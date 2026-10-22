const app = require("./app");
const { PORT } = require("./config/environment");
const logger = require("./utils/logger");

app.listen(PORT, () => {
    logger.info("SmartBills API started", { port: PORT });
});