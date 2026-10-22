const formatMoney = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value);

    // NUMERIC dari pg biasanya string; format tanpa konversi floating point.
    const match = /^(\d+)(?:\.(\d+))?$/.exec(text);

    if (!match) {
        throw new Error("Invalid numeric balance returned by database");
    }

    const integer = match[1].replace(/^0+(?=\d)/, "");
    const decimals = match[2] || "";

    if (decimals.length > 2 && /[^0]/.test(decimals.slice(2))) {
        throw new Error("Balance contains more than 2 decimal places");
    }

    return `${integer}.${decimals.slice(0, 2).padEnd(2, "0")}`;
};

const toUserResponse = (user) => ({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    current_balance: formatMoney(user.current_balance),
    initial_balance: formatMoney(user.initial_balance),
    initial_balance_set_at: user.initial_balance_set_at,
    has_initial_balance: user.initial_balance_set_at !== null
        && user.initial_balance_set_at !== undefined,
    created_at: user.created_at
});

module.exports = {
    formatMoney,
    toUserResponse
};