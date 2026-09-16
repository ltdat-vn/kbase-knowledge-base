import axios from 'axios';
import {
  AuthResponse,
  ChatResponse,
  DocumentItem,
  FileCategory,
  Project,
  ProjectMember,
  SystemStats,
  User,
  UserRole,
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kbase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if on login or register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // localStorage.removeItem('kbase_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string):Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string, fullName: string, role?: UserRole): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', { email, password, fullName, role });
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects');
    return res.data;
  },
  getById: async (id: number): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (name: string, description: string): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', { name, description });
    return res.data;
  },
  update: async (id: number, name: string, description: string): Promise<Project> => {
    const res = await apiClient.put<Project>(`/projects/${id}`, { name, description });
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
  getMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const res = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return res.data;
  },
  inviteMember: async (projectId: number, email: string, role: string): Promise<ProjectMember> => {
    const res = await apiClient.post<ProjectMember>(`/projects/${projectId}/members`, { email, role });
    return res.data;
  },
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};

export const documentApi = {
  upload: async (
    projectId: number,
    file: File,
    title?: string,
    summary?: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('projectId', projectId.toString());
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (summary) formData.append('summary', summary);

    const res = await apiClient.post<DocumentItem>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },
  getByProject: async (projectId: number, category?: FileCategory): Promise<DocumentItem[]> => {
    const params = category ? { category } : {};
    const res = await apiClient.get<DocumentItem[]>(`/documents/project/${projectId}`, { params });
    return res.data;
  },
  search: async (projectId: number, query: string): Promise<DocumentItem[]> => {
    const res = await apiClient.get<DocumentItem[]>('/documents/search', {
      params: { projectId, query },
    });
    return res.data;
  },
  getById: async (id: number): Promise<DocumentItem> => {
    const res = await apiClient.get<DocumentItem>(`/documents/${id}`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
  getDownloadUrl: (id: number): string => `${API_BASE_URL}/documents/download/${id}`,
  getPreviewUrl: (id: number): string => `${API_BASE_URL}/documents/preview/${id}`,
};

export const chatApi = {
  askQuestion: async (projectId: number, question: string): Promise<ChatResponse> => {
    const res = await apiClient.post<ChatResponse>('/chat/ask', { projectId, question });
    return res.data;
  },
};

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },
  updateRole: async (id: number, role: UserRole): Promise<User> => {
    const res = await apiClient.put<User>(`/admin/users/${id}/role`, null, { params: { role } });
    return res.data;
  },
  toggleStatus: async (id: number): Promise<User> => {
    const res = await apiClient.put<User>(`/admin/users/${id}/toggle-status`);
    return res.data;
  },
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
  getStats: async (): Promise<SystemStats> => {
    const res = await apiClient.get<SystemStats>('/admin/stats');
    return res.data;
  },
};
