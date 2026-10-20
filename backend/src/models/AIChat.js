import pool from '../database/config.js';

export class AIChat {
  static async createSession(userId, farmId, title = 'New Chat') {
    const result = await pool.query(
      `INSERT INTO ai_chat_sessions (user_id, farm_id, title) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, farmId, title]
    );
    return result.rows[0];
  }

  static async getSessions(userId, farmId) {
    const result = await pool.query(
      `SELECT * FROM ai_chat_sessions 
       WHERE user_id = $1 AND farm_id = $2 
       ORDER BY updated_at DESC`,
      [userId, farmId]
    );
    return result.rows;
  }

  static async addMessage(sessionId, role, content) {
    const result = await pool.query(
      `INSERT INTO ai_chat_messages (session_id, role, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [sessionId, role, content]
    );
    return result.rows[0];
  }

  static async getMessages(sessionId) {
    const result = await pool.query(
      `SELECT * FROM ai_chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  }

  static async deleteSession(sessionId, userId) {
    const result = await pool.query(
      'DELETE FROM ai_chat_sessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [sessionId, userId]
    );
    return result.rows[0];
  }
}