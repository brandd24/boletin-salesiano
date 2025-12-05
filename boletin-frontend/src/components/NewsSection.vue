<!-- src/components/NewsSection.vue -->
<template>
  <section class="news-section">
    <!-- Barra superior: título, filtros y buscador -->
    <header class="news-header">
      <div class="news-header-left">
        <h2 class="news-title">Latest News</h2>
        <p class="news-subtitle">
          Updates, stories and editorials from our community.
        </p>
      </div>

      <div class="news-header-right">
        <!-- Filtro por categoría -->
        <div class="category-filter">
          <button
            v-for="cat in categoriesWithAll"
            :key="cat"
            class="category-chip"
            :class="{ 'category-chip--active': categoryFilter === cat }"
            @click="setCategory(cat)"
          >
            {{ formatCategory(cat) }}
          </button>
        </div>

        <!-- Buscador -->
        <div class="search-wrapper">
          <input
            v-model="search"
            type="text"
            placeholder="Search in news..."
            class="search-input"
          />
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="news-content">
      <!-- Columna principal: noticia seleccionada -->
      <div class="news-main" v-if="selectedArticle">
        <article class="news-card news-card--featured fade-in-up" ref="printArea">
          <!-- Imagen principal -->
          <div class="news-card-image" v-if="selectedArticle.image">
            <img
              :src="mediaUrl(selectedArticle.image.url || selectedArticle.image)"
              :alt="selectedArticle.title"
              loading="lazy"
            />
          </div>

          <!-- Contenido -->
          <div class="news-card-body">
            <div class="news-meta-row">
              <span class="news-badge" v-if="selectedArticle.type === 'editorial'">
                Editorial
              </span>
              <span class="news-badge" v-else-if="selectedArticle.highlighted">
                Featured
              </span>

              <span class="news-meta-item">
                {{ formatDate(selectedArticle.date || selectedArticle.created_at) }}
              </span>
              <span class="news-meta-item">
                · {{ getReadingTime(selectedArticle) }} min read
              </span>
              <span
                v-if="selectedArticle.category"
                class="news-meta-item news-meta-category"
              >
                {{ formatCategory(selectedArticle.category) }}
              </span>
            </div>

            <h3 class="news-card-title">
              {{ selectedArticle.title }}
            </h3>

            <p v-if="selectedArticle.excerpt" class="news-card-excerpt">
              {{ selectedArticle.excerpt }}
            </p>

            <div
              class="news-card-content"
              v-html="selectedArticle.content"
            ></div>

            <!-- Barra de acciones -->
            <div class="news-actions">
              <button class="btn" @click="printCurrentArticle">
                Print / Save as PDF
              </button>
              <button class="btn btn-outline" @click="toggleBookmark(selectedArticle)">
                {{ isBookmarked(selectedArticle.id) ? 'Remove bookmark' : 'Add to bookmarks' }}
              </button>
            </div>
          </div>
        </article>

        <!-- Relacionados -->
        <section v-if="relatedArticles.length" class="related-section fade-in-up">
          <h4 class="related-title">Related articles</h4>
          <div class="related-grid">
            <article
              v-for="item in relatedArticles"
              :key="item.id"
              class="related-card"
              @click="selectArticle(item)"
            >
              <div class="related-image" v-if="item.image">
                <img
                  :src="mediaUrl(item.image.url || item.image)"
                  :alt="item.title"
                  loading="lazy"
                />
              </div>
              <div class="related-body">
                <h5 class="related-card-title">{{ item.title }}</h5>
                <p class="related-date">
                  {{ formatDate(item.date || item.created_at) }}
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- Columna lateral: lista de noticias -->
      <aside class="news-sidebar">
        <div class="sidebar-card">
          <h4 class="sidebar-title">Latest entries</h4>

          <div v-if="loading" class="sidebar-loading">
            <div class="skeleton-item" v-for="n in 4" :key="n"></div>
          </div>

          <div v-else-if="filteredList.length">
            <ul class="sidebar-list">
              <li
                v-for="item in filteredList"
                :key="item.id"
                class="sidebar-item fade-in-up"
                :class="{ 'sidebar-item--active': selectedArticle && selectedArticle.id === item.id }"
                @click="selectArticle(item)"
              >
                <div class="sidebar-text">
                  <h5 class="sidebar-item-title">{{ item.title }}</h5>
                  <p class="sidebar-item-meta">
                    {{ formatDate(item.date || item.created_at) }}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <p v-else class="sidebar-empty">No news found with these filters.</p>
        </div>

        <!-- Bookmarks locales -->
        <div v-if="bookmarkedArticles.length" class="sidebar-card sidebar-card--bookmarks">
          <h4 class="sidebar-title">Bookmarks</h4>
          <ul class="sidebar-list">
            <li
              v-for="item in bookmarkedArticles"
              :key="item.id"
              class="sidebar-item"
              @click="selectArticle(item)"
            >
              <div class="sidebar-text">
                <h5 class="sidebar-item-title">{{ item.title }}</h5>
                <p class="sidebar-item-meta">
                  {{ formatDate(item.date || item.created_at) }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- Estado de error -->
    <div v-if="error" class="news-error">
      {{ error }}
    </div>
  </section>
</template>

<script>
import { fetchNoticias, mediaUrl } from '@/services/api';

export default {
  name: 'NewsSection',
  data() {
    return {
      loading: true,
      error: null,
      news: [],
      selectedArticle: null,
      categoryFilter: 'all',
      search: '',
      bookmarks: [], // solo ids
    };
  },
  computed: {
    categories() {
      const set = new Set();
      this.news.forEach((item) => {
        if (item.category) {
          set.add(item.category);
        }
      });
      return Array.from(set);
    },
    categoriesWithAll() {
      return ['all', ...this.categories];
    },
    filteredList() {
      let list = [...this.news];

      if (this.categoryFilter !== 'all') {
        list = list.filter((item) => item.category === this.categoryFilter);
      }

      if (this.search.trim()) {
        const q = this.search.trim().toLowerCase();
        list = list.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.excerpt && item.excerpt.toLowerCase().includes(q))
        );
      }

      return list;
    },
    relatedArticles() {
      if (!this.selectedArticle || !this.selectedArticle.category) return [];
      return this.news
        .filter(
          (item) =>
            item.id !== this.selectedArticle.id &&
            item.category === this.selectedArticle.category
        )
        .slice(0, 3);
    },
    bookmarkedArticles() {
      return this.news.filter((item) => this.bookmarks.includes(item.id));
    },
  },
  methods: {
    mediaUrl,
    async loadNews() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetchNoticias({ page: 1, pageSize: 8 });
        this.news = Array.isArray(res) ? res : [];
        if (this.news.length > 0) {
          this.selectedArticle = this.news[0];
        }
      } catch (err) {
        console.error(err);
        this.error = 'There was a problem loading the news.';
      } finally {
        this.loading = false;
      }
    },
    selectArticle(article) {
      this.selectedArticle = article;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    setCategory(cat) {
      this.categoryFilter = cat;
    },
    formatCategory(cat) {
      if (cat === 'all') return 'All';
      return String(cat).charAt(0).toUpperCase() + String(cat).slice(1);
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    },
    getReadingTime(article) {
      if (!article || !article.content) return 1;
      const text = article.content.replace(/<[^>]+>/g, ' ');
      const words = text.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.round(words / 200));
      return minutes;
    },
    printCurrentArticle() {
      // Sencillo: usamos la impresión nativa del navegador.
      // En estilos definimos @media print para que solo se imprima lo importante.
      window.print();
    },
    loadBookmarks() {
      try {
        const raw = localStorage.getItem('newsBookmarks');
        if (!raw) return;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this.bookmarks = arr;
        }
      } catch (e) {
        console.warn('Error loading bookmarks from localStorage', e);
      }
    },
    saveBookmarks() {
      try {
        localStorage.setItem('newsBookmarks', JSON.stringify(this.bookmarks));
      } catch (e) {
        console.warn('Error saving bookmarks to localStorage', e);
      }
    },
    toggleBookmark(article) {
      const id = article.id;
      if (!id) return;
      if (this.bookmarks.includes(id)) {
        this.bookmarks = this.bookmarks.filter((x) => x !== id);
      } else {
        this.bookmarks = [...this.bookmarks, id];
      }
      this.saveBookmarks();
    },
    isBookmarked(id) {
      return this.bookmarks.includes(id);
    },
  },
  created() {
    this.loadBookmarks();
    this.loadNews();
  },
};
</script>

<style scoped>
.news-section {
  padding: 2.5rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #111827;
  background: #f9fafb;
}

/* Encabezado */
.news-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
}

.news-header-left {
  max-width: 420px;
}

.news-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.news-subtitle {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  color: #6b7280;
}

.news-header-right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Categorías */
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.category-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.category-chip--active {
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
}

/* Buscador */
.search-wrapper {
  display: flex;
  justify-content: flex-end;
}

.search-input {
  min-width: 220px;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
  outline: none;
  background: #ffffff;
}

.search-input:focus {
  border-color: #111827;
}

/* Layout principal */
.news-content {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(260px, 1fr);
  gap: 1.75rem;
}

/* Card principal */
.news-card {
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
}

.news-card-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 320px;
}

.news-card-body {
  padding: 1.5rem 1.75rem 1.5rem;
}

.news-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.news-badge {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #111827;
  color: #f9fafb;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.news-meta-item {
  display: inline-flex;
  align-items: center;
}

.news-meta-category {
  padding-left: 0.75rem;
  border-left: 1px solid #e5e7eb;
}

.news-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.news-card-excerpt {
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 0.9rem;
}

.news-card-content {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #111827;
}

.news-card-content p + p {
  margin-top: 0.5rem;
}

/* Acciones */
.news-actions {
  margin-top: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.btn {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  background: #111827;
  color: #f9fafb;
}

.btn-outline {
  background: #ffffff;
  color: #111827;
  border: 1px solid #d1d5db;
}

/* Relacionados */
.related-section {
  margin-top: 1.75rem;
}

.related-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.85rem;
}

.related-card {
  background: #ffffff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.related-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
}

.related-image img {
  width: 100%;
  height: 90px;
  object-fit: cover;
}

.related-body {
  padding: 0.6rem 0.75rem;
}

.related-card-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.related-date {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Sidebar */
.news-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.15);
}

.sidebar-card--bookmarks {
  background: #111827;
  color: #e5e7eb;
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.sidebar-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-item {
  padding: 0.55rem 0.55rem;
  border-radius: 0.7rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.sidebar-item--active {
  background: #111827;
  color: #f9fafb;
}

.sidebar-item:hover {
  background: rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.sidebar-card--bookmarks .sidebar-item:hover {
  background: rgba(249, 250, 251, 0.1);
}

.sidebar-text {
  display: flex;
  flex-direction: column;
}

.sidebar-item-title {
  font-size: 0.85rem;
  font-weight: 500;
}

.sidebar-item-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.sidebar-card--bookmarks .sidebar-item-meta {
  color: #9ca3af;
}

.sidebar-empty {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Loading skeleton */
.sidebar-loading {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-item {
  height: 38px;
  border-radius: 0.6rem;
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 40%,
    #e5e7eb 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}

/* Error */
.news-error {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #b91c1c;
}

/* Animaciones */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Imprimir solo la noticia principal */
@media print {
  body * {
    visibility: hidden;
  }
  .news-card--featured,
  .news-card--featured * {
    visibility: visible;
  }
  .news-card--featured {
    position: absolute;
    inset: 0;
    box-shadow: none;
  }
}

/* Responsivo */
@media (max-width: 960px) {
  .news-content {
    grid-template-columns: 1fr;
  }

  .news-sidebar {
    order: -1;
  }
}

@media (max-width: 640px) {
  .news-section {
    padding: 1.5rem 1rem;
  }

  .news-header {
    flex-direction: column;
  }

  .news-header-right {
    align-items: flex-start;
  }

  .search-wrapper {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }
}
</style>
