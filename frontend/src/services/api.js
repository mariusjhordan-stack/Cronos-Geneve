const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Servicio unificado para interactuar con la API REST de Django (DRF)
 */
export const api = {
  // Catálogo de relojes con filtros dinámicos
  async getRelojes(params = {}) {
    const query = new URLSearchParams();
    if (params.marca) query.append('marca', params.marca);
    if (params.movimiento) query.append('movimiento', params.movimiento);
    if (params.categoria) query.append('categoria', params.categoria);
    if (params.buscar || params.q) query.append('buscar', params.buscar || params.q);
    if (params.orden) query.append('orden', params.orden);
    if (params.page) query.append('page', params.page);

    const qs = query.toString();
    const url = `${API_BASE}/api/relojes/${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error al obtener relojes: ${res.statusText}`);
    }
    return await res.json();
  },

  // Detalle individual de un guardatiempo
  async getReloj(id) {
    const res = await fetch(`${API_BASE}/api/relojes/${id}/`);
    if (!res.ok) {
      throw new Error(`Error al obtener la pieza ${id}: ${res.statusText}`);
    }
    return await res.json();
  },

  // Manufacturas y marcas
  async getMarcas() {
    const res = await fetch(`${API_BASE}/api/marcas/`);
    if (!res.ok) {
      throw new Error(`Error al obtener marcas: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Categorías horológicas
  async getCategorias() {
    const res = await fetch(`${API_BASE}/api/categorias/`);
    if (!res.ok) {
      throw new Error(`Error al obtener categorías: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Protocolo de adquisición y emisión notarial (Checkout)
  async checkout(orderData) {
    const res = await fetch(`${API_BASE}/api/pedidos/checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Error al procesar la adquisición en bóveda');
    }
    return result;
  },

  // Recuperar certificado notarial de orden emitida
  async getOrden(id) {
    const res = await fetch(`${API_BASE}/api/pedidos/ordenes/${id}/`);
    if (!res.ok) {
      throw new Error(`Error al obtener la orden ${id}: ${res.statusText}`);
    }
    return await res.json();
  },
};
