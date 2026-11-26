import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../api/client";

const TOKEN_KEY = "smartbills.jwt";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [status, setStatus] = useState("loading");
    const [session, setSession] = useState(null);
    const [startupError, setStartupError] = useState("");

    const restoreSession = useCallback(async () => {
        setStatus("loading");
        setStartupError("");

        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (!token) {
                setSession(null);
                setStatus("unauthenticated");
                return;
            }

            const profile = await api.profile(token);
            setSession({ token, user: profile.user });
            setStatus("authenticated");
        } catch (error) {
            if (error.status === 401) {
                try {
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                } catch (storageError) {
                    setStartupError(
                        `Sesi tidak valid dan token gagal dihapus: ${storageError.message}`
                    );
                    setStatus("startup-error");
                    return;
                }
                setSession(null);
                setStatus("unauthenticated");
                setStartupError("Sesi Anda berakhir. Silakan masuk kembali.");
                return;
            }

            setStartupError(error.message);
            setStatus("startup-error");
        }
    }, []);

    const signIn = useCallback(async (credentials) => {
        const result = await api.login(credentials);
        if (typeof result?.token !== "string" || !result.token) {
            throw new Error("Server tidak mengirim token autentikasi.");
        }

        await SecureStore.setItemAsync(TOKEN_KEY, result.token);
        setSession({ token: result.token, user: result.user });
        setStatus("authenticated");
        setStartupError("");
    }, []);

    const signOut = useCallback(async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setSession(null);
        setStatus("unauthenticated");
        setStartupError("");
    }, []);

    const updateSessionUser = useCallback((user) => {
        setSession((current) => current
            ? { ...current, user }
            : current);
    }, []);

    const value = useMemo(() => ({
        status,
        session,
        startupError,
        restoreSession,
        signIn,
        signOut,
        updateSessionUser
    }), [status, session, startupError, restoreSession, signIn, signOut, updateSessionUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};
