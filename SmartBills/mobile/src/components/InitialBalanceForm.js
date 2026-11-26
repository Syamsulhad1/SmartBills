import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export const InitialBalanceForm = ({ onSubmit }) => {
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const submit = async () => {
        setError("");
        const normalizedAmount = amount.trim();
        if (!/^\d{1,13}(\.\d{1,2})?$/.test(normalizedAmount)) {
            setError("Masukkan nominal non-negatif dengan maksimal 2 angka desimal.");
            return;
        }

        setSaving(true);
        try {
            await onSubmit(normalizedAmount);
        } catch (submitError) {
            setError(submitError.message || "Saldo awal gagal disimpan.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Atur saldo awal</Text>
            <Text style={styles.description}>
                Masukkan saldo yang Anda miliki saat mulai menggunakan SmartBills.
            </Text>
            <Text style={styles.label}>Nominal saldo (Rupiah)</Text>
            <View style={styles.inputRow}>
                <Text style={styles.currency}>Rp</Text>
                <TextInput
                    accessibilityLabel="Nominal saldo awal"
                    editable={!saving}
                    keyboardType="decimal-pad"
                    onChangeText={setAmount}
                    placeholder="Contoh: 1500000"
                    placeholderTextColor="#91A098"
                    style={styles.input}
                    value={amount}
                />
            </View>
            {!!error && (
                <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                </Text>
            )}
            <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={submit}
                style={({ pressed }) => [
                    styles.button,
                    pressed && !saving && styles.pressed,
                    saving && styles.disabled
                ]}
            >
                {saving
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.buttonText}>Simpan saldo awal</Text>}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: "#FFFFFF", padding: 18, borderRadius: 16 },
    title: { color: "#14251D", fontWeight: "800", fontSize: 17 },
    description: { color: "#68776F", fontSize: 13, lineHeight: 19, marginTop: 7 },
    label: { color: "#14251D", fontWeight: "600", fontSize: 13, marginTop: 18 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#DCE6E0",
        borderWidth: 1,
        borderRadius: 11,
        paddingHorizontal: 14,
        marginTop: 8,
        backgroundColor: "#FFFFFF"
    },
    currency: { color: "#68776F", fontSize: 15, fontWeight: "700" },
    input: { flex: 1, color: "#14251D", height: 50, paddingLeft: 10, fontSize: 15 },
    error: { color: "#B42318", fontSize: 13, lineHeight: 18, marginTop: 10 },
    button: {
        minHeight: 48,
        borderRadius: 11,
        backgroundColor: "#0D6B50",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15
    },
    buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
    pressed: { opacity: 0.88 },
    disabled: { opacity: 0.7 }
});
