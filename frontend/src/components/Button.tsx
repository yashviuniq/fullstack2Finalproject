import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useAppTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surfaceElevated;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? colors.border : colors.primary;
    }
    return 'transparent';
  };

  const paddingVertical = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const paddingHorizontal = size === 'sm' ? 12 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical,
          paddingHorizontal,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
