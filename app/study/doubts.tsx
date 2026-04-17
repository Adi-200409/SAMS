import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const fetchDoubts = (subject?: string) =>
  api.get('/doubts/', { params: subject ? { subject } : {} }).then((r) => r.data.results || r.data);

export default function DoubtsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
  const [answerText, setAnswerText] = useState('');
  const [form, setForm] = useState({ title: '', subject: '', content: '' });

  const { data: doubts, isLoading } = useQuery({
    queryKey: ['doubts', subjectFilter],
    queryFn: () => fetchDoubts(subjectFilter),
  });

  const postMutation = useMutation({
    mutationFn: (data: any) => api.post('/doubts/', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doubts'] }); setShowForm(false); Alert.alert('✅ Posted!', 'AI is generating an answer...'); },
    onError: () => Alert.alert('Error', 'Could not post doubt.'),
  });

  const answerMutation = useMutation({
    mutationFn: ({ id, content }: any) => api.post(`/doubts/${id}/`, { content }),
    onSuccess: () => { setAnswerText(''); qc.invalidateQueries({ queryKey: ['doubt', selectedDoubt?.id] }); },
  });

  const { data: doubtDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['doubt', selectedDoubt?.id],
    queryFn: () => selectedDoubt ? api.get(`/doubts/${selectedDoubt.id}/`).then((r) => r.data) : null,
    enabled: !!selectedDoubt,
  });

  if (selectedDoubt) {
    const d = doubtDetail || selectedDoubt;
    return (
      <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedDoubt(null)}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{d.title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: Spacing.base }}>
          <GlassCard style={styles.detailCard}>
            <View style={styles.subjectTag}><Text style={styles.subjectText}>{d.subject}</Text></View>
            <Text style={styles.detailContent}>{d.content}</Text>
          </GlassCard>

          {d.ai_answer && (
            <GlassCard style={[styles.detailCard, styles.aiCard]}>
              <Text style={styles.aiLabel}>🤖 AI Answer</Text>
              <Text style={styles.aiText}>{d.ai_answer}</Text>
            </GlassCard>
          )}

          {detailLoading ? <ActivityIndicator color={Colors.primary} /> : (
            (d.answers || []).filter((a: any) => !a.is_ai_generated).map((answer: any) => (
              <GlassCard key={answer.id} style={styles.answerCard}>
                <Text style={styles.answererName}>👤 {answer.answerer_name}</Text>
                <Text style={styles.answerContent}>{answer.content}</Text>
                {answer.is_accepted && <Text style={styles.accepted}>✓ Accepted Answer</Text>}
              </GlassCard>
            ))
          )}

          <GlassCard style={styles.replyBox}>
            <Text style={styles.replyTitle}>Add Your Answer</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Share your knowledge..."
              placeholderTextColor={Colors.textMuted}
              value={answerText}
              onChangeText={setAnswerText}
              multiline numberOfLines={3}
            />
            <GradientButton
              label="Post Answer"
              onPress={() => answerMutation.mutate({ id: selectedDoubt.id, content: answerText })}
              loading={answerMutation.isPending}
              small
              style={{ marginTop: 8 }}
            />
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={Colors.textSecondary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>💡 Doubt Forum</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <GlassCard style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.md }}>
          <Text style={styles.formTitle}>Ask a Doubt (AI answers instantly!)</Text>
          {[
            { key: 'title', placeholder: 'Doubt title/question' },
            { key: 'subject', placeholder: 'Subject (e.g. Physics, Math)' },
          ].map((f) => (
            <TextInput
              key={f.key}
              style={styles.formInput}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.textMuted}
              value={(form as any)[f.key]}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
            />
          ))}
          <TextInput
            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Describe your doubt in detail..."
            placeholderTextColor={Colors.textMuted}
            value={form.content}
            onChangeText={(v) => setForm((f) => ({ ...f, content: v }))}
            multiline numberOfLines={4}
          />
          <GradientButton
            label="Post & Get AI Answer 🤖"
            onPress={() => postMutation.mutate(form)}
            loading={postMutation.isPending}
            colors={Colors.gradientWarm as any}
          />
        </GlassCard>
      )}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by subject..."
          placeholderTextColor={Colors.textMuted}
          value={subjectFilter}
          onChangeText={setSubjectFilter}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={doubts || []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedDoubt(item)} activeOpacity={0.8}>
              <GlassCard style={styles.doubtCard}>
                <View style={styles.doubtHeader}>
                  <View style={styles.subjectTag}><Text style={styles.subjectText}>{item.subject}</Text></View>
                  <Text style={styles.statusDot}>
                    {item.status === 'answered' ? '✅' : '🔵'}
                  </Text>
                </View>
                <Text style={styles.doubtTitle}>{item.title}</Text>
                <Text style={styles.doubtContent} numberOfLines={2}>{item.content}</Text>
                <View style={styles.doubtFooter}>
                  <Text style={styles.doubtMeta}>👤 {item.student_name}</Text>
                  <Text style={styles.doubtMeta}>💬 {item.answers?.length || 0} answers</Text>
                  <Text style={styles.doubtMeta}>👁 {item.views}</Text>
                </View>
                {item.ai_answer && (
                  <View style={styles.aiAnsweredBadge}>
                    <Text style={styles.aiAnsweredText}>🤖 AI Answered</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48 }}>💡</Text>
              <Text style={{ fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 }}>No doubts yet. Ask one!</Text>
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
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  formTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 10 },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: Typography.sm, marginBottom: 8,
  },
  searchRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  searchInput: {
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: Typography.sm,
  },
  doubtCard: { marginBottom: Spacing.sm },
  doubtHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  subjectTag: { backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  subjectText: { fontSize: Typography.xs, color: Colors.primaryLight, fontWeight: Typography.semibold },
  statusDot: { fontSize: 14 },
  doubtTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  doubtContent: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 8 },
  doubtFooter: { flexDirection: 'row', gap: 12 },
  doubtMeta: { fontSize: Typography.xs, color: Colors.textMuted },
  aiAnsweredBadge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: Colors.warning + '20', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  aiAnsweredText: { fontSize: 10, color: Colors.warning, fontWeight: Typography.semibold },
  detailCard: { marginBottom: Spacing.sm },
  detailContent: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22 },
  aiCard: { borderColor: Colors.warning + '50', borderWidth: 1 },
  aiLabel: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.warning, marginBottom: 6 },
  aiText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22 },
  answerCard: { marginBottom: Spacing.sm, borderColor: Colors.secondary + '30' },
  answererName: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.secondary, marginBottom: 6 },
  answerContent: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  accepted: { fontSize: Typography.xs, color: Colors.success, marginTop: 6, fontWeight: Typography.bold },
  replyBox: { marginTop: Spacing.md },
  replyTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 10 },
  replyInput: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: Typography.sm, height: 80, textAlignVertical: 'top',
  },
});
