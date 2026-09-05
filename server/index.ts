import express from 'express';
import cors from 'cors';
import { userService, formService, chatService } from '../src/lib/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, dan password wajib diisi'
      });
    }

    const result = await userService.createUser(username, email, password);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const user = userService.getUserById(Number(result.userId));
    const tokenResult = await userService.authenticateUser(email, password);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token: tokenResult.token
      },
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal melakukan registrasi'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password wajib diisi'
      });
    }

    const result = await userService.authenticateUser(email, password);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({
      success: true,
      data: result,
      message: 'Login berhasil'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal melakukan login'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token tidak ditemukan'
      });
    }

    const result = userService.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    const user = userService.getUserById(result.userId);
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memverifikasi token'
    });
  }
});

// Form endpoints
app.post('/api/forms', (req, res) => {
  try {
    const { userId, formType, inputData, outputData } = req.body;
    
    if (!userId || !formType || !inputData) {
      return res.status(400).json({
        success: false,
        error: 'Data form tidak lengkap'
      });
    }

    const result = formService.saveFormSubmission(
      userId,
      formType,
      JSON.stringify(inputData),
      JSON.stringify(outputData || {})
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: { id: result.id },
      message: 'Form berhasil disimpan'
    });
  } catch (error) {
    console.error('Form save error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menyimpan form'
    });
  }
});

app.get('/api/forms/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = formService.getUserFormHistory(Number(userId), limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Form history error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil history form'
    });
  }
});

// Chat endpoints
app.post('/api/chat', (req, res) => {
  try {
    const { userId, sessionId, messageType, content, metadata } = req.body;
    
    if (!userId || !sessionId || !messageType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Data chat tidak lengkap'
      });
    }

    const result = chatService.saveChatMessage(
      userId,
      sessionId,
      messageType,
      content,
      metadata
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: { id: result.id },
      message: 'Pesan berhasil disimpan'
    });
  } catch (error) {
    console.error('Chat save error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menyimpan pesan'
    });
  }
});

app.get('/api/chat/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, limit } = req.query;
    
    const history = chatService.getChatHistory(
      Number(userId),
      sessionId as string,
      limit ? Number(limit) : 100
    );
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil history chat'
    });
  }
});

app.get('/api/chat/sessions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = chatService.getUserSessions(Number(userId));
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Chat sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil sessions'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📊 Database SQLite: app.db`);
});

