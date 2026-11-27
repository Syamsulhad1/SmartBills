import { API_BASE_URL } from "../config.js";

const parseResponse = async (response) => {
    if (response.status === 204) {
        return null;
    }

    let payload;
    try {
        payload = await response.json();
    } catch (cause) {
        const error = new Error("Server mengirim respons yang tidak valid.");
        error.cause = cause;
        throw error;
    }

    if (!response.ok || payload?.success === false) {
        const validationErrors = Array.isArray(payload?.errors)
            ? payload.errors
                .map((item) => (typeof item === "string" ? item : item?.message))
                .filter(Boolean)
                .join(", ")
            : null;
        const error = new Error(
            validationErrors || payload?.message || `Permintaan gagal (${response.status}).`
        );
        error.status = response.status;
        error.code = payload?.code;
        throw error;
    }

    return payload?.data;
};

const appendReceipt = (formData, image) => {
    const extensionByMimeType = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    };
    const mimeType = image.mimeType || "image/jpeg";
    formData.append("receipt", {
        uri: image.uri,
        name: image.fileName || `receipt.${extensionByMimeType[mimeType] || "jpg"}`,
        type: mimeType
    });
};

const readBlobAsDataUri = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result === "string") {
            resolve(reader.result);
        } else {
            reject(new Error("Bukti transaksi tidak dapat dibaca."));
        }
    };
    reader.onerror = () => reject(new Error("Bukti transaksi tidak dapat dibaca."));
    reader.readAsDataURL(blob);
});

export const createApi = ({
    baseUrl = API_BASE_URL,
    fetchImpl = fetch,
    timeoutMs = 15000,
    ocrTimeoutMs = 90000
} = {}) => {
    const apiBaseUrl = baseUrl.replace(/\/$/, "");

    const request = async (path, {
        token,
        method = "GET",
        body,
        multipart = false,
        timeoutMs: requestTimeoutMs = timeoutMs
    } = {}) => {
        const headers = { Accept: "application/json" };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        if (body !== undefined && !multipart) {
            headers["Content-Type"] = "application/json";
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            requestTimeoutMs
        );
        let response;
        try {
            response = await fetchImpl(`${apiBaseUrl}${path}`, {
                method,
                headers,
                signal: controller.signal,
                ...(body !== undefined
                    ? { body: multipart ? body : JSON.stringify(body) }
                    : {})
            });
        } catch (cause) {
            const error = new Error(controller.signal.aborted
                ? `Server tidak merespons dalam ${Math.ceil(requestTimeoutMs / 1000)} detik. Periksa jaringan, alamat API, dan server backend.`
                : "Tidak dapat terhubung ke server. Periksa jaringan dan alamat API.");
            error.cause = cause;
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }

        return parseResponse(response);
    };

    return {
        login: (credentials) => request("/auth/login", {
            method: "POST",
            body: credentials
        }),
        register: (details) => request("/auth/register", {
            method: "POST",
            body: details
        }),
        profile: (token) => request("/users/me", { token }),
        categories: (token, type) => request(
            `/categories${type ? `?type=${encodeURIComponent(type)}` : ""}`,
            { token }
        ),
        recognizeReceipt: (token, image) => {
            const formData = new FormData();
            appendReceipt(formData, image);
            return request("/ai/ocr", {
                token,
                method: "POST",
                body: formData,
                multipart: true,
                timeoutMs: ocrTimeoutMs
            });
        },
        parseReceiptTransaction: (token, text) => request(
            "/ai/parse-transaction",
            { token, method: "POST", body: { text } }
        ),
        createTransaction: (token, transaction, receiptImage) => {
            if (!receiptImage) {
                return request("/transactions", {
                    token,
                    method: "POST",
                    body: transaction
                });
            }

            const formData = new FormData();
            Object.entries(transaction).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            });
            appendReceipt(formData, receiptImage);
            return request("/transactions", {
                token,
                method: "POST",
                body: formData,
                multipart: true
            });
        },
        transactions: (token) => request(
            "/transactions?limit=50&offset=0",
            { token }
        ),
        receiptImageSource: (token, transactionId) => ({
            uri: `${apiBaseUrl}/transactions/${encodeURIComponent(transactionId)}/receipt`,
            headers: { Authorization: `Bearer ${token}` }
        }),
        receiptImageUri: async (token, transactionId) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            let response;
            try {
                response = await fetchImpl(
                    `${apiBaseUrl}/transactions/${encodeURIComponent(transactionId)}/receipt`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal
                    }
                );
            } catch (cause) {
                const error = new Error(controller.signal.aborted
                    ? "Server tidak merespons saat memuat bukti transaksi."
                    : "Tidak dapat terhubung ke server untuk memuat bukti transaksi.");
                error.cause = cause;
                throw error;
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                let message = `Bukti transaksi gagal dimuat (${response.status}).`;
                try {
                    const payload = await response.json();
                    message = payload?.message || message;
                } catch {
                    // Keep the HTTP status message if the server response is not JSON.
                }
                if (response.status === 404) {
                    message = "File bukti tidak ditemukan di server. Transaksi mungkin tersimpan tanpa gambar struk.";
                } else if (response.status === 401) {
                    message = "Sesi login tidak valid. Keluar lalu masuk kembali.";
                }
                const error = new Error(message);
                error.status = response.status;
                throw error;
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.startsWith("image/")) {
                throw new Error("Server tidak mengirim file gambar bukti transaksi.");
            }

            return readBlobAsDataUri(await response.blob());
        },
        setInitialBalance: (token, amount) => request(
            "/users/me/initial-balance",
            { token, method: "POST", body: { amount } }
        ),
        analytics: (token, period = "monthly") => request(
            `/analytics?period=${encodeURIComponent(period)}`,
            { token }
        )
    };
};

export const api = createApi();
