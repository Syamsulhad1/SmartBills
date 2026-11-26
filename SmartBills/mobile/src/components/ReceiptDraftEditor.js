import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { api } from "../api/client";

const today = () => new Date().toISOString().slice(0, 10);

const getInitialValues = (transaction) => ({
    type: transaction?.type || "",
    amount: transaction?.amount ? String(transaction.amount) : "",
    merchantName: transaction?.merchantName || "",
    notes: transaction?.notes || "",
    transactionDate: transaction
        ? transaction.transactionDate || ""
        : today(),
    categoryId: transaction?.categoryId ? String(transaction.categoryId) : ""
});

export const ReceiptDraftEditor = ({
    token,
    transaction,
    receiptImage,
    onSave
}) => {
    const [values, setValues] = useState(() => getInitialValues(transaction));
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoryError, setCategoryError] = useState("");
    const [formError, setFormError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [saveStatus, setSaveStatus] = useState("idle");
    const [savedTransactionId, setSavedTransactionId] = useState(null);

    useEffect(() => {
        let active = true;
        const loadCategories = async () => {
            setCategoriesLoading(true);
            setCategoryError("");
            try {
                const result = await api.categories(token, values.type);
                if (active) setCategories(result.categories);
            } catch (error) {
                if (active) {
                    setCategoryError(error.message || "Kategori gagal dimuat.");
                }
            } finally {
                if (active) setCategoriesLoading(false);
            }
        };
        loadCategories();
        return () => {
            active = false;
        };
    }, [token, values.type]);

    const updateValue = (field, value) => {
        setValues((current) => ({ ...current, [field]: value }));
        setSaveStatus("idle");
        setSavedTransactionId(null);
        setSaveError("");
        setFormError("");
    };

    const saveTransaction = async () => {
        if (saveStatus === "saving" || saveStatus === "success") return;
        const amount = values.amount.trim();
        if (!["INCOME", "EXPENSE"].includes(values.type)) {
            setFormError("Pilih jenis transaksi.");
            return;
        }
        if (!/^\d{1,13}(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
            setFormError("Nominal wajib lebih dari 0 dan maksimal 2 angka desimal.");
            return;
        }
        if (
            values.transactionDate
            && !/^\d{4}-\d{2}-\d{2}$/.test(values.transactionDate)
        ) {
            setFormError("Tanggal harus memakai format YYYY-MM-DD.");
            return;
        }
        if (
            values.transactionDate
            && (() => {
                const date = new Date(`${values.transactionDate}T00:00:00.000Z`);
                return Number.isNaN(date.getTime())
                    || date.toISOString().slice(0, 10) !== values.transactionDate;
            })()
        ) {
            setFormError("Tanggal transaksi tidak valid.");
            return;
        }

        const selectedCategory = categories.find(
            (category) => String(category.category_id) === values.categoryId
        );
        const transaction = {
            type: values.type,
            amount,
            merchantName: values.merchantName.trim() || null,
            notes: values.notes.trim() || null,
            transactionDate: values.transactionDate || null,
            categoryId: values.categoryId ? Number(values.categoryId) : null
        };
        if (
            values.categoryId
            && !selectedCategory
        ) {
            setFormError("Kategori yang dipilih tidak tersedia. Pilih kategori lagi.");
            return;
        }

        setFormError("");
        setSaveError("");
        setSaveStatus("saving");
        try {
            const result = await onSave(transaction, receiptImage);
            setSavedTransactionId(result.transaction_id);
            setSaveStatus("success");
        } catch (error) {
            setSaveError(error.message || "Transaksi gagal disimpan.");
            setSaveStatus("error");
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                {transaction ? "Koreksi hasil ekstraksi" : "Input transaksi manual"}
            </Text>
            <Text style={styles.description}>
                Periksa atau isi data transaksi. Perubahan ini masih berupa draft.
                {receiptImage
                    ? " Bukti struk akan tersimpan bersama transaksi setelah disimpan."
                    : ""}
            </Text>

            <Text style={styles.label}>Jenis transaksi</Text>
            <View style={styles.typeOptions}>
                {[
                    { value: "EXPENSE", label: "Pengeluaran" },
                    { value: "INCOME", label: "Pemasukan" }
                ].map((option) => (
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: values.type === option.value }}
                        onPress={() => {
                            updateValue("type", option.value);
                            updateValue("categoryId", "");
                        }}
                        style={[
                            styles.typeButton,
                            values.type === option.value && styles.typeButtonSelected
                        ]}
                    >
                        <Text
                            style={[
                                styles.typeText,
                                values.type === option.value && styles.typeTextSelected
                            ]}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <DraftInput
                label="Nominal (Rupiah)"
                value={values.amount}
                onChangeText={(value) => updateValue("amount", value)}
                keyboardType="decimal-pad"
                placeholder="Contoh: 25000"
            />
            <DraftInput
                label={values.type === "EXPENSE"
                    ? "Nama toko / merchant"
                    : values.type === "INCOME"
                        ? "Sumber pemasukan"
                        : "Toko / sumber"}
                value={values.merchantName}
                onChangeText={(value) => updateValue("merchantName", value)}
                placeholder={values.type === "EXPENSE"
                    ? "Contoh: Toko kebutuhan harian"
                    : values.type === "INCOME"
                        ? "Contoh: Perusahaan atau klien"
                        : "Nama toko atau sumber pemasukan"}
                maxLength={100}
            />
            <DraftInput
                label={values.type === "EXPENSE"
                    ? "Keterangan barang/jasa yang dibeli"
                    : values.type === "INCOME"
                        ? "Keterangan pemasukan"
                        : "Keterangan transaksi"}
                value={values.notes}
                onChangeText={(value) => updateValue("notes", value)}
                placeholder={values.type === "EXPENSE"
                    ? "Contoh: Belanja kebutuhan dapur"
                    : values.type === "INCOME"
                        ? "Contoh: Gaji bulanan"
                        : "Pilih jenis transaksi, lalu isi keterangannya"}
                multiline
                maxLength={500}
            />
            <DraftInput
                label="Tanggal (YYYY-MM-DD)"
                value={values.transactionDate}
                onChangeText={(value) => updateValue("transactionDate", value)}
                placeholder="2026-11-11"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Kategori</Text>
            {categoriesLoading
                ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="small" color="#0D6B50" />
                        <Text style={styles.helper}>Memuat kategori...</Text>
                    </View>
                )
                : categoryError
                    ? (
                        <Text accessibilityRole="alert" style={styles.error}>
                            {categoryError}
                        </Text>
                    )
                    : (
                        <View style={styles.categoryOptions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ selected: !values.categoryId }}
                                onPress={() => updateValue("categoryId", "")}
                                style={[
                                    styles.categoryButton,
                                    !values.categoryId && styles.categoryButtonSelected
                                ]}
                            >
                                <Text style={styles.categoryText}>Tanpa kategori</Text>
                            </Pressable>
                            {categories.map((category) => (
                                <Pressable
                                    key={category.category_id}
                                    accessibilityRole="button"
                                    accessibilityState={{
                                        selected: values.categoryId
                                            === String(category.category_id)
                                    }}
                                    onPress={() => updateValue(
                                        "categoryId",
                                        String(category.category_id)
                                    )}
                                    style={[
                                        styles.categoryButton,
                                        values.categoryId === String(category.category_id)
                                            && styles.categoryButtonSelected
                                    ]}
                                >
                                    <Text style={styles.categoryText}>{category.name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

            {!!formError && (
                <Text accessibilityRole="alert" style={styles.error}>{formError}</Text>
            )}
            {!!saveError && (
                <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text>
            )}
            {saveStatus === "success" ? (
                <View accessibilityRole="alert" style={styles.successBox}>
                    <Text style={styles.successTitle}>Transaksi berhasil disimpan</Text>
                    <Text style={styles.successText}>
                        {receiptImage
                            ? "Bukti struk ikut tersimpan. "
                            : ""}
                        ID transaksi: {savedTransactionId}
                    </Text>
                </View>
            ) : (
                <Pressable
                    accessibilityRole="button"
                    disabled={saveStatus === "saving" || categoriesLoading}
                    onPress={saveTransaction}
                    style={[
                        styles.saveButton,
                        (saveStatus === "saving" || categoriesLoading) && styles.disabled
                    ]}
                >
                    {saveStatus === "saving"
                        ? (
                            <View style={styles.saving}>
                                <ActivityIndicator color="#FFFFFF" />
                                <Text style={styles.saveText}>Menyimpan transaksi...</Text>
                            </View>
                        )
                        : (
                            <Text style={styles.saveText}>
                                {transaction ? "Simpan transaksi" : "Simpan transaksi manual"}
                            </Text>
                        )}
                </Pressable>
            )}
        </View>
    );
};

const DraftInput = ({ label, ...inputProps }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            {...inputProps}
            placeholderTextColor="#91A098"
            style={[styles.input, inputProps.multiline && styles.multilineInput]}
            textAlignVertical={inputProps.multiline ? "top" : "center"}
        />
    </View>
);

const styles = StyleSheet.create({
    card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16 },
    title: { color: "#14251D", fontWeight: "700", fontSize: 15 },
    description: { color: "#68776F", fontSize: 13, lineHeight: 19, marginTop: 7 },
    field: { marginTop: 13 },
    label: { color: "#33443B", fontSize: 12, fontWeight: "600", marginBottom: 7 },
    input: {
        minHeight: 45,
        borderColor: "#DCE6E0",
        borderWidth: 1,
        borderRadius: 9,
        paddingHorizontal: 12,
        color: "#14251D",
        fontSize: 14
    },
    multilineInput: { minHeight: 88, paddingTop: 11 },
    typeOptions: { flexDirection: "row", gap: 8 },
    typeButton: {
        flex: 1,
        alignItems: "center",
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "#DCE6E0",
        paddingVertical: 11
    },
    typeButtonSelected: { backgroundColor: "#E6F4ED", borderColor: "#0D6B50" },
    typeText: { color: "#68776F", fontSize: 12, fontWeight: "600" },
    typeTextSelected: { color: "#0D6B50" },
    categoryOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    categoryButton: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#DCE6E0",
        paddingHorizontal: 11,
        paddingVertical: 8
    },
    categoryButtonSelected: { backgroundColor: "#E6F4ED", borderColor: "#0D6B50" },
    categoryText: { color: "#33443B", fontSize: 12 },
    loading: { flexDirection: "row", alignItems: "center", gap: 8 },
    helper: { color: "#68776F", fontSize: 12 },
    error: { color: "#B42318", fontSize: 12, lineHeight: 18, marginTop: 8 },
    saveButton: {
        minHeight: 46,
        borderRadius: 10,
        backgroundColor: "#0D6B50",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 14
    },
    saveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
    saving: { flexDirection: "row", alignItems: "center", gap: 9 },
    disabled: { opacity: 0.7 },
    successBox: {
        backgroundColor: "#E6F4ED",
        borderRadius: 10,
        padding: 12,
        marginTop: 14
    },
    successTitle: { color: "#0D6B50", fontWeight: "700", fontSize: 13 },
    successText: { color: "#33443B", fontSize: 12, marginTop: 5 }
});
