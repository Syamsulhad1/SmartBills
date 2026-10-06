const app = require("./app");
const { PORT } = require("./config/environment");

app.listen(PORT, () => {
    console.log(`SmartBills API running on port ${PORT}`);
});