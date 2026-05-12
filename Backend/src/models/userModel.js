import pool from "../config/db.js";

// CREATE USER
export const createUser = async (
    username,
    email,
    passwordHash
) => {
    const query = `
    INSERT INTO users (
      username,
      email,
      password_hash
    )
    VALUES ($1, $2, $3)
    RETURNING
      id_users,
      username,
      email,
      role,
      created_at
  `;

    const values = [
        username,
        email,
        passwordHash,
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};

// FIND USER BY EMAIL
export const findUserByEmail =
    async (email) => {
        const query = `
      SELECT *
      FROM users
      WHERE email = $1
      AND deleted_at IS NULL
    `;

        const result =
            await pool.query(query, [
                email,
            ]);

        return result.rows[0];
    };

// GET USER BY ID
export const getUserById = async (id) => {
    const query = `
        SELECT id_users, username, email, role, created_at
        FROM users
        WHERE id_users = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// UPDATE USER
export const updateUser = async (id, data) => {
    const query = `
        UPDATE users
        SET
            username = COALESCE($1, username),
            email = COALESCE($2, email),
            password_hash = COALESCE($3, password_hash)
        WHERE id_users = $4
        RETURNING id_users, username, email
    `;

    const result = await pool.query(query, [
        data.username,
        data.email,
        data.password_hash,
        id
    ]);

    return result.rows[0];
};

// DELETE USER
export const deleteUser = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id_users = $1
    `;

    await pool.query(query, [id]);
};