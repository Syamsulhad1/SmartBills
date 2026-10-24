const http = require("node:http");
const { timingSafeEqual } = require("node:crypto");
const os = require("node:os");
const path = require("node:path");

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = 6 * 1024 * 1024;
const MAX_QUEUED_RECOGNITIONS = 3;
const supportedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const hasValidSignature = (buffer, mimeType) => {
    if (mimeType === "image/jpeg") {
        return buffer.length >= 3
            && buffer[0] === 0xff
            && buffer[1] === 0xd8
            && buffer[2] === 0xff;
    }
    if (mimeType === "image/png") {
        return buffer.length >= 8
            && buffer.subarray(0, 8).equals(Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
            ]));
    }
    return mimeType === "image/webp"
        && buffer.length >= 12
        && buffer.toString("ascii", 0, 4) === "RIFF"
        && buffer.toString("ascii", 8, 12) === "WEBP";
};

const sendJson = (response, statusCode, data) => {
    if (response.headersSent) return;
    const body = JSON.stringify(data);
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body),
        "Cache-Control": "no-store"
    });
    response.end(body);
};

const readJsonBody = async (request) => {
    const chunks = [];
    let totalBytes = 0;
    for await (const chunk of request) {
        totalBytes += chunk.length;
        if (totalBytes > MAX_REQUEST_BYTES) {
            request.resume();
            return null;
        }
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return undefined;
    }
};

const isAuthorized = (authorization, expectedToken) => {
    if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
        return false;
    }
    const supplied = Buffer.from(authorization.slice(7));
    const expected = Buffer.from(expectedToken);
    return supplied.length === expected.length
        && timingSafeEqual(supplied, expected);
};

const scoreRecognition = ({ text = "", confidence = 0 } = {}) => {
    const normalizedText = text.toLocaleLowerCase("id-ID");
    const alphanumericCount = (text.match(/[\p{L}\p{N}]/gu) || []).length;
    const numberGroups = (text.match(/\d[\d.,]*/g) || []).length;
    const receiptTerms = [
        "total",
        "bayar",
        "jumlah",
        "tanggal",
        "date",
        "invoice",
        "receipt",
        "struk",
        "rp",
        "idr"
    ];
    const matchedTerms = receiptTerms.filter((term) =>
        new RegExp(`\\b${term}\\b`, "u").test(normalizedText)
    ).length;

    return Math.max(0, Number(confidence) || 0) * 0.35
        + Math.min(alphanumericCount, 100) * 0.25
        + Math.min(numberGroups, 6) * 8
        + matchedTerms * 12;
};

const createOcrServer = ({
    token = process.env.OCR_SERVICE_TOKEN,
    createWorker,
    logger = console
} = {}) => {
    if (typeof token !== "string" || token.length < 32) {
        throw new Error("OCR_SERVICE_TOKEN must contain at least 32 characters");
    }

    const workerFactory = createWorker || require("tesseract.js").createWorker;
    let workerPromise;
    let recognitionQueue = Promise.resolve();
    let queuedRecognitions = 0;

    const getWorker = async () => {
        if (!workerPromise) {
            workerPromise = workerFactory(
                ["eng", "ind"],
                1,
                {
                    cachePath: process.env.TESSERACT_CACHE_PATH
                        || path.join(os.tmpdir(), "tesseract.js-cache"),
                    cacheMethod: "write"
                }
            );
        }
        try {
            return await workerPromise;
        } catch (error) {
            workerPromise = undefined;
            throw error;
        }
    };

    const server = http.createServer((request, response) => {
        const handle = async () => {
            if (request.method === "GET" && request.url === "/health") {
                return sendJson(response, 200, { status: "ok" });
            }
            if (request.method !== "POST" || request.url !== "/ocr") {
                return sendJson(response, 404, { error: "Not found" });
            }
            if (!isAuthorized(request.headers.authorization, token)) {
                return sendJson(response, 401, { error: "Unauthorized" });
            }
            if (!request.headers["content-type"]?.startsWith("application/json")) {
                return sendJson(response, 415, { error: "Expected JSON request" });
            }

            const payload = await readJsonBody(request);
            if (payload === null) {
                return sendJson(response, 413, { error: "Request is too large" });
            }
            if (!payload || typeof payload !== "object") {
                return sendJson(response, 400, { error: "Invalid JSON request" });
            }

            const { imageBase64, mimeType } = payload;
            const maxBase64Length = Math.ceil(MAX_IMAGE_BYTES / 3) * 4;
            if (
                typeof imageBase64 !== "string"
                || imageBase64.length === 0
                || imageBase64.length > maxBase64Length
                || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(imageBase64)
                || !supportedMimeTypes.has(mimeType)
            ) {
                return sendJson(response, 400, { error: "Invalid OCR image request" });
            }

            const imageBuffer = Buffer.from(imageBase64, "base64");
            if (
                imageBuffer.length === 0
                || imageBuffer.length > MAX_IMAGE_BYTES
                || imageBuffer.toString("base64") !== imageBase64
                || !hasValidSignature(imageBuffer, mimeType)
            ) {
                return sendJson(response, 400, { error: "Invalid OCR image data" });
            }
            if (queuedRecognitions >= MAX_QUEUED_RECOGNITIONS) {
                return sendJson(response, 429, { error: "OCR service is busy" });
            }

            queuedRecognitions += 1;
            const recognition = recognitionQueue.then(async () => {
                const worker = await getWorker();
                const results = [];
                for (const pageSegmentationMode of ["6", "11"]) {
                    await worker.setParameters({
                        tessedit_pageseg_mode: pageSegmentationMode
                    });
                    results.push(await worker.recognize(imageBuffer));
                }
                return results.reduce((best, current) =>
                    scoreRecognition(current.data) > scoreRecognition(best.data)
                        ? current
                        : best
                );
            });
            recognitionQueue = recognition.then(() => undefined, () => undefined);

            let recognitionResult;
            try {
                recognitionResult = await recognition;
            } finally {
                queuedRecognitions -= 1;
            }
            const text = typeof recognitionResult.data?.text === "string"
                ? recognitionResult.data.text
                : "";
            if (!text.trim()) {
                return sendJson(response, 422, { error: "No readable text found" });
            }
            return sendJson(response, 200, { text });
        };

        handle().catch((error) => {
            logger.error("OCR request failed", error);
            sendJson(response, 502, { error: "OCR processing failed" });
        });
    });

    return {
        server,
        close: async () => {
            await new Promise((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
            if (workerPromise) {
                const worker = await workerPromise;
                await worker.terminate();
            }
        }
    };
};

module.exports = { createOcrServer };
