const {
    after,
    before,
    test
} = require("node:test");
const assert = require("node:assert/strict");
const { createOcrServer } = require("../ocr-service");

const token = "ocr-recognition-tests-token-with-at-least-32-characters";
const image = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
let server;
let baseUrl;
let modes;
let recognized;

before(async () => {
    modes = [];
    recognized = 0;
    const app = createOcrServer({
        token,
        createWorker: async () => ({
            setParameters: async ({ tessedit_pageseg_mode }) => {
                modes.push(tessedit_pageseg_mode);
            },
            recognize: async () => {
                recognized += 1;
                return recognized === 1
                    ? {
                        data: {
                            text: "unreadable noise",
                            confidence: 95
                        }
                    }
                    : {
                        data: {
                            text: "TOKO UJI\nTOTAL Rp 25.000\n24/10/2026",
                            confidence: 70
                        }
                    };
            },
            terminate: async () => {}
        })
    });
    server = app.server.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});

test("tries block and sparse-text OCR modes and returns the more useful receipt text", async () => {
    const response = await fetch(`${baseUrl}/ocr`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            imageBase64: image.toString("base64"),
            mimeType: "image/jpeg"
        })
    });
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(modes, ["6", "11"]);
    assert.equal(recognized, 2);
    assert.equal(result.text, "TOKO UJI\nTOTAL Rp 25.000\n24/10/2026");
});
