import pool from "../config/db.js";

// GET ALL TASK USER
export const getTasksByUser =
    async (userId) => {
        const query = `
      SELECT
        t.*,
        c.name AS category_name
      FROM tasks t
      LEFT JOIN categories c
        ON t.category_id =
          c.id_categories
      WHERE t.user_id = $1
        AND t.deleted_at IS NULL
      ORDER BY
        t.created_at DESC
    `;

        const result =
            await pool.query(query, [
                userId,
            ]);

        return result.rows;
    };

// CREATE TASK
export const createTask =
    async (data) => {
        const query = `
      INSERT INTO tasks (
        user_id,
        category_id,
        title,
        description,
        priority,
        deadline
      )
      VALUES (
        $1,$2,$3,$4,$5,$6
      )
      RETURNING *
    `;

        const values = [
            data.user_id,
            data.category_id || null,
            data.title,
            data.description || null,
            data.priority || "medium",
            data.deadline || null,
        ];

        const result =
            await pool.query(
                query,
                values
            );

        return result.rows[0];
    };

// UPDATE TASK
export const updateTask =
    async (
        taskId,
        data,
        userId
    ) => {
        const query = `
      UPDATE tasks
      SET
        category_id = $1,
        title = $2,
        description = $3,
        priority = $4,
        deadline = $5
      WHERE
        id_tasks = $6
        AND user_id = $7
      RETURNING *
    `;

        const values = [
            data.category_id || null,
            data.title,
            data.description || null,
            data.priority || "medium",
            data.deadline || null,
            taskId,
            userId,
        ];

        const result =
            await pool.query(
                query,
                values
            );

        return result.rows[0];
    };

// SOFT DELETE TASK
export const softDeleteTask =
    async (
        taskId,
        userId
    ) => {
        const query = `
      UPDATE tasks
      SET deleted_at = NOW()
      WHERE
        id_tasks = $1
        AND user_id = $2
    `;

        await pool.query(query, [
            taskId,
            userId,
        ]);
    };

// TOGGLE CHECKLIST
export const toggleTaskStatus =
    async (
        taskId,
        userId
    ) => {
        const query = `
      UPDATE tasks
      SET is_completed =
        NOT is_completed
      WHERE
        id_tasks = $1
        AND user_id = $2
      RETURNING *
    `;

        const result =
            await pool.query(
                query,
                [taskId, userId]
            );

        return result.rows[0];
    };

// GET DELETED TASKS (TRASH)
export const getDeletedTasks =
    async (userId) => {
        const query = `
      SELECT
        t.*,
        c.name AS category_name
      FROM tasks t
      LEFT JOIN categories c
        ON t.category_id =
          c.id_categories
      WHERE
        t.user_id = $1
        AND t.deleted_at
          IS NOT NULL
      ORDER BY
        t.deleted_at DESC
    `;

        const result =
            await pool.query(
                query,
                [userId]
            );

        return result.rows;
    };

// RESTORE TASK
export const restoreTask =
    async (
        taskId,
        userId
    ) => {
        const query = `
      UPDATE tasks
      SET deleted_at = NULL
      WHERE
        id_tasks = $1
        AND user_id = $2
      RETURNING *
    `;

        const result =
            await pool.query(
                query,
                [taskId, userId]
            );

        return result.rows[0];
    };

// PERMANENT DELETE TASK
export const permanentDeleteTask =
    async (
        taskId,
        userId
    ) => {
        const query = `
      DELETE FROM tasks
      WHERE
        id_tasks = $1
        AND user_id = $2
      RETURNING *
    `;

        const result =
            await pool.query(
                query,
                [taskId, userId]
            );

        return result.rows[0];
    };