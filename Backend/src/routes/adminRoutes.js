import express from "express";

import {
    getAllUserTasks,
    overdueTasks,
    statistics,
    getCategories,
    addCategory,
    removeCategory,
    editCategory,
} from "../controllers/adminController.js";

import {
    authenticate,
    isAdmin,
} from "../middleware/authMiddleware.js";

const router =
    express.Router();

// ALL TASKS
router.get(
    "/tasks",
    authenticate,
    isAdmin,
    getAllUserTasks
);

// OVERDUE
router.get(
    "/overdue",
    authenticate,
    isAdmin,
    overdueTasks
);

// STATISTICS
router.get(
    "/statistics",
    authenticate,
    isAdmin,
    statistics
);

// CATEGORIES
router.get("/categories", authenticate, isAdmin, getCategories);
router.post("/categories", authenticate, isAdmin, addCategory);
router.put("/categories/:id", authenticate, isAdmin, editCategory);
router.delete("/categories/:id", authenticate, isAdmin, removeCategory);

export default router;