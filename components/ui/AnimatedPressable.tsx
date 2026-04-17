import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

export default function AnimatedPressable({ 
  children, 
  style, 
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  ...rest 
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withTiming(scaleTo, { duration: 100 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable 
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
