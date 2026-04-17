import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const TYPE_EMOJI: Record<string, string> = {
  video: '🎬', pdf: '📄', article: '📰', course: '🎓', book: '📚', tool: '🛠️',
};

const fetchResources = () => api.get('/resources/').then((r) => r.data.results || r.data);

export default function ResourcesScreen() {
  const router = useRouter();
  const { data: resources, isLoading } = useQuery({ queryKey: ['resources'], queryFn: fetchResources });

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📚 Resource Library</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={resources || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: Spacing.base, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.typeEmoji}>{TYPE_EMOJI[item.resource_type] || '📁'}</Text>
              <View style={styles.typeTag}>
                <Text style={styles.typeText}>{item.resource_type}</Text>
              </View>
              {item.is_free && (
                <View style={styles.freeTag}>
                  <Text style={styles.freeText}>FREE</Text>
                </View>
              )}
              {item.verified && (
                <Text style={styles.verifiedIcon}>✅</Text>
              )}
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subject}>📘 {item.subject}</Text>
            {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}

            {item.ai_tags?.length > 0 && (
              <View style={styles.tagsRow}>
                {item.ai_tags.slice(0, 3).map((tag: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.meta}>by {item.added_by_name}</Text>
              <TouchableOpacity
                style={styles.openBtn}
                onPress={() => Alert.alert('Open Resource', `URL: ${item.url}\n\nOpen in your browser.`)}
              >
                <Ionicons name="open-outline" size={14} color={Colors.primary} />
                <Text style={styles.openText}>Open</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>📚</Text>
            <Text style={{ fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 }}>No resources yet</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  typeEmoji: { fontSize: 20 },
  typeTag: { backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  typeText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold, textTransform: 'capitalize' },
  freeTag: { backgroundColor: Colors.success + '20', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  freeText: { fontSize: Typography.xs, color: Colors.success, fontWeight: Typography.bold },
  verifiedIcon: { fontSize: 14 },
  title: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 2 },
  subject: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 6 },
  desc: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tag: { backgroundColor: Colors.surface2, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, color: Colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: Colors.glassBorder, paddingTop: 8 },
  rating: { fontSize: Typography.xs, color: Colors.warning },
  meta: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1 },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  openText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },
});
