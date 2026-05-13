import { Tabs } from 'expo-router';
import React from 'react';

import { theme } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.DEFAULT,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="process-voice"
        options={{
          title: 'Process Voice',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="mic" color={color} />,
        }}
      />
    </Tabs>
  );
}
