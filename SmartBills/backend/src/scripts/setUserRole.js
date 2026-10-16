const pool = require("../config/database");
const { updateUserRoleByEmail } = require("../models/userModel");

const allowedRoles = new Set(["user", "admin"]);
const [email, role] = process.argv.slice(2);

const setUserRole = async () => {
    try {
        if (!email || !role || !allowedRoles.has(role)) {
            throw new Error("Usage: npm run set-user-role -- <email> <user|admin>");
        }

        const user = await updateUserRoleByEmail(email.trim().toLowerCase(), role);

        if (!user) {
            throw new Error("User not found");
        }

        console.log(`Updated ${user.email} to role ${user.role}`);
    } finally {
        await pool.end();
    }
};

setUserRole().catch((error) => {
    console.error("Set user role failed:", error.message);
    process.exitCode = 1;
});
