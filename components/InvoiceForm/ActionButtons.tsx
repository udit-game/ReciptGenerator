// components/InvoiceForm/ActionButtons.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/Colors';

interface ActionButtonsProps {
  isSaved: boolean;
  onSave: () => void;
  onPrint: () => void;
  onShare: () => void;
}

export function ActionButtons({ isSaved, onSave, onPrint, onShare }: ActionButtonsProps) {
  const scheme = useColorScheme();
  const colors = Theme[scheme as keyof typeof Theme] || Theme.light;

  return (
    <View style={styles.container}>
      {!isSaved ? (
        /* Phase 1: Lock Data Record First */
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: colors.brand }]} 
          onPress={onSave}
          activeOpacity={0.7}
        >
          <MaterialIcons name="cloud-upload" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.btnText}>Save & Finalize Invoice</Text>
        </TouchableOpacity>
      ) : (
        /* Phase 2: Post-Commit External Actions Allowed */
        <View style={styles.splitButtonGroup}>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.brand, flex: 1 }]} 
            onPress={onShare}
            activeOpacity={0.7}
          >
            <MaterialIcons name="share" size={20} color="#FFF" style={styles.icon} />
            <Text style={styles.btnText}>Share PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: colors.brand, flex: 1 }]} 
            onPress={onPrint}
            activeOpacity={0.7}
          >
            <MaterialIcons name="print" size={20} color={colors.brand} style={styles.icon} />
            <Text style={[styles.secondaryBtnText, { color: colors.brand }]}>Print Invoice</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, width: '100%' },
  splitButtonGroup: { flexDirection: 'row', gap: 12 },
  primaryBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  secondaryBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 12, 
    borderWidth: 1.5 
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  icon: { marginRight: 8 }
});