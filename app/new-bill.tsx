// app/new-bill.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButtons } from "../components/InvoiceForm/ActionButtons";
import { FormCard } from "../components/InvoiceForm/FormCard";
import { InputField } from "../components/InvoiceForm/InputField";
import { LineItemRow } from "../components/InvoiceForm/LineItemRow";
import { Theme } from "../constants/Colors";

import { ClientDropdown } from "@/components/InvoiceForm/Dropdowns/ClientDropdown";
import { Client } from "@/hooks/RepoHooks/useClientStorage";
import { useErrorLog } from "@/hooks/RepoHooks/useErrorLog";
import { GoodsItem, InvoiceData, TaxMode } from "@/types/InvoiceTypes";
import { generateRandomId } from "@/utils/Crypto";
import { useInvoiceActions } from "../hooks/LibHooks/useInvoiceActions";
import { useInvoiceAutofill } from "../hooks/RepoHooks/useInvoiceAutofill";
import { useInvoiceStorage } from "../hooks/RepoHooks/useInvoiceStorage";
import { useAppTheme } from "@/hooks/Context/ThemeContext";

export default function NewBillScreen() {
  const router = useRouter();
  const { themeMode, currentTheme: colors } = useAppTheme();

  // Transaction Configuration Core State pointers
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState(
    `SSI/${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}/001`,
  );
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Client Metadata Snapshots (Populated via catalog, fully editable, locked at step finalization)
  const [billToName, setBillToName] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [billToGstin, setBillToGstin] = useState("");
  const [billToState, setBillToState] = useState("");
  const [billToCode, setBillToCode] = useState("");

  const [taxMode, setTaxMode] = useState<TaxMode>(TaxMode.IGST);
  const [freight, setFreight] = useState("0");
  const [goods, setGoods] = useState<GoodsItem[]>([
    { productId: generateRandomId(), desc: "", hsn: "", qty: 0, rate: 0 },
  ]);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { saveInvoice } = useInvoiceStorage();
  const { executeDirectPrint, executeSharePDF } = useInvoiceActions();
  const { fetchHistoricalLineItems } = useInvoiceAutofill();
  const { recordError } = useErrorLog();

  // Handles populating data when a clean client is selected from the dropdown
  const handleClientCatalogSelect = (client: Client | null) => {
    if (!client) return;
    setSelectedClientId(client.id);
    setBillToName(client.name);
    setBillToAddress(client.address);
    setBillToGstin(client.gstin);
    setTaxMode(client.tax_type);
  };

  // Triggers historical line item autofill logic upon client selection
  useEffect(() => {
    if (!selectedClientId || isSaved) return;

    async function triggerHistoryRecovery() {
      const pastItems = await fetchHistoricalLineItems(selectedClientId);
      if (pastItems && pastItems.length > 0) {
        Alert.alert(
          "Previous Order Found",
          "Autofill line items with products from their previous bill?",
          [
            { text: "Skip", style: "cancel" },
            { text: "Autofill Items", onPress: () => setGoods(pastItems) },
          ],
        );
      }
    }
    triggerHistoryRecovery();
  }, [selectedClientId, isSaved]);

  const updateGoodsItem = useCallback(
    (index: number, key: keyof GoodsItem, value: any) => {
      setGoods((currentGoods) => {
        const updated = [...currentGoods];
        if (key === "qty" || key === "rate") {
          updated[index] = { ...updated[index], [key]: Number(value) || 0 };
        } else {
          updated[index] = { ...updated[index], [key]: value };
        }
        return updated;
      });
    },
    [],
  );

  const addGoodsRow = () => {
    if (isSaved) return;
    setGoods([
      ...goods,
      { productId: generateRandomId(), desc: "", hsn: "", qty: 0, rate: 0 },
    ]);
  };

  const removeGoodsRow = useCallback((index: number) => {
    setGoods((currentGoods) => {
      if (currentGoods.length === 1) return currentGoods;
      return currentGoods.filter((_, i) => i !== index);
    });
  }, []);

  const getPayload = (): InvoiceData => ({
    invoiceNo,
    invoiceDate,
    billToName,
    billToAddress,
    billToGstin,
    billToState,
    billToCode,
    taxMode,
    freight: Number(freight) || 0,
    goods,
  });

  const handleSavePipeline = async () => {
    try {
      await saveInvoice(getPayload(), selectedClientId);
      setIsSaved(true);
      Alert.alert("Invoice Saved", "Data committed and frozen successfully.");
    } catch (err) {
      await recordError("InvoiceForm.tsx, 143", err);
      Alert.alert(
        "Error",
        "Could not complete database execution transaction.",
      );
    }
  };


  function handlePrintPipeline(): void {
    const payload = getPayload();
    executeDirectPrint(payload);
  }

  function handleSharePipeline(): void {
    const payload = getPayload();
    executeSharePDF(payload);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View style={[styles.navHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={18} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          New Invoice
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ClientDropdown
            selectedClientId={selectedClientId}
            onSelectClient={handleClientCatalogSelect}
            editable={!isSaved}
          />

          <FormCard title="Invoice Metadata">
            <View style={styles.row}>
              <InputField
                label="Invoice No."
                value={invoiceNo}
                onChangeText={setInvoiceNo}
                editable={!isSaved}
              />
              <View style={{ width: 12 }} />
              <InputField
                label="Invoice Date"
                value={invoiceDate}
                placeholder="YYYY-MM-DD"
                onChangeText={setInvoiceDate}
                editable={!isSaved}
              />
            </View>
          </FormCard>

          <FormCard title="Consignee / Bill To Details">
            <InputField
              label="Party Name"
              value={billToName}
              onChangeText={setBillToName}
              editable={!isSaved}
            />
            <InputField
              label="Full Address"
              value={billToAddress}
              onChangeText={setBillToAddress}
              multiline
              numberOfLines={2}
              editable={!isSaved}
            />
            <View style={styles.row}>
              <InputField
                label="GSTIN"
                value={billToGstin}
                onChangeText={setBillToGstin}
                autoCapitalize="characters"
                maxLength={15}
                editable={!isSaved}
              />
              <View style={{ width: 12 }} />
              <InputField
                label="State"
                value={billToState}
                onChangeText={setBillToState}
                editable={!isSaved}
              />
              <View style={{ width: 12 }} />
              <InputField
                label="Code"
                value={billToCode}
                onChangeText={setBillToCode}
                keyboardType="numeric"
                maxLength={2}
                editable={!isSaved}
              />
            </View>
          </FormCard>

          <FormCard title="Tax Architecture & Processing">
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
              Tax Configuration Mode
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                disabled={isSaved}
                style={[
                  styles.toggleBtn,
                  taxMode === TaxMode.IGST && {
                    backgroundColor: colors.brand,
                    borderColor: colors.brand,
                  },
                  isSaved && { opacity: 0.65 },
                ]}
                onPress={() => setTaxMode(TaxMode.IGST)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    taxMode === TaxMode.IGST && styles.activeText,
                    { color: taxMode === TaxMode.IGST ? "#FFF" : colors.text },
                  ]}
                >
                  IGST (18%)
                </Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity
                disabled={isSaved}
                style={[
                  styles.toggleBtn,
                  taxMode === TaxMode.CGST_SGST && {
                    backgroundColor: colors.brand,
                    borderColor: colors.brand,
                  },
                  isSaved && { opacity: 0.65 },
                ]}
                onPress={() => setTaxMode(TaxMode.CGST_SGST)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    taxMode === TaxMode.CGST_SGST && styles.activeText,
                    {
                      color:
                        taxMode === TaxMode.CGST_SGST ? "#FFF" : colors.text,
                    },
                  ]}
                >
                  CGST + SGST (9%+9%)
                </Text>
              </TouchableOpacity>
            </View>
            <InputField
              label="Freight Charges (₹)"
              value={freight}
              onChangeText={setFreight}
              keyboardType="numeric"
              editable={!isSaved}
            />
          </FormCard>

          <FormCard title="Line Items (Goods)">
            {goods.map((item, index) => (
              <LineItemRow
                key={item.productId + String(index)}
                item={item}
                index={index}
                onUpdate={updateGoodsItem}
                onRemove={removeGoodsRow}
                showDelete={goods.length > 1 && !isSaved}
                editable={!isSaved}
              />
            ))}

            {!isSaved && (
              <TouchableOpacity
                style={[styles.addItemBtn, { borderColor: colors.brand }]}
                onPress={addGoodsRow}
              >
                <MaterialIcons name="add" size={16} color={colors.brand} />
                <Text style={[styles.addItemText, { color: colors.brand }]}>
                  Add Line Item
                </Text>
              </TouchableOpacity>
            )}
          </FormCard>

          <ActionButtons
            isSaved={isSaved}
            onSave={handleSavePipeline}
            onPrint={handlePrintPipeline}
            onShare={handleSharePipeline}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", width: 60 },
  backText: { fontSize: 15, marginLeft: 4 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "flex-end" },
  subLabel: { fontSize: 12, fontWeight: "500", marginBottom: 6 },
  toggleRow: { flexDirection: "row", marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: { fontSize: 13, fontWeight: "500" },
  activeText: { fontWeight: "600" },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  addItemText: { fontSize: 13, fontWeight: "600", marginLeft: 4 },
});
