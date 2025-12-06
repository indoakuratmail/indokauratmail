/**
 * Cloudflare Email Worker
 * Handles incoming emails and stores them in Supabase
 */

export default {
  async email(message, env, ctx) {
    try {
      // Validate environment variables
      if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing required environment variables')
        return new Response('Configuration error', { status: 500 })
      }

      // Extract email data
      const recipient = message.to
      const sender = message.from
      const subject = message.headers.get('subject') || '(No Subject)'
      
      // Get email body
      const bodyText = await message.text()
      const bodyHtml = await message.html()
      
      // Calculate expiry time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      
      // Check if custom domain
      const availableDomains = ['tempmail-id.com', 'quickmail-id.net']
      const recipientDomain = recipient.split('@')[1]
      const isCustomDomain = !availableDomains.includes(recipientDomain)
      
      // Insert email into Supabase
      const emailResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          recipient,
          sender,
          subject,
          body_html: bodyHtml || null,
          body_text: bodyText || null,
          expires_at: expiresAt,
          is_custom_domain: isCustomDomain
        })
      })
      
      if (!emailResponse.ok) {
        const error = await emailResponse.text()
        console.error('Failed to insert email:', error)
        return new Response('Failed to store email', { status: 500 })
      }
      
      const emailData = await emailResponse.json()
      const emailId = emailData[0]?.id
      
      // Handle attachments if any
      if (message.attachments && message.attachments.length > 0) {
        for (const attachment of message.attachments) {
          const attachmentData = await attachment.arrayBuffer()
          const filename = attachment.name || 'attachment'
          const contentType = attachment.type || 'application/octet-stream'
          const size = attachmentData.byteLength
          
          // Upload to Supabase Storage
          const storagePath = `${emailId}/${filename}`
          
          const uploadResponse = await fetch(
            `${env.SUPABASE_URL}/storage/v1/object/email-attachments/${storagePath}`,
            {
              method: 'POST',
              headers: {
                'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': contentType
              },
              body: attachmentData
            }
          )
          
          if (uploadResponse.ok) {
            // Insert attachment record
            await fetch(`${env.SUPABASE_URL}/rest/v1/attachments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({
                email_id: emailId,
                filename,
                content_type: contentType,
                size,
                storage_path: storagePath
              })
            })
          }
        }
      }
      
      // Update custom domain usage stats if applicable
      if (isCustomDomain) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/upsert_custom_domain_usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ domain_name: recipientDomain })
        })
      }
      
      console.log(`Email processed successfully: ${recipient}`)
      return new Response('Email processed', { status: 200 })
      
    } catch (error) {
      console.error('Error processing email:', error)
      return new Response('Internal error', { status: 500 })
    }
  }
}
