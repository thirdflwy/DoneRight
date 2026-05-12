import {
    getAllTasks,
    getOverdueTasks,
    getStatistics,
    getGlobalCategories,
    createGlobalCategory,
    deleteGlobalCategory,
    updateGlobalCategory,
} from "../models/adminModel.js";

export const getAllUserTasks =
    async (req, res) => {
        try {
            const tasks =
                await getAllTasks();

            res.status(200).json(tasks);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    };

export const overdueTasks =
    async (req, res) => {
        try {
            const tasks =
                await getOverdueTasks();

            res.status(200).json(tasks);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    };

export const statistics =
    async (req, res) => {
        try {
            const stats =
                await getStatistics();

            res.status(200).json(stats);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    };

export const getCategories = async (req, res) => {
    try {
        const categories = await getGlobalCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addCategory = async (req, res) => {
    try {
        const category = await createGlobalCategory(req.body.name);
        res.status(201).json({ message: "Category created", category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeCategory = async (req, res) => {
    try {
        await deleteGlobalCategory(req.params.id);
        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const editCategory = async (req, res) => {
    try {
        const category = await updateGlobalCategory(req.params.id, req.body.name);
        if (!category) {
            return res.status(404).json({ message: "Category not found or not global" });
        }
        res.status(200).json({ message: "Category updated", category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};