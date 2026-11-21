import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchLeaderboard, fetchMyStats } from '../store/slices/leaderboardSlice';
import { HeaderBar } from '../components/HeaderBar';
import { StatCard } from '../components/StatCard';
import { LeaderboardItemRow } from '../components/LeaderboardItemRow';
import { LeaderboardItem, PointTransaction } from '../types';

export const StudentDashboardScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const { entries, pagination, myStats, loading, refreshing } = useAppSelector(
    (state) => state.leaderboard
  );

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history'>('leaderboard');
  const [currentPage, setCurrentPage] = useState(0);

  const loadData = useCallback(
    (page: number = 0, isRefresh: boolean = false) => {
      dispatch(fetchLeaderboard({ page, size: 10, isRefresh }));
      dispatch(fetchMyStats());
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(0);
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
      dispatch(fetchLeaderboard({ page: newPage, size: 10 }));
    }
  };

  const renderTransactionItem = ({ item }: { item: PointTransaction }) => {
    const isPositive = item.pointsDelta > 0;
    const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.txCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.txDeltaBadge,
            {
              backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2',
              borderColor: isPositive ? colors.success : colors.error,
            },
          ]}
        >
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={isPositive ? colors.success : colors.error}
          />
          <Text
            style={[
              styles.txDeltaText,
              { color: isPositive ? colors.success : colors.error },
            ]}
          >
            {isPositive ? `+${item.pointsDelta}` : `${item.pointsDelta}`}
          </Text>
        </View>

        <View style={styles.txInfo}>
          <Text style={[styles.txReason, { color: colors.text }]}>{item.reason}</Text>
          <Text style={[styles.txTeacher, { color: colors.textSecondary }]}>
            Awarded by: {item.awardedByName} • {formattedDate}
          </Text>
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.headerWrapper}>
      {/* Overview Stat Cards */}
      <View style={styles.statsRow}>
        <StatCard
          label="Your Rank"
          value={myStats ? `#${myStats.rank}` : '—'}
          subtext="Deterministic ranking"
          icon={<Ionicons name="trophy" size={20} color={colors.accent} />}
          highlight
        />
        <StatCard
          label="Total Points"
          value={myStats ? myStats.totalPoints : 0}
          subtext="Academic credit points"
          icon={<Ionicons name="star" size={20} color={colors.primary} />}
        />
      </View>

      {/* Segmented Tab Controls */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surfaceElevated }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('leaderboard')}
          style={[
            styles.tabButton,
            activeTab === 'leaderboard' && { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons
            name="podium-outline"
            size={16}
            color={activeTab === 'leaderboard' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'leaderboard' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'leaderboard' ? '700' : '500',
              },
            ]}
          >
            Peer Leaderboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[
            styles.tabButton,
            activeTab === 'history' && { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === 'history' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'history' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'history' ? '700' : '500',
              },
            ]}
          >
            My Point History ({myStats?.recentTransactions?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginationFooter = () => {
    if (activeTab !== 'leaderboard' || pagination.totalPages <= 1) return null;
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
        title="Student Portal"
        subtitle={`Welcome, ${user?.fullName || 'Student'}`}
      />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading standings...
          </Text>
        </View>
      ) : activeTab === 'leaderboard' ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.studentId.toString()}
          renderItem={({ item }) => (
            <LeaderboardItemRow
              item={item}
              isCurrentStudent={item.userId === user?.id}
              isTeacher={false}
            />
          )}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderPaginationFooter}
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
              <Ionicons name="people-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No student entries found.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={myStats?.recentTransactions || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          ListHeaderComponent={renderListHeader}
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
              <Ionicons name="receipt-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No point adjustments recorded yet.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 13,
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
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  txDeltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 54,
    justifyContent: 'center',
    gap: 2,
  },
  txDeltaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  txInfo: {
    flex: 1,
  },
  txReason: {
    fontSize: 14,
    fontWeight: '600',
  },
  txTeacher: {
    fontSize: 12,
    marginTop: 3,
  },
});
