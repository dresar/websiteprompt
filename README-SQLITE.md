# Setup SQLite Database dan Demo Login

Proyek ini sekarang menggunakan **SQLite** dengan `better-sqlite3` sebagai database backend.

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup User Demo
Jalankan script untuk membuat user demo:
```bash
npm run setup:demo
```

Ini akan membuat user dengan kredensial:
- **Email**: `demo@example.com`
- **Password**: `demo123`

### 3. Menjalankan Server

#### Opsi 1: Menjalankan Backend dan Frontend Bersamaan
```bash
npm run dev:all
```

#### Opsi 2: Menjalankan Terpisah

Terminal 1 - Backend Server:
```bash
npm run server
```
Server akan berjalan di `http://localhost:3001`

Terminal 2 - Frontend:
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:8080` (atau 8081 jika 8080 sudah digunakan)

## 📋 Endpoint API

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verifikasi token

### Forms
- `POST /api/forms` - Simpan form submission
- `GET /api/forms/:userId` - Ambil history form user

### Chat
- `POST /api/chat` - Simpan pesan chat
- `GET /api/chat/:userId` - Ambil history chat
- `GET /api/chat/sessions/:userId` - Ambil daftar sessions

## 🗄️ Database

Database SQLite akan dibuat otomatis di file `app.db` di root project saat server pertama kali dijalankan.

### Struktur Database

**users**
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**form_submissions**
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- form_type (TEXT)
- input_data (TEXT)
- output_data (TEXT)
- created_at (DATETIME)

**chat_history**
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- session_id (TEXT)
- message_type (TEXT)
- content (TEXT)
- metadata (TEXT)
- created_at (DATETIME)

## 🧪 Testing Login

Setelah menjalankan `npm run setup:demo`, Anda bisa login dengan:
- Email: `demo@example.com`
- Password: `demo123`

## 📝 Catatan

- Database file `app.db` akan dibuat otomatis saat pertama kali server dijalankan
- Password di-hash menggunakan bcrypt dengan salt rounds 12
- JWT token berlaku selama 7 hari
- Backend server harus berjalan sebelum frontend bisa melakukan login/register

