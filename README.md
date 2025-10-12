# 🎓 Ajarin.id

Platform pembelajaran online untuk kursus programming dan teknologi.

## � Live Demo

- **Frontend**: [https://ajarin-id.vercel.app](https://ajarin-id.vercel.app)
- **Backend API**: [https://ajarinid-api.vercel.app](https://ajarinid-api.vercel.app)


## 🚀 Quick Start

### Prerequisites

- Node.js 
- MongoDB (local atau MongoDB Atlas)
- n8n

### Installation

1. **Clone repository**

   ```bash
   git clone https://github.com/kevinekarevano/Ajarin_id.git
   cd Ajarin_id
   ```

2. **Setup Backend**

   ```bash
   cd server
   npm install
   touch .env
   # Edit .env dengan konfigurasi database dan API keys
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd client
   npm install
   touch .env
   # Edit .env dengan konfigurasi database dan API keys
   npm run dev
   ```

4. **Open Browser**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

### Environment Variables

**Server (.env)**

```env
For hackathon judgje, pls see the gdrive folder
MONGODB_URI=mongodb://localhost:27017/ajarin_id
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Client (.env)**

```env
(For hackathon judgje, pls see the gdrive folder)
VITE_API_URL=http://localhost:3000/api
```

## 💻 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, MongoDB, JWT
- **Deployment**: Vercel (Frontend), Railway (Backend)
- **Storage**: Cloudinary (File Upload)

## 🔒 Account

```
Akun 1:
Email: user1@gmail.com
Password: 12345678

Akun 2
Email: user2@gmail.com
Password: 12345678
```

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Framework
- **Vite** - Build tool dan development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **HTML2Canvas + jsPDF** - Certificate generation
- **QRCode.js** - QR code generation

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Cloudinary** - Image and file storage
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Database

- **MongoDB Atlas** - Cloud database hosting
- **Collections**: Users, Courses, Materials, Assignments, Enrollments, Certificates, Discussions

---

## 📋 Prerequisites

Pastikan Anda telah menginstall:

- **Node.js** (v16 atau lebih tinggi)
- **npm** 
- **Git**
- **MongoDB** (local) atau akun **MongoDB Atlas**
- **Cloudinary** account untuk image storage

---


### N8N SETUP

1. **install n8n from npm**

   ```bash
   npm install -g n8n
   ```
2. **run n8n**

   ```bash
   n8n
   ```
   N8N akan berjalan di http://localhost:5678

3. **Import Workflow from /n8n/**

   ```bash
   1. Buka dashboard N8N di browser: http://localhost:5678
   2. Klik Import Workflow → From File
   3. Pilih file: n8n/ajarin.id_Workflow_N8N
   4. Pastikan semua node termuat:
   * When chat message received
   * AI Agent
   * Google Gemini Chat Model
   * Simple Memory
   * HTTP Request
   ```
   
4. **Edit file index.html di bagian webhookUrl**

   ```bash
   webhookUrl: 'webhookanda'
   ```
   Ganti dengan URL webhook milik instance N8N kamu sendiri.

