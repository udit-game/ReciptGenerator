// components/InvoiceHistory/InvoiceHistoryRow.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SavedInvoiceSummary } from '@/hooks/RepoHooks/useInvoiceStorage';
import { GoodsItem } from '@/types/InvoiceTypes';
import { useErrorLog } from '@/hooks/RepoHooks/useErrorLog';
import { useAppTheme } from '@/hooks/Context/ThemeContext';

interface RowProps {
  invoice: SavedInvoiceSummary;
  onFetchItems: (id: string) => Promise<GoodsItem[]>;
}

export const InvoiceHistoryRow = React.memo(function InvoiceHistoryRow({ invoice, onFetchItems }: RowProps) {
  const { themeMode, currentTheme: colors } = useAppTheme();
  const { recordError } = useErrorLog();

  const [expanded, setExpanded] = useState(false);
  const [lineItems, setLineItems] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleExpand = async () => {
    if (!expanded && lineItems.length === 0) {
      setLoading(true);
      try {
        const items = await onFetchItems(invoice.id);
        setLineItems(items);
      } catch (err) {
        await recordError('InvoiceHistoryRow.tsx, 75', err);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Tap Target Headliner Info Panel */}
      <TouchableOpacity onPress={handleToggleExpand} activeOpacity={0.7} style={styles.headerTrigger}>
        <View style={styles.metaColumn}>
          <Text style={[styles.invoiceNum, { color: colors.text }]}>{invoice.invoice_number}</Text>
          <Text style={[styles.clientName, { color: colors.textSecondary }]} numberOfLines={1}>
            {invoice.client_name || "Unknown Client Master"}
          </Text>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{invoice.invoice_date}</Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={[styles.totalAmount, { color: colors.brand || colors.text }]}>
            ₹{invoice.taxable_amount.toFixed(2)}
          </Text>
          <MaterialIcons 
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={22} 
            color={colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>

      {/* Expandable Line-Item Section */}
      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
          {loading ? (
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Loading line adjustments...</Text>
          ) : lineItems.length === 0 ? (
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>No records found inside snapshot block.</Text>
          ) : (
            <View>
              <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.th, styles.flexDesc, { color: colors.textSecondary }]}>Item</Text>
                <Text style={[styles.th, styles.flexQty, { color: colors.textSecondary, textAlign: 'center' }]}>Qty</Text>
                <Text style={[styles.th, styles.flexRate, { color: colors.textSecondary, textAlign: 'right' }]}>Rate</Text>
              </View>
              {lineItems.map((item, idx) => (
                <View key={item.productId || String(idx)} style={styles.tableRow}>
                  <Text style={[styles.td, styles.flexDesc, { color: colors.text }]} numberOfLines={1}>
                    {item.desc}
                  </Text>
                  <Text style={[styles.td, styles.flexQty, { color: colors.text, textAlign: 'center' }]}>
                    {item.qty}
                  </Text>
                  <Text style={[styles.td, styles.flexRate, { color: colors.text, textAlign: 'right' }]}>
                    ₹{item.rate.toFixed(2)}
                  </Text>
                </View>
              ))}
              
              {/* Financial Breakdown Summary Panel */}
              <View style={[styles.summaryBlock, { backgroundColor: colors.background }]}>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                  Taxable Base Value: ₹{invoice.taxable_amount.toFixed(2)}
                </Text>
                {invoice.freight_amount > 0 && (
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    Freight Processing: ₹{invoice.freight_amount.toFixed(2)}
                  </Text>
                )}
                <Text style={[styles.taxSummaryText, { color: colors.text }]}>
                  Tax: ₹{invoice.taxable_amount * 0.18 || "0.00"}
                </Text>
                <Text style={[styles.taxSummaryText, { color: colors.text }]}>
                  Mode: {invoice.tax_type.toUpperCase()} (Included)
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}, (prev, next) => {
  // Only re-render if the core scalar structural data updates
  return (
    prev.invoice.id === next.invoice.id &&
    prev.invoice.total_amount === next.invoice.total_amount &&
    prev.invoice.invoice_number === next.invoice.invoice_number
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  headerTrigger: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, alignItems: 'center' },
  metaColumn: { flex: 1, gap: 2 },
  invoiceNum: { fontSize: 15, fontWeight: '700' },
  clientName: { fontSize: 13, fontWeight: '500' },
  dateLabel: { fontSize: 11, marginTop: 2 },
  amountColumn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalAmount: { fontSize: 16, fontWeight: '700' },
  expandedContent: { padding: 12, borderTopWidth: 1 },
  infoText: { fontSize: 12, fontStyle: 'italic', paddingVertical: 4 },
  tableHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, marginBottom: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 4 },
  th: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  td: { fontSize: 13 },
  flexDesc: { flex: 3 },
  flexQty: { flex: 0.8 },
  flexRate: { flex: 1.2 },
  summaryBlock: { marginTop: 10, padding: 8, borderRadius: 6, gap: 2 },
  summaryText: { fontSize: 11, fontWeight: '500' },
  taxSummaryText: { fontSize: 11, fontWeight: '600', marginTop: 2 }
});