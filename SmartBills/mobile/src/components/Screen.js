import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const Screen = ({ children, style, edges }) => (
    <SafeAreaView edges={edges} style={styles.safeArea}>
        <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
);

export const LoadingScreen = ({ message = "Memuat..." }) => (
    <Screen style={styles.center}>
        <ActivityIndicator size="large" color="#0D6B50" />
        <Text style={styles.loadingText}>{message}</Text>
    </Screen>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F8F6"
    },
    content: {
        flex: 1,
        padding: 24
    },
    center: {
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        marginTop: 14,
        color: "#52645C",
        fontSize: 15
    }
});
