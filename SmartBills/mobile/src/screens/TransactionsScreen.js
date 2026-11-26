import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { ReceiptDraftEditor } from "../components/ReceiptDraftEditor";
import { Screen } from "../components/Screen";

export const TransactionsScreen = ({ token, onSave }) => (
    <Screen edges={["top", "left", "right"]} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View>
                <Text style={styles.title}>Transaksi</Text>
                <Text style={styles.subtitle}>Catat pemasukan atau pengeluaran secara manual.</Text>
            </View>
            <ReceiptDraftEditor token={token} onSave={onSave} />
        </ScrollView>
    </Screen>
);

const styles = StyleSheet.create({
    screen: { padding: 0 },
    content: { padding: 20, paddingBottom: 28, gap: 16 },
    title: { color: "#14251D", fontSize: 25, fontWeight: "800" },
    subtitle: { color: "#68776F", fontSize: 14, lineHeight: 20, marginTop: 5 }
});
