import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
  }

  const initDarkMode = () => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      isDark.value = stored === 'true'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  onMounted(() => {
    initDarkMode()
  })

  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  return {
    isDark,
    toggleDark
  }
}
