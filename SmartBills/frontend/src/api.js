const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL
    || "http://localhost:5000/api").replace(/\/$/, "");

const request = async (path, { token, ...options } = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", "Bearer " + token);
    }
    if (!(options.body instanceof FormData) && options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });
    const payload = response.status === 204 ? null : await response.json();

    if (!response.ok || payload?.success === false) {
        const validation = payload?.errors;
        const diagnostics = [
            payload?.code,
            payload?.providerStatus
                ? `Gemini ${payload.providerStatus}${payload.providerCode ? ` ${payload.providerCode}` : ""}`
                : null
        ].filter(Boolean);
        let message = payload?.message || `Request failed (${response.status})`;
        if (diagnostics.length) {
            message += ` (${diagnostics.join("; ")})`;
        }
        const error = new Error(
            Array.isArray(validation) ? validation.join(", ") : message
        );
        error.status = response.status;
        error.code = payload?.code;
        throw error;
    }

    return payload?.data;
};

export const api = {
    login: (credentials) => request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    }),
    register: (details) => request("/auth/register", {
        method: "POST",
        body: JSON.stringify(details)
    }),
    profile: (token) => request("/users/me", { token }),
    setInitialBalance: (token, amount) => request("/users/me/initial-balance", {
        token,
        method: "POST",
        body: JSON.stringify({ amount })
    }),
    categories: (token) => request("/categories", { token }),
    transactions: (token) => request("/transactions?limit=50&offset=0", {
        token
    }),
    createTransaction: (token, formData) => request("/transactions", {
        token,
        method: "POST",
        body: formData
    }),
    deleteTransaction: (token, id) => request(`/transactions/${id}`, {
        token,
        method: "DELETE"
    }),
    analytics: (token) => request("/analytics?period=monthly", { token }),
    news: (token) => request("/news", { token }),
    parseTransaction: (token, text) => request("/ai/parse-transaction", {
        token,
        method: "POST",
        body: JSON.stringify({ text })
    }),
    recognizeReceipt: (token, file) => {
        const formData = new FormData();
        formData.append("receipt", file);
        return request("/ai/ocr", {
            token,
            method: "POST",
            body: formData
        });
    },
    receipt: async (token, id) => {
        const response = await fetch(
            `${API_BASE_URL}/transactions/${id}/receipt`,
            { headers: { Authorization: "Bearer " + token } }
        );
        if (!response.ok) {
            throw new Error("Bukti transaksi tidak dapat dibuka.");
        }
        return response.blob();
    }
};
