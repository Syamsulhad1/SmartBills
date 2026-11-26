import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { Screen } from "../components/Screen";

export const HomeScreen = () => {
    const { session, signOut } = useAuth();
    const [signingOut, setSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState("");
    const user = session?.user;

    const handleSignOut = async () => {
        setSignOutError("");
        setSigningOut(true);
        try {
            await signOut();
        } catch (error) {
            setSignOutError(error.message || "Tidak dapat menghapus sesi.");
        } finally {
            setSigningOut(false);
        }
    };

    return (
        <Screen>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>S</Text>
                </View>
                <Text style={styles.brand}>SmartBills</Text>
            </View>

            <View style={styles.welcome}>
                <Text style={styles.eyebrow}>AKUN ANDA</Text>
                <Text style={styles.title}>Halo, {user?.name || "Pengguna"}!</Text>
                <Text style={styles.subtitle}>
                    Fondasi aplikasi mobile SmartBills siap digunakan.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email || "-"}</Text>
                <View style={styles.divider} />
                <Text style={styles.label}>Status saldo awal</Text>
                <Text style={styles.value}>
                    {user?.has_initial_balance ? "Sudah diatur" : "Belum diatur"}
                </Text>
                {user?.current_balance != null && (
                    <>
                        <View style={styles.divider} />
                        <Text style={styles.label}>Saldo saat ini</Text>
                        <Text style={styles.balance}>
                            Rp {Number(user.current_balance).toLocaleString("id-ID")}
                        </Text>
                    </>
                )}
            </View>

            <View style={styles.footer}>
                {!!signOutError && (
                    <Text accessibilityRole="alert" style={styles.signOutError}>
                        {signOutError}
                    </Text>
                )}
                <Text style={styles.note}>
                    Fitur transaksi dan dashboard mobile dapat ditambahkan di tahap berikutnya.
                </Text>
                <Pressable
                    accessibilityRole="button"
                    disabled={signingOut}
                    onPress={handleSignOut}
                    style={styles.signOut}
                >
                    {signingOut
                        ? <ActivityIndicator color="#0D6B50" />
                        : <Text style={styles.signOutText}>Keluar</Text>}
                </Pressable>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: 11 },
    logo: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: "#DDF2E8",
        alignItems: "center",
        justifyContent: "center"
    },
    logoText: { color: "#0D6B50", fontWeight: "800", fontSize: 20 },
    brand: { color: "#0D6B50", fontSize: 17, fontWeight: "800" },
    welcome: { marginTop: 45, marginBottom: 24 },
    eyebrow: { color: "#0D6B50", fontWeight: "700", fontSize: 12, letterSpacing: 1 },
    title: { color: "#14251D", fontWeight: "800", fontSize: 27, marginTop: 8 },
    subtitle: { color: "#68776F", fontSize: 15, lineHeight: 22, marginTop: 8 },
    card: { backgroundColor: "#FFFFFF", padding: 19, borderRadius: 16 },
    label: { color: "#68776F", fontSize: 13 },
    value: { color: "#14251D", fontSize: 16, fontWeight: "600", marginTop: 5 },
    divider: { height: 1, backgroundColor: "#E8EEE9", marginVertical: 16 },
    balance: { color: "#0D6B50", fontWeight: "800", fontSize: 22, marginTop: 5 },
    footer: { marginTop: "auto" },
    note: {
        color: "#68776F",
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
        marginBottom: 14
    },
    signOut: {
        minHeight: 50,
        borderColor: "#DCE6E0",
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF"
    },
    signOutError: {
        color: "#B42318",
        fontSize: 13,
        lineHeight: 18,
        textAlign: "center",
        marginBottom: 10
    },
    signOutText: { color: "#0D6B50", fontWeight: "700", fontSize: 15 }
});
