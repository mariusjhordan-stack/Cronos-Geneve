const API_BASE = import.meta.env.VITE_API_URL || '';
const AUTH_STORAGE_KEY = 'cronos_auth_tokens';

function readTokens() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function writeTokens(tokens) {
  try {
    if (tokens?.access && tokens?.refresh) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // La app sigue permitiendo el checkout invitado si el almacenamiento no está disponible.
  }
}

function notifySessionExpired() {
  writeTokens(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cronos:auth-expired'));
  }
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const firstValue = (value) => {
      if (typeof value === 'string') return value;
      if (Array.isArray(value)) return firstValue(value[0]);
      if (value && typeof value === 'object') return firstValue(Object.values(value)[0]);
      return '';
    };
    const detail = firstValue(data.detail || data.error || data.non_field_errors || data);
    const error = new Error(detail || `Error de API (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// Single-flight: una sola renovación en curso. Las peticiones concurrentes
// Single-flight: una sola renovación en curso. Las peticiones concurrentes
// que reciben 401 comparten la misma promesa en lugar de refrescar a la vez.
let refreshPromise = null;

async function doRefresh(currentRefresh) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: currentRefresh }),
    });
    if (!response.ok) {
      notifySessionExpired();
      return null;
    }
    const updated = await parseResponse(response);
    if (!updated?.access) {
      notifySessionExpired();
      return null;
    }
    const fresh = { access: updated.access, refresh: updated.refresh || currentRefresh };
    writeTokens(fresh);
    return fresh;
  } catch {
    notifySessionExpired();
    return null;
  }
}

function refreshStoredToken() {
  const tokens = readTokens();
  if (!tokens?.refresh) {
    notifySessionExpired();
    return Promise.resolve(null);
  }
  if (!refreshPromise) {
    refreshPromise = doRefresh(tokens.refresh).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request(path, options = {}, { auth = true, retry = true } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const tokens = readTokens();
  if (auth && tokens?.access) headers.set('Authorization', `Bearer ${tokens.access}`);

  let response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401 && auth && retry) {
    const currentTokens = readTokens();
    if (currentTokens?.refresh) {
      const refreshed = await refreshStoredToken();
      if (refreshed?.access) {
        const retryHeaders = new Headers(options.headers || {});
        if (options.body && !(options.body instanceof FormData) && !retryHeaders.has('Content-Type')) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        retryHeaders.set('Authorization', `Bearer ${refreshed.access}`);
        const retryResponse = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders });
        if (retryResponse.status === 401) {
          notifySessionExpired();
        }
        return parseResponse(retryResponse);
      }
    } else {
      notifySessionExpired();
    }
  }

  return parseResponse(response);
}

function jsonBody(value) {
  return JSON.stringify(value);
}

function getOrderToken(orderId) {
  try {
    const map = JSON.parse(sessionStorage.getItem('cronos_order_tokens') || '{}');
    return map[String(orderId)] || null;
  } catch {
    return null;
  }
}

function saveOrderToken(orderId, token) {
  try {
    const map = JSON.parse(sessionStorage.getItem('cronos_order_tokens') || '{}');
    map[String(orderId)] = token;
    sessionStorage.setItem('cronos_order_tokens', JSON.stringify(map));
  } catch {
    // La URL mantiene el token de comprobante para compatibilidad con invitado.
  }
}

export const api = {
  getStoredTokens: readTokens,
  setTokens: writeTokens,

  async getRelojes(params = {}) {
    const query = new URLSearchParams();
    ['marca', 'movimiento', 'categoria', 'orden', 'page'].forEach((key) => {
      if (params[key]) query.append(key, params[key]);
    });
    if (params.buscar || params.q) query.append('buscar', params.buscar || params.q);
    const qs = query.toString();
    return request(`/api/relojes/${qs ? `?${qs}` : ''}`, {}, { auth: false });
  },

  async getAllRelojes(params = {}) {
    const items = [];
    for (let page = 1; page <= 50; page += 1) {
      const data = await this.getRelojes({ ...params, page });
      const batch = Array.isArray(data) ? data : (data.results || []);
      items.push(...batch);
      if (Array.isArray(data) || !data.next) break;
    }
    return items;
  },

  getReloj(id) { return request(`/api/relojes/${id}/`, {}, { auth: false }); },
  async getMarcas() {
    const data = await request('/api/marcas/', {}, { auth: false });
    return Array.isArray(data) ? data : (data.results || []);
  },
  async getCategorias() {
    const data = await request('/api/categorias/', {}, { auth: false });
    return Array.isArray(data) ? data : (data.results || []);
  },

  async register(data) {
    return request('/api/auth/register/', { method: 'POST', body: jsonBody(data) }, { auth: false });
  },

  async login(credentials) {
    const data = await request('/api/auth/login/', { method: 'POST', body: jsonBody(credentials) }, { auth: false });
    writeTokens({ access: data.access, refresh: data.refresh });
    return data;
  },

  async refresh() {
    const refreshed = await refreshStoredToken();
    if (!refreshed?.access) throw new Error('La sesión expiró. Inicie sesión nuevamente.');
    return readTokens();
  },

  async logout() {
    // Flujo robusto: intenta logout normal; si el access expiró (401),
    // renueva UNA vez (single-flight) y reintenta el logout una sola vez.
    // En cualquier caso la sesión local siempre queda limpia. Sin loops.
    try {
      const tokens = readTokens();
      if (!tokens?.refresh) return;
      const postLogout = (refresh) => request('/api/auth/logout/', {
        method: 'POST',
        body: jsonBody({ refresh }),
      }, { retry: false });
      try {
        await postLogout(tokens.refresh);
      } catch (error) {
        const expiredAccess = error?.message?.includes('(401)');
        if (!expiredAccess) return;
        if (!await refreshStoredToken()) return;
        const fresh = readTokens();
        if (fresh?.refresh) {
          await postLogout(fresh.refresh).catch(() => {});
        }
      }
    } finally {
      writeTokens(null);
    }
  },

  me() { return request('/api/auth/me/'); },
  getPerfil() { return request('/api/perfil/'); },
  updatePerfil(data) { return request('/api/perfil/', { method: 'PATCH', body: jsonBody(data) }); },
  getDirecciones() { return request('/api/direcciones/'); },
  createDireccion(data) { return request('/api/direcciones/', { method: 'POST', body: jsonBody(data) }); },
  updateDireccion(id, data) { return request(`/api/direcciones/${id}/`, { method: 'PATCH', body: jsonBody(data) }); },
  deleteDireccion(id) { return request(`/api/direcciones/${id}/`, { method: 'DELETE' }); },
  getFavoritos() { return request('/api/favoritos/'); },
  addFavorito(relojId) { return request('/api/favoritos/', { method: 'POST', body: jsonBody({ reloj_id: relojId }) }); },
  removeFavorito(relojId) { return request(`/api/favoritos/${relojId}/`, { method: 'DELETE' }); },
  getMisOrdenes(page = 1) {
    const qs = typeof page === 'number' ? (page > 1 ? `?page=${page}` : '') : (page || '');
    return request(`/api/me/ordenes/${qs}`);
  },
  getMiOrden(id) { return request(`/api/me/ordenes/${id}/`); },

  async checkout(orderData, idempotencyKey) {
    const result = await request('/api/pedidos/checkout/', {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      body: jsonBody(orderData),
    });
    if (result?.orden?.id && result?.token_acceso) saveOrderToken(result.orden.id, result.token_acceso);
    return result;
  },

  getPaymentStatus(reference, paymentId = '') {
    const qs = paymentId ? `?payment_id=${encodeURIComponent(paymentId)}` : '';
    return request(`/api/pedidos/pagos/${encodeURIComponent(reference)}/${qs}`, {}, { auth: false });
  },

  validateCart(items) {
    return request('/api/pedidos/carrito/validar/', { method: 'POST', body: jsonBody({ items }) }, { auth: false });
  },

  async getOrden(id, token = null) {
    const tokens = readTokens();
    if (tokens?.access || tokens?.refresh) {
      try {
        return await this.getMiOrden(id);
      } catch (error) {
        if (error.status === 404 || error.message?.includes('404')) {
          throw error;
        }
        const guestToken = token || getOrderToken(id);
        if (!guestToken) throw error;
      }
    }
    const accessToken = token || getOrderToken(id) || '';
    if (!accessToken && !tokens?.access) {
      throw new Error('Comprobante no disponible. Se requiere token de acceso.');
    }
    const qs = accessToken ? `?token=${encodeURIComponent(accessToken)}` : '';
    return request(`/api/pedidos/ordenes/${id}/${qs}`, {}, { auth: false });
  },

  getOrderToken,
  saveOrderToken,
};
