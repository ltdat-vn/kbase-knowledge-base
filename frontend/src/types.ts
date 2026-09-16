export type UserRole = 'ROLE_ADMIN' | 'ROLE_OWNER' | 'ROLE_USER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: User;
  memberCount: number;
  documentCount: number;
  currentUserRole?: string; // "OWNER" | "MEMBER" | "VIEWER" | "ADMIN"
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: number;
  user: User;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export type FileCategory =
  | 'DOCUMENT'
  | 'SPREADSHEET'
  | 'PRESENTATION'
  | 'IMAGE'
  | 'VIDEO'
  | 'TEXT'
  | 'OTHER';

export interface DocumentItem {
  id: number;
  title: string;
  originalFilename: string;
  contentType: string;
  fileCategory: FileCategory;
  fileSize: number;
  formattedSize: string;
  summary: string;
  projectId: number;
  projectName: string;
  uploadedBy: User;
  createdAt: string;
}

export interface SourceReference {
  documentId: number;
  documentTitle: string;
  originalFilename: string;
  snippet: string;
  score: number;
}

export interface ChatResponse {
  question: string;
  answer: string;
  projectId: number;
  references: SourceReference[];
}

export interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalDocuments: number;
  totalStorageBytes: number;
  formattedStorage: string;
}
