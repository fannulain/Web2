import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, USERNAME_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USERNAME_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

// Auth

export async function login(username) {
  const response = await api.post('/login', { username });
  const { token } = response.data;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);

  return token;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  window.location.href = '/login';
}

// Tasks

export async function createTask(text) {
  const response = await api.post('/tasks', { text });
  return response.data;
}

export async function getTasks() {
  const response = await api.get('/tasks');
  return response.data;
}

export async function getTask(id) {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
}

export async function updateTask(id, text) {
  const response = await api.put(`/tasks/${id}`, { text });
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
}

export default api;
