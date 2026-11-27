const PASSWORD_REQUIREMENT_MESSAGE =
    "Password minimal 8 karakter serta harus mengandung huruf dan angka";

const isStrongPassword = (password) =>
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

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
    } else if (!isStrongPassword(password)) {
        errors.push(PASSWORD_REQUIREMENT_MESSAGE);
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
    validateLoginInput,
    isStrongPassword
};
