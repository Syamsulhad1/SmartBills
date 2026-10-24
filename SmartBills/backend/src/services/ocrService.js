const {
    OCR_SERVICE_URL,
    OCR_SERVICE_TOKEN
} = require("../config/environment");
const { validateReceiptBuffer } = require("../config/storage");

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
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
        throw createError("Receipt image is required", 400, "OCR_IMAGE_REQUIRED");
    }

    validateReceiptBuffer(imageBuffer, mimeType);
    if (imageBuffer.length > MAX_IMAGE_BYTES) {
        throw createError(
            "Receipt image exceeds the 4 MB OCR limit",
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
            "OCR service URL is missing or invalid",
            503,
            "OCR_NOT_CONFIGURED"
        );
    }

    if (typeof serviceToken !== "string" || serviceToken.length < 32) {
        throw createError(
            "OCR service token is missing or too short",
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
            throw createError("OCR service request timed out", 504, "OCR_TIMEOUT");
        }
        throw createError(
            "Could not reach OCR service",
            502,
            "OCR_SERVICE_REQUEST_FAILED"
        );
    }

    if (response.status === 401 || response.status === 403) {
        throw createError(
            "OCR service authentication failed",
            503,
            "OCR_SERVICE_AUTH_FAILED"
        );
    }
    if (response.status === 429) {
        throw createError("OCR service is busy", 503, "OCR_SERVICE_BUSY");
    }
    if (response.status === 422) {
        throw createError(
            "No readable text was found in the receipt image",
            422,
            "OCR_NO_TEXT"
        );
    }
    if (!response.ok) {
        throw createError(
            "OCR service failed to process the receipt",
            502,
            "OCR_SERVICE_FAILED"
        );
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw createError(
            "OCR service returned an invalid response",
            502,
            "OCR_SERVICE_INVALID_RESPONSE"
        );
    }

    if (typeof result?.text !== "string" || !result.text.trim()) {
        throw createError(
            "No readable text was found in the receipt image",
            422,
            "OCR_NO_TEXT"
        );
    }

    return { text: result.text };
};

module.exports = { recognizeReceipt };
