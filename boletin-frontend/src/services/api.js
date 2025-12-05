/* ============================================================
   STRAPI BASE CONFIG
   ============================================================ */

const BASE_URL = 'http://localhost:1337';

/**
 * GET genérico
 * Compatible con Strapi v3/v4
 */
async function get(path, params = {}) {
  const url = new URL(BASE_URL + path);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });

  const res = await fetch(url.toString());

  if (!res.ok) {
    console.error('❌ Error al llamar a Strapi:', res.status, res.statusText);
    throw new Error(`Error ${res.status}`);
  }

  return res.json();
}

/**
 * Construye URLs de imágenes (Strapi v3/v4)
 */
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return BASE_URL + path;
}



/* ============================================================
   NOTICIAS
   ============================================================ */

/**
 * Lista de noticias
 */
export function fetchNoticias(params = {}) {
  return get('/noticias', {
    _sort: 'date:DESC',
    ...params
  });
}

/**
 * Una noticia por ID
 */
export function fetchNoticiaById(id) {
  return get(`/noticias/${id}`);
}

/**
 * Una noticia por slug
 */
export async function fetchNoticiaBySlug(slug) {
  if (!slug) return null;

  const res = await get('/noticias', {
    slug,
    _limit: 1
  });

  let noticia =
    Array.isArray(res) && res.length ? res[0] :
    res?.data?.length ? res.data[0] :
    null;

  return noticia;
}



/* ============================================================
   BULLETINS
   ============================================================ */

export function fetchBulletins(params = {}) {
  return get('/bulletins', {
    _sort: 'issue_date:DESC',
    ...params
  });
}

export async function fetchHeroBulletin() {
  const res = await get('/bulletins', {
    is_hero: true,
    _limit: 1
  });

  if (Array.isArray(res) && res.length) return res[0];
  if (res?.data?.length) return res.data[0];

  return null;
}



/* ============================================================
   BLOGS
   ============================================================ */

export function fetchBlogs(params = {}) {
  return get('/blogs', {
    _sort: 'date:DESC',
    ...params
  });
}

export async function fetchBlogBySlug(slug) {
  if (!slug) return null;

  const res = await get('/blogs', {
    slug,
    _limit: 1
  });

  if (Array.isArray(res) && res.length > 0) return res[0];
  if (res?.data?.length) return res.data[0];

  return null;
}



/* ============================================================
   ACTIVITIES
   ============================================================ */

export async function fetchActivities(params = {}) {
  const res = await get('/activities', {
    _sort: 'date:DESC',
    ...params
  });

  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;

  return [];
}

export async function fetchActivityBySlug(slug) {
  if (!slug) return null;

  const res = await get('/activities', {
    slug,
    _limit: 1
  });

  if (Array.isArray(res) && res.length > 0) return res[0];
  if (res?.data?.length) return res.data[0];

  return null;
}
