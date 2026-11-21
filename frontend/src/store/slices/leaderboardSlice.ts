import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leaderboardApi } from '../../api/leaderboard';
import { studentApi } from '../../api/student';
import {
  AwardPointsPayload,
  LeaderboardItem,
  LeaderboardResponse,
  PaginationInfo,
  StudentProfile,
} from '../../types';

export interface LeaderboardState {
  entries: LeaderboardItem[];
  pagination: PaginationInfo;
  myStats: StudentProfile | null;
  loading: boolean;
  refreshing: boolean;
  awarding: boolean;
  error: string | null;
  currentSortBy: string;
  currentDirection: string;
}

const initialPagination: PaginationInfo = {
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
  last: true,
};

const initialState: LeaderboardState = {
  entries: [],
  pagination: initialPagination,
  myStats: null,
  loading: false,
  refreshing: false,
  awarding: false,
  error: null,
  currentSortBy: 'totalPoints',
  currentDirection: 'DESC',
};

export const fetchLeaderboard = createAsyncThunk<
  LeaderboardResponse,
  { page?: number; size?: number; sortBy?: string; direction?: string; isRefresh?: boolean },
  { rejectValue: string }
>('leaderboard/fetchLeaderboard', async (params, { rejectWithValue }) => {
  try {
    const { page = 0, size = 10, sortBy = 'totalPoints', direction = 'DESC' } = params;
    const response = await leaderboardApi.getLeaderboard(page, size, sortBy, direction);
    return response;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Failed to fetch leaderboard';
    return rejectWithValue(msg);
  }
});

export const fetchMyStats = createAsyncThunk<StudentProfile, void, { rejectValue: string }>(
  'leaderboard/fetchMyStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentApi.getMyProfile();
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch personal stats';
      return rejectWithValue(msg);
    }
  }
);

export const awardStudentPoints = createAsyncThunk<
  LeaderboardItem,
  AwardPointsPayload,
  { rejectValue: string }
>('leaderboard/awardStudentPoints', async (payload, { rejectWithValue }) => {
  try {
    const response = await studentApi.awardPoints(
      payload.studentId,
      payload.pointsDelta,
      payload.reason
    );
    return response;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || 'Failed to award points';
    return rejectWithValue(msg);
  }
});

// Deterministic sort comparator matching backend:
// totalPoints DESC (or ASC), then updatedAt ASC, then id ASC
const sortDeterministic = (
  items: LeaderboardItem[],
  direction: string = 'DESC'
): LeaderboardItem[] => {
  const isAsc = direction.toUpperCase() === 'ASC';
  return [...items].sort((a, b) => {
    if (a.totalPoints !== b.totalPoints) {
      return isAsc ? a.totalPoints - b.totalPoints : b.totalPoints - a.totalPoints;
    }
    const timeDiff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.studentId - b.studentId;
  });
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: string; direction: string }>
    ) => {
      state.currentSortBy = action.payload.sortBy;
      state.currentDirection = action.payload.direction;
    },
    clearLeaderboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchLeaderboard
    builder.addCase(fetchLeaderboard.pending, (state, action) => {
      if (action.meta.arg.isRefresh) {
        state.refreshing = true;
      } else {
        state.loading = true;
      }
      state.error = null;
    });
    builder.addCase(
      fetchLeaderboard.fulfilled,
      (state, action: PayloadAction<LeaderboardResponse>) => {
        state.loading = false;
        state.refreshing = false;
        state.entries = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          last: action.payload.last,
        };
      }
    );
    builder.addCase(fetchLeaderboard.rejected, (state, action) => {
      state.loading = false;
      state.refreshing = false;
      state.error = action.payload || 'Failed to load leaderboard';
    });

    // fetchMyStats
    builder.addCase(fetchMyStats.fulfilled, (state, action: PayloadAction<StudentProfile>) => {
      state.myStats = action.payload;
    });

    // awardStudentPoints (Immediate state update and deterministic re-sorting)
    builder.addCase(awardStudentPoints.pending, (state) => {
      state.awarding = true;
      state.error = null;
    });
    builder.addCase(
      awardStudentPoints.fulfilled,
      (state, action: PayloadAction<LeaderboardItem>) => {
        state.awarding = false;
        const updated = action.payload;

        // Replace or update student in existing entries
        const existingIndex = state.entries.findIndex(
          (item) => item.studentId === updated.studentId
        );
        let updatedList: LeaderboardItem[];
        if (existingIndex !== -1) {
          updatedList = state.entries.map((item, idx) =>
            idx === existingIndex ? updated : item
          );
        } else {
          updatedList = [...state.entries, updated];
        }

        // Re-sort deterministically
        const sorted = sortDeterministic(updatedList, state.currentDirection);

        // Recalculate ranks based on page offset
        const baseRank = state.pagination.page * state.pagination.size;
        state.entries = sorted.map((item, idx) => ({
          ...item,
          rank: baseRank + idx + 1,
        }));

        // Also update myStats if the logged-in student had points awarded
        if (state.myStats && state.myStats.studentId === updated.studentId) {
          state.myStats.totalPoints = updated.totalPoints;
          state.myStats.rank = updated.rank;
          state.myStats.updatedAt = updated.updatedAt;
        }
      }
    );
    builder.addCase(awardStudentPoints.rejected, (state, action) => {
      state.awarding = false;
      state.error = action.payload || 'Failed to award points';
    });
  },
});

export const { setSorting, clearLeaderboardError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
