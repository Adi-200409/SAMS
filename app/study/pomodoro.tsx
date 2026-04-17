import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import api from '../../services/api';

const MODES = [
  { label: 'Focus', duration: 25 * 60, color: Colors.primary },
  { label: 'Short Break', duration: 5 * 60, color: Colors.secondary },
  { label: 'Long Break', duration: 15 * 60, color: Colors.accent },
];

export default function PomodoroScreen() {
  const router = useRouter();
  const [modeIndex, setModeIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const [subject, setSubject] = useState('General Study');
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mode = MODES[modeIndex];
  const progress = 1 - timeLeft / mode.duration;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            Vibration.vibrate([0, 500, 200, 500]);
            handleTimerEnd();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, modeIndex]);

  const handleTimerEnd = () => {
    if (modeIndex === 0) {
      // Completed a focus session
      setPomodoros((p) => p + 1);
      Alert.alert('🍅 Pomodoro Complete!', `Great work! You've completed ${pomodoros + 1} pomodoro(s). Take a break!`, [
        { text: 'Short Break', onPress: () => switchMode(1) },
        { text: 'Long Break', onPress: () => switchMode(2) },
      ]);
    } else {
      Alert.alert('Break Done!', 'Ready to focus again?', [
        { text: 'Start Focus', onPress: () => switchMode(0) },
      ]);
    }
  };

  const switchMode = (idx: number) => {
    setModeIndex(idx);
    setTimeLeft(MODES[idx].duration);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (!isRunning && !sessionStart) {
      setSessionStart(new Date());
    }
    setIsRunning((r) => !r);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode.duration);
  };

  const saveSession = async () => {
    if (pomodoros === 0) {
      Alert.alert('No session', 'Complete at least one Pomodoro to save.');
      return;
    }
    try {
      await api.post('/study-sessions/', {
        subject,
        start_time: sessionStart?.toISOString() || new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: pomodoros * 25,
        pomodoros_completed: pomodoros,
      });
      Alert.alert('✅ Session Saved!', `+${pomodoros * 10} points earned!`);
      setPomodoros(0);
      setSessionStart(null);
    } catch {
      Alert.alert('Error', 'Could not save session.');
    }
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const circumference = 2 * Math.PI * 90;

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍅 Pomodoro Timer</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mode Selector */}
      <View style={styles.modeRow}>
        {MODES.map((m, i) => (
          <TouchableOpacity
            key={m.label}
            style={[styles.modeBtn, modeIndex === i && { backgroundColor: mode.color + '30', borderColor: mode.color }]}
            onPress={() => switchMode(i)}
          >
            <Text style={[styles.modeBtnText, modeIndex === i && { color: mode.color }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Circle */}
      <View style={styles.timerSection}>
        <View style={styles.timerOuter}>
          <LinearGradient colors={[mode.color, mode.color + '55']} style={styles.timerRing}>
            <View style={styles.timerInner}>
              <Text style={[styles.timerText, { color: mode.color }]}>{mins}:{secs}</Text>
              <Text style={styles.timerMode}>{mode.label}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Pomodoro Count */}
      <View style={styles.pomRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[styles.pomDot, i < pomodoros % 4 && { backgroundColor: mode.color }]} />
        ))}
        <Text style={styles.pomCount}>🍅 × {pomodoros}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Ionicons name="refresh" size={24} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: mode.color }]}
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          <Ionicons name={isRunning ? 'pause' : 'play'} size={36} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={saveSession}>
          <Ionicons name="save-outline" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <GlassCard style={styles.statsCard}>
        <View style={styles.statsRow}>
          <StatItem label="Today's Pomodoros" value={`${pomodoros} 🍅`} />
          <StatItem label="Focus Time" value={`${pomodoros * 25} min`} />
          <StatItem label="Points Earned" value={`${pomodoros * 10} ⭐`} />
        </View>
      </GlassCard>

      {/* Tips */}
      <GlassCard style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Pomodoro Tips</Text>
        <Text style={styles.tipText}>
          Work for 25 mins, take a 5-min break. After 4 pomodoros, take a long 15-min break.
          Save your session to earn XP points! 🚀
        </Text>
      </GlassCard>
    </LinearGradient>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary }}>{value}</Text>
      <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: Spacing.base, marginBottom: Spacing.xl },
  modeBtn: {
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  modeBtnText: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.semibold },
  timerSection: { alignItems: 'center', marginBottom: Spacing.xl },
  timerOuter: { width: 220, height: 220, borderRadius: 110, overflow: 'hidden' },
  timerRing: { flex: 1, padding: 6 },
  timerInner: {
    flex: 1, borderRadius: 100, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  timerText: { fontSize: 52, fontWeight: Typography.extrabold, letterSpacing: 2 },
  timerMode: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  pomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: Spacing.xl },
  pomDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.glassBorder },
  pomCount: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginLeft: 8 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xl, marginBottom: Spacing.xl },
  playBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  resetBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center' },
  statsCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm },
  statsRow: { flexDirection: 'row' },
  tipCard: { marginHorizontal: Spacing.base },
  tipTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 6 },
  tipText: { fontSize: Typography.xs, color: Colors.textMuted, lineHeight: 18 },
});
