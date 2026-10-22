const write = (level, message, context = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...context
    };
    const serialized = JSON.stringify(entry);

    if (level === "error") {
        console.error(serialized);
    } else if (level === "warn") {
        console.warn(serialized);
    } else {
        console.log(serialized);
    }
};

module.exports = {
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context)
};
