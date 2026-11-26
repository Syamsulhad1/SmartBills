import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { AuthForm } from "./src/components/AuthForm";
import { LoadingScreen } from "./src/components/Screen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { AccountScreen } from "./src/screens/AccountScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ScanScreen } from "./src/screens/ScanScreen";
import { TransactionsScreen } from "./src/screens/TransactionsScreen";
import { StartupErrorScreen } from "./src/screens/StartupErrorScreen";
import { api } from "./src/api/client";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const { session, updateSessionUser } = useAuth();

    const saveTransaction = async (transaction, receiptImage) => {
        const result = await api.createTransaction(
            session.token,
            transaction,
            receiptImage
        );
        if (result.current_balance != null) {
            updateSessionUser({
                ...session.user,
                current_balance: result.current_balance
            });
        }
        return result;
    };

    const tabIcons = {
        Home: { active: "home", inactive: "home-outline" },
        Transactions: { active: "add-circle", inactive: "add-circle-outline" },
        Scan: { active: "scan", inactive: "scan-outline" },
        History: { active: "time", inactive: "time-outline" },
        Account: { active: "person", inactive: "person-outline" }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#0D6B50",
                tabBarInactiveTintColor: "#829087",
                tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
                tabBarIconStyle: { marginTop: 3 },
                tabBarStyle: {
                    paddingTop: 4,
                    borderTopColor: "#E5ECE7",
                    backgroundColor: "#FFFFFF"
                },
                tabBarIcon: ({ color, focused, size }) => {
                    const icon = tabIcons[route.name];
                    return (
                        <Ionicons
                            name={focused ? icon.active : icon.inactive}
                            size={size}
                            color={color}
                        />
                    );
                }
            })}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{ title: "Home", tabBarLabel: "Home" }}
            />
            <Tab.Screen name="Transactions" options={{ title: "Transaksi", tabBarLabel: "Transaksi" }}>
                {() => <TransactionsScreen token={session.token} onSave={saveTransaction} />}
            </Tab.Screen>
            <Tab.Screen name="Scan" options={{ title: "Scan", tabBarLabel: "Scan" }}>
                {() => <ScanScreen token={session.token} onSave={saveTransaction} />}
            </Tab.Screen>
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: "Riwayat", tabBarLabel: "Riwayat" }}
            />
            <Tab.Screen name="Account" options={{ title: "Akun", tabBarLabel: "Akun" }}>
                {() => <AccountScreen onSaveInitialBalance={async (amount) => {
                    const result = await api.setInitialBalance(session.token, amount);
                    updateSessionUser(result.user);
                }} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

const AuthNavigator = () => {
    const { signIn, startupError } = useAuth();

    const registerAndSignIn = async (details) => {
        await api.register(details);
        await signIn({
            email: details.email,
            password: details.password
        });
    };

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "#F5F8F6" }
            }}
        >
            <Stack.Screen name="Login">
                {(props) => (
                    <AuthForm
                        {...props}
                        mode="login"
                        onSubmit={signIn}
                        onSwitch={() => props.navigation.navigate("Register")}
                        startupMessage={startupError}
                    />
                )}
            </Stack.Screen>
            <Stack.Screen name="Register">
                {(props) => (
                    <AuthForm
                        {...props}
                        mode="register"
                        onSubmit={registerAndSignIn}
                        onSwitch={() => props.navigation.navigate("Login")}
                    />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
};

const AppContent = () => {
    const {
        status,
        startupError,
        restoreSession,
        signOut
    } = useAuth();

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    if (status === "loading") {
        return <LoadingScreen message="Memeriksa sesi..." />;
    }

    if (status === "startup-error") {
        return (
            <StartupErrorScreen
                message={startupError}
                onRetry={restoreSession}
                onSignOut={signOut}
            />
        );
    }

    return (
        <NavigationContainer>
            {status === "authenticated"
                ? (
                    <MainTabNavigator />
                )
                : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="dark" />
                <AppContent />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
