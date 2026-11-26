import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Screen } from "../components/Screen";

const currency = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: 0
})}`;

const transactionDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "-"
        : date.toLocaleDateString("id-ID", { dateStyle: "medium" });
};

export const HistoryScreen = () => {
    const { session } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [receiptError, setReceiptError] = useState("");
    const [receiptImageUri, setReceiptImageUri] = useState(null);
    const [receiptAttempt, setReceiptAttempt] = useState(0);
    const requestSequence = useRef(0);

    const loadTransactions = useCallback(async (isRefresh = false) => {
        const sequence = ++requestSequence.current;
        setError("");
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const result = await api.transactions(session.token);
            if (sequence === requestSequence.current) {
                setTransactions(result || []);
            }
        } catch (loadError) {
            if (sequence === requestSequence.current) {
                setError(loadError.message || "Riwayat transaksi gagal dimuat.");
            }
        } finally {
            if (sequence === requestSequence.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [session.token]);

    const loadReceipt = async (transaction) => {
        setReceiptLoading(true);
        setReceiptError("");
        setReceiptImageUri(null);
        try {
            const imageUri = await api.receiptImageUri(
                session.token,
                transaction.transaction_id
            );
            setReceiptImageUri(imageUri);
        } catch (loadError) {
            setReceiptError(loadError.message || "Bukti transaksi gagal dimuat.");
        } finally {
            setReceiptLoading(false);
        }
    };

    const openReceipt = (transaction) => {
        setSelectedReceipt(transaction);
        setReceiptAttempt(0);
        loadReceipt(transaction);
    };

    const closeReceipt = () => {
        setSelectedReceipt(null);
        setReceiptLoading(false);
        setReceiptError("");
        setReceiptImageUri(null);
    };

    const retryReceipt = () => {
        setReceiptAttempt((attempt) => attempt + 1);
        if (selectedReceipt) loadReceipt(selectedReceipt);
    };

    useFocusEffect(useCallback(() => {
        loadTransactions();
        return () => {
            requestSequence.current += 1;
        };
    }, [loadTransactions]));

    return (
        <Screen edges={["top", "left", "right"]} style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadTransactions(true)}
                        tintColor="#0D6B50"
                    />
                }
            >
                <View>
                    <Text style={styles.title}>Riwayat</Text>
                    <Text style={styles.subtitle}>Maksimal 50 transaksi terbaru.</Text>
                </View>
                {loading
                    ? (
                        <View style={styles.state}>
                            <ActivityIndicator size="large" color="#0D6B50" />
                            <Text style={styles.stateText}>Memuat transaksi...</Text>
                        </View>
                    )
                    : error
                        ? (
                            <View style={styles.messageCard}>
                                <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                                <Pressable onPress={() => loadTransactions()} style={styles.retry}>
                                    <Text style={styles.retryText}>Coba lagi</Text>
                                </Pressable>
                            </View>
                        )
                        : transactions.length === 0
                            ? (
                                <View style={styles.messageCard}>
                                    <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
                                    <Text style={styles.stateText}>Transaksi yang disimpan akan muncul di sini.</Text>
                                </View>
                            )
                            : transactions.map((item) => {
                                const isIncome = item.type === "INCOME";
                                return (
                                    <View key={item.transaction_id} style={styles.transactionCard}>
                                        <View style={styles.row}>
                                            <View style={styles.transactionDetails}>
                                                <Text numberOfLines={1} style={styles.merchant}>
                                                    {item.merchant_name || item.notes || "Transaksi"}
                                                </Text>
                                                <Text style={styles.meta}>
                                                    {transactionDate(item.transaction_date)} · {item.category_name || "Tanpa kategori"}
                                                </Text>
                                            </View>
                                            <Text style={[styles.amount, isIncome && styles.income]}>
                                                {isIncome ? "+" : "-"}{currency(item.amount)}
                                            </Text>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.type}>
                                                {isIncome ? "Pemasukan" : "Pengeluaran"}
                                            </Text>
                                            {item.receipt_url && (
                                                <Pressable
                                                    accessibilityRole="button"
                                                    accessibilityLabel="Lihat bukti transaksi"
                                                    onPress={() => openReceipt(item)}
                                                    style={styles.receiptButton}
                                                >
                                                    <Text style={styles.receiptButtonText}>
                                                        Lihat bukti
                                                    </Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
            </ScrollView>
            <Modal
                visible={Boolean(selectedReceipt)}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeReceipt}
            >
                <View style={styles.receiptBackdrop}>
                    <View style={styles.receiptModal}>
                        <View style={styles.receiptHeader}>
                            <View style={styles.receiptHeading}>
                                <Text style={styles.receiptTitle}>Bukti transaksi</Text>
                                <Text numberOfLines={1} style={styles.receiptMerchant}>
                                    {selectedReceipt?.merchant_name
                                        || selectedReceipt?.notes
                                        || "Transaksi"}
                                </Text>
                            </View>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Tutup bukti transaksi"
                                onPress={closeReceipt}
                                style={styles.closeReceiptButton}
                            >
                                <Text style={styles.closeReceiptText}>Tutup</Text>
                            </Pressable>
                        </View>
                        <View style={styles.receiptImageContainer}>
                            {receiptLoading && (
                                <ActivityIndicator
                                    size="large"
                                    color="#0D6B50"
                                    style={styles.receiptLoader}
                                />
                            )}
                            {receiptError
                                ? (
                                    <View style={styles.receiptErrorContainer}>
                                        <Text accessibilityRole="alert" style={styles.error}>
                                            {receiptError}
                                        </Text>
                                        <Pressable
                                            accessibilityRole="button"
                                            onPress={retryReceipt}
                                            style={styles.retry}
                                        >
                                            <Text style={styles.retryText}>Coba lagi</Text>
                                        </Pressable>
                                    </View>
                                )
                                : selectedReceipt && receiptImageUri && (
                                    <Image
                                        key={`${selectedReceipt.transaction_id}-${receiptAttempt}`}
                                        source={{ uri: receiptImageUri }}
                                        resizeMode="contain"
                                        style={styles.receiptImage}
                                        onLoadStart={() => setReceiptLoading(true)}
                                        onLoadEnd={() => setReceiptLoading(false)}
                                        onError={() => {
                                            setReceiptLoading(false);
                                            setReceiptError(
                                                "File bukti diterima, tetapi gambar tidak dapat ditampilkan."
                                            );
                                        }}
                                    />
                                )}
                        </View>
                    </View>
                </View>
            </Modal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    screen: { padding: 0 },
    content: { padding: 20, paddingBottom: 28, gap: 12 },
    title: { color: "#14251D", fontSize: 25, fontWeight: "800" },
    subtitle: { color: "#68776F", fontSize: 14, marginTop: 5, marginBottom: 5 },
    state: { alignItems: "center", paddingVertical: 36, gap: 10 },
    stateText: { color: "#68776F", fontSize: 13, lineHeight: 19 },
    messageCard: { backgroundColor: "#FFFFFF", padding: 18, borderRadius: 14, gap: 8 },
    emptyTitle: { color: "#14251D", fontWeight: "700", fontSize: 15 },
    error: { color: "#B42318", fontSize: 13, lineHeight: 19 },
    retry: {
        alignSelf: "flex-start",
        marginTop: 4,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 9,
        backgroundColor: "#0D6B50"
    },
    retryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    transactionCard: { backgroundColor: "#FFFFFF", padding: 15, borderRadius: 13, gap: 9 },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    transactionDetails: { flex: 1 },
    merchant: { color: "#14251D", fontSize: 14, fontWeight: "700" },
    meta: { color: "#68776F", fontSize: 11, marginTop: 5 },
    amount: { color: "#B42318", fontSize: 13, fontWeight: "800" },
    income: { color: "#0D6B50" },
    cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    type: { color: "#829087", fontSize: 11 },
    receiptButton: {
        backgroundColor: "#E5F3EC",
        borderRadius: 8,
        paddingHorizontal: 11,
        paddingVertical: 7
    },
    receiptButtonText: { color: "#0D6B50", fontSize: 12, fontWeight: "700" },
    receiptBackdrop: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(10, 20, 15, 0.72)",
        padding: 18
    },
    receiptModal: {
        width: "100%",
        height: "78%",
        maxWidth: 560,
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16
    },
    receiptHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 12
    },
    receiptHeading: { flex: 1 },
    receiptTitle: { color: "#14251D", fontSize: 17, fontWeight: "800" },
    receiptMerchant: { color: "#68776F", fontSize: 12, marginTop: 4 },
    closeReceiptButton: {
        backgroundColor: "#EEF2EF",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8
    },
    closeReceiptText: { color: "#14251D", fontSize: 12, fontWeight: "700" },
    receiptImageContainer: {
        flex: 1,
        minHeight: 240,
        backgroundColor: "#F5F8F6",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
    },
    receiptImage: { width: "100%", height: "100%" },
    receiptLoader: { position: "absolute", zIndex: 1 },
    receiptErrorContainer: { alignItems: "center", padding: 18 },
});
