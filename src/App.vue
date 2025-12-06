<template>
  <div id="app" :class="{ 'dark': isDark }">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark } = useDarkMode()
</script>

<style>
#app {
  min-height: 100vh;
  transition: background-color 0.3s ease;
}
</style>
