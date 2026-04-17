import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, getCategoryColor } from '../../constants/theme';
import GlassCard from '../ui/GlassCard';

interface ActivityCardProps {
  item: any;
}

export default function ActivityCard({ item }: ActivityCardProps) {
  const router = useRouter();
  const catColor = getCategoryColor(item.category);

  return (
    <TouchableOpacity onPress={() => router.push(`/activity/${item.id}` as any)} activeOpacity={0.8}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.catTag, { backgroundColor: catColor + '25' }]}>
            <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
          </View>
          <Text style={styles.points}>+{item.points_reward}pts</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta}>📍 {item.venue} · 🗓️ {new Date(item.start_date).toLocaleDateString()}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catTag: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  catText: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'capitalize' },
  points: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: Typography.bold },
  title: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: Typography.xs, color: Colors.textMuted },
});
