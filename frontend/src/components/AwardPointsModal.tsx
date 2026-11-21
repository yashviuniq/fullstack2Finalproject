import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { LeaderboardItem } from '../types';
import { Input } from './Input';
import { Button } from './Button';

interface AwardPointsModalProps {
  visible: boolean;
  student: LeaderboardItem | null;
  onClose: () => void;
  onSubmit: (studentId: number, pointsDelta: number, reason: string) => Promise<void>;
  loading?: boolean;
}

export const AwardPointsModal: React.FC<AwardPointsModalProps> = ({
  visible,
  student,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { colors, isDark } = useAppTheme();
  const [pointsDelta, setPointsDelta] = useState<string>('10');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!student) return null;

  const quickPoints = [5, 10, 25, 50, -5, -10];

  const handleQuickSelect = (val: number) => {
    setPointsDelta(val.toString());
  };

  const handleSave = async () => {
    const delta = parseInt(pointsDelta, 10);
    if (isNaN(delta) || delta === 0) {
      setError('Please enter a non-zero integer for points delta');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for this point adjustment');
      return;
    }

    setError(null);
    try {
      await onSubmit(student.studentId, delta, reason.trim());
      setReason('');
      setPointsDelta('10');
      onClose();
    } catch (err: any) {
      setError(err || 'Failed to award points');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Award / Adjust Points
                  </Text>
                  <Text style={[styles.studentSubtext, { color: colors.textSecondary }]}>
                    Student: <Text style={{ fontWeight: '700', color: colors.primary }}>{student.fullName}</Text>
                  </Text>
                  <Text style={[styles.currentPoints, { color: colors.textMuted }]}>
                    Current Score: {student.totalPoints} pts • Rank #{student.rank}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceElevated }]}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Chips */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  Quick Point Shortcuts
                </Text>
                <View style={styles.chipsRow}>
                  {quickPoints.map((val) => {
                    const isSelected = pointsDelta === val.toString();
                    const isPositive = val > 0;
                    return (
                      <TouchableOpacity
                        key={val}
                        onPress={() => handleQuickSelect(val)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.surfaceElevated,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : isPositive
                                ? colors.success
                                : colors.error,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {isPositive ? `+${val}` : `${val}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Numeric Input */}
                <Input
                  label="Points Delta (Positive or Negative)"
                  value={pointsDelta}
                  onChangeText={setPointsDelta}
                  keyboardType="numeric"
                  placeholder="e.g. 15 or -10"
                />

                {/* Reason Input */}
                <Input
                  label="Reason / Notes"
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. Excellent presentation in Physics lab"
                  multiline
                  numberOfLines={3}
                />

                {error ? (
                  <View style={[styles.errorContainer, { backgroundColor: isDark ? '#451A1A' : '#FEE2E2' }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <Button
                    title="Cancel"
                    onPress={onClose}
                    variant="secondary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  />
                  <Button
                    title="Confirm Adjustment"
                    onPress={handleSave}
                    variant="primary"
                    style={{ flex: 1.5 }}
                    loading={loading}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 480,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  studentSubtext: {
    fontSize: 14,
    marginTop: 3,
  },
  currentPoints: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 54,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
