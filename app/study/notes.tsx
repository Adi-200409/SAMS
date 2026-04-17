import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchNotes = (subject?: string) =>
  api.get('/notes/', { params: subject ? { subject } : {} }).then((r) => r.data.results || r.data);

export default function NotesScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [summarizing, setSummarizing] = useState<number | null>(null);

  const { data: notes, isLoading, refetch } = useQuery({
    queryKey: ['notes', subject],
    queryFn: () => fetchNotes(subject),
  });

  const handleSummarize = async (note: any) => {
    setSummarizing(note.id);
    try {
      const { data } = await api.post('/ai/note-summary/', { note_id: note.id });
      Alert.alert('📝 AI Summary', data.summary.substring(0, 500) + (data.summary.length > 500 ? '...' : ''));
      refetch();
    } catch {
      Alert.alert('Error', 'Could not summarize note.');
    } finally {
      setSummarizing(null);
    }
  };

  const handleUpvote = async (note: any) => {
    try {
      await api.post(`/notes/${note.id}/`);
      refetch();
    } catch { }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📝 Note Sharing</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by subject..."
          placeholderTextColor={Colors.textMuted}
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notes || []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GlassCard style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.subjectTag}>
                  <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
                {item.year && <Text style={styles.yearText}>Year {item.year}</Text>}
              </View>

              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteDesc} numberOfLines={2}>{item.description || item.content}</Text>

              {item.ai_summary && (
                <View style={styles.aiSummaryBox}>
                  <Text style={styles.aiLabel}>🤖 AI Summary</Text>
                  <Text style={styles.aiSummary} numberOfLines={3}>{item.ai_summary}</Text>
                </View>
              )}

              <View style={styles.noteFooter}>
                <Text style={styles.uploaderText}>👤 {item.uploader_name}</Text>
                <TouchableOpacity style={styles.upvoteBtn} onPress={() => handleUpvote(item)}>
                  <Ionicons name={item.has_upvoted ? 'heart' : 'heart-outline'} size={16} color={item.has_upvoted ? Colors.accent : Colors.textMuted} />
                  <Text style={[styles.upvoteCount, item.has_upvoted && { color: Colors.accent }]}>{item.upvote_count}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.summarizeBtn}
                  onPress={() => handleSummarize(item)}
                  disabled={summarizing === item.id}
                >
                  {summarizing === item.id
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <Text style={styles.summarizeBtnText}>🤖 Summarize</Text>
                  }
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48 }}>📝</Text>
              <Text style={{ fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 }}>No notes found</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.base, marginBottom: Spacing.md,
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.sm },
  noteCard: { marginBottom: Spacing.md },
  noteHeader: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  subjectTag: { backgroundColor: Colors.secondary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  subjectText: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: Typography.semibold },
  yearText: { fontSize: Typography.xs, color: Colors.textMuted },
  noteTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  noteDesc: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 8 },
  aiSummaryBox: { backgroundColor: Colors.primary + '10', borderRadius: Radius.md, padding: 10, marginBottom: 8 },
  aiLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary, marginBottom: 4 },
  aiSummary: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
  noteFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  uploaderText: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1 },
  upvoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  upvoteCount: { fontSize: Typography.xs, color: Colors.textMuted },
  summarizeBtn: { backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  summarizeBtnText: { fontSize: 11, color: Colors.primary, fontWeight: Typography.semibold },
});
