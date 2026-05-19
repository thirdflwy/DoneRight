import {
    getCategoriesByUser,
    createCategory,
    deleteCategory,
    updateCategory,
} from "../models/categoryModel.js";

export const getCategories = async (
    req,
    res
) => {
    try {
        const categories =
            await getCategoriesByUser(
                req.user.id
            );

        res.status(200).json(
            categories
        );
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Internal server error",
        });
    }
};

export const addCategory = async (
    req,
    res
) => {
    try {
        const category =
            await createCategory(
                req.user.id,
                req.body.name
            );

        res.status(201).json({
            message:
                "Category created",
            category,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Internal server error",
        });
    }
};

export const removeCategory = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { mode } = req.body;

        await deleteCategory(
            id,
            req.user.id,
            mode
        );

        res.status(200).json({
            message:
                "Category deleted",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Internal server error",
        });
    }
};

export const editCategory = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message:
                    "Category name is required",
            });
        }

        const category =
            await updateCategory(
                id,
                req.user.id,
                name.trim()
            );

        if (!category) {
            return res.status(404).json({
                message:
                    "Category not found or unauthorized",
            });
        }

        res.status(200).json({
            message:
                "Category updated",
            category,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Internal server error",
        });
    }
};