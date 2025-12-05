<!-- src/pages/Detalle.vue -->
<template>
  <div>
    <h1 class="page-title">Detalle de noticia</h1>

    <div v-if="loading">Cargando noticia…</div>
    <div v-else-if="error">Ocurrió un error al cargar la noticia.</div>
    <div v-else-if="!noticia">No se encontró la noticia.</div>

    <article v-else class="article fade-in">
      <div class="article-back">
        <RouterLink :to="{ name: 'noticias' }">← Volver a noticias</RouterLink>
      </div>

      <header class="article-header">
        <h2 class="article-title">{{ noticia.title }}</h2>

        <div class="article-meta">
          {{ formatDate(noticia.date) }}
          <span v-if="noticia.country"> · {{ noticia.country }}</span>
          <span v-if="noticia.author_name"> · {{ noticia.author_name }}</span>
          <span v-if="categoriesText(noticia)">
            · {{ categoriesText(noticia) }}
          </span>
        </div>

        <p v-if="noticia.summary" class="article-summary">
          {{ plainSummary(noticia.summary, 260) }}
        </p>

        <img
          v-if="noticia.cover_image"
          :src="mediaUrl(noticia.cover_image.url)"
          :alt="noticia.title"
          class="article-cover"
        />

        <!-- ★★★★★ BLOQUE NUEVO — FLICKR EMBED ★★★★★ -->
        <section
          v-if="noticia.flickr_album_id"
          class="flickr-section"
          style="margin: 40px 0;"
        >
          <h3 class="flickr-title">Álbum fotográfico</h3>

          <iframe
            :src="`https://www.flickr.com/photos/boletinsalesiano/albums/${noticia.flickr_album_id}/player/`"
            width="100%"
            height="500"
            frameborder="0"
            allowfullscreen
            allow="autoplay; fullscreen"
            style="border-radius: 12px; overflow: hidden;"
          ></iframe>
        </section>
        <!-- ★★★★★ FIN DEL BLOQUE NUEVO ★★★★★ -->
      </header>

      <section class="article-content" v-html="contentHtml"></section>

      <!-- Galería -->
      <section
        v-if="Array.isArray(noticia.gallery) && noticia.gallery.length"
        class="gallery-grid"
      >
        <h3 class="gallery-title">Galería</h3>
        <div class="gallery-items">
          <div
            v-for="img in noticia.gallery"
            :key="img.id || img.url"
            class="gallery-item"
            @click="openPreview(img)"
          >
            <img
              :src="mediaUrl(img.url || img)"
              :alt="img.name || noticia.title"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <!-- Lightbox -->
      <div v-if="previewImage" class="lightbox" @click.self="closePreview">
        <div class="lightbox-inner">
          <button class="lightbox-close" @click="closePreview">×</button>
          <img :src="previewImage" :alt="noticia.title" />
        </div>
      </div>

      <!-- Recomendadas -->
      <section v-if="recommended.length" class="recommended-section">
        <h3 class="section-title">Noticias recomendadas</h3>

        <div class="recommended-grid">
          <article v-for="n in recommended" :key="n.id" class="recommended-card">
            <RouterLink
              v-if="n.slug"
              class="recommended-link"
              :to="{ name: 'noticia-detalle', params: { slug: n.slug } }"
            >
              <div v-if="n.cover_image" class="recommended-image-wrapper">
                <img
                  :src="mediaUrl(n.cover_image.url)"
                  :alt="n.title"
                  loading="lazy"
                />
              </div>

              <div class="recommended-body">
                <div class="recommended-meta">
                  {{ formatDate(n.date) }}
                  <span v-if="n.country"> · {{ n.country }}</span>
                </div>

                <h4 class="recommended-title">{{ n.title }}</h4>

                <p class="recommended-summary">
                  {{ plainSummary(n.summary, 120) }}
                </p>
              </div>
            </RouterLink>

            <div v-else class="recommended-body">
              <div class="recommended-meta">
                {{ formatDate(n.date) }}
                <span v-if="n.country"> · {{ n.country }}</span>
              </div>
              <h4 class="recommended-title">{{ n.title }}</h4>
              <p class="recommended-summary">
                {{ plainSummary(n.summary, 120) }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { fetchNoticiaBySlug, fetchNoticias, mediaUrl } from '../services/api';

const route = useRoute();

const noticia = ref(null);
const loading = ref(true);
const error = ref(false);

const previewImage = ref(null);
const recommended = ref([]);

const contentHtml = computed(() => {
  if (!noticia.value || !noticia.value.content) return '';
  let raw = noticia.value.content;

  if (/<(p|br|div|h1|h2|h3|ul|ol|li)/i.test(raw)) {
    return raw;
  }

  raw = raw.replace(/~~(.*?)~~/g, '<u>$1</u>');
  const paragraphs = raw
    .split(/\n{2,}/)
    .map(p =>
      p
        .trim()
        .replace(/\n/g, '<br>')
    )
    .filter(Boolean);

  if (!paragraphs.length) return `<p>${raw}</p>`;
  return paragraphs.map(p => `<p>${p}</p>`).join('');
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function categoriesText(n) {
  if (!n.categories || !Array.isArray(n.categories)) return '';
  return n.categories.map(c => c.name).join(', ');
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

function openPreview(img) {
  const url = img.url || img;
  previewImage.value = mediaUrl(url);
}
function closePreview() {
  previewImage.value = null;
}

async function loadRecommended(currentSlug) {
  try {
    const list = await fetchNoticias();
    const arr = Array.isArray(list) ? list : [];
    recommended.value = arr
      .filter(n => n.slug && n.slug !== currentSlug)
      .slice(0, 3);
  } catch (e) {
    console.error(e);
  }
}

async function loadNoticia(slug) {
  if (!slug) return;
  try {
    loading.value = true;
    error.value = false;

    const data = await fetchNoticiaBySlug(slug);
    noticia.value = data || null;

    if (data && data.slug) {
      await loadRecommended(data.slug);
    }
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadNoticia(route.params.slug);
});

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      loadNoticia(newSlug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
);
</script>
