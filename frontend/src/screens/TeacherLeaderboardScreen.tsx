import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchLeaderboard,
  awardStudentPoints,
  setSorting,
} from '../store/slices/leaderboardSlice';
import { HeaderBar } from '../components/HeaderBar';
import { LeaderboardItemRow } from '../components/LeaderboardItemRow';
import { AwardPointsModal } from '../components/AwardPointsModal';
import { LeaderboardItem } from '../types';

export const TeacherLeaderboardScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const { entries, pagination, loading, refreshing, awarding, currentDirection } = useAppSelector(
    (state) => state.leaderboard
  );

  const [selectedStudent, setSelectedStudent] = useState<LeaderboardItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const loadData = useCallback(
    (page: number = 0, isRefresh: boolean = false, direction: string = currentDirection) => {
      dispatch(fetchLeaderboard({ page, size: 10, sortBy: 'totalPoints', direction, isRefresh }));
    },
    [dispatch, currentDirection]
  );

  useEffect(() => {
    loadData(0);
  }, [loadData]);

  const handleToggleSortDirection = () => {
    const nextDirection = currentDirection === 'DESC' ? 'ASC' : 'DESC';
    dispatch(setSorting({ sortBy: 'totalPoints', direction: nextDirection }));
    setCurrentPage(0);
    loadData(0, false, nextDirection);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
      loadData(newPage, false);
    }
  };

  const handleOpenAwardModal = (student: LeaderboardItem) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handleAwardSubmit = async (
    studentId: number,
    pointsDelta: number,
    reason: string
  ): Promise<void> => {
    const resultAction = await dispatch(
      awardStudentPoints({ studentId, pointsDelta, reason })
    );

    if (awardStudentPoints.fulfilled.match(resultAction)) {
      Alert.alert(
        'Points Adjusted',
        `Successfully ${pointsDelta > 0 ? 'awarded' : 'deducted'} ${Math.abs(pointsDelta)} points.`
      );
    } else {
      throw resultAction.payload || 'Failed to update points';
    }
  };

  const filteredEntries = entries.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.fullName.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
  });

  const renderHeader = () => (
    <View style={styles.headerControls}>
      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search students by name or email..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Action Strip: Stats & Sort Toggle */}
      <View style={styles.actionStrip}>
        <Text style={[styles.studentsCount, { color: colors.textSecondary }]}>
          Total Students: <Text style={{ fontWeight: '700', color: colors.text }}>{pagination.totalElements}</Text>
        </Text>

        <TouchableOpacity
          onPress={handleToggleSortDirection}
          style={[
            styles.sortButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name={currentDirection === 'DESC' ? 'arrow-down' : 'arrow-up'}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.sortButtonText, { color: colors.primary }]}>
            Points: {currentDirection === 'DESC' ? 'Highest First' : 'Lowest First'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (pagination.totalPages <= 1) return null;
    return (
      <View style={styles.paginationRow}>
        <TouchableOpacity
          disabled={pagination.page === 0}
          onPress={() => handlePageChange(pagination.page - 1)}
          style={[
            styles.pageBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pagination.page === 0 ? 0.4 : 1,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={16} color={colors.text} />
          <Text style={[styles.pageBtnText, { color: colors.text }]}>Prev</Text>
        </TouchableOpacity>

        <Text style={[styles.pageInfoText, { color: colors.textSecondary }]}>
          Page {pagination.page + 1} of {pagination.totalPages}
        </Text>

        <TouchableOpacity
          disabled={pagination.last}
          onPress={() => handlePageChange(pagination.page + 1)}
          style={[
            styles.pageBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pagination.last ? 0.4 : 1,
            },
          ]}
        >
          <Text style={[styles.pageBtnText, { color: colors.text }]}>Next</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="Teacher Dashboard"
        subtitle={`Welcome, ${user?.fullName || 'Faculty'}`}
      />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading student rankings...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.studentId.toString()}
          renderItem={({ item }) => (
            <LeaderboardItemRow
              item={item}
              isTeacher
              onPressAward={handleOpenAwardModal}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(currentPage, true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No students match your search.' : 'No students found.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Award / Adjust Points Modal */}
      <AwardPointsModal
        visible={modalVisible}
        student={selectedStudent}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAwardSubmit}
        loading={awarding}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerControls: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  studentsCount: {
    fontSize: 13,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pageInfoText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
