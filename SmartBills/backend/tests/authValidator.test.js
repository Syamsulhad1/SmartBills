const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateRegisterInput,
    validateLoginInput
} = require("../src/validators/authValidator");

const registrationInput = (password) => ({
    name: "Penguji SmartBills",
    email: "penguji@example.com",
    password
});

const PASSWORD_REQUIREMENT_MESSAGE =
    "Password minimal 8 karakter serta harus mengandung huruf dan angka";


test("registrasi menerima kata sandi minimal 8 karakter dengan huruf dan angka", () => {
    const validPasswords = [
        "rahasia1",
        "SmartBills123",
        "A1bcdefg",
        "kata sandi 1"
    ];

    for (const password of validPasswords) {
        assert.deepEqual(
            validateRegisterInput(registrationInput(password)),
            [],
            `Kata sandi ${password} seharusnya valid`
        );
    }
});


test("registrasi menolak kata sandi tanpa huruf atau tanpa angka", () => {
    const invalidPasswords = [
        "12345678",
        "abcdefgh",
        "Abcdefg",
        "A1b2c3",
        "       1"
    ];

    for (const password of invalidPasswords) {
        assert.deepEqual(
            validateRegisterInput(registrationInput(password)),
            [PASSWORD_REQUIREMENT_MESSAGE],
            `Kata sandi ${password} seharusnya ditolak`
        );
    }
});


test("registrasi menolak kata sandi yang tidak diisi", () => {
    for (const password of [undefined, null, "", 12345678]) {
        const errors = validateRegisterInput(registrationInput(password));

        assert.ok(errors.includes("Password wajib diisi"));
    }
});


test("login tidak menerapkan aturan kekuatan kata sandi baru", () => {
    assert.deepEqual(
        validateLoginInput({
            email: "penguji@example.com",
            password: "12345678"
        }),
        []
    );
});
