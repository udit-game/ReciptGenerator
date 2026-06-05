import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Theme[colorScheme as keyof typeof Theme] || Theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome Back,</Text>
        <Text style={[styles.brandName, { color: colors.text }]}>Switch Technology India</Text>
      </View>

      <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Generate Tax Invoice</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Create, sign, and print compliant GST digital invoices quickly.
          </Text>
        </View>
        
        <Pressable 
          style={({ pressed }) => [
            styles.createButton, 
            { backgroundColor: colors.brand, opacity: pressed ? 0.9 : 1 }
          ]}
          onPress={() => router.push('../new-bill')}
        >
          <MaterialIcons name="add" size={20} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.createButtonText}>Create Bill</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 24, marginTop: 12 },
  greeting: { fontSize: 14, fontWeight: '500' },
  brandName: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  actionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTextContainer: { marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, lineHeight: 18 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});