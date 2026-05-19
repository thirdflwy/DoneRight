import express from "express";

import {
    getCategories,
    addCategory,
    removeCategory,
    editCategory,
} from "../controllers/categoryController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

const router =
    express.Router();

// GET CATEGORY
router.get(
    "/",
    authenticate,
    getCategories
);

// CREATE CATEGORY
router.post(
    "/",
    authenticate,
    addCategory
);

// DELETE CATEGORY
router.delete(
    "/:id",
    authenticate,
    removeCategory
);

// UPDATE CATEGORY
router.put(
    "/:id",
    authenticate,
    editCategory
);

export default router;