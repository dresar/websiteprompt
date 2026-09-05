import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key-change-in-production';

// Initialize SQLite database
const db = new Database('app.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    form_type TEXT NOT NULL,
    input_data TEXT NOT NULL,
    output_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata TEXT, -- JSON string for additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
`);

// User management functions
export const userService = {
  async createUser(username: string, email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(username, email, hashedPassword);
      return { success: true, userId: result.lastInsertRowid };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: 'Username atau email sudah digunakan' };
      }
      return { success: false, error: 'Gagal membuat akun' };
    }
  },

  async authenticateUser(email: string, password: string) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email) as any;
      
      if (!user) {
        return { success: false, error: 'Email atau password salah' };
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Email atau password salah' };
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      };
    } catch (error) {
      return { success: false, error: 'Gagal login' };
    }
  },

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return { success: true, userId: decoded.userId, email: decoded.email };
    } catch (error) {
      return { success: false, error: 'Token tidak valid' };
    }
  },

  getUserById(userId: number) {
    const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    return stmt.get(userId);
  }
};

// Form data management
export const formService = {
  saveFormSubmission(userId: number, formType: string, inputData: string, outputData: string) {
    try {
      const stmt = db.prepare(`
        INSERT INTO form_submissions (user_id, form_type, input_data, output_data)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(userId, formType, inputData, outputData);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      return { success: false, error: 'Gagal menyimpan data form' };
    }
  },

  getUserFormHistory(userId: number, limit: number = 50) {
    const stmt = db.prepare(`
      SELECT * FROM form_submissions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  },

  deleteFormSubmission(userId: number, submissionId: number) {
    const stmt = db.prepare(`
      DELETE FROM form_submissions 
      WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(submissionId, userId);
    return result.changes > 0;
  }
};

// Chat history management
export const chatService = {
  saveChatMessage(userId: number, sessionId: string, messageType: 'user' | 'assistant', content: string, metadata?: any) {
    try {
      const stmt = db.prepare(`
        INSERT INTO chat_history (user_id, session_id, message_type, content, metadata)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        userId, 
        sessionId, 
        messageType, 
        content, 
        metadata ? JSON.stringify(metadata) : null
      );
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      return { success: false, error: 'Gagal menyimpan pesan' };
    }
  },

  getChatHistory(userId: number, sessionId?: string, limit: number = 100) {
    let query = `
      SELECT * FROM chat_history 
      WHERE user_id = ?
    `;
    const params: any[] = [userId];

    if (sessionId) {
      query += ' AND session_id = ?';
      params.push(sessionId);
    }

    query += ' ORDER BY created_at ASC LIMIT ?';
    params.push(limit);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  getUserSessions(userId: number) {
    const stmt = db.prepare(`
      SELECT DISTINCT session_id, 
             MIN(created_at) as first_message,
             MAX(created_at) as last_message,
             COUNT(*) as message_count
      FROM chat_history 
      WHERE user_id = ? 
      GROUP BY session_id 
      ORDER BY last_message DESC
    `);
    return stmt.all(userId);
  },

  deleteChatSession(userId: number, sessionId: string) {
    const stmt = db.prepare(`
      DELETE FROM chat_history 
      WHERE user_id = ? AND session_id = ?
    `);
    const result = stmt.run(userId, sessionId);
    return result.changes > 0;
  }
};

export default db;