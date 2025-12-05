<!-- src/pages/Search.vue -->
<template>
  <div class="search-page">
    <h1 class="page-title">Buscar en el Boletín</h1>

    <div class="search-intro">
      Escribe una palabra clave para buscar en los títulos, países y resúmenes de las noticias.
    </div>

    <div class="news-search search-page-input">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Ejemplo: Panamá, juventud, familia, inteligencia artificial…"
      />
    </div>

    <div v-if="loading">Cargando noticias…</div>
    <div v-else-if="error">Ocurrió un error al cargar las noticias.</div>
    <div v-else-if="filteredNoticias.length === 0">
      No se encontraron resultados para “{{ searchQuery }}”.
    </div>

    <section v-else class="search-results">
      <article
        v-for="n in filteredNoticias"
        :key="n.id"
        class="search-card"
      >
        <RouterLink
          class="search-card-link"
          :to="{ name: 'noticia-detalle', params: { id: n.id } }"
        >
          <div v-if="n.cover_image" class="search-card-image-wrapper">
            <img
              :src="mediaUrl(n.cover_image.url)"
              :alt="n.title"
              loading="lazy"
            />
          </div>

          <div class="search-card-body">
            <div class="search-card-meta">
              {{ formatDate(n.date) }}
              <span v-if="n.country"> · {{ n.country }}</span>
              <span v-if="categoriesText(n)"> · {{ categoriesText(n) }}</span>
            </div>

            <h2 class="search-card-title">
              {{ n.title }}
            </h2>

            <p class="search-card-summary">
              {{ plainSummary(n.summary, 180) }}
            </p>
          </div>
        </RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchNoticias, mediaUrl } from '../services/api';

const noticias = ref([]);
const loading = ref(true);
const error = ref(false);
const searchQuery = ref('');

/* Filtra solo por búsqueda, sin chips extra para que sea simple */
const filteredNoticias = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return noticias.value;

  return noticias.value.filter(n => {
    const title = (n.title || '').toLowerCase();
    const country = (n.country || '').toLowerCase();
    const summary = (n.summary || '').toLowerCase();
    return (
      title.includes(q) ||
      country.includes(q) ||
      summary.includes(q)
    );
  });
});

function categoriesText(noticia) {
  if (!noticia.categories || !Array.isArray(noticia.categories)) return '';
  return noticia.categories.map(c => c.name).join(', ');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function plainSummary(html, maxLen = 160) {
  if (!html) return '';
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/~~/g, '')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

onMounted(async () => {
  try {
    loading.value = true;
    const data = await fetchNoticias();
    noticias.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
