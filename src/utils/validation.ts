export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateUsername(username: string): ValidationResult {
  // Length check
  if (username.length < 3) {
    return { isValid: false, error: 'Username minimal 3 karakter' }
  }
  if (username.length > 30) {
    return { isValid: false, error: 'Username maksimal 30 karakter' }
  }
  
  // Character check (alphanumeric, dash, underscore, dot only)
  const validPattern = /^[a-zA-Z0-9._-]+$/
  if (!validPattern.test(username)) {
    return { 
      isValid: false, 
      error: 'Username hanya boleh mengandung huruf, angka, titik, dash, dan underscore' 
    }
  }
  
  // No consecutive dots
  if (username.includes('..')) {
    return { isValid: false, error: 'Username tidak boleh mengandung titik berturut-turut' }
  }
  
  // Cannot start or end with dot
  if (username.startsWith('.') || username.endsWith('.')) {
    return { isValid: false, error: 'Username tidak boleh diawali atau diakhiri dengan titik' }
  }
  
  return { isValid: true }
}

export function validateDomain(domain: string): boolean {
  const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i
  return domainPattern.test(domain)
}

export function generateRandomUsername(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
