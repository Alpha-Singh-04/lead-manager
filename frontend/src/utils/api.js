import { getCurrentApiUrl } from '../config/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.msg || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${getCurrentApiUrl()}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${getCurrentApiUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint, data) => {
    const response = await fetch(`${getCurrentApiUrl()}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${getCurrentApiUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
}; 