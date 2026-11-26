import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";

export const StartupErrorScreen = ({ message, onRetry, onSignOut }) => {
    const [signOutError, setSignOutError] = useState("");

    const handleSignOut = async () => {
        setSignOutError("");
        try {
            await onSignOut();
        } catch (error) {
            setSignOutError(error.message || "Tidak dapat menghapus sesi.");
        }
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Tidak dapat memuat akun</Text>
                <Text style={styles.message}>{message}</Text>
                <Text style={styles.hint}>
                    Pastikan backend aktif dan alamat API dapat dijangkau dari perangkat ini.
                </Text>
                {!!signOutError && (
                    <Text accessibilityRole="alert" style={styles.message}>
                        {signOutError}
                    </Text>
                )}
                <Pressable style={styles.retry} onPress={onRetry}>
                    <Text style={styles.retryText}>Coba lagi</Text>
                </Pressable>
                <Pressable style={styles.signOut} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Keluar dan masuk ulang</Text>
                </Pressable>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: { justifyContent: "center" },
    card: { backgroundColor: "#FFFFFF", padding: 22, borderRadius: 18 },
    title: { color: "#14251D", fontWeight: "800", fontSize: 21 },
    message: { color: "#B42318", fontSize: 15, marginTop: 14, lineHeight: 21 },
    hint: { color: "#68776F", fontSize: 14, marginTop: 10, lineHeight: 21 },
    retry: {
        backgroundColor: "#0D6B50",
        borderRadius: 11,
        padding: 15,
        alignItems: "center",
        marginTop: 22
    },
    retryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
    signOut: { alignItems: "center", padding: 15 },
    signOutText: { color: "#0D6B50", fontWeight: "700", fontSize: 14 }
});
