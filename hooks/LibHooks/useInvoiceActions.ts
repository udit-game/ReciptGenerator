import { InvoiceData } from "@/types/InvoiceTypes";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Alert, Platform } from "react-native";
import { generateInvoiceHTML } from "../../utils/generateInvoiceHTML";
import { File, Paths } from "expo-file-system";


export function useInvoiceActions() {
  const prepareHTML = (data: InvoiceData): string => {
    return generateInvoiceHTML(data, Platform.OS === 'ios' ? 'ios' : 'android');
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
    let tempFile: File | null = null;

    try {
      const html = prepareHTML(data);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });

      const safeName = data.billToName
        .replace(/[^a-zA-Z0-9-_ ]/g, "_")
        .trim();

      const customFilename = `${safeName}_${new Date().getDate().toLocaleString()}.pdf`;

      // Create target file in cache
      tempFile = new File(Paths.cache, customFilename);

      // Copy generated PDF to custom-named file
      const sourceFile = new File(uri);

      sourceFile.copy(tempFile);

      // Share custom named file
      await shareAsync(tempFile.uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert(
        "Sharing Error",
        "Failed to generate or share PDF."
      );
      throw error;
    } finally {
        if (tempFile?.exists) {
          tempFile.delete();
        }
    }
  };

  return { executeDirectPrint, executeSharePDF };
}
