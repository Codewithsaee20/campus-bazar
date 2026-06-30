import api, { publicApi } from './api';

const withQuery = (url, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const authApi = {
  async sendOtp(identifier) {
    const payload = {
      email: identifier,
      identifier,
    };
    return api.post('/auth/send-otp', payload);
  },

  async verifyOtp(identifier, otp) {
    const payload = {
      email: identifier,
      identifier,
      otp,
    };
    return api.post('/auth/verify-otp', payload);
  },

  async getProfile() {
    return api.get('/auth/me');
  },

  async refresh() {
    return api.post('/auth/refresh');
  },

  async logout() {
    return api.post('/auth/logout');
  },
};

export const listingApi = {
  async getAll(filters = {}) {
    return api.get(withQuery('/listings', filters));
  },

  async getById(id) {
    return api.get(`/listings/${id}`);
  },

  async create(formData) {
    return api.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async update(id, formData) {
    return api.put(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async remove(id) {
    return api.delete(`/listings/${id}`);
  },
};

export const categoryApi = {
  async getAll() {
    return publicApi.get('/categories');
  },
};

export const bookApi = {
  async search(query) {
    return api.get(withQuery('/books/search', { q: query, query }));
  },

  async getById(id) {
    return api.get(`/books/${id}`);
  },

  async findOrCreate(payload) {
    try {
      return await api.post('/books/find-or-create', payload);
    } catch (error) {
      return api.post('/books', payload);
    }
  },
};

export const interestApi = {
  async create(payload) {
    return api.post('/interest', payload);
  },

  async getMine() {
    try {
      return await api.get('/interest/my');
    } catch (error) {
      return api.get('/interest');
    }
  },
};

export const reportApi = {
  async create(payload) {
    return api.post('/reports', payload);
  },
};

export const orderApi = {
  async create(payload) {
    return api.post('/orders', payload);
  },

  async getMyBuying() {
    return api.get('/orders/my/buying');
  },

  async getMySelling() {
    return api.get('/orders/my/selling');
  },

  async getById(id) {
    return api.get(`/orders/${id}`);
  },

  async cancel(id, reason) {
    return api.patch(`/orders/${id}/cancel`, { reason });
  },

  async accept(id) {
    return api.patch(`/orders/${id}/accept`, {});
  },

  async generateOtp(id) {
    return api.post(`/orders/${id}/otp/generate`, {});
  },

  async verifyOtp(id, otp) {
    return api.post(`/orders/${id}/otp/verify`, { otp });
  },
};

export const unwrapData = (response) => {
  if (response?.data?.data !== undefined) return response.data.data;
  return response?.data;
};
