<!-- src/App.vue -->
<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header-inner">
        <div class="app-logo">
          <span class="app-logo-title">Boletín Salesiano</span>
          <span class="app-logo-subtitle">Demo de migración a Strapi + Vue</span>
        </div>

        <nav class="app-nav">
          <RouterLink to="/">Inicio</RouterLink>
          <RouterLink to="/noticias">Noticias</RouterLink>
          <RouterLink to="/blogs">Blogs</RouterLink>
          <RouterLink to="/activities">Actividades</RouterLink>
          <RouterLink to="/bulletins">Archivo Boletín</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="app-footer-inner">
        Boletín Salesiano · Proyecto de migración técnico · {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router';
</script>
