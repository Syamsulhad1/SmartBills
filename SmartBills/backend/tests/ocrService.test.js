const test = require("node:test");
const assert = require("node:assert/strict");
const { recognizeReceipt } = require("../src/services/ocrService");

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
const token = "test-ocr-service-token-with-at-least-32-characters";

test("sends a validated receipt to the configured OCR service", async () => {
    let request;
    const result = await recognizeReceipt(jpeg, "image/jpeg", {
        serviceUrl: "http://localhost:8080",
        serviceToken: token,
        fetchImpl: async (url, options) => {
            request = { url, options };
            return {
                ok: true,
                status: 200,
                json: async () => ({ text: "TOKO UJI\nTOTAL 25000" })
            };
        }
    });

    assert.equal(request.url, "http://localhost:8080/ocr");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.deepEqual(JSON.parse(request.options.body), {
        imageBase64: jpeg.toString("base64"),
        mimeType: "image/jpeg"
    });
    assert.equal(result.text, "TOKO UJI\nTOTAL 25000");
});

test("rejects invalid images and unsafe or missing service configuration", async () => {
    const shouldNotFetch = async () => {
        throw new Error("OCR service must not be called");
    };

    await assert.rejects(
        recognizeReceipt(Buffer.from("not an image"), "image/jpeg", {
            serviceUrl: "http://localhost:8080",
            serviceToken: token,
            fetchImpl: shouldNotFetch
        }),
        { statusCode: 400 }
    );
    await assert.rejects(
        recognizeReceipt(jpeg, "image/jpeg", {
            serviceUrl: "http://public.example",
            serviceToken: token,
            fetchImpl: shouldNotFetch
        }),
        { statusCode: 503, code: "OCR_NOT_CONFIGURED" }
    );
    await assert.rejects(
        recognizeReceipt(jpeg, "image/jpeg", {
            serviceUrl: "http://localhost:8080",
            serviceToken: "short",
            fetchImpl: shouldNotFetch
        }),
        { statusCode: 503, code: "OCR_NOT_CONFIGURED" }
    );
});

test("maps unreadable image and OCR service failures safely", async () => {
    await assert.rejects(
        recognizeReceipt(jpeg, "image/jpeg", {
            serviceUrl: "http://localhost:8080",
            serviceToken: token,
            fetchImpl: async () => ({
                ok: false,
                status: 422,
                json: async () => ({ error: "private OCR detail" })
            })
        }),
        { statusCode: 422, code: "OCR_NO_TEXT" }
    );

    await assert.rejects(
        recognizeReceipt(jpeg, "image/jpeg", {
            serviceUrl: "http://localhost:8080",
            serviceToken: token,
            fetchImpl: async () => ({
                ok: false,
                status: 503,
                json: async () => ({ error: "private OCR detail" })
            })
        }),
        { statusCode: 502, code: "OCR_SERVICE_FAILED" }
    );
});
