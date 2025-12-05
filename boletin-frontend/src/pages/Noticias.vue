<!-- src/pages/Noticias.vue -->
<template>
  <div>
    <h1 class="page-title">Noticias</h1>

    <!-- 🔍 Barra de búsqueda -->
    <div class="news-search">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Buscar noticias por título, país o resumen…"
      />
    </div>

    <!-- 🧮 Filtros por país y categoría -->
    <div class="news-filters" v-if="countries.length || categories.length">
      <div class="filter-group" v-if="countries.length">
        <span class="filter-label">País:</span>
        <button
          class="filter-pill"
          :class="{ 'is-active': countryFilter === 'all' }"
          @click="countryFilter = 'all'"
        >
          Todos
        </button>
        <button
          v-for="c in countries"
          :key="c"
          class="filter-pill"
          :class="{ 'is-active': countryFilter === c }"
          @click="countryFilter = c"
        >
          {{ c }}
        </button>
      </div>

      <div class="filter-group" v-if="categories.length">
        <span class="filter-label">Categoría:</span>
        <button
          class="filter-pill"
          :class="{ 'is-active': categoryFilter === 'all' }"
          @click="categoryFilter = 'all'"
        >
          Todas
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="filter-pill"
          :class="{ 'is-active': categoryFilter === cat }"
          @click="categoryFilter = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div v-if="loading">Cargando noticias…</div>
    <div v-else-if="error">Ocurrió un error al cargar las noticias.</div>
    <div v-else-if="filteredNoticias.length === 0">
      No se encontraron noticias para “{{ searchQuery || 'los filtros seleccionados' }}”.
    </div>

    <div v-else>
      <!-- ====== LAYOUT PRINCIPAL: HERO + LISTA + SIDEBAR ====== -->
      <div class="news-layout">
        <!-- COLUMNA PRINCIPAL -->
        <section class="news-main">
          <!-- Noticia destacada -->
          <article class="news-featured fade-in" v-if="featured">
            <img
              v-if="featuredImage"
              :src="featuredImage"
              :alt="featured.title"
              class="news-featured-image"
            />

            <div class="news-featured-body">
              <div class="news-meta">
                {{ formatDate(featured.date) }}
                · {{ featured.country || 'Centroamérica' }}
              </div>

              <div class="badges" v-if="featuredCategories.length">
                <span
                  v-for="cat in featuredCategories"
                  :key="cat.id || cat.name"
                  class="badge"
                >
                  {{ cat.name }}
                </span>
              </div>

              <h2 class="news-title">
                <RouterLink
                  v-if="featured.slug"
                  class="news-link"
                  :to="{ name: 'noticia-detalle', params: { slug: featured.slug } }"
                >
                  {{ featured.title }}
                </RouterLink>
                <span v-else>{{ featured.title }}</span>
              </h2>

              <p class="news-summary">
                {{ plainSummary(featured.summary) || 'Sin resumen disponible.' }}
              </p>

              <RouterLink
                v-if="featured.slug"
                class="news-link"
                :to="{ name: 'noticia-detalle', params: { slug: featured.slug } }"
              >
                Leer más →
              </RouterLink>
            </div>
          </article>

          <!-- LISTA PRINCIPAL: TODAS LAS DEMÁS NOTICIAS -->
          <section
            v-if="mainListNoticias.length"
            class="news-main-list fade-in"
          >
            <h3 class="section-title section-title-main">
              Todas las noticias
            </h3>

            <article
              v-for="(n, index) in mainListNoticias"
              :key="n.id"
              class="news-row"
              :style="{ animationDelay: (index * 40) + 'ms' }"
            >
              <RouterLink
                v-if="n.slug"
                class="news-row-link"
                :to="{ name: 'noticia-detalle', params: { slug: n.slug } }"
              >
                <div class="news-row-image-wrapper" v-if="n.cover_image">
                  <img
                    :src="mediaUrl(n.cover_image.url)"
                    :alt="n.title"
                    loading="lazy"
                  />
                </div>

                <div class="news-row-body">
                  <div class="news-row-meta">
                    {{ formatDate(n.date) }}
                    <span v-if="n.country"> · {{ n.country }}</span>
                    <span v-if="categoriesText(n)">
                      · {{ categoriesText(n) }}
                    </span>
                  </div>

                  <h3 class="news-row-title">
                    {{ n.title }}
                  </h3>

                  <p class="news-row-summary">
                    {{ plainSummary(n.summary, 200) }}
                  </p>
                </div>
              </RouterLink>

              <!-- Fallback sin slug (por si acaso) -->
              <div v-else class="news-row-link">
                <div class="news-row-image-wrapper" v-if="n.cover_image">
                  <img
                    :src="mediaUrl(n.cover_image.url)"
                    :alt="n.title"
                    loading="lazy"
                  />
                </div>
                <div class="news-row-body">
                  <div class="news-row-meta">
                    {{ formatDate(n.date) }}
                    <span v-if="n.country"> · {{ n.country }}</span>
                    <span v-if="categoriesText(n)">
                      · {{ categoriesText(n) }}
                    </span>
                  </div>
                  <h3 class="news-row-title">{{ n.title }}</h3>
                  <p class="news-row-summary">
                    {{ plainSummary(n.summary, 200) }}
                  </p>
                </div>
              </div>
            </article>
          </section>
        </section>

        <!-- SIDEBAR: MITAD RECIENTES / MITAD POR PAÍS -->
        <aside class="news-sidebar fade-in">
          <!-- Bloque 1: Recientes -->
          <section class="news-list news-sidebar-block">
            <h3 class="section-title with-accent">Recientes</h3>

            <div
              v-for="(n, index) in recentNoticias"
              :key="n.id"
              class="news-list-item fade-in"
              :style="{ animationDelay: (index * 60) + 'ms' }"
            >
              <div class="news-list-title">
                <RouterLink
                  v-if="n.slug"
                  class="news-link"
                  :to="{ name: 'noticia-detalle', params: { slug: n.slug } }"
                >
                  {{ n.title }}
                </RouterLink>
                <span v-else>{{ n.title }}</span>
              </div>
              <div class="news-list-meta">
                {{ formatDate(n.date) }}
                <span v-if="n.country"> · {{ n.country }}</span>
                <span v-if="categoriesText(n)">
                  · {{ categoriesText(n) }}
                </span>
              </div>
            </div>

            <p v-if="recentNoticias.length === 0" class="news-list-empty">
              No hay noticias recientes.
            </p>
          </section>

          <!-- Bloque 2: Por país (chips interactivos) -->
          <section class="news-sidebar-block sidebar-secondary">
            <h3 class="section-title with-accent">Por país</h3>

            <ul v-if="sidebarCountries.length" class="sidebar-list">
              <li v-for="c in sidebarCountries" :key="c.name">
                <button
                  class="sidebar-chip"
                  :class="{ 'is-active': countryFilter === c.name }"
                  @click="countryFilter = c.name"
                >
                  <span class="sidebar-chip-name">{{ c.name }}</span>
                  <span class="sidebar-chip-count">{{ c.count }}</span>
                </button>
              </li>
            </ul>

            <p v-else class="news-list-empty">
              No hay países con noticias.
            </p>
          </section>
        </aside>
      </div>

      <!-- ====== SECCIÓN HISTORIAS (FOTO NOTICIAS) ====== -->
      <section
        v-if="photoNoticias.length"
        class="stories-section fade-in"
      >
        <h2 class="stories-heading">Historias</h2>

        <div class="stories-strip">
          <article
            v-for="(n, index) in photoNoticias"
            :key="n.id"
            class="story-card fade-in"
            :style="{ animationDelay: (index * 50) + 'ms' }"
          >
            <RouterLink
              v-if="n.slug"
              class="story-link"
              :to="{ name: 'noticia-detalle', params: { slug: n.slug } }"
            >
              <div class="story-image-wrapper">
                <img
                  :src="storyImage(n)"
                  :alt="n.title"
                  loading="lazy"
                />
                <div class="story-gradient"></div>
                <div class="story-text-layer">
                  <div class="story-badge">Foto noticia</div>
                  <h3 class="story-title-text">
                    {{ n.title }}
                  </h3>
                </div>
              </div>
            </RouterLink>

            <!-- Fallback sin slug -->
            <div v-else class="story-image-wrapper">
              <img
                :src="storyImage(n)"
                :alt="n.title"
                loading="lazy"
              />
              <div class="story-gradient"></div>
              <div class="story-text-layer">
                <div class="story-badge">Foto noticia</div>
                <h3 class="story-title-text">
                  {{ n.title }}
                </h3>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
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
const countryFilter = ref('all');
const categoryFilter = ref('all');

/* Países disponibles (para chips de arriba) */
const countries = computed(() => {
  const set = new Set();
  for (const n of noticias.value) {
    if (n.country) set.add(n.country);
  }
  return Array.from(set);
});

/* Categorías disponibles (por nombre) */
const categories = computed(() => {
  const set = new Set();
  for (const n of noticias.value) {
    if (Array.isArray(n.categories)) {
      n.categories.forEach(c => c && c.name && set.add(c.name));
    }
  }
  return Array.from(set);
});

/* Noticias filtradas por búsqueda + país + categoría */
const filteredNoticias = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return noticias.value.filter(n => {
    const title = (n.title || '').toLowerCase();
    const country = (n.country || '').toLowerCase();
    const summary = (n.summary || '').toLowerCase();

    const matchesSearch =
      !q || title.includes(q) || country.includes(q) || summary.includes(q);

    const matchesCountry =
      countryFilter.value === 'all' || n.country === countryFilter.value;

    const catNames = Array.isArray(n.categories)
      ? n.categories.map(c => c.name)
      : [];
    const matchesCategory =
      categoryFilter.value === 'all' || catNames.includes(categoryFilter.value);

    return matchesSearch && matchesCountry && matchesCategory;
  });
});

/* Hero */
const featured = computed(() => filteredNoticias.value[0] || null);

/* Lista principal: todo menos la destacada */
const mainListNoticias = computed(() => filteredNoticias.value.slice(1));

/* Recientes (sidebar): top 8 */
const recentNoticias = computed(() => filteredNoticias.value.slice(0, 8));

/* Países con conteo para el bloque "Por país" */
const sidebarCountries = computed(() => {
  const map = new Map();
  filteredNoticias.value.forEach(n => {
    if (!n.country) return;
    const prev = map.get(n.country) || 0;
    map.set(n.country, prev + 1);
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
});

/* Historias: solo “foto noticias” (con galería) */
const photoNoticias = computed(() =>
  filteredNoticias.value
    .filter(
      n => Array.isArray(n.gallery) && n.gallery.length && n.cover_image
    )
    .slice(0, 10)
);

const featuredImage = computed(() => {
  if (!featured.value || !featured.value.cover_image) return '';
  return mediaUrl(featured.value.cover_image.url);
});

const featuredCategories = computed(() =>
  featured.value && Array.isArray(featured.value.categories)
    ? featured.value.categories
    : []
);

function storyImage(noticia) {
  if (noticia.cover_image) {
    return mediaUrl(noticia.cover_image.url);
  }
  if (Array.isArray(noticia.gallery) && noticia.gallery.length) {
    const img = noticia.gallery[0];
    return mediaUrl(img.url || img);
  }
  return '';
}

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

/* Quita etiquetas HTML del summary y lo recorta */
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
