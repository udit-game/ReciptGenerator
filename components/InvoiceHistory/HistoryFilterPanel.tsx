// components/InvoiceHistory/HistoryFilterPanel.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '@/constants/Colors';
import { InvoiceFilters } from '@/hooks/RepoHooks/useInvoiceStorage';
import { ClientDropdown } from '../InvoiceForm/Dropdowns/ClientDropdown';
import { ProductDropdown } from '../InvoiceForm/Dropdowns/ProductDropdown';

interface FilterPanelProps {
  filters: InvoiceFilters;
  onFilterChange: (updated: Partial<InvoiceFilters>) => void;
  onClearFilters: () => void;
  selectedProductName: string;
}

type ShortcutPills = 'TODAY' | 'WEEK' | 'MONTH' | '3MONTHS' | 'YEAR' | 'CUSTOM';

export const HistoryFilterPanel = React.memo(function HistoryFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  selectedProductName
}: FilterPanelProps) {
  const scheme = useColorScheme();
  const colors = Theme[scheme as keyof typeof Theme] || Theme.light;
  
  const [activePill, setActivePill] = useState<ShortcutPills>('CUSTOM');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyDateShortcutPill = (mode: ShortcutPills) => {
    setActivePill(mode);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    let start = '';
    const end = formatDate(today);

    switch(mode) {
      case 'TODAY':
        start = end;
        break;
      case 'WEEK':
        today.setDate(today.getDate() - 7);
        start = formatDate(today);
        break;
      case 'MONTH':
        today.setMonth(today.getMonth() - 1);
        start = formatDate(today);
        break;
      case '3MONTHS':
        today.setMonth(today.getMonth() - 3);
        start = formatDate(today);
        break;
      case 'YEAR':
        today.setFullYear(today.getFullYear() - 1);
        start = formatDate(today);
        break;
      default:
        return; // Custom mode retains manual input properties
    }
    onFilterChange({ startDate: start, endDate: end });
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      {/* Primary General Text Content Bar Input */}
      <View style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search Invoice #..."
          placeholderTextColor={colors.textSecondary}
          value={filters.searchQuery || ''}
          onChangeText={(v) => onFilterChange({ searchQuery: v })}
        />
        <TouchableOpacity style={styles.toggleFiltersBtn} onPress={() => setShowAdvanced(!showAdvanced)}>
          <MaterialIcons name={showAdvanced ? "tune" : "filter-list"} size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Advanced Filter Layout Configuration Blocks */}
      {showAdvanced && (
        <View style={styles.advancedGroup}>
          <ClientDropdown
            selectedClientId={filters.clientId || ''}
            onSelectClient={(c) => onFilterChange({ clientId: c?.id || '' })}
            editable={true}
            label="Filter By Client Master"
            showAddOption={false}
          />

          <ProductDropdown
            currentValue={selectedProductName}
            onSelectProduct={(p) => onFilterChange({ productId: p?.id || '' })}
            editable={true}
            label="Filter By Product Master"
            showAddOption={false}
          />

          {/* Explicit Custom Range Inputs Wrapper */}
          <Text style={[styles.subTextLabel, { color: colors.textSecondary }]}>Date Window Parameters (YYYY-MM-DD)</Text>
          <View style={styles.dateFormFieldsRow}>
            <TextInput
              style={[styles.dateInputBox, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="From Date"
              placeholderTextColor={colors.textSecondary}
              value={filters.startDate || ''}
              onChangeText={(v) => { setActivePill('CUSTOM'); onFilterChange({ startDate: v }); }}
            />
            <MaterialIcons name="swap-horiz" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.dateInputBox, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="To Date"
              placeholderTextColor={colors.textSecondary}
              value={filters.endDate || ''}
              onChangeText={(v) => { setActivePill('CUSTOM'); onFilterChange({ endDate: v }); }}
            />
          </View>

          {/* Quick Filter Horizontal Scroll Pills Deck */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
            {(['TODAY', 'WEEK', 'MONTH', '3MONTHS', 'YEAR'] as ShortcutPills[]).map((pill) => (
              <TouchableOpacity
                key={pill}
                style={[styles.pill, activePill === pill ? { backgroundColor: colors.brand } : { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => applyDateShortcutPill(pill)}
              >
                <Text style={[styles.pillText, { color: activePill === pill ? '#FFF' : colors.text }]}>
                  {pill === '3MONTHS' ? '3 Months' : pill.toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.clearBtn} onPress={() => { setActivePill('CUSTOM'); onClearFilters(); }}>
            <MaterialIcons name="refresh" size={16} color="#E53935" />
            <Text style={styles.clearText}>Reset Filtering Logs</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { padding: 12, borderBottomWidth: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, height: 42 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  toggleFiltersBtn: { padding: 4 },
  advancedGroup: { marginTop: 12, gap: 10 },
  subTextLabel: { fontSize: 11, fontWeight: '600', marginBottom: -2 },
  dateFormFieldsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateInputBox: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, textAlign: 'center' },
  pillsContainer: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  pillText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4, paddingVertical: 8 },
  clearText: { fontSize: 12, color: '#E53935', fontWeight: '600' }
});