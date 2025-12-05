<!-- src/pages/Home.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import {
  mediaUrl,
  fetchHeroBulletin,
  fetchNoticias,
  fetchBlogs,
  fetchActivities,
} from '../services/api';

const loadingHero = ref(true);
const heroBulletin = ref(null);

const homeNoticias = ref([]);
const homeBlogs = ref([]);
const homeActivities = ref([]);

const errorHero = ref(false);

onMounted(async () => {
  try {
    const [hero, noticias, blogs, activities] = await Promise.all([
      fetchHeroBulletin(),
      fetchNoticias({ _limit: 4 }),
      fetchBlogs({ _limit: 3 }),
      fetchActivities({ _limit: 3 }),
    ]);

    heroBulletin.value = hero || null;
    homeNoticias.value = Array.isArray(noticias) ? noticias : [];
    homeBlogs.value = Array.isArray(blogs) ? blogs : [];
    homeActivities.value = Array.isArray(activities) ? activities : [];
  } catch (e) {
    console.error(e);
    errorHero.value = true;
  } finally {
    loadingHero.value = false;
  }
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function plainSummary(html, maxLen = 140) {
  if (!html) return '';
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/~~/g, '')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}
</script>

<template>
  <section class="home">
    <h2 class="page-title">Inicio</h2>

    <!-- ================= HERO / TEMA DEL MES ================= -->
    <section class="home-hero-grid">
      <!-- Columna texto-titular -->
      <article class="home-hero-intro">
        <p class="home-hero-kicker">Boletín Salesiano · Centroamérica</p>
        <h1 class="home-hero-title">
          Un espacio digital para noticias, blogs y actividades salesianas.
        </h1>
        <p class="home-hero-text">
          Esta demo integra contenido del Boletín Salesiano con un entorno
          moderno en Vue y Strapi, pensado para centralizar noticias, blogs,
          actividades y archivo histórico.
        </p>

        <div class="home-hero-buttons">
          <RouterLink class="home-btn home-btn-primary" :to="{ name: 'noticias' }">
            Ver noticias
          </RouterLink>

          <RouterLink class="home-btn home-btn-outline" :to="{ name: 'bulletins' }">
            Archivo del Boletín
          </RouterLink>
        </div>

        <div class="home-hero-stats">
          <div class="home-hero-pill">
            <span class="pill-label">Noticias</span>
            <span class="pill-value">
              {{ homeNoticias.length || '—' }} en la demo
            </span>
          </div>
          <div class="home-hero-pill">
            <span class="pill-label">Blogs</span>
            <span class="pill-value">
              {{ homeBlogs.length || '—' }}
            </span>
          </div>
          <div class="home-hero-pill">
            <span class="pill-label">Actividades</span>
            <span class="pill-value">
              {{ homeActivities.length || '—' }}
            </span>
          </div>
        </div>
      </article>

      <!-- Columna derecha: HERO real o placeholder -->
      <section class="home-hero-card-wrapper">
        <div v-if="loadingHero" class="home-hero-card home-hero-card--loading">
          Cargando tema del mes…
        </div>

        <article
          v-else-if="heroBulletin"
          class="home-hero-card home-hero-card--bulletin"
        >
          <header class="home-hero-card-header">
            <span class="home-hero-chip">Tema del mes</span>
            <RouterLink
              class="home-hero-mini-link"
              :to="{ name: 'bulletins' }"
            >
              Ver archivo completo →
            </RouterLink>
          </header>

          <div class="home-hero-card-body">
            <div class="home-hero-card-media" v-if="heroBulletin.cover_image">
              <img
                :src="mediaUrl(heroBulletin.cover_image.url)"
                :alt="heroBulletin.title"
              />
            </div>

            <div class="home-hero-card-text">
              <p class="home-hero-card-meta">
                {{ heroBulletin.period_text || 'Edición especial' }}
                <span v-if="heroBulletin.issue_date">
                  · {{ formatDate(heroBulletin.issue_date) }}
                </span>
              </p>
              <h2 class="home-hero-card-title">
                {{ heroBulletin.title }}
              </h2>
              <p
                class="home-hero-card-summary"
                v-html="plainSummary(heroBulletin.description, 180)"
              ></p>

              <a
                v-if="heroBulletin.flip_url"
                class="home-hero-link-main"
                :href="heroBulletin.flip_url"
                target="_blank"
                rel="noopener"
              >
                Ver edición en flipbook →
              </a>
            </div>
          </div>
        </article>

        <!-- Placeholder si no hay hero configurado -->
        <article
          v-else
          class="home-hero-card home-hero-card--placeholder"
        >
          <h3 class="placeholder-title">Idea para producción real</h3>
          <p class="placeholder-text">
            Aquí se cargaría automáticamente el boletín marcado como
            <strong>“tema del mes”</strong> en Strapi (campo
            <code>is_hero</code>), mostrando su portada, periodo, breve
            descripción y el enlace directo al flipbook.
          </p>
          <p class="placeholder-text">
            Para probarlo, marca cualquier registro de
            <strong>Bulletins</strong> con <code>is_hero = true</code> y
            recarga la página.
          </p>
        </article>
      </section>
    </section>

    <!-- ================= BLOQUES PRINCIPALES ================= -->
    <section class="home-main-grid">
      <!-- Noticias -->
      <section class="home-block">
        <header class="home-block-header home-block-header--news">
          <h3 class="home-block-title">Noticias</h3>
          <RouterLink class="home-block-link" :to="{ name: 'noticias' }">
            Ver todas →
          </RouterLink>
        </header>

        <div class="home-block-body">
          <p v-if="!homeNoticias.length" class="home-empty">
            Aún no hay noticias cargadas en Strapi.
          </p>

          <article
            v-for="n in homeNoticias"
            :key="n.id"
            class="home-row"
          >
            <RouterLink
              class="home-row-link"
              :to="{ name: 'noticia-detalle', params: { slug: n.slug || n.id } }"
            >
              <div
                v-if="n.cover_image"
                class="home-row-image"
              >
                <img :src="mediaUrl(n.cover_image.url)" :alt="n.title" />
              </div>

              <div class="home-row-body">
                <p class="home-row-meta">
                  {{ formatDate(n.date) }}
                  <span v-if="n.country"> · {{ n.country }}</span>
                </p>
                <h4 class="home-row-title">
                  {{ n.title }}
                </h4>
                <p class="home-row-summary">
                  {{ plainSummary(n.summary, 110) }}
                </p>
              </div>
            </RouterLink>
          </article>
        </div>
      </section>

      <!-- Blogs -->
      <section class="home-block">
        <header class="home-block-header home-block-header--blogs">
          <h3 class="home-block-title">Blogs</h3>
          <RouterLink class="home-block-link" :to="{ name: 'blogs' }">
            Ver blogs →
          </RouterLink>
        </header>

        <div class="home-block-body">
          <p v-if="!homeBlogs.length" class="home-empty">
            Aquí se listarían los blogs recientes publicados en Strapi.
          </p>

          <article
            v-for="b in homeBlogs"
            :key="b.id"
            class="home-row home-row--compact"
          >
            <RouterLink
              class="home-row-link"
              :to="{ name: 'blogs', query: { destacado: b.slug } }"
            >
              <div
                v-if="b.cover_image"
                class="home-row-image home-row-image--small"
              >
                <img :src="mediaUrl(b.cover_image.url)" :alt="b.title" />
              </div>

              <div class="home-row-body">
                <p class="home-row-meta">
                  {{ formatDate(b.date) }}
                  <span v-if="b.author_name"> · {{ b.author_name }}</span>
                </p>
                <h4 class="home-row-title">
                  {{ b.title }}
                </h4>
                <p class="home-row-summary">
                  {{ plainSummary(b.summary, 90) }}
                </p>
              </div>
            </RouterLink>
          </article>
        </div>
      </section>

      <!-- Actividades -->
      <section class="home-block">
        <header class="home-block-header home-block-header--activities">
          <h3 class="home-block-title">Actividades</h3>
          <RouterLink class="home-block-link" :to="{ name: 'activities' }">
            Ver actividades →
          </RouterLink>
        </header>

        <div class="home-block-body">
          <p v-if="!homeActivities.length" class="home-empty">
            Aquí aparecerán jornadas, campañas y proyectos programados.
          </p>

          <article
            v-for="a in homeActivities"
            :key="a.id"
            class="home-row home-row--compact"
          >
            <RouterLink
              class="home-row-link"
              :to="{ name: 'activities', query: { destacado: a.slug } }"
            >
              <div
                v-if="a.cover_image"
                class="home-row-image home-row-image--small"
              >
                <img :src="mediaUrl(a.cover_image.url)" :alt="a.title" />
              </div>

              <div class="home-row-body">
                <p class="home-row-meta">
                  {{ formatDate(a.date) }}
                  <span v-if="a.location"> · {{ a.location }}</span>
                </p>
                <h4 class="home-row-title">
                  {{ a.title }}
                </h4>
                <p class="home-row-summary">
                  {{ plainSummary(a.summary, 90) }}
                </p>
              </div>
            </RouterLink>
          </article>
        </div>
      </section>
    </section>

    <!-- ================= NOTA TÉCNICA (MAQUETA) ================= -->
    <section class="home-note">
      <p class="home-note-title">Nota técnica de la demo</p>
      <p class="home-note-text">
        Esta página de inicio imita la estructura del Boletín real: banner
        principal con tema del mes, bloques de noticias, blogs y actividades.
        Algunas zonas siguen siendo maquetas estáticas para dejar claro
        <strong>qué se podría automatizar</strong> cuando el proyecto entre en
        producción.
      </p>
    </section>
  </section>
</template>

<style scoped>
/* Layout general del home (todo cuadrado, sin border-radius) */
.home {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ===== HERO GRID ===== */
.home-hero-grid {
  display: grid;
  grid-template-columns: 1.7fr 1.3fr;
  gap: 1.25rem;
}

.home-hero-intro {
  background: #ffffff;
  border: 1px solid var(--bs-border);
  padding: 1.2rem 1.3rem;
}

.home-hero-kicker {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7280;
  margin-bottom: 0.35rem;
}

.home-hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
  color: var(--bs-blue);
}

.home-hero-text {
  font-size: 0.95rem;
  color: #4b5563;
  margin-bottom: 0.9rem;
}

.home-hero-buttons {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
}

.home-btn-primary {
  background: var(--bs-blue);
  color: #ffffff;
  border-color: var(--bs-blue);
}

.home-btn-primary:hover {
  filter: brightness(0.95);
}

.home-btn-outline {
  background: #ffffff;
  color: var(--bs-blue);
  border-color: var(--bs-blue);
}

.home-btn-outline:hover {
  background: #f3f4f6;
}

.home-hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.home-hero-pill {
  border: 1px solid var(--bs-border);
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.pill-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-right: 0.35rem;
}

.pill-value {
  font-weight: 600;
}

/* Hero derecha */
.home-hero-card-wrapper {
  display: flex;
}

.home-hero-card {
  background: #0f172a;
  color: #e5e7eb;
  border: 1px solid #1f2937;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.home-hero-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0.8rem;
  border-bottom: 1px solid #1f2937;
  background: linear-gradient(
    to right,
    var(--bs-red),
    var(--bs-yellow-main),
    var(--bs-blue)
  );
  color: #f9fafb;
}

.home-hero-chip {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.home-hero-mini-link {
  font-size: 0.8rem;
  color: #f9fafb;
  text-decoration: none;
}

.home-hero-mini-link:hover {
  text-decoration: underline;
}

.home-hero-card-body {
  display: grid;
  grid-template-columns: 1.4fr 1.6fr;
}

.home-hero-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-hero-card-text {
  padding: 0.8rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.home-hero-card-meta {
  font-size: 0.78rem;
  color: #9ca3af;
}

.home-hero-card-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.home-hero-card-summary {
  font-size: 0.88rem;
  color: #d1d5db;
}

.home-hero-link-main {
  margin-top: 0.3rem;
  font-size: 0.86rem;
  color: #bfdbfe;
  text-decoration: none;
}

.home-hero-link-main:hover {
  text-decoration: underline;
}

/* Variantes */
.home-hero-card--loading {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.home-hero-card--placeholder {
  background: #ffffff;
  color: #374151;
  border-style: dashed;
  padding: 0.9rem 1rem;
}

.placeholder-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.4rem;
  color: #6b7280;
}

.placeholder-text {
  font-size: 0.88rem;
  margin-bottom: 0.35rem;
}

/* ===== GRID PRINCIPAL ===== */
.home-main-grid {
  display: grid;
  grid-template-columns: 1.4fr 1.1fr 1.1fr;
  gap: 1rem;
}

/* Bloques tipo “barra de color” */
.home-block {
  background: #ffffff;
  border: 1px solid var(--bs-border);
  display: flex;
  flex-direction: column;
}

.home-block-header {
  padding: 0.45rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  font-size: 0.86rem;
  font-weight: 600;
}

/* Barras con gradiente de la paleta */
.home-block-header--news {
  border-bottom: 2px solid var(--bs-border);
  background: linear-gradient(
    to right,
    var(--bs-yellow-main),
    var(--bs-red),
    var(--bs-blue)
  );
  color: #f9fafb;
}

.home-block-header--blogs {
  border-bottom: 2px solid var(--bs-border);
  background: linear-gradient(to right, var(--bs-red), var(--bs-blue));
  color: #f9fafb;
}

.home-block-header--activities {
  border-bottom: 2px solid var(--bs-border);
  background: linear-gradient(to right, var(--bs-blue), var(--bs-yellow-main));
  color: #f9fafb;
}

.home-block-title {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.home-block-link {
  font-size: 0.8rem;
  color: inherit;
  text-decoration: none;
}

.home-block-link:hover {
  text-decoration: underline;
}

.home-block-body {
  padding: 0.6rem 0.75rem 0.8rem;
}

.home-empty {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Filas internas */
.home-row {
  border-bottom: 1px solid #e5e7eb;
}

.home-row:last-child {
  border-bottom: none;
}

.home-row-link {
  display: flex;
  gap: 0.6rem;
  padding: 0.5rem 0;
  text-decoration: none;
  color: inherit;
}

.home-row-link:hover {
  background: #f9fafb;
}

.home-row-image {
  width: 120px;
  min-width: 120px;
  height: 80px;
  border: 1px solid var(--bs-border);
  overflow: hidden;
}

.home-row-image--small {
  width: 90px;
  min-width: 90px;
  height: 60px;
}

.home-row-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-row-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.home-row-meta {
  font-size: 0.78rem;
  color: #6b7280;
}

.home-row-title {
  font-size: 0.94rem;
  font-weight: 600;
}

.home-row-summary {
  font-size: 0.84rem;
  color: #4b5563;
}

.home-row--compact .home-row-summary {
  font-size: 0.8rem;
}

/* Nota técnica abajo */
.home-note {
  background: #ffffff;
  border: 1px dashed var(--bs-border);
  padding: 0.7rem 0.9rem;
  font-size: 0.86rem;
  color: #4b5563;
}

.home-note-title {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .home-hero-grid {
    grid-template-columns: 1fr;
  }

  .home-main-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .home-main-grid {
    grid-template-columns: 1fr;
  }

  .home-hero-card-body {
    grid-template-columns: 1fr;
  }
}
</style>
