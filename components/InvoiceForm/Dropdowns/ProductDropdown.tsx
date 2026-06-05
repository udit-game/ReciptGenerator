import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '../InputField';
import { useProductStorage, Product } from '@/hooks/RepoHooks/useProductStorage';
import { useAppTheme } from '@/hooks/Context/ThemeContext';

interface Props {
  onSelectProduct: (product: Product | null) => void;
  currentValue: string;
  editable: boolean;
  label?: string;
  showAddOption?: boolean;
}

export function ProductDropdown({ onSelectProduct, currentValue, editable, label = "Product Item", showAddOption = true }: Props) {
  const { themeMode, currentTheme: colors } = useAppTheme();

  const { fetchAllProducts, insertNewProduct } = useProductStorage();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchInternal, setSearchInternal] = useState('');

  // Modal Input Field States
  const [pName, setPName] = useState('');
  const [pHsn, setPHsn] = useState('');
  const [pRate, setPRate] = useState('');

  const loadCatalog = async () => {
    try {
      const data = await fetchAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch {
      Alert.alert("Error", "Could not recover product configurations.");
    }
  };

  useEffect(() => { loadCatalog(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInternal.trim() === '') {
        setFilteredProducts(products);
      } else {
        const lower = searchInternal.toLowerCase();
        setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(lower) || p.hsn_code.includes(lower)));
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInternal, products]);

  const handleCreateProduct = async () => {
    if (!pName || !pHsn) return;
    try {
      const newlyCreatedRecord = await insertNewProduct(pName, pHsn, Number(pRate) || 0);
      await loadCatalog();
      onSelectProduct(newlyCreatedRecord);
      setModalVisible(false);
      setPName(''); setPHsn(''); setPRate('');
    } catch {
      Alert.alert("Storage Error", "Failed to insert item parameters into product master.");
    }
  };

  return (
    <View style={{ flex: 1.5 }}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.pickerRow}>
        <TouchableOpacity 
          disabled={!editable}
          style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
          onPress={() => { setSearchInternal(''); setDropdownOpen(true); }}
        >
          <Text numberOfLines={1} style={{ color: currentValue ? colors.text : colors.textSecondary, fontSize: 13 }}>
            {currentValue || "Find Item..."}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>

        {!showAddOption && currentValue ? (
          <TouchableOpacity style={styles.clearPickerSelection} onPress={() => onSelectProduct(null)}>
            <MaterialIcons name="clear" size={18} color="#E53935" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={dropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setDropdownOpen(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            <View style={[styles.localSearchBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <MaterialIcons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.localSearchInput, { color: colors.text }]}
                placeholder="Search description or HSN..."
                placeholderTextColor={colors.textSecondary}
                value={searchInternal}
                onChangeText={setSearchInternal}
              />
            </View>

            {showAddOption && (
              <TouchableOpacity 
                style={[styles.addItemOption, { borderBottomColor: colors.border }]}
                onPress={() => { setDropdownOpen(false); setModalVisible(true); }}
              >
                <MaterialIcons name="add" size={18} color={colors.brand} />
                <Text style={[styles.addItemText, { color: colors.brand }]}>New Product Master</Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.itemRow} 
                  onPress={() => { onSelectProduct(item); setDropdownOpen(false); }}
                >
                  <Text style={{ color: colors.text }}>{item.name} (HSN: {item.hsn_code})</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>New Product Master Entry</Text>
          <InputField label="Product Name / Description" value={pName} onChangeText={setPName} placeholder="E.g., 5A Regulator Switch" />
          <InputField label="HSN Code" value={pHsn} onChangeText={setPHsn} keyboardType="numeric" placeholder="8536" />
          <InputField label="Default Baseline Rate (₹)" value={pRate} onChangeText={setPRate} keyboardType="numeric" placeholder="0.00" />
          
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.brand }]} onPress={handleCreateProduct}>
              <Text style={{ color: '#FFF', fontWeight: '600' }}>Save Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, height: 40 },
  clearPickerSelection: { padding: 6, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 30 },
  dropdownMenu: { borderRadius: 12, borderWidth: 1, maxHeight: 300, padding: 6 },
  localSearchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, height: 38, marginBottom: 6 },
  localSearchInput: { flex: 1, fontSize: 13, marginLeft: 6, padding: 0 },
  addItemOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, gap: 6 },
  addItemText: { fontWeight: '600', fontSize: 13 },
  itemRow: { paddingVertical: 10, paddingHorizontal: 6 },
  modalContent: { flex: 1, padding: 24, justifyContent: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' }
});