import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { LeaderboardItem } from '../types';

interface LeaderboardItemRowProps {
  item: LeaderboardItem;
  isCurrentStudent?: boolean;
  onPressAward?: (item: LeaderboardItem) => void;
  isTeacher?: boolean;
}

export const LeaderboardItemRow: React.FC<LeaderboardItemRowProps> = ({
  item,
  isCurrentStudent = false,
  onPressAward,
  isTeacher = false,
}) => {
  const { colors, isDark } = useAppTheme();

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309', icon: 'trophy' };
      case 2:
        return { bg: '#F1F5F9', border: '#94A3B8', text: '#475569', icon: 'medal' };
      case 3:
        return { bg: '#FFEDD5', border: '#EA580C', text: '#C2410C', icon: 'ribbon' };
      default:
        return {
          bg: isDark ? colors.surfaceElevated : colors.surfaceElevated,
          border: colors.border,
          text: colors.textSecondary,
          icon: null,
        };
    }
  };

  const badge = getRankBadgeStyle(item.rank);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isCurrentStudent ? colors.primaryLight : colors.surface,
          borderColor: isCurrentStudent ? colors.primary : colors.border,
          borderWidth: isCurrentStudent ? 1.5 : 1,
        },
      ]}
    >
      {/* Rank Badge */}
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor: badge.bg,
            borderColor: badge.border,
          },
        ]}
      >
        {badge.icon && item.rank <= 3 ? (
          <Ionicons name={badge.icon as any} size={14} color={badge.text} style={{ marginBottom: 1 }} />
        ) : null}
        <Text style={[styles.rankText, { color: badge.text }]}>#{item.rank}</Text>
      </View>

      {/* Student Details */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.nameText,
              { color: isCurrentStudent ? colors.primary : colors.text },
            ]}
            numberOfLines={1}
          >
            {item.fullName}
          </Text>
          {isCurrentStudent && (
            <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.youBadgeText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={[styles.emailText, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.email}
        </Text>
      </View>

      {/* Points & Action */}
      <View style={styles.actionContainer}>
        <View style={[styles.pointsBadge, { backgroundColor: colors.badge }]}>
          <Ionicons name="star" size={14} color={colors.accent} />
          <Text style={[styles.pointsText, { color: colors.badgeText }]}>
            {item.totalPoints} pts
          </Text>
        </View>

        {isTeacher && onPressAward && (
          <TouchableOpacity
            onPress={() => onPressAward(item)}
            style={[styles.awardButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Award points to ${item.fullName}`}
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.awardButtonText}>Award</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    maxWidth: 150,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 12,
    marginTop: 2,
  },
  actionContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  awardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  awardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
