import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { ReceiptCamera } from "../components/ReceiptCamera";
import { Screen } from "../components/Screen";

export const ScanScreen = ({ token, onSave }) => (
    <Screen edges={["top", "left", "right"]} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View>
                <Text style={styles.title}>Scan bukti</Text>
                <Text style={styles.subtitle}>Ambil foto atau pilih struk, lalu tinjau hasil OCR dan AI.</Text>
            </View>
            <ReceiptCamera token={token} onTransactionSaved={onSave} />
        </ScrollView>
    </Screen>
);

const styles = StyleSheet.create({
    screen: { padding: 0 },
    content: { padding: 20, paddingBottom: 28, gap: 16 },
    title: { color: "#14251D", fontSize: 25, fontWeight: "800" },
    subtitle: { color: "#68776F", fontSize: 14, lineHeight: 20, marginTop: 5 }
});
