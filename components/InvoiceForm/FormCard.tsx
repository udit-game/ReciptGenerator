import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Theme } from '../../constants/Colors';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
}

export const FormCard = React.memo(function FormCard({ title, children }: FormCardProps) {
  const scheme = useColorScheme();
  const colors = Theme[scheme as keyof typeof Theme] || Theme.light;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.brand || colors.text }]}>{title}</Text>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }
});