import { useErrorLog } from '@/hooks/RepoHooks/useErrorLog';
import { SavedErrorLog } from '@/types/LogsTypes';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/Context/ThemeContext';

// SUB-COMPONENT: Individual card tracking its own expansion layout
function LogCardItem({ item, themeMode, colors }: { item: SavedErrorLog; themeMode: string; colors: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.logHeader}>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.created_at}</Text>
      </View>
      <Text style={[styles.message, { color: colors.text }]}>{item.error_message}</Text>
      
      {item.error_stack && (
        <View style={{ marginTop: 6 }}>
          <Text 
            style={[
              styles.stack, 
              { 
                backgroundColor: themeMode === 'dark' ? '#2c2c2e' : '#f1f3f5', 
                color: colors.textSecondary 
              }
            ]} 
            numberOfLines={isExpanded ? undefined : 2} // Collapsed down to 2 lines by default
          >
            {item.error_stack}
          </Text>
          
          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.toggleText, { color: colors.brand || '#007AFF' }]}>
              {isExpanded ? "Collapse Trace ▲" : "Expand Trace ▼"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function LogsScreen() {
  const { themeMode, currentTheme: colors } = useAppTheme();
  const { getAllLogs, getLogsByDate } = useErrorLog();
  const [logs, setLogs] = useState<SavedErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const loadLogs = async (shouldFilter = false) => {
    setLoading(true);
    try {
      const data = shouldFilter && dateFilter.trim() !== ''
        ? await getLogsByDate(dateFilter.trim())
        : await getAllLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.headerContainer, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Device System Errors</Text>
      </View>
      
      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TextInput 
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={dateFilter}
          onChangeText={setDateFilter}
        />
        <View style={styles.buttonGroup}>
          <Button title="Filter Date" color={colors.text} onPress={() => loadLogs(true)} />
          <Button title="Clear" color="#666" onPress={() => { setDateFilter(''); loadLogs(false); }} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color={colors.text} />
      ) : (
        <FlatList 
          data={logs}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No errors recorded matching constraints.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <LogCardItem item={item} themeMode={themeMode} colors={colors} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { flex: 1 },
  headerContainer: { height: 52, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  filterRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderBottomWidth: 1 },
  input: { flex: 1, height: 40, borderWidth: 1, borderRadius: 6, paddingHorizontal: 10 },
  buttonGroup: { flexDirection: 'row', gap: 4 },
  listPadding: { 
    padding: 16, 
    paddingBottom: 100
  },
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
  logCard: { padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timestamp: { fontSize: 11 },
  message: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  stack: { fontSize: 11, fontFamily: 'monospace', padding: 8, borderRadius: 4, lineHeight: 15 },
  toggleButton: { marginTop: 6, paddingVertical: 4, alignItems: 'flex-start' },
  toggleText: { fontSize: 12, fontWeight: '600' }
});