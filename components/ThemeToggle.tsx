import { useAppTheme } from '@/hooks/Context/ThemeContext';
import React from 'react';
import { View, Switch, StyleSheet, Platform } from 'react-native';

export default function ThemeToggle() {
  const { themeMode, currentTheme, toggleTheme } = useAppTheme();

  return (
    <View style={styles.headerContainer}>
      <Switch
        trackColor={{ false: '#767577', true: currentTheme.brand }}
        thumbColor={themeMode === 'dark' ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleTheme}
        value={themeMode === 'dark'}
        style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginRight: Platform.OS === 'android' ? 8 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});