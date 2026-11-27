const validateRegisterInput = ({ name, email, password }) => {
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("Nama minimal 2 karakter");
    }

    if (!email || typeof email !== "string") {
        errors.push("Email wajib diisi");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            errors.push("Format email tidak valid");
        }
    }

    if (!password || typeof password !== "string") {
        errors.push("Password wajib diisi");
    } else if (password.length < 8) {
        errors.push("Password minimal 8 karakter");
    }

    return errors;
};

const validateLoginInput = ({ email, password }) => {
    const errors = [];

    if (!email || typeof email !== "string") {
        errors.push("Email wajib diisi");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            errors.push("Format email tidak valid");
        }
    }

    if (!password || typeof password !== "string") {
        errors.push("Password wajib diisi");
    }

    return errors;
};

module.exports = {
    validateRegisterInput,
    validateLoginInput
};
