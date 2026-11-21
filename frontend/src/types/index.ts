export type Role = 'STUDENT' | 'TEACHER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PointTransaction {
  id: number;
  pointsDelta: number;
  reason: string;
  awardedByName: string;
  awardedByEmail: string;
  createdAt: string;
}

export interface StudentProfile {
  studentId: number;
  userId: number;
  fullName: string;
  email: string;
  totalPoints: number;
  rank: number;
  updatedAt: string;
  recentTransactions: PointTransaction[];
}

export interface LeaderboardItem {
  studentId: number;
  userId: number;
  fullName: string;
  email: string;
  totalPoints: number;
  rank: number;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface LeaderboardResponse extends PaginationInfo {
  items: LeaderboardItem[];
}

export interface AwardPointsPayload {
  studentId: number;
  pointsDelta: number;
  reason: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  border: string;
  badge: string;
  badgeText: string;
  error: string;
  success: string;
  card: string;
  accent: string;
}
