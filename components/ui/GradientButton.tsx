import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Typography } from '../../constants/theme';
import AnimatedPressable from './AnimatedPressable';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  colors?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  outline?: boolean;
}

export default function GradientButton({
  label, onPress, colors, style, textStyle, loading, disabled, small, outline,
}: GradientButtonProps) {
  const gradColors = colors || Colors.gradientPrimary;

  if (outline) {
    return (
      <AnimatedPressable
        style={[styles.outlineBtn, small && styles.small, style]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <Text style={[styles.outlineText, small && styles.smallText, textStyle]}>{label}</Text>
        )}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, small && styles.small, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.text, small && styles.smallText, textStyle]}>{label}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
  small: {
    borderRadius: Radius.md,
  },
  smallText: {
    fontSize: Typography.sm,
    paddingVertical: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  outlineBtn: {
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  outlineText: {
    color: Colors.primary,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
});
