import { Tabs } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text + '80',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
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
        name="cursos/[id]"
        options={{
          href: null,
          title: 'Detalhes do Curso',
        }}
      />
      <Tabs.Screen
        name="cursos/aula/[id]"
        options={{
          href: null,
          title: 'Sala de Leitura',
        }}
      />
      <Tabs.Screen
        name="admin/index"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings-applications" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
