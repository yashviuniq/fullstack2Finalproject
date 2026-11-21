import { apiClient } from './client';
import { LeaderboardResponse } from '../types';

export const leaderboardApi = {
  getLeaderboard: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'totalPoints',
    direction: string = 'DESC'
  ): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<LeaderboardResponse>('/api/v1/leaderboard', {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  },
};
