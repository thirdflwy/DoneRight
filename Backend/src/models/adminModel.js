import pool from "../config/db.js";

// GET ALL TASKS
export const getAllTasks =
    async () => {
        const query = `
      SELECT
        t.*,
        u.username,
        c.name AS category_name
      FROM tasks t
      JOIN users u
        ON t.user_id =
          u.id_users
      LEFT JOIN categories c
        ON t.category_id =
          c.id_categories
      WHERE
        t.deleted_at
          IS NULL
      ORDER BY
        t.created_at DESC
    `;

        const result =
            await pool.query(query);

        return result.rows;
    };

// OVERDUE TASKS
export const getOverdueTasks =
    async () => {
        const query = `
      SELECT *
      FROM tasks
      WHERE
        deadline < NOW()
        AND is_completed = false
        AND deleted_at IS NULL
    `;

        const result =
            await pool.query(query);

        return result.rows;
    };

// DASHBOARD STAT
export const getStatistics =
    async () => {
        const query = `
      SELECT
      (
        SELECT COUNT(*)
        FROM users
      ) AS total_users,

      (
        SELECT COUNT(*)
        FROM tasks
        WHERE deleted_at
          IS NULL
      ) AS total_tasks,

      (
        SELECT COUNT(*)
        FROM tasks
        WHERE
          is_completed = true
          AND deleted_at
            IS NULL
      ) AS completed_tasks
    `;

        const result =
            await pool.query(query);

        return result.rows[0];
    };

// GET GLOBAL CATEGORIES
export const getGlobalCategories = async () => {
    const query = `
        SELECT *
        FROM categories
        WHERE is_global = true
        ORDER BY name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// CREATE GLOBAL CATEGORY
export const createGlobalCategory = async (name) => {
    const query = `
        INSERT INTO categories (name, is_global)
        VALUES ($1, true)
        RETURNING *
    `;
    const result = await pool.query(query, [name]);
    return result.rows[0];
};

// DELETE GLOBAL CATEGORY
export const deleteGlobalCategory = async (categoryId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `
            UPDATE tasks
            SET category_id = NULL
            WHERE category_id = $1
            `,
            [categoryId]
        );

        await client.query(
            `
            DELETE FROM categories
            WHERE id_categories = $1
            AND is_global = true
            `,
            [categoryId]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// UPDATE GLOBAL CATEGORY
export const updateGlobalCategory = async (categoryId, name) => {
    const query = `
        UPDATE categories
        SET name = $1
        WHERE id_categories = $2 AND is_global = true
        RETURNING *
    `;
    const result = await pool.query(query, [name, categoryId]);
    return result.rows[0];
};