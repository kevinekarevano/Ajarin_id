# 🎓 Ajarin.id

Platform pembelajaran online untuk kursus programming dan teknologi.

## � Live Demo

- **Frontend**: [https://ajarin-id.vercel.app](https://ajarin-id.vercel.app)
- **Backend API**: [https://ajarin-id-backend.up.railway.app](https://ajarin-id-backend.up.railway.app)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local atau MongoDB Atlas)

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
   cp .env.example .env
   # Edit .env dengan konfigurasi database dan API keys
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open Browser**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

### Environment Variables

**Backend (.env)**

```env
MONGODB_URI=mongodb://localhost:27017/ajarin_id
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:5000/api
```

## 💻 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, MongoDB, JWT
- **Deployment**: Vercel (Frontend), Railway (Backend)
- **Storage**: Cloudinary (File Upload)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

```
Mentor Account:
Email: mentor@ajarin.id
Password: mentor123

Student Account:
Email: student@ajarin.id
Password: student123
```

### 📸 Screenshots

<!-- Add screenshots here -->

![Dashboard](screenshots/dashboard.png)
![Course Detail](screenshots/course-detail.png)
![Certificate](screenshots/certificate.png)

---

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
- **npm** atau **yarn**
- **Git**
- **MongoDB** (local) atau akun **MongoDB Atlas**
- **Cloudinary** account untuk image storage

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/kevinekarevano/Ajarin_id.git
cd Ajarin_id
```

### 2. Setup Backend

#### Navigate to server directory

```bash
cd server
```

#### Install dependencies

```bash
npm install
```

#### Setup environment variables

```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Anda:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ajarin_db

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# Client Configuration
CLIENT_URL=http://localhost:5173
```

#### Start server

```bash
npm run dev
```

Server akan running di `http://localhost:3000`

### 3. Setup Frontend

#### Navigate to client directory (new terminal)

```bash
cd client
```

#### Install dependencies

```bash
npm install
```

#### Setup environment variables (optional)

```bash
cp .env.example .env
```

Edit file `.env` jika diperlukan:

```env
# API Base URL (default: http://localhost:3000/api)
VITE_API_BASE_URL=http://localhost:3000/api

# Client Base URL (default: auto-detected)
VITE_BASE_URL=http://localhost:5173
```

#### Start frontend

```bash
npm run dev
```

Frontend akan running di `http://localhost:5173`

### 4. Setup Database (Optional)

Jika menggunakan MongoDB local:

```bash
# Install MongoDB di sistem Anda
# Jalankan MongoDB service
mongod

# Import sample data (optional)
mongosh ajarin_db < server/seeders/sample-data.js
```

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

#### 1. Setup Vercel

```bash
npm install -g vercel
cd client
vercel login
```

#### 2. Configure build settings

Buat file `vercel.json` di folder `client`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 3. Set environment variables di Vercel

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_BASE_URL=https://your-frontend-domain.com
```

#### 4. Deploy

```bash
vercel --prod
```

### Backend Deployment (Railway/Heroku)

#### Option A: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login dan deploy
railway login
cd server
railway init
railway add
railway up
```

#### Option B: Heroku

```bash
# Install Heroku CLI
# Login dan deploy
heroku login
cd server
heroku create your-app-name
git push heroku main
```

#### Set environment variables

```bash
# Railway
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set JWT_SECRET=your_jwt_secret
railway variables set CLIENT_URL=https://your-frontend-domain.com

# Heroku
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLIENT_URL=https://your-frontend-domain.com
```

### Database Deployment (MongoDB Atlas)

#### 1. Setup MongoDB Atlas

- Buat akun di [MongoDB Atlas](https://www.mongodb.com/atlas)
- Buat cluster baru
- Setup network access (whitelist IP)
- Buat database user

#### 2. Get connection string

```
mongodb+srv://username:password@cluster.mongodb.net/ajarin_db?retryWrites=true&w=majority
```

#### 3. Update environment variables

Update `MONGODB_URI` di semua deployment environments.

---

## 🔧 Development

### Available Scripts

#### Frontend (client)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend (server)

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run seed         # Seed database with sample data
npm test             # Run tests
```

### Project Structure

```
Ajarin_id/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Utility functions
│   │   └── lib/           # Configuration files
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-api-domain.com/api
```

### Authentication

```bash
# Register
POST /auth/register

# Login
POST /auth/login

# Logout
POST /auth/logout
```

### Courses

```bash
# Get all courses
GET /courses

# Get course by ID
GET /courses/:id

# Create course (mentor only)
POST /courses

# Update course (mentor only)
PUT /courses/:id

# Delete course (mentor only)
DELETE /courses/:id
```

Untuk dokumentasi API lengkap, lihat [API Documentation](docs/api.md)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Error

```
Error: Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: Pastikan CORS sudah dikonfigurasi dengan benar di server dan `CLIENT_URL` sudah diset.

#### 2. Database Connection Error

```
Error: MongooseError: Operation failed after 30000ms
```

**Solution**:

- Cek koneksi internet
- Verifikasi MONGODB_URI
- Pastikan IP address sudah di-whitelist di MongoDB Atlas

#### 3. File Upload Error

```
Error: Cloudinary upload failed
```

**Solution**: Verifikasi konfigurasi Cloudinary (cloud_name, api_key, api_secret)

#### 4. JWT Token Error

```
Error: JsonWebTokenError: invalid signature
```

**Solution**: Pastikan JWT_SECRET sama antara development dan production

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Kevin Ekarevano** - _Full Stack Developer_ - [@kevinekarevano](https://github.com/kevinekarevano)

---

## 🙏 Acknowledgments

- Terima kasih kepada semua contributor
- Icons dari [Lucide](https://lucide.dev/)
- UI inspirasi dari berbagai platform pembelajaran online
- MongoDB Atlas untuk database hosting
- Vercel untuk frontend hosting
- Cloudinary untuk image storage

---

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

- 📧 Email: support@ajarin.id
- 💬 Discord: [Ajarin.id Community](https://discord.gg/ajarin)
- 🐛 Issues: [GitHub Issues](https://github.com/kevinekarevano/Ajarin_id/issues)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/kevinekarevano">Kevin Ekarevano</a></p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
