// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

import Home from '../pages/Home.vue';
import Noticias from '../pages/Noticias.vue';
import Detalle from '../pages/Detalle.vue';
import Blogs from '../pages/Blogs.vue';
import BlogDetail from '../pages/BlogDetail.vue';
import Activities from '../pages/Activities.vue';
import ActivityDetail from '../pages/ActivityDetail.vue'; // ⬅ NUEVO
import Bulletins from '../pages/Bulletins.vue';
import Search from '../pages/Search.vue';

const routes = [
  { path: '/', name: 'home', component: Home },

  { path: '/noticias', name: 'noticias', component: Noticias },
  { path: '/noticias/:slug', name: 'noticia-detalle', component: Detalle },

  { path: '/blogs', name: 'blogs', component: Blogs },
  { path: '/blogs/:slug', name: 'blog-detalle', component: BlogDetail },

  { path: '/activities', name: 'activities', component: Activities },

  // ✅ NUEVA RUTA PARA DETALLE DE ACTIVIDAD
  {
    path: '/activities/:slug',
    name: 'activity-detail',
    component: ActivityDetail,
    props: true
  },

  { path: '/bulletins', name: 'bulletins', component: Bulletins },

  { path: '/buscar', name: 'buscar', component: Search }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
