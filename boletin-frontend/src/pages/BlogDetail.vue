<!-- src/pages/BlogDetail.vue -->
<template>
  <div>
    <h1 class="page-title">Detalle de blog</h1>

    <div v-if="loading">Cargando artículo…</div>
    <div v-else-if="error">Ocurrió un error al cargar el blog.</div>
    <div v-else-if="!blog">No se encontró el blog solicitado.</div>

    <article v-else class="article fade-in">
      <div class="article-back">
        <RouterLink :to="{ name: 'blogs' }">← Volver a blogs</RouterLink>
      </div>

      <header class="article-header">
        <h2 class="article-title">{{ blog.title }}</h2>

        <div class="article-meta">
          {{ formatDate(blog.date) }}
          <span v-if="blog.author_name"> · {{ blog.author_name }}</span>
          <span v-if="tagsText">
            · {{ tagsText }}
          </span>
        </div>

        <p v-if="blog.summary" class="article-summary">
          {{ plainSummary(blog.summary, 260) }}
        </p>

        <img
          v-if="blog.cover_image"
          :src="mediaUrl(blog.cover_image.url)"
          :alt="blog.title"
          class="article-cover"
        />
      </header>

      <!-- CONTENIDO PRINCIPAL -->
      <section
        class="article-content"
        v-html="contentHtml"
      ></section>

      <!-- GALERÍA OPCIONAL -->
      <section
        v-if="Array.isArray(blog.gallery) && blog.gallery.length"
        class="gallery-grid"
      >
        <h3 class="gallery-title">Galería</h3>
        <div class="gallery-items">
          <div
            v-for="img in blog.gallery"
            :key="img.id || img.url"
            class="gallery-item"
            @click="openPreview(img)"
          >
            <img
              :src="mediaUrl(img.url || img)"
              :alt="img.name || blog.title"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <!-- LIGHTBOX -->
      <div
        v-if="previewImage"
        class="lightbox"
        @click.self="closePreview"
      >
        <div class="lightbox-inner">
          <button class="lightbox-close" @click="closePreview">×</button>
          <img :src="previewImage" :alt="blog.title" />
        </div>
      </div>

      <!-- MÁS BLOGS -->
      <section v-if="recommended.length" class="recommended-section">
        <h3 class="section-title">Otros artículos del blog</h3>

        <div class="recommended-grid">
          <article
            v-for="b in recommended"
            :key="b.id"
            class="recommended-card"
          >
            <RouterLink
              class="recommended-link"
              :to="{ name: 'blog-detalle', params: { slug: b.slug } }"
            >
              <div v-if="b.cover_image" class="recommended-image-wrapper">
                <img
                  :src="mediaUrl(b.cover_image.url)"
                  :alt="b.title"
                  loading="lazy"
                />
              </div>

              <div class="recommended-body">
                <div class="recommended-meta">
                  {{ formatDate(b.date) }}
                </div>

                <h4 class="recommended-title">{{ b.title }}</h4>

                <p class="recommended-summary">
                  {{ plainSummary(b.summary, 120) }}
                </p>
              </div>
            </RouterLink>
          </article>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { fetchBlogBySlug, fetchBlogs, mediaUrl } from '../services/api';

const route = useRoute();
const blog = ref(null);
const loading = ref(true);
const error = ref(false);

const previewImage = ref(null);
const recommended = ref([]);

/* ====== CONTENT RICH-TEXT ====== */
const contentHtml = computed(() => {
  if (!blog.value || !blog.value.content) return '';
  let raw = blog.value.content;

  // Si ya viene con HTML, lo respetamos
  if (/<(p|br|div|h[1-6]|ul|ol|li)/i.test(raw)) {
    return raw;
  }

  // Markdown ligero para ~~subrayado~~
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

/* ====== TAGS EN TEXTO ====== */
const tagsText = computed(() => {
  if (!blog.value || !blog.value.tags) return '';
  if (Array.isArray(blog.value.tags)) {
    return blog.value.tags.join(', ');
  }
  if (typeof blog.value.tags === 'string') {
    return blog.value.tags;
  }
  return '';
});

/* ====== UTILIDADES ====== */
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

/* ====== LIGHTBOX ====== */
function openPreview(img) {
  const url = img.url || img;
  previewImage.value = mediaUrl(url);
}

function closePreview() {
  previewImage.value = null;
}

/* ====== RECOMENDADOS ====== */
async function loadRecommended(currentSlug) {
  try {
    const list = await fetchBlogs({ _limit: 6 });
    const arr = Array.isArray(list) ? list : [];
    recommended.value = arr
      .filter(b => b.slug !== currentSlug)
      .slice(0, 3);
  } catch (e) {
    console.error(e);
  }
}

/* ====== CARGA PRINCIPAL ====== */
async function loadBlog(slug) {
  if (!slug) return;
  try {
    loading.value = true;
    error.value = false;

    const data = await fetchBlogBySlug(slug);
    blog.value = data;

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
  loadBlog(route.params.slug);
});

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      loadBlog(newSlug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
);
</script>
