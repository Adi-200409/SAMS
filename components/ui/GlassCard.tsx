import React from 'react';
import { ViewStyle, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | any;
  noPadding?: boolean;
  glowColor?: string;
  delay?: number;
}

export default function GlassCard({ children, style, noPadding, glowColor, delay = 0 }: GlassCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={[
        styles.cardContainer,
        glowColor && { shadowColor: glowColor, shadowOpacity: 0.3, shadowRadius: 20 },
        style,
      ]}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={[
          styles.blur,
          noPadding ? styles.noPadding : styles.padding,
        ]}
      >
        {children}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(20,20,35,0.4)', // Base tint for blur
  },
  blur: {
    flex: 1,
  },
  padding: {
    padding: Spacing.base,
  },
  noPadding: {
    padding: 0,
  },
});
