import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { Screen } from "./Screen";

const colors = {
    ink: "#14251D",
    muted: "#68776F",
    green: "#0D6B50",
    border: "#DCE6E0",
    error: "#B42318",
    white: "#FFFFFF"
};

export const AuthForm = ({
    mode,
    onSubmit,
    onSwitch,
    startupMessage = ""
}) => {
    const registering = mode === "register";
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(startupMessage);

    const submit = async () => {
        setError("");
        if (!email.trim() || !password) {
            setError("Email dan kata sandi wajib diisi.");
            return;
        }
        if (registering && !name.trim()) {
            setError("Nama wajib diisi.");
            return;
        }

        setBusy(true);
        try {
            await onSubmit({
                ...(registering ? { name: name.trim() } : {}),
                email: email.trim(),
                password
            });
        } catch (submitError) {
            setError(submitError.message || "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.brandMark}>
                        <Text style={styles.brandMarkText}>S</Text>
                    </View>
                    <Text style={styles.brand}>SmartBills</Text>
                    <Text style={styles.title}>
                        {registering ? "Buat akun baru" : "Selamat datang"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {registering
                            ? "Mulai kelola keuangan dengan lebih mudah."
                            : "Masuk untuk melanjutkan ke akun Anda."}
                    </Text>

                    {registering && (
                        <Field
                            label="Nama"
                            value={name}
                            onChangeText={setName}
                            placeholder="Nama lengkap"
                            autoCapitalize="words"
                        />
                    )}
                    <Field
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="nama@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                    <Field
                        label="Kata sandi"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Masukkan kata sandi"
                        secureTextEntry
                        autoComplete={registering ? "new-password" : "password"}
                    />

                    {!!error && (
                        <View accessibilityRole="alert" style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={submit}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && !busy && styles.pressed,
                            busy && styles.disabled
                        ]}
                    >
                        {busy
                            ? <ActivityIndicator color={colors.white} />
                            : <Text style={styles.primaryText}>
                                {registering ? "Daftar" : "Masuk"}
                            </Text>}
                    </Pressable>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>
                            {registering ? "Sudah punya akun? " : "Belum punya akun? "}
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onSwitch}
                            disabled={busy}
                        >
                            <Text style={styles.switchLink}>
                                {registering ? "Masuk" : "Daftar"}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
};

const Field = ({ label, ...inputProps }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            {...inputProps}
            placeholderTextColor="#91A098"
            style={styles.input}
            returnKeyType="done"
        />
    </View>
);

const styles = StyleSheet.create({
    keyboard: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
    brandMark: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#DDF2E8",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10
    },
    brandMarkText: { color: colors.green, fontWeight: "800", fontSize: 25 },
    brand: { color: colors.green, fontWeight: "800", fontSize: 15 },
    title: { color: colors.ink, fontWeight: "800", fontSize: 28, marginTop: 30 },
    subtitle: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 24 },
    field: { marginBottom: 17 },
    label: { color: colors.ink, fontWeight: "600", fontSize: 14, marginBottom: 8 },
    input: {
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: colors.white,
        color: colors.ink,
        paddingHorizontal: 15,
        height: 52,
        fontSize: 15
    },
    errorBox: {
        borderRadius: 10,
        backgroundColor: "#FEF3F2",
        padding: 12,
        marginBottom: 16
    },
    errorText: { color: colors.error, fontSize: 14, lineHeight: 20 },
    primaryButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: colors.green,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4
    },
    primaryText: { color: colors.white, fontWeight: "700", fontSize: 16 },
    pressed: { opacity: 0.88 },
    disabled: { opacity: 0.7 },
    switchRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 22
    },
    switchText: { color: colors.muted, fontSize: 14 },
    switchLink: { color: colors.green, fontWeight: "700", fontSize: 14 }
});
