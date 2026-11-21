import { apiClient } from './client';
import { LeaderboardItem, StudentProfile } from '../types';

export const studentApi = {
  getMyProfile: async (): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>('/api/v1/students/me');
    return response.data;
  },

  awardPoints: async (
    studentId: number,
    pointsDelta: number,
    reason: string
  ): Promise<LeaderboardItem> => {
    const response = await apiClient.post<LeaderboardItem>(
      `/api/v1/students/${studentId}/points`,
      { pointsDelta, reason }
    );
    return response.data;
  },
};
