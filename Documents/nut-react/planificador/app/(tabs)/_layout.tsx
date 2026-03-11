import { Tabs } from 'expo-router';
import React from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/services/supabase';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isMenuCollapsed, setIsMenuCollapsed] = React.useState(false);
  const expandedMenuWidth = Platform.OS === 'web' ? 240 : 220;

  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleMenu = React.useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMenuCollapsed((prev) => !prev);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarPosition: 'left',
          tabBarVariant: 'material',
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          tabBarShowLabel: !isMenuCollapsed,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 8,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            minHeight: 52,
          },
          tabBarStyle: {
            width: isMenuCollapsed ? 0 : expandedMenuWidth,
            paddingTop: isMenuCollapsed ? 0 : 16,
            paddingBottom: isMenuCollapsed ? 0 : 16,
            borderRightWidth: isMenuCollapsed ? 0 : 1,
            borderRightColor: '#E5E7EB',
            borderTopWidth: 0,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            overflow: 'hidden',
          },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors[colorScheme ?? 'light'].text,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={toggleMenu}
              style={{
                marginLeft: 12,
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F3F4F6',
              }}
            >
              <MaterialIcons
                name={isMenuCollapsed ? 'menu' : 'menu-open'}
                size={20}
                color={Colors[colorScheme ?? 'light'].text}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Salir', style: 'destructive', onPress: () => supabase.auth.signOut() },
                ])
              }
              style={{
                marginRight: 12,
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F3F4F6',
              }}
            >
              <MaterialIcons name="logout" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mis tareas',
            tabBarLabel: 'Tareas',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="checkmark.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Nueva tarea',
            tabBarLabel: 'Nueva',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="weekly-menu"
          options={{
            title: 'Menú semanal',
            tabBarLabel: 'Menú',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="fork.knife" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calories"
          options={{
            title: 'Calorías',
            tabBarLabel: 'Calorías',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="flame.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: 'Presupuesto',
            tabBarLabel: 'Presupuesto',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="wallet.pass.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="saved-budgets"
          options={{
            title: 'Presupuestos guardados',
            tabBarLabel: 'Guardados',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="tray.full.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Rutinas',
            tabBarLabel: 'Rutinas',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="dumbbell.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="body-progress"
          options={{
            title: 'Avances',
            tabBarLabel: 'Avances',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle.fill" color={color} />,
          }}
        />
      </Tabs>

      {!isMenuCollapsed && (
        <Pressable
          onPress={toggleMenu}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: expandedMenuWidth,
            right: 0,
            backgroundColor: 'transparent',
          }}
        />
      )}
    </View>
  );
}
