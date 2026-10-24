const { createOcrServer } = require("./index");

const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port");
}

const ocrService = createOcrServer();
ocrService.server.listen(port, "0.0.0.0", () => {
    console.log(`OCR service listening on port ${port}`);
});

let shuttingDown = false;
const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    ocrService.close().catch((error) => {
        console.error("Failed to stop OCR service cleanly", error);
        process.exitCode = 1;
    });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
