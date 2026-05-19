import pool from "../config/db.js";

// GET CATEGORY USER
export const getCategoriesByUser =
    async (userId) => {
        const query = `
      SELECT *
      FROM categories
      WHERE
        is_global = true
        OR user_id = $1
      ORDER BY name ASC
    `;

        const result =
            await pool.query(
                query,
                [userId]
            );

        return result.rows;
    };

// CREATE CATEGORY
export const createCategory =
    async (
        userId,
        name
    ) => {
        const query = `
      INSERT INTO categories (
        user_id,
        name
      )
      VALUES ($1, $2)
      RETURNING *
    `;

        const result =
            await pool.query(query, [
                userId,
                name,
            ]);

        return result.rows[0];
    };

// DELETE CATEGORY
export const deleteCategory =
    async (
        categoryId,
        userId,
        mode
    ) => {
        const client =
            await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            // hapus semua task
            if (
                mode ===
                "delete_tasks"
            ) {
                await client.query(
                    `
          UPDATE tasks
          SET deleted_at = NOW()
          WHERE category_id = $1
          AND user_id = $2
          `,
                    [
                        categoryId,
                        userId,
                    ]
                );
            }

            // pertahankan task
            else {
                await client.query(
                    `
          UPDATE tasks
          SET category_id = NULL
          WHERE category_id = $1
          AND user_id = $2
          `,
                    [
                        categoryId,
                        userId,
                    ]
                );
            }

            await client.query(
                `
        DELETE FROM categories
        WHERE id_categories = $1
        AND user_id = $2
        `,
                [categoryId, userId]
            );

            await client.query(
                "COMMIT"
            );
        } catch (error) {
            await client.query(
                "ROLLBACK"
            );

            throw error;
        } finally {
            client.release();
        }
    };

// UPDATE CATEGORY
export const updateCategory =
    async (
        categoryId,
        userId,
        name
    ) => {
        const query = `
      UPDATE categories
      SET name = $1
      WHERE
        id_categories = $2
        AND user_id = $3
      RETURNING *
    `;

        const result =
            await pool.query(query, [
                name,
                categoryId,
                userId,
            ]);

        return result.rows[0];
    };