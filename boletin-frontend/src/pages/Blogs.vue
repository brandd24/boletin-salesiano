<!-- src/pages/Blogs.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchBlogs, mediaUrl } from '../services/api';

const blogs = ref([]);
const loading = ref(true);
const error = ref(false);
const searchTerm = ref('');

/* ---- helpers ---- */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function plainSummary(html, maxLen = 180) {
  if (!html) return '';
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

function tagsText(b) {
  if (!b || !b.tags) return '';
  if (Array.isArray(b.tags)) return b.tags.join(', ');
  // por si viene como string tipo JSON
  try {
    const arr = JSON.parse(b.tags);
    if (Array.isArray(arr)) return arr.join(', ');
  } catch (e) {
    /* ignore */
  }
  return String(b.tags);
}

/* ---- datos derivados ---- */
const filteredBlogs = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return blogs.value;

  return blogs.value.filter(b => {
    const haystack = [
      b.title,
      b.summary,
      b.content,
      b.author_name,
      tagsText(b)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
});

const featuredBlog = computed(() =>
  filteredBlogs.value.length ? filteredBlogs.value[0] : null
);

const otherBlogs = computed(() =>
  filteredBlogs.value.length > 1 ? filteredBlogs.value.slice(1) : []
);

/* ---- carga inicial ---- */
async function loadBlogs() {
  try {
    loading.value = true;
    error.value = false;

    const res = await fetchBlogs();
    const arr = Array.isArray(res) ? res : res.data || [];
    blogs.value = arr;
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadBlogs();
});
</script>

<template>
  <section class="fade-in">
    <h2 class="page-title">Blogs</h2>

    <p class="search-intro" style="margin-bottom: 0.6rem;">
      Espacio para artículos de opinión, reflexión y temas de interés salesiano.
    </p>

    <!-- BUSCADOR -->
    <div class="news-search" style="margin-bottom: 1.1rem;">
      <input
        v-model="searchTerm"
        type="search"
        placeholder="Buscar blogs por título, autor o tema…"
      />
    </div>

    <div v-if="loading">Cargando blogs…</div>
    <div v-else-if="error">Ocurrió un error al cargar los blogs.</div>
    <div v-else-if="!filteredBlogs.length">No se encontraron blogs.</div>

    <div v-else class="news-layout">
      <!-- COLUMNA PRINCIPAL -->
      <div class="news-main">
        <!-- BLOG DESTACADO -->
        <article
          v-if="featuredBlog"
          class="news-featured"
        >
          <RouterLink
            class="news-grid-link"
            :to="`/blogs/${featuredBlog.slug}`"
          >
            <img
              v-if="featuredBlog.cover_image"
              class="news-featured-image"
              :src="mediaUrl(featuredBlog.cover_image.url)"
              :alt="featuredBlog.title"
              loading="lazy"
            />

            <div class="news-featured-body">
              <div class="news-meta">
                {{ formatDate(featuredBlog.date) }}
                <span v-if="featuredBlog.author_name">
                  · {{ featuredBlog.author_name }}
                </span>
                <span v-if="tagsText(featuredBlog)">
                  · {{ tagsText(featuredBlog) }}
                </span>
              </div>

              <h3 class="news-title">
                {{ featuredBlog.title }}
              </h3>

              <p class="news-summary">
                {{ plainSummary(featuredBlog.summary || featuredBlog.content, 260) }}
              </p>

              <span class="news-link">
                Leer blog →
              </span>
            </div>
          </RouterLink>
        </article>

        <!-- LISTA DE BLOGS (debajo del destacado) -->
        <section class="news-main-list blogs-main-list" style="margin-top: 1.2rem;">
          <h3 class="section-title section-title-main">
            Últimos artículos del blog
          </h3>

          <div
            v-for="b in otherBlogs"
            :key="b.id"
            class="news-row"
          >
            <RouterLink
              class="news-row-link"
              :to="`/blogs/${b.slug}`"
            >
              <div class="news-row-image-wrapper" v-if="b.cover_image">
                <img
                  :src="mediaUrl(b.cover_image.url)"
                  :alt="b.title"
                  loading="lazy"
                />
              </div>

              <div class="news-row-body">
                <div class="news-row-meta">
                  {{ formatDate(b.date) }}
                  <span v-if="b.author_name"> · {{ b.author_name }}</span>
                  <span v-if="tagsText(b)"> · {{ tagsText(b) }}</span>
                </div>

                <h4 class="news-row-title">
                  {{ b.title }}
                </h4>

                <p class="news-row-summary">
                  {{ plainSummary(b.summary || b.content, 160) }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>

      <!-- SIDEBAR -->
      <aside class="news-sidebar">
        <!-- Bloque informativo real -->
        <div class="news-sidebar-block">
          <h3 class="section-title with-accent">Sobre esta sección</h3>
          <p style="font-size: 0.86rem; color: #4b5563; margin-bottom: 0.4rem;">
            Aquí se muestran los artículos del blog almacenados en Strapi,
            ordenados por fecha. El primero aparece como destacado.
          </p>
          <p style="font-size: 0.8rem; color: #6b7280;">
            En producción, este bloque podría incluir una breve presentación
            del equipo editorial o enlaces a normas de publicación.
          </p>
        </div>

        <!-- Bloque “idea para producción real” -->
        <div class="news-sidebar-block sidebar-secondary" style="border: 1px dashed #d1d5db;">
          <h4 class="section-title" style="margin-bottom: 0.3rem;">
            Idea para producción real
          </h4>
          <p style="font-size: 0.8rem; color: #4b5563; margin-bottom: 0.25rem;">
            Aquí podrían cargarse automáticamente las categorías o etiquetas
            más usadas en los blogs (por ejemplo, <em>Familia</em>,
            <em>Juventud</em>, <em>Educación</em>), permitiendo filtrar
            los artículos con un clic.
          </p>
          <p style="font-size: 0.78rem; color: #6b7280;">
            También se podría mostrar un listado de “Artículos más leídos”
            calculado en base a estadísticas reales.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>
