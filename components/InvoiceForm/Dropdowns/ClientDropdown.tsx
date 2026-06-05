import { Theme } from "@/constants/Colors";
import { Client, useClientStorage } from "@/hooks/RepoHooks/useClientStorage";
import { TaxMode } from "@/types/InvoiceTypes";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { InputField } from "../InputField";

interface Props {
  selectedClientId: string;
  onSelectClient: (client: Client | null) => void;
  editable: boolean;
  label?: string;
  showAddOption?: boolean;
}

export function ClientDropdown({
  selectedClientId,
  onSelectClient,
  editable,
  label = "Select Client / Consignee",
  showAddOption = true,
}: Props) {
  const scheme = useColorScheme();
  const colors = Theme[scheme as keyof typeof Theme] || Theme.light;

  const { fetchAllClients, insertNewClient } = useClientStorage();

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchInternal, setSearchInternal] = useState("");

  // Creation Sub-Modal Inputs
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newGstin, setNewGstin] = useState("");
  const [taxType, setTaxType] = useState<TaxMode>(TaxMode.IGST);

  const loadCatalog = async () => {
    try {
      const data = await fetchAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch {
      Alert.alert("Error", "Could not load customer profiles catalog.");
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Throttled inline search implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInternal.trim() === "") {
        setFilteredClients(clients);
      } else {
        const lower = searchInternal.toLowerCase();
        setFilteredClients(
          clients.filter((c) => c.name.toLowerCase().includes(lower)),
        );
      }
    }, 150); // 150ms debounce window
    return () => clearTimeout(timer);
  }, [searchInternal, clients]);

  const handleCreateClient = async () => {
    try {
      const newlyCreatedRecord = await insertNewClient(
        newName,
        newAddress,
        newGstin,
        taxType,
      );
      await loadCatalog();
      onSelectClient(newlyCreatedRecord);
      setModalVisible(false);
      setNewName("");
      setNewAddress("");
      setNewGstin("");
    } catch (error) {
      console.error("Failed to create new client master record.", error);
      Alert.alert(
        "Storage Failure",
        "Failed to preserve client master fields data entry.",
      );
    }
  };

  const currentSelected = clients.find((c) => c.id === selectedClientId);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.pickerRow}>
        <TouchableOpacity
          disabled={!editable}
          style={[
            styles.dropdownTrigger,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              flex: 1,
            },
          ]}
          onPress={() => {
            setSearchInternal("");
            setDropdownOpen(true);
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: currentSelected ? colors.text : colors.textSecondary,
            }}
          >
            {currentSelected ? currentSelected.name : "Choose a Client..."}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.text} />
        </TouchableOpacity>

        {!showAddOption && selectedClientId ? (
          <TouchableOpacity
            style={styles.clearPickerSelection}
            onPress={() => onSelectClient(null)}
          >
            <MaterialIcons name="clear" size={20} color="#E53935" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={dropdownOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setDropdownOpen(false)}
        >
          <View
            style={[
              styles.dropdownMenu,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Throttled Local Search Bar Input Field */}
            <View
              style={[
                styles.localSearchBox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <MaterialIcons
                name="search"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.localSearchInput, { color: colors.text }]}
                placeholder="Type to filter list rows..."
                placeholderTextColor={colors.textSecondary}
                value={searchInternal}
                onChangeText={setSearchInternal}
              />
            </View>

            {showAddOption && (
              <TouchableOpacity
                style={[
                  styles.addItemOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setDropdownOpen(false);
                  setModalVisible(true);
                }}
              >
                <MaterialIcons
                  name="add-circle-outline"
                  size={20}
                  color={colors.brand}
                />
                <Text style={[styles.addItemText, { color: colors.brand }]}>
                  Add New Client Master
                </Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => {
                    onSelectClient(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            New Client Master Entry
          </Text>
          <InputField
            label="Company Name"
            value={newName}
            onChangeText={setNewName}
            placeholder="E.g., Reliance Industries"
          />
          <InputField
            label="Full Billing Address"
            value={newAddress}
            onChangeText={setNewAddress}
            multiline
          />
          <InputField
            label="GSTIN"
            value={newGstin}
            onChangeText={setNewGstin}
            autoCapitalize="characters"
            maxLength={15}
          />
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary, marginTop: 10 },
            ]}
          >
            Tax Type
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 16, gap: 12 }}>
            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                taxType === TaxMode.IGST && {
                  backgroundColor: colors.brand,
                  borderColor: colors.brand,
                },
                { flex: 1, justifyContent: "center" },
              ]}
              onPress={() => setTaxType(TaxMode.IGST)}
            >
              <Text
                style={{
                  color: taxType === TaxMode.IGST ? "#FFF" : colors.text,
                  fontWeight: "500",
                }}
              >
                IGST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                taxType === TaxMode.CGST_SGST && {
                  backgroundColor: colors.brand,
                  borderColor: colors.brand,
                },
                { flex: 1, justifyContent: "center" },
              ]}
              onPress={() => setTaxType(TaxMode.CGST_SGST)}
            >
              <Text
                style={{
                  color: taxType === TaxMode.CGST_SGST ? "#FFF" : colors.text,
                  fontWeight: "500",
                }}
              >
                CGST + SGST
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.brand }]}
              onPress={handleCreateClient}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>
                Save Client
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "500", marginBottom: 6 },
  pickerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearPickerSelection: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  dropdownMenu: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 340,
    padding: 8,
  },
  localSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 38,
    marginBottom: 8,
  },
  localSearchInput: { flex: 1, fontSize: 13, marginLeft: 6, padding: 0 },
  addItemOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  addItemText: { fontWeight: "600", fontSize: 14 },
  itemRow: { paddingVertical: 12, paddingHorizontal: 8 },
  modalContent: { flex: 1, padding: 24, justifyContent: "center" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
});
