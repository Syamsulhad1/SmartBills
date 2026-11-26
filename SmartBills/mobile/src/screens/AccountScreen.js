import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { InitialBalanceForm } from "../components/InitialBalanceForm";
import { Screen } from "../components/Screen";

export const AccountScreen = ({ onSaveInitialBalance }) => {
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
        <Screen edges={["top", "left", "right"]} style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <View>
                    <Text style={styles.title}>Akun</Text>
                    <Text style={styles.subtitle}>Informasi profil dan preferensi akun Anda.</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.name || "P").trim().charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.name}>{user?.name || "Pengguna"}</Text>
                    <Text style={styles.email}>{user?.email || "-"}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.label}>Saldo awal</Text>
                    <Text style={styles.value}>
                        {user?.has_initial_balance ? "Sudah diatur" : "Belum diatur"}
                    </Text>
                    {user?.current_balance != null && (
                        <>
                            <Text style={[styles.label, styles.balanceLabel]}>Saldo saat ini</Text>
                            <Text style={styles.balance}>
                                Rp {Number(user.current_balance).toLocaleString("id-ID")}
                            </Text>
                        </>
                    )}
                </View>
                {!user?.has_initial_balance && (
                    <InitialBalanceForm onSubmit={onSaveInitialBalance} />
                )}
                {!!signOutError && (
                    <Text accessibilityRole="alert" style={styles.error}>{signOutError}</Text>
                )}
                <Pressable
                    accessibilityRole="button"
                    disabled={signingOut}
                    onPress={handleSignOut}
                    style={[styles.signOut, signingOut && styles.disabled]}
                >
                    {signingOut
                        ? <ActivityIndicator color="#B42318" />
                        : <Text style={styles.signOutText}>Keluar dari akun</Text>}
                </Pressable>
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    screen: { padding: 0 },
    content: { padding: 20, paddingBottom: 28, gap: 16 },
    title: { color: "#14251D", fontSize: 25, fontWeight: "800" },
    subtitle: { color: "#68776F", fontSize: 14, lineHeight: 20, marginTop: 5 },
    card: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 15, padding: 20 },
    avatar: {
        width: 58,
        height: 58,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: "#DDF2E8"
    },
    avatarText: { color: "#0D6B50", fontSize: 25, fontWeight: "800" },
    name: { color: "#14251D", fontSize: 18, fontWeight: "800", marginTop: 12 },
    email: { color: "#68776F", fontSize: 13, marginTop: 4 },
    divider: { alignSelf: "stretch", height: 1, backgroundColor: "#E8EEE9", marginVertical: 18 },
    label: { alignSelf: "stretch", color: "#68776F", fontSize: 12 },
    value: { alignSelf: "stretch", color: "#14251D", fontSize: 14, fontWeight: "700", marginTop: 5 },
    balanceLabel: { marginTop: 15 },
    balance: { alignSelf: "stretch", color: "#0D6B50", fontSize: 20, fontWeight: "800", marginTop: 5 },
    error: { color: "#B42318", fontSize: 13, lineHeight: 19 },
    signOut: {
        minHeight: 49,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#F0C9C5",
        borderRadius: 12,
        backgroundColor: "#FFFFFF"
    },
    signOutText: { color: "#B42318", fontSize: 14, fontWeight: "700" },
    disabled: { opacity: 0.65 }
});
