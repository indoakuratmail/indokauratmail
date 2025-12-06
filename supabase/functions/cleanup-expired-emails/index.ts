import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Delete expired emails
    const { data: expiredEmails, error: selectError } = await supabase
      .from('emails')
      .select('id')
      .lt('expires_at', new Date().toISOString())
    
    if (selectError) {
      throw selectError
    }
    
    if (expiredEmails && expiredEmails.length > 0) {
      const emailIds = expiredEmails.map(e => e.id)
      
      // Delete attachments first (cascade will handle this, but explicit is better)
      const { error: attachmentError } = await supabase
        .from('attachments')
        .delete()
        .in('email_id', emailIds)
      
      if (attachmentError) {
        console.error('Error deleting attachments:', attachmentError)
      }
      
      // Delete emails
      const { error: deleteError } = await supabase
        .from('emails')
        .delete()
        .in('id', emailIds)
      
      if (deleteError) {
        throw deleteError
      }
      
      console.log(`Deleted ${expiredEmails.length} expired emails`)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted: expiredEmails?.length || 0 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
