import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius, getCategoryColor } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedPressable from '../../components/ui/AnimatedPressable';

const STATUS_FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

export default function ActivitiesScreen() {
  const [status, setStatus] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'clubs'>('events');
  const router = useRouter();

  const { data: activities, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['activities', status],
    queryFn: () => api.get('/activities/', { params: { status: status === 'all' ? undefined : status } }).then((r) => r.data.results || r.data),
  });

  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => api.get('/clubs/').then((r) => r.data.results || r.data),
    enabled: activeTab === 'clubs',
  });

  const filtered = (activeTab === 'events' ? activities : clubs)?.filter((item: any) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, clubs..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['events', 'clubs'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'events' ? '🎯 Events' : '🏛️ Clubs'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filters (events only) */}
      {activeTab === 'events' && (
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity key={s} style={[styles.filter, status === s && styles.filterActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.filterText, status === s && styles.filterTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* List */}
      {(isLoading || clubsLoading) ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered || []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) =>
            activeTab === 'events'
              ? <EventCard item={item} index={index} onPress={() => router.push(`/activity/${item.id}` as any)} />
              : <ClubCard item={item} index={index} onPress={() => router.push(`/club/${item.id}` as any)} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No {activeTab} found</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

function EventCard({ item, index, onPress }: any) {
  const catColor = getCategoryColor(item.category);
  return (
    <AnimatedPressable onPress={onPress}>
      <GlassCard delay={index * 100} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.catTag, { backgroundColor: catColor + '25', borderColor: catColor + '50' }]}>
            <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: item.status === 'upcoming' ? Colors.secondary + '20' : Colors.primary + '20' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>📍 {item.venue}</Text>
          <Text style={styles.cardMeta}>🗓️ {new Date(item.start_date).toLocaleDateString()}</Text>
          <Text style={[styles.pointsText, { color: Colors.secondary }]}>+{item.points_reward}pts</Text>
        </View>
        {item.is_registered && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredText}>✓ Registered</Text>
          </View>
        )}
      </GlassCard>
    </AnimatedPressable>
  );
}

function ClubCard({ item, index, onPress }: any) {
  const catColor = getCategoryColor(item.category);
  return (
    <AnimatedPressable onPress={onPress}>
      <GlassCard delay={index * 100} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.catTag, { backgroundColor: catColor + '25', borderColor: catColor + '50' }]}>
            <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
          </View>
          <Text style={styles.memberCount}>👥 {item.member_count}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        {item.is_member && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredText}>✓ Member</Text>
          </View>
        )}
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.sm },
  tabRow: {
    flexDirection: 'row', marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface2, borderRadius: Radius.md, padding: 3,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.semibold },
  tabTextActive: { color: '#fff' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  filter: {
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: Typography.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  filterTextActive: { color: '#fff', fontWeight: Typography.semibold },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 30 },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm, alignItems: 'center' },
  catTag: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  catText: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'capitalize' },
  statusTag: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  cardFooter: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  cardMeta: { fontSize: Typography.xs, color: Colors.textMuted },
  pointsText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  memberCount: { fontSize: Typography.sm, color: Colors.textMuted },
  registeredBadge: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: Colors.secondary + '20', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  registeredText: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: Typography.semibold },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 },
});
