// components/InvoiceForm/LineItemRow.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from './InputField';
import { GoodsItem } from '@/types/InvoiceTypes';
import { ProductDropdown } from './Dropdowns/ProductDropdown';

interface RowProps {
  item: GoodsItem;
  index: number;
  onUpdate: (index: number, key: keyof GoodsItem, value: any) => void;
  onRemove: (index: number) => void;
  showDelete: boolean;
  editable: boolean;
}

export const LineItemRow = React.memo(function LineItemRow({ 
  item, index, onUpdate, onRemove, showDelete, editable 
}: RowProps) {
  
  const handleCatalogProductSelection = (selectedProduct: any) => {
    onUpdate(index, 'productId', selectedProduct.id);
    onUpdate(index, 'desc', selectedProduct.name);
    onUpdate(index, 'hsn', selectedProduct.hsn_code);
    onUpdate(index, 'rate', selectedProduct.default_rate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ProductDropdown 
          currentValue={item.desc} 
          onSelectProduct={handleCatalogProductSelection}
          editable={editable}
        />
        <View style={{ width: 8 }} />
        <InputField 
          label="HSN" 
          value={item.hsn} 
          keyboardType="numeric" 
          onChangeText={(v) => onUpdate(index, 'hsn', v)} 
          editable={editable}
        />
      </View>
      
      <View style={styles.row}>
        <InputField 
          label="Quantity" 
          value={String(item.qty || '')} 
          keyboardType="numeric" 
          onChangeText={(v) => onUpdate(index, 'qty', v)} 
          editable={editable}
        />
        <View style={{ width: 8 }} />
        <InputField 
          label="Rate (₹)" 
          value={String(item.rate || '')} 
          keyboardType="numeric" 
          onChangeText={(v) => onUpdate(index, 'rate', v)} 
          editable={editable}
        />
        
        {showDelete && (
          <TouchableOpacity onPress={() => onRemove(index)} style={styles.trash}>
            <MaterialIcons name="delete-outline" size={22} color="#E53935" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}, (prev, next) => {
  return (
    prev.item.productId === next.item.productId &&
    prev.item.desc === next.item.desc &&
    prev.item.hsn === next.item.hsn &&
    prev.item.qty === next.item.qty &&
    prev.item.rate === next.item.rate &&
    prev.showDelete === next.showDelete &&
    prev.editable === next.editable
  );
});

const styles = StyleSheet.create({
  container: { paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  trash: { height: 40, justifyContent: 'center', alignItems: 'center', paddingLeft: 8, marginBottom: 8 }
});