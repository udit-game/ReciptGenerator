import { InvoiceData } from "@/types/InvoiceTypes";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Alert } from "react-native";
import { generateInvoiceHTML } from "../../utils/generateInvoiceHTML";

export function useInvoiceActions() {
  const prepareHTML = (data: InvoiceData): string => {
    return generateInvoiceHTML(data);
  };

  const executeDirectPrint = async (data: InvoiceData) => {
    try {
      const html = prepareHTML(data);
      await Print.printAsync({ html });
    } catch (error) {
      Alert.alert(
        "Print Error",
        "Failed to interface with device printing subsystem.",
      );
      throw error;
    }
  };

  const executeSharePDF = async (data: InvoiceData) => {
    try {
      const html = prepareHTML(data);
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
      return uri;
    } catch (error) {
      Alert.alert(
        "Sharing Error",
        "Failed to compile document asset distributions.",
      );
      throw error;
    }
  };

  return { executeDirectPrint, executeSharePDF };
}
