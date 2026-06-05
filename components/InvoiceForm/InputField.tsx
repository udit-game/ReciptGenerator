import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useAppTheme } from '@/hooks/Context/ThemeContext';

interface InputProps extends TextInputProps {
  label: string;
}

export const InputField = React.memo(function InputField({ label, editable = true, ...props }: InputProps) {
  const { themeMode, currentTheme: colors } = useAppTheme();

  return (
    <View style={[styles.wrapper, !editable && { opacity: 0.65 }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            color: colors.text, 
            backgroundColor: editable ? colors.background : colors.border, 
            borderColor: colors.border 
          }
        ]}
        placeholderTextColor={colors.textSecondary}
        editable={editable}
        {...props}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the core visual or tracking properties update
  return (
    prevProps.label === nextProps.label &&
    prevProps.value === nextProps.value &&
    prevProps.editable === nextProps.editable &&
    prevProps.placeholder === nextProps.placeholder
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12, flex: 1 },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }
});