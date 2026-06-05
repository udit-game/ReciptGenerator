import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Theme } from '@/constants/Colors';
import { useInvoiceStorage, SavedInvoiceSummary, InvoiceFilters } from '@/hooks/RepoHooks/useInvoiceStorage';
import { InvoiceHistoryRow } from '@/components/InvoiceHistory/InvoiceHistoryRow';
import { HistoryFilterPanel } from '@/components/InvoiceHistory/HistoryFilterPanel';
import { useProductStorage } from '@/hooks/RepoHooks/useProductStorage';
import { useErrorLog } from '@/hooks/RepoHooks/useErrorLog';

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const colors = Theme[scheme as keyof typeof Theme] || Theme.light;

  const { getInvoices, getInvoiceItems } = useInvoiceStorage();
  const { getProductById } = useProductStorage();
  const { recordError } = useErrorLog();
  
  const [history, setHistory] = useState<SavedInvoiceSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvedProductName, setResolvedProductName] = useState('');

  const [filters, setFilters] = useState<InvoiceFilters>({
    searchQuery: '', clientId: '', productId: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    if (!filters.productId) {
      setResolvedProductName('');
      return;
    }
    
    async function resolveProductName() {
      try {
        const product = await getProductById(filters.productId!);
        setResolvedProductName(product ? product.name : 'Unknown Item');
      } catch {
        setResolvedProductName('Unknown Item');
      }
    }
    resolveProductName();
  }, [filters.productId]);

  const syncInvoiceTimeline = async (currentFilters: InvoiceFilters) => {
    try {
      const invoicesOfHistory = await getInvoices(currentFilters);
      setHistory(invoicesOfHistory);
    } catch (err) {
      await recordError('History.tsx, 143', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      syncInvoiceTimeline(filters);
    }, [filters])
  );

  const handleFilterUpdate = useCallback((updatedSlice: Partial<InvoiceFilters>) => {
    setFilters(prev => {
      const nextFilters = { ...prev, ...updatedSlice };
      syncInvoiceTimeline(nextFilters);
      return nextFilters;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    const blankFilters: InvoiceFilters = { searchQuery: '', clientId: '', productId: '', startDate: '', endDate: '' };
    setFilters(blankFilters);
    syncInvoiceTimeline(blankFilters);
  }, []);

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    await syncInvoiceTimeline(filters);
    setRefreshing(false);
  };

  const handleFetchLineItems = useCallback(async (invoiceId: string) => {
    return await getInvoiceItems(invoiceId);
  }, []);

  const renderInvoiceCard = useCallback(({ item }: { item: SavedInvoiceSummary }) => (
    <InvoiceHistoryRow invoice={item} onFetchItems={handleFetchLineItems} />
  ), [handleFetchLineItems]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.headerContainer, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Global Billing Ledger</Text>
      </View>

      <HistoryFilterPanel 
        filters={filters}
        onFilterChange={handleFilterUpdate}
        onClearFilters={handleClearFilters}
        selectedProductName={resolvedProductName}
      />

      {/* 1. Added style={styles.list} here */}
      <FlatList
        data={history}
        style={styles.list} 
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceCard}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        onRefresh={handlePullToRefresh}
        refreshing={refreshing}
        initialNumToRender={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No matching invoices found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { flex: 1 }, // 2. Added this to force the list to match remaining screen height
  headerContainer: { height: 52, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  listPadding: { padding: 16, paddingBottom: 32 },
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' }
});