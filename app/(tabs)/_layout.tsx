import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { View, StyleSheet } from 'react-native';
import useAuthGuard from '../../hooks/useAuthGuard';
import { useIsStudent, useIsTeacher, useIsAdmin } from '../../store/authStore';

export default function TabsLayout() {
  useAuthGuard();
  const isTeacher = useIsTeacher();
  const isAdmin   = useIsAdmin();
  const isStudent = useIsStudent();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
      }}
    >
      {/* ── HOME (all roles) ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* ── STUDENT TABS ── */}
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="marks"
        options={{
          title: 'Marks',
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'ribbon' : 'ribbon-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'school' : 'school-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="placement"
        options={{
          title: 'Placement',
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* ── TEACHER TABS ── */}
      <Tabs.Screen
        name="teacher/classes"
        options={{
          title: 'Classes',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="teacher/mark-attendance"
        options={{
          title: 'Attendance',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'clipboard' : 'clipboard-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="teacher/enter-marks"
        options={{
          title: 'Marks',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'create' : 'create-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* ── ADMIN TABS ── */}
      <Tabs.Screen
        name="admin/subjects"
        options={{
          title: 'Subjects',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'library' : 'library-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/approvals"
        options={{
          title: 'Approvals',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/placement"
        options={{
          title: 'Placement',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/users"
        options={{
          title: 'Users',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people-circle' : 'people-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* ── SHARED — hidden from non-students ── */}
      <Tabs.Screen
        name="activities"
        options={{
          href: isStudent ? undefined : null,
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          href: isStudent ? undefined : null,
          title: 'Study',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: isStudent ? undefined : null,
          title: 'Rank',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'trophy' : 'trophy-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* ── PROFILE (all roles) ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111128',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  iconWrapper: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  iconActive: {
    backgroundColor: 'rgba(108,99,255,0.15)',
  },
});
