import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../api/client";
import { ReceiptDraftEditor } from "./ReceiptDraftEditor";

const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;

const getImageMimeType = (asset) => {
    const mimeType = asset.mimeType?.toLowerCase();
    if (supportedImageTypes.has(mimeType)) return mimeType;

    const extension = asset.fileName?.split(".").pop()?.toLowerCase()
        || asset.uri.split(".").pop()?.toLowerCase().split("?")[0];
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    if (extension === "png") return "image/png";
    if (extension === "webp") return "image/webp";
    return mimeType || "";
};

export const ReceiptCamera = ({ token, onTransactionSaved }) => {
    const [image, setImage] = useState(null);
    const [recognition, setRecognition] = useState("");
    const [status, setStatus] = useState("idle");
    const [aiStatus, setAiStatus] = useState("idle");
    const [draft, setDraft] = useState(null);
    const [manualMode, setManualMode] = useState(false);
    const [error, setError] = useState("");
    const [aiError, setAiError] = useState("");

    const useImage = (asset) => {
        const mimeType = getImageMimeType(asset);
        if (!supportedImageTypes.has(mimeType)) {
            setError("Gunakan gambar berformat JPEG, PNG, atau WebP.");
            setStatus("idle");
            return;
        }
        if (asset.fileSize > maxImageBytes) {
            setError("Ukuran gambar maksimal 5 MB.");
            setStatus("idle");
            return;
        }

        setImage({ ...asset, mimeType });
        setRecognition("");
        setDraft(null);
        setManualMode(false);
        setAiStatus("idle");
        setAiError("");
        setError("");
        setStatus("ready");
    };

    const takePhoto = async () => {
        setError("");
        setRecognition("");
        setStatus("opening-camera");

        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                setError("Izin kamera diperlukan untuk memotret struk.");
                setStatus("idle");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.7
            });
            if (result.canceled) {
                setStatus("idle");
                return;
            }

            useImage(result.assets[0]);
        } catch (cameraError) {
            setError(cameraError.message || "Kamera tidak dapat dibuka.");
            setStatus("idle");
        }
    };

    const chooseFromGallery = async () => {
        setError("");
        setRecognition("");
        setStatus("opening-gallery");

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.7
            });
            if (result.canceled) {
                setStatus("idle");
                return;
            }

            useImage(result.assets[0]);
        } catch (pickerError) {
            setError(pickerError.message || "Galeri tidak dapat dibuka.");
            setStatus("idle");
        }
    };

    const submitForOcr = async () => {
        if (!image) return;

        setError("");
        setRecognition("");
        setDraft(null);
        setManualMode(false);
        setAiStatus("idle");
        setAiError("");
        setStatus("uploading");
        try {
            const result = await api.recognizeReceipt(token, image);
            setRecognition(result.text);
            setStatus("complete");
        } catch (uploadError) {
            setError(uploadError.message || "Struk gagal diproses.");
            setStatus("ready");
        }
    };

    const parseWithAi = async () => {
        if (!recognition) return;

        setAiError("");
        setDraft(null);
        setAiStatus("processing");
        try {
            const result = await api.parseReceiptTransaction(token, recognition);
            setDraft(result);
            setAiStatus("complete");
        } catch (parseError) {
            setAiError(parseError.message || "AI gagal menganalisis teks struk.");
            setAiStatus("error");
        }
    };

    const busy = status === "opening-camera"
        || status === "opening-gallery"
        || status === "uploading"
        || aiStatus === "processing";

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Scan bukti transaksi</Text>
            <Text style={styles.description}>
                Foto struk untuk mengambil teksnya. Hasil OCR dapat diperiksa sebelum
                melanjutkan.
            </Text>

            {image && (
                <Image
                    accessibilityLabel="Pratinjau foto struk"
                    resizeMode="cover"
                    source={{ uri: image.uri }}
                    style={styles.preview}
                />
            )}

            {(status === "opening-camera" || status === "opening-gallery") && (
                <View style={styles.progress}>
                    <ActivityIndicator color="#0D6B50" />
                    <Text style={styles.progressText}>
                        {status === "opening-gallery"
                            ? "Membuka galeri..."
                            : "Membuka kamera..."}
                    </Text>
                </View>
            )}

            {status === "uploading" && (
                <View
                    accessibilityLabel="OCR sedang memindai gambar struk"
                    accessibilityRole="progressbar"
                    style={styles.ocrProgress}
                >
                    <ActivityIndicator size="large" color="#0D6B50" />
                    <View style={styles.ocrProgressContent}>
                        <Text style={styles.ocrProgressTitle}>
                            OCR sedang memindai struk
                        </Text>
                        <Text style={styles.ocrProgressText}>
                            Gambar sedang diunggah dan teks pada struk sedang dibaca.
                            Mohon tunggu.
                        </Text>
                    </View>
                </View>
            )}

            {!!error && (
                <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                </Text>
            )}

            {status === "complete" && (
                <View style={styles.result}>
                    <Text style={styles.resultTitle}>1. Hasil OCR</Text>
                    <Text selectable style={styles.resultText}>{recognition}</Text>
                    <Text style={styles.stageComplete}>✓ OCR selesai</Text>
                </View>
            )}

            {!!aiError && (
                <View style={styles.errorBox}>
                    <Text accessibilityRole="alert" style={styles.error}>{aiError}</Text>
                    <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={parseWithAi}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryText}>Coba AI lagi</Text>
                    </Pressable>
                </View>
            )}

            {aiStatus === "processing" && (
                <View style={styles.progress}>
                    <ActivityIndicator color="#0D6B50" />
                    <Text style={styles.progressText}>2. AI sedang menganalisis transaksi...</Text>
                </View>
            )}

            {aiStatus === "complete" && draft && (
                <View style={styles.draft}>
                    <Text style={styles.resultTitle}>Hasil AI siap diperiksa</Text>
                    {!!draft.warnings?.length && (
                        <View style={styles.warnings}>
                            <Text style={styles.warningTitle}>Perlu diperiksa</Text>
                            {draft.warnings.map((warning) => (
                                <Text key={warning.code} style={styles.warningText}>
                                    • {warning.message}
                                </Text>
                            ))}
                        </View>
                    )}
                    <Text style={styles.reviewNote}>
                        Koreksi nilai di formulir berikutnya jika diperlukan.
                    </Text>
                </View>
            )}

            {(aiStatus === "complete" || manualMode) && (
                <ReceiptDraftEditor
                    key={aiStatus === "complete" ? "extracted" : "manual"}
                    token={token}
                    transaction={aiStatus === "complete" ? draft?.transaction : undefined}
                    receiptImage={image}
                    onSave={onTransactionSaved}
                />
            )}

            <View style={styles.actions}>
                {image && status !== "complete" && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityHint="Mengirim foto struk untuk dibaca dengan OCR"
                        disabled={busy}
                        onPress={submitForOcr}
                        style={[styles.button, styles.primaryButton, busy && styles.disabled]}
                    >
                        {status === "uploading"
                            ? (
                                <View style={styles.buttonProgress}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.primaryText}>
                                        OCR sedang memindai...
                                    </Text>
                                </View>
                            )
                            : (
                                <Text style={styles.primaryText}>
                                    Langkah berikutnya: Proses OCR
                                </Text>
                            )}
                    </Pressable>
                )}
                {status === "complete" && aiStatus !== "complete" && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityHint="Melanjutkan hasil OCR ke analisis transaksi"
                        disabled={busy}
                        onPress={parseWithAi}
                        style={[styles.button, styles.primaryButton, busy && styles.disabled]}
                    >
                        {aiStatus === "processing"
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.primaryText}>
                                Langkah berikutnya: Analisis dengan AI
                            </Text>}
                    </Pressable>
                )}
                <View style={styles.sourceActions}>
                    <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={takePhoto}
                        style={[styles.button, styles.secondaryButton, busy && styles.disabled]}
                    >
                        <Text style={styles.secondaryText}>
                            {image ? "Ambil ulang foto" : "Ambil foto"}
                        </Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={chooseFromGallery}
                        style={[styles.button, styles.secondaryButton, busy && styles.disabled]}
                    >
                        <Text style={styles.secondaryText}>Pilih dari galeri</Text>
                    </Pressable>
                </View>
                {!manualMode && aiStatus !== "complete" && (
                    <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => {
                            setManualMode(true);
                        }}
                        style={[styles.button, styles.secondaryButton, busy && styles.disabled]}
                    >
                        <Text style={styles.secondaryText}>Input transaksi manual</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16 },
    title: { color: "#14251D", fontWeight: "700", fontSize: 15 },
    description: { color: "#68776F", fontSize: 13, lineHeight: 19, marginTop: 7 },
    preview: {
        width: "100%",
        height: 220,
        borderRadius: 11,
        backgroundColor: "#EEF1EF",
        marginTop: 14
    },
    progress: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingVertical: 15
    },
    progressText: { color: "#68776F", fontSize: 13 },
    ocrProgress: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#E6F4ED",
        borderColor: "#B7E2CD",
        borderWidth: 1,
        borderRadius: 11,
        padding: 14,
        marginTop: 14
    },
    ocrProgressContent: { flex: 1 },
    ocrProgressTitle: { color: "#0D6B50", fontSize: 14, fontWeight: "700" },
    ocrProgressText: { color: "#33443B", fontSize: 12, lineHeight: 18, marginTop: 4 },
    error: { color: "#B42318", fontSize: 13, lineHeight: 19, marginTop: 12 },
    result: {
        backgroundColor: "#F5F8F6",
        borderRadius: 11,
        padding: 13,
        marginTop: 14
    },
    resultTitle: { color: "#14251D", fontWeight: "700", fontSize: 13, marginBottom: 7 },
    resultText: { color: "#33443B", fontSize: 13, lineHeight: 19 },
    stageComplete: { color: "#0D6B50", fontSize: 12, fontWeight: "700", marginTop: 10 },
    draft: {
        backgroundColor: "#F5F8F6",
        borderRadius: 11,
        padding: 13,
        marginTop: 12
    },
    warnings: { backgroundColor: "#FFF7E6", borderRadius: 8, padding: 10, marginTop: 8 },
    warningTitle: { color: "#8A5700", fontSize: 12, fontWeight: "700", marginBottom: 5 },
    warningText: { color: "#75500D", fontSize: 12, lineHeight: 18 },
    reviewNote: { color: "#68776F", fontSize: 11, marginTop: 10 },
    errorBox: { backgroundColor: "#FEF3F2", borderRadius: 10, padding: 12, marginTop: 12 },
    retryButton: {
        alignSelf: "flex-start",
        backgroundColor: "#0D6B50",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 9
    },
    retryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
    actions: { gap: 9, marginTop: 15 },
    sourceActions: { flexDirection: "row", gap: 9 },
    button: {
        flex: 1,
        minHeight: 46,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12
    },
    secondaryButton: { backgroundColor: "#E8EEE9" },
    secondaryText: { color: "#0D6B50", fontWeight: "700", fontSize: 14 },
    primaryButton: { backgroundColor: "#0D6B50" },
    primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
    buttonProgress: { flexDirection: "row", alignItems: "center", gap: 8 },
    disabled: { opacity: 0.65 }
});
