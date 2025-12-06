import { ref, computed } from 'vue'
import id from './id'
import en from './en'

type Locale = 'id' | 'en'

const translations = {
  id,
  en
}

const currentLocale = ref<Locale>('id')

export function useI18n() {
  const locale = computed(() => currentLocale.value)
  
  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }
  
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[currentLocale.value]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  // Initialize from localStorage
  const stored = localStorage.getItem('locale') as Locale
  if (stored && (stored === 'id' || stored === 'en')) {
    currentLocale.value = stored
  }
  
  return {
    locale,
    setLocale,
    t
  }
}

// Global plugin
export default {
  install(app: any) {
    const { t } = useI18n()
    app.config.globalProperties.$t = t
  }
}
