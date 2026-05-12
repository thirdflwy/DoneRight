import {
    getUserById,
    updateUser,
    deleteUser
} from "../models/userModel.js";

import bcrypt from "bcryptjs";

// GET PROFILE
export const getProfile = async (req, res) => {
    try {
        const user = await getUserById(req.user.id);

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let password_hash = null;

        if (password) {
            password_hash = await bcrypt.hash(password, 10);
        }

        const user = await updateUser(req.user.id, {
            username: username || null,
            email: email || null,
            password_hash
        });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

// DELETE ACCOUNT
export const deleteProfile = async (req, res) => {
    try {
        await deleteUser(req.user.id);

        res.json({ message: "Account deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};