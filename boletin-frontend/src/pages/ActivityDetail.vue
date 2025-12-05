<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchActivityBySlug, mediaUrl } from '../services/api';

const route = useRoute();
const slug = route.params.slug;

const activity = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    activity.value = await fetchActivityBySlug(slug);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="activity-detail">
    <div v-if="loading" class="loading">Cargando actividad…</div>

    <div v-else-if="!activity" class="not-found">
      <h2>Actividad no encontrada</h2>
      <RouterLink to="/activities">Volver</RouterLink>
    </div>

    <div v-else>
      <h1 class="title">{{ activity.title }}</h1>

      <p class="meta">
        <strong>Fecha:</strong> {{ activity.date }} <br>
        <strong>Lugar:</strong> {{ activity.location }}
      </p>

      <img
        v-if="activity.cover_image"
        :src="mediaUrl(activity.cover_image.url)"
        class="cover"
      >

      <div class="content" v-html="activity.content"></div>

      <div v-if="activity.gallery?.length" class="gallery">
        <h3>Galería</h3>
        <div class="grid">
          <img
            v-for="img in activity.gallery"
            :key="img.id"
            :src="mediaUrl(img.url)"
          >
        </div>
      </div>

      <RouterLink class="back" to="/activities">← Volver a actividades</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.activity-detail {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}
.title {
  font-size: 2rem;
  font-weight: 700;
  color: #004b87;
}
.cover {
  width: 100%;
  border-radius: 6px;
  margin: 1rem 0;
}
.gallery .grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.gallery img {
  width: 100%;
  border-radius: 6px;
}
.back {
  display: inline-block;
  margin-top: 2rem;
  color: #c00;
}
</style>
