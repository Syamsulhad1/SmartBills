const validateRegisterInput = ({ name, email, password }) => {
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("Name must contain at least 2 characters");
    }

    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            errors.push("Invalid email format");
        }
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    } else if (password.length < 8) {
        errors.push("Password must contain at least 8 characters");
    }

    return errors;
};

const validateLoginInput = ({ email, password }) => {
    const errors = [];

    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            errors.push("Invalid email format");
        }
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    }

    return errors;
};

module.exports = {
    validateRegisterInput,
    validateLoginInput
};
