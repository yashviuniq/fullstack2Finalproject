import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  highlight = false,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: highlight ? colors.primaryLight : colors.surface,
          borderColor: highlight ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {icon}
      </View>
      <Text
        style={[
          styles.value,
          { color: highlight ? colors.primary : colors.text },
        ]}
      >
        {value}
      </Text>
      {subtext ? (
        <Text style={[styles.subtext, { color: colors.textMuted }]}>{subtext}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
