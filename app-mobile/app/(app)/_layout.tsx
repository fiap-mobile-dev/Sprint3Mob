import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function AppLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cursos/index"
        options={{
          title: 'Cursos',
          tabBarIcon: ({ color }) => <MaterialIcons name="school" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="certificados"
        options={{
          title: 'Certificados',
          tabBarIcon: ({ color }) => <MaterialIcons name="workspace-premium" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin/index"
        options={{
          title: 'Admin',
          href: user?.role === 'admin' ? undefined : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="admin-panel-settings" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="cursos/[id]" options={{ href: null, title: 'Detalhes do curso' }} />
      <Tabs.Screen name="cursos/aula/[id]" options={{ href: null, title: 'Sala de aula' }} />
      <Tabs.Screen name="sobre" options={{ href: null, title: 'Sobre o app' }} />
    </Tabs>
  );
}
