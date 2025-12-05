<!-- src/pages/Bulletins.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchBulletins, mediaUrl } from '../services/api';

// Estado básico
const bulletins = ref([]);
const loading = ref(true);
const error = ref(null);

// Filtros
const searchTerm = ref('');
const yearFilter = ref('all');

// Cargar datos desde Strapi
onMounted(async () => {
  try {
    const res = await fetchBulletins();
    // Strapi v3: viene como array simple
    bulletins.value = Array.isArray(res) ? res : res.data || [];
  } catch (e) {
    console.error(e);
    error.value = 'No se pudieron cargar los boletines.';
  } finally {
    loading.value = false;
  }
});

// Años disponibles (para el select)
const years = computed(() => {
  const set = new Set();
  bulletins.value.forEach((b) => {
    if (b.issue_date) {
      const year = new Date(b.issue_date).getFullYear();
      if (!isNaN(year)) set.add(year);
    }
  });
  return Array.from(set).sort((a, b) => b - a);
});

// Filtro combinado por año + texto
const filteredBulletins = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  const year = yearFilter.value;

  return bulletins.value.filter((b) => {
    const matchesYear =
      year === 'all' ||
      (b.issue_date &&
        new Date(b.issue_date).getFullYear().toString() === year.toString());

    if (!matchesYear) return false;

    if (!term) return true;

    const haystack = [
      b.title,
      b.period_text,
      b.description,
      (b.tags && JSON.stringify(b.tags)) || ''
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
});

// Utilidad para mostrar fecha
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
</script>

<template>
  <section class="bulletins-page">
    <h2 class="page-title">Archivo Boletín</h2>

    <p class="bulletins-intro">
      Consulta ediciones anteriores del
      <strong>Boletín Salesiano</strong> en formato digital.
    </p>

    <!-- Controles de filtro -->
    <div class="bulletins-filters">
      <div class="bulletins-search">
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Buscar por título, periodo o palabras clave..."
        />
      </div>

      <div class="bulletins-year">
        <label for="year-select">Año:</label>
        <select id="year-select" v-model="yearFilter">
          <option value="all">Todos</option>
          <option
            v-for="year in years"
            :key="year"
            :value="year"
          >
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Estados básicos -->
    <div v-if="loading" class="bulletins-state">
      Cargando boletines…
    </div>
    <div v-else-if="error" class="bulletins-state bulletins-state-error">
      {{ error }}
    </div>
    <div
      v-else-if="!filteredBulletins.length"
      class="bulletins-state"
    >
      No se encontraron boletines con los filtros actuales.
    </div>

    <!-- Listado principal -->
    <div v-else class="bulletins-layout">
      <!-- Destacado (última edición) -->
      <article
        class="bulletins-featured"
        v-if="filteredBulletins.length"
      >
        <div class="bulletins-featured-image-wrapper">
          <img
            :src="mediaUrl(filteredBulletins[0].cover_image?.url)"
            :alt="filteredBulletins[0].title"
            class="bulletins-featured-image"
          />
        </div>

        <div class="bulletins-featured-body">
          <p class="bulletins-meta">
            {{ formatDate(filteredBulletins[0].issue_date) }}
            <span v-if="filteredBulletins[0].period_text">
              · {{ filteredBulletins[0].period_text }}
            </span>
          </p>
          <h3 class="bulletins-featured-title">
            {{ filteredBulletins[0].title }}
          </h3>
          <p
            v-if="filteredBulletins[0].description"
            class="bulletins-featured-description"
          >
            <!-- descripción corta (texto plano) -->
            {{
              String(filteredBulletins[0].description)
                .replace(/<[^>]+>/g, '')
                .slice(0, 220)
            }}{{ String(filteredBulletins[0].description).length > 220 ? '…' : '' }}
          </p>

          <div class="bulletins-featured-actions">
            <a
              v-if="filteredBulletins[0].flip_url"
              :href="filteredBulletins[0].flip_url"
              target="_blank"
              rel="noopener noreferrer"
              class="bulletins-btn bulletins-btn-primary"
            >
              Ver edición en flipbook →
            </a>
            <a
              v-if="filteredBulletins[0].cover_image?.url"
              :href="mediaUrl(filteredBulletins[0].cover_image.url)"
              target="_blank"
              rel="noopener noreferrer"
              class="bulletins-btn bulletins-btn-ghost"
            >
              Ver portada en grande
            </a>
          </div>

          <p class="bulletins-idea">
            IDEA PARA PRODUCCIÓN REAL · Aquí podría marcarse automáticamente
            la edición del mes y mostrarse en la homepage como banner principal.
          </p>
        </div>
      </article>

      <!-- Resto de boletines en grid -->
      <section class="bulletins-list-section">
        <h3 class="section-title section-title-main">
          Boletines en PDF
        </h3>

        <div class="bulletins-grid">
          <article
            v-for="(b, index) in filteredBulletins.slice(1)"
            :key="b.id || index"
            class="bulletins-card"
          >
            <div class="bulletins-card-image-wrapper">
              <img
                :src="mediaUrl(b.cover_image?.url)"
                :alt="b.title"
                class="bulletins-card-image"
              />
            </div>

            <div class="bulletins-card-body">
              <p class="bulletins-meta">
                {{ formatDate(b.issue_date) }}
                <span v-if="b.period_text">
                  · {{ b.period_text }}
                </span>
              </p>
              <h4 class="bulletins-card-title">
                {{ b.title }}
              </h4>

              <p
                v-if="b.description"
                class="bulletins-card-description"
              >
                {{
                  String(b.description)
                    .replace(/<[^>]+>/g, '')
                    .slice(0, 120)
                }}{{ String(b.description).length > 120 ? '…' : '' }}
              </p>

              <div class="bulletins-card-actions">
                <a
                  v-if="b.flip_url"
                  :href="b.flip_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bulletins-link"
                >
                  Ver en flipbook →
                </a>
                <a
                  v-if="b.cover_image?.url"
                  :href="mediaUrl(b.cover_image.url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bulletins-link bulletins-link-muted"
                >
                  Ver portada
                </a>
              </div>
            </div>
          </article>
        </div>

        <div class="bulletins-note">
          IDEA PARA PRODUCCIÓN REAL · Aquí podría integrarse un filtro avanzado
          por país o inspectoría, y un botón para descargar el PDF además del
          flipbook.
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.bulletins-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Intro */
.bulletins-intro {
  font-size: 0.92rem;
  color: #4b5563;
  margin-bottom: 0.4rem;
}

/* Filtros */
.bulletins-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.bulletins-search {
  flex: 1 1 260px;
}

.bulletins-search input {
  width: 100%;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--bs-border);
  font-size: 0.9rem;
  background: #f9fafb;
  outline: none;
}

.bulletins-search input:focus {
  background: #ffffff;
  border-color: var(--bs-yellow-main);
  box-shadow: 0 0 0 2px rgba(244, 152, 10, 0.25);
}

.bulletins-year {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.bulletins-year label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.bulletins-year select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--bs-border);
  background: #ffffff;
  font-size: 0.85rem;
}

/* Estados */
.bulletins-state {
  font-size: 0.9rem;
  color: #4b5563;
  padding: 0.75rem 0.5rem;
}

.bulletins-state-error {
  color: var(--bs-red);
}

/* Layout principal */
.bulletins-layout {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

/* Destacado */
.bulletins-featured {
  display: grid;
  grid-template-columns: 2fr 3fr;
  border: 1px solid var(--bs-border);
  background: #ffffff;
}

.bulletins-featured-image-wrapper {
  border-right: 1px solid var(--bs-border);
  background: #000;
}

.bulletins-featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bulletins-featured-body {
  padding: 1rem 1.25rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.bulletins-meta {
  font-size: 0.8rem;
  color: #6b7280;
}

.bulletins-featured-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--bs-blue);
}

.bulletins-featured-description {
  font-size: 0.9rem;
  color: #4b5563;
}

.bulletins-featured-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.bulletins-btn {
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid transparent;
  text-decoration: none;
  text-align: center;
}

.bulletins-btn-primary {
  background: var(--bs-blue);
  border-color: var(--bs-blue);
  color: #f9fafb;
}

.bulletins-btn-ghost {
  background: #ffffff;
  border-color: var(--bs-border);
  color: #1f2937;
}

.bulletins-idea {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: #6b7280;
  border-top: 1px dashed var(--bs-border);
  padding-top: 0.4rem;
}

/* Sección listado */
.bulletins-list-section {
  border: 1px solid var(--bs-border);
  background: #ffffff;
  padding: 0.9rem 1.1rem 1.1rem;
}

.section-title-main {
  position: relative;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 0.8rem;
  padding-top: 0.25rem;
}

.section-title-main::before {
  content: "";
  position: absolute;
  left: -1.1rem;
  right: -1.1rem;
  top: 0;
  height: 3px;
  background: linear-gradient(
    to right,
    var(--bs-blue),
    var(--bs-yellow-main),
    var(--bs-red)
  );
}

/* Grid de tarjetas */
.bulletins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.8rem;
}

.bulletins-card {
  border: 1px solid var(--bs-border);
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

.bulletins-card-image-wrapper {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #000;
}

.bulletins-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bulletins-card-body {
  padding: 0.65rem 0.75rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.bulletins-card-title {
  font-size: 0.96rem;
  font-weight: 600;
  color: #111827;
}

.bulletins-card-description {
  font-size: 0.83rem;
  color: #4b5563;
}

.bulletins-card-actions {
  margin-top: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.bulletins-link {
  font-size: 0.82rem;
  text-decoration: none;
  color: var(--bs-blue);
}

.bulletins-link-muted {
  color: #6b7280;
}

.bulletins-note {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  color: #6b7280;
  border-top: 1px dashed var(--bs-border);
  padding-top: 0.45rem;
}

/* Responsive */
@media (max-width: 900px) {
  .bulletins-featured {
    grid-template-columns: 1.3fr 2fr;
  }
}

@media (max-width: 720px) {
  .bulletins-featured {
    grid-template-columns: 1fr;
  }

  .bulletins-featured-image-wrapper {
    border-right: none;
    border-bottom: 1px solid var(--bs-border);
  }

  .section-title-main::before {
    left: -0.8rem;
    right: -0.8rem;
  }
}
</style>
