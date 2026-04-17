import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const fetchExchanges = () => api.get('/skill-exchange/').then((r) => r.data.results || r.data);

export default function SkillExchangeScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ skill_offered: '', skill_wanted: '', description: '' });

  const { data: exchanges, isLoading } = useQuery({
    queryKey: ['skill-exchange'],
    queryFn: fetchExchanges,
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/skill-exchange/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skill-exchange'] });
      setShowForm(false);
      Alert.alert('✅ Posted!', 'Your skill exchange offer is live!');
    },
    onError: () => Alert.alert('Error', 'Could not post offer.'),
  });

  const findMatches = async () => {
    try {
      const { data } = await api.get('/ai/skill-match/');
      if (data.matches?.length > 0) {
        const matchInfo = data.matches
          .map((m: any) => `Match Score: ${m.match_score}%\n${m.reason}`)
          .join('\n\n');
        Alert.alert('🤖 AI Skill Matches', matchInfo);
      } else {
        Alert.alert('No Matches', 'Update your profile with skills to find matches.');
      }
    } catch {
      Alert.alert('Error', 'Could not fetch AI matches.');
    }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🤝 Skill Exchange</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <GlassCard style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.md }}>
          <Text style={styles.formTitle}>Offer a Skill Exchange</Text>
          {[
            { key: 'skill_offered', placeholder: 'Skill you offer (e.g. Python)' },
            { key: 'skill_wanted', placeholder: 'Skill you want (e.g. Design)' },
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
            style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
            placeholder="Describe your exchange offer..."
            placeholderTextColor={Colors.textMuted}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            multiline numberOfLines={3}
          />
          <GradientButton
            label="Post Offer"
            onPress={() => addMutation.mutate(form)}
            loading={addMutation.isPending}
            colors={['#00D4AA', '#00A8FF']}
          />
        </GlassCard>
      )}

      <TouchableOpacity style={styles.aiMatchBtn} onPress={findMatches}>
        <LinearGradient colors={['#6C63FF', '#8B4CF7']} style={styles.aiMatchGrad}>
          <Text style={styles.aiMatchText}>🤖 Find AI Skill Matches for Me</Text>
        </LinearGradient>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={exchanges || []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <View style={styles.skillRow}>
                <View style={styles.skillTag}>
                  <Text style={styles.skillLabel}>Offers</Text>
                  <Text style={styles.skillName}>{item.skill_offered}</Text>
                </View>
                <Text style={styles.swapIcon}>⇄</Text>
                <View style={[styles.skillTag, { borderColor: Colors.secondary + '50' }]}>
                  <Text style={[styles.skillLabel, { color: Colors.secondary }]}>Wants</Text>
                  <Text style={styles.skillName}>{item.skill_wanted}</Text>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.footer}>
                <Text style={styles.teacher}>👤 {item.teacher_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? Colors.success + '20' : Colors.textMuted + '20' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'open' ? Colors.success : Colors.textMuted }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </GlassCard>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48 }}>🤝</Text>
              <Text style={{ fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 }}>No skill exchanges yet</Text>
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
  formTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 10 },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: Typography.sm, marginBottom: 8,
  },
  aiMatchBtn: { marginHorizontal: Spacing.base, marginBottom: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
  aiMatchGrad: { paddingVertical: 12, alignItems: 'center' },
  aiMatchText: { color: '#fff', fontWeight: Typography.bold, fontSize: Typography.sm },
  card: { marginBottom: Spacing.md },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  skillTag: {
    flex: 1, borderWidth: 1, borderColor: Colors.primary + '50',
    borderRadius: Radius.md, padding: 10, alignItems: 'center',
    backgroundColor: Colors.primary + '10',
  },
  skillLabel: { fontSize: 10, color: Colors.primary, fontWeight: Typography.bold, marginBottom: 2 },
  skillName: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  swapIcon: { fontSize: 20, color: Colors.textMuted },
  desc: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teacher: { fontSize: Typography.xs, color: Colors.textMuted },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'capitalize' },
});
