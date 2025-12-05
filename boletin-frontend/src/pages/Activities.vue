<script setup>
import { onMounted, ref } from 'vue';
import { fetchActivities, mediaUrl } from '../services/api';

const activities = ref([]);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetchActivities({
      _limit: 50
    });

    // Soporta respuesta de Strapi v3 y v4
    if (Array.isArray(res)) {
      activities.value = res;
    } else if (res && Array.isArray(res.data)) {
      activities.value = res.data.map((item) => ({
        id: item.id,
        ...item.attributes
      }));
    }
  } catch (err) {
    console.error(err);
    error.value = 'No se pudieron cargar las actividades.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="activities-page">
    <h1 class="page-title">Actividades</h1>

    <p class="activities-intro">
      Agenda de eventos, jornadas y proyectos del
      <strong>Boletín Salesiano</strong> en la región.
    </p>

    <!-- Estado de carga / error -->
    <div v-if="isLoading" class="activities-state">
      Cargando actividades…
    </div>
    <div v-else-if="error" class="activities-state activities-state-error">
      {{ error }}
    </div>

    <!-- Grid de actividades -->
    <div v-else class="activities-grid">
      <article
        v-for="activity in activities"
        :key="activity.id"
        class="activity-card"
      >
        <RouterLink
          :to="{ name: 'activity-detail', params: { slug: activity.slug } }"
          class="activity-card-link"
        >
          <div class="activity-image-wrapper">
            <img
              v-if="activity.cover_image"
              :src="mediaUrl(activity.cover_image.url || activity.cover_image.formats?.medium?.url)"
              :alt="activity.title"
              class="activity-image"
            />
            <div v-else class="activity-image-placeholder">
              Sin imagen
            </div>
          </div>

          <div class="activity-body">
            <p class="activity-date">
              {{ activity.date ? new Date(activity.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : 'Fecha por definir' }}
            </p>

            <h2 class="activity-title">
              {{ activity.title }}
            </h2>

            <p v-if="activity.location" class="activity-location">
              {{ activity.location }}
            </p>

            <p v-if="activity.summary" class="activity-summary">
              {{ activity.summary.replace(/<[^>]*>/g, '').slice(0, 140) }}<span v-if="activity.summary.length > 140">…</span>
            </p>

            <span class="activity-more">
              Ver detalle →
            </span>
          </div>
        </RouterLink>
      </article>

      <!-- Si no hubiera actividades -->
      <p v-if="!activities.length" class="activities-empty">
        Aún no hay actividades publicadas.
      </p>
    </div>
  </section>
</template>
