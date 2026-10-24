const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({
    path: path.resolve(__dirname, "..", ".env")
});

process.env.PORT = process.env.OCR_LOCAL_PORT || "8080";

require("./server");
