const {
    OCR_SERVICE_URL,
    OCR_SERVICE_TOKEN
} = require("../config/environment");
const { validateReceiptBuffer } = require("../config/storage");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 65000;

const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

const recognizeReceipt = async (
    imageBuffer,
    mimeType,
    {
        serviceUrl = OCR_SERVICE_URL,
        serviceToken = OCR_SERVICE_TOKEN,
        fetchImpl = fetch
    } = {}
) => {
    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
        throw createError("Gambar bukti wajib diunggah", 400, "OCR_IMAGE_REQUIRED");
    }

    validateReceiptBuffer(imageBuffer, mimeType);
    if (imageBuffer.length > MAX_IMAGE_BYTES) {
        throw createError(
            "Ukuran gambar bukti melebihi batas OCR 5 MB",
            413,
            "OCR_IMAGE_TOO_LARGE"
        );
    }

    let endpoint;
    try {
        const parsedUrl = new URL(serviceUrl);
        const isLoopback = [
            "localhost",
            "127.0.0.1",
            "[::1]"
        ].includes(parsedUrl.hostname);
        if (
            !["http:", "https:"].includes(parsedUrl.protocol)
            || parsedUrl.username
            || parsedUrl.password
            || parsedUrl.search
            || parsedUrl.hash
            || (parsedUrl.protocol === "http:" && !isLoopback)
        ) {
            throw new Error("Unsafe OCR service URL");
        }
        endpoint = new URL(
            "ocr",
            serviceUrl.endsWith("/") ? serviceUrl : `${serviceUrl}/`
        ).toString();
    } catch {
        throw createError(
            "URL layanan OCR tidak valid atau belum dikonfigurasi",
            503,
            "OCR_NOT_CONFIGURED"
        );
    }

    if (typeof serviceToken !== "string" || serviceToken.length < 32) {
        throw createError(
            "Token layanan OCR tidak valid atau belum dikonfigurasi",
            503,
            "OCR_NOT_CONFIGURED"
        );
    }

    let response;
    try {
        response = await fetchImpl(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${serviceToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                imageBase64: imageBuffer.toString("base64"),
                mimeType
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
    } catch (error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
            throw createError("Permintaan ke layanan OCR melebihi batas waktu", 504, "OCR_TIMEOUT");
        }
        throw createError(
            "Tidak dapat terhubung ke layanan OCR",
            502,
            "OCR_SERVICE_REQUEST_FAILED"
        );
    }

    if (response.status === 401 || response.status === 403) {
        throw createError(
            "Autentikasi layanan OCR gagal",
            503,
            "OCR_SERVICE_AUTH_FAILED"
        );
    }
    if (response.status === 429) {
        throw createError("Layanan OCR sedang sibuk", 503, "OCR_SERVICE_BUSY");
    }
    if (response.status === 422) {
        throw createError(
            "Tidak ada teks yang dapat dibaca pada gambar bukti",
            422,
            "OCR_NO_TEXT"
        );
    }
    if (!response.ok) {
        throw createError(
            "Layanan OCR gagal memproses gambar bukti",
            502,
            "OCR_SERVICE_FAILED"
        );
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw createError(
            "Layanan OCR mengirim respons yang tidak valid",
            502,
            "OCR_SERVICE_INVALID_RESPONSE"
        );
    }

    if (typeof result?.text !== "string" || !result.text.trim()) {
        throw createError(
            "Tidak ada teks yang dapat dibaca pada gambar bukti",
            422,
            "OCR_NO_TEXT"
        );
    }

    return { text: result.text };
};

module.exports = { recognizeReceipt };
