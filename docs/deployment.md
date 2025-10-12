# Deployment Guide

## 🚀 Frontend Deployment (Vercel)

### Prerequisites

- Vercel account
- GitHub repository
- Node.js 16+

### Step 1: Prepare Frontend

```bash
cd client
npm run build  # Test build locally
```

### Step 2: Deploy via Vercel Dashboard

1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `client`
5. Configure environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   VITE_BASE_URL=https://your-frontend-url.com
   ```
6. Deploy

### Step 3: Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from client directory
cd client
vercel --prod
```

### Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

## 🔧 Backend Deployment (Railway)

### Prerequisites

- Railway account
- GitHub repository

### Step 1: Deploy via Railway Dashboard

1. Login to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Set root directory to `server`
6. Railway will auto-detect Node.js and deploy

### Step 2: Configure Environment Variables

In Railway dashboard, go to Variables tab and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ajarin_db
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend-domain.com
PORT=3000
```

### Step 3: Deploy via Railway CLI (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd server
railway init

# Deploy
railway up
```

---

## 🔧 Backend Deployment (Heroku - Alternative)

### Prerequisites

- Heroku account
- Heroku CLI installed

### Step 1: Prepare Backend

```bash
cd server

# Create Procfile
echo "web: node src/index.js" > Procfile

# Ensure package.json has start script
# "start": "node src/index.js"
```

### Step 2: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret
heroku config:set CLIENT_URL=https://your-frontend-domain.com

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 🗄️ Database Deployment (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create account and organization
3. Create new project

### Step 2: Create Cluster

1. Click "Build a Database"
2. Choose "Shared" (free tier)
3. Select cloud provider and region
4. Create cluster

### Step 3: Configure Database Access

1. Go to "Database Access"
2. Add new database user
3. Set username and password
4. Grant "Read and write to any database" role

### Step 4: Configure Network Access

1. Go to "Network Access"
2. Add IP Address
3. Choose "Allow access from anywhere" (0.0.0.0/0) for production
4. Or add specific IP addresses

### Step 5: Get Connection String

1. Go to "Databases" tab
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database user password

Example connection string:

```
mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/ajarin_db?retryWrites=true&w=majority
```

---

## 🖼️ File Storage (Cloudinary)

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Create free account

### Step 2: Get API Credentials

1. Go to Dashboard
2. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Configure Upload Settings (Optional)

1. Go to Settings > Upload
2. Configure upload presets if needed
3. Set up folder structure

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: |
          cd client
          npm ci

      - name: Build
        run: |
          cd client
          npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_BASE_URL: ${{ secrets.VITE_BASE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

---

## 🌐 Domain Configuration

### Frontend Domain (Vercel)

1. Purchase domain from provider (Namecheap, GoDaddy, etc.)
2. In Vercel dashboard, go to Project > Settings > Domains
3. Add your domain (e.g., `ajarin.id`)
4. Configure DNS records as instructed:

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### Backend Domain (Railway)

1. In Railway dashboard, go to Settings > Domains
2. Add custom domain (e.g., `api.ajarin.id`)
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app.railway.app
   ```

---

## 🔧 Environment Variables Summary

### Frontend (.env)

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BASE_URL=https://yourdomain.com
```

### Backend (.env)

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ajarin_db
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://yourdomain.com
```

---

## 🚀 Post-Deployment Checklist

### ✅ Frontend

- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] API calls working
- [ ] Image uploads working
- [ ] Certificate generation working
- [ ] Mobile responsive

### ✅ Backend

- [ ] API endpoints responding
- [ ] Database connected
- [ ] File uploads working
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Error handling working

### ✅ Database

- [ ] Connection established
- [ ] Collections created
- [ ] Indexes created (if any)
- [ ] Data persisting correctly

### ✅ General

- [ ] SSL certificates active (HTTPS)
- [ ] Custom domains working
- [ ] Environment variables set
- [ ] Error monitoring setup (optional)
- [ ] Performance monitoring (optional)

---

## 🆘 Troubleshooting

### Common Issues

#### CORS Error

```
Access to fetch at 'api.domain.com' from origin 'domain.com' has been blocked by CORS
```

**Solution**: Update `CLIENT_URL` in backend environment variables

#### Build Failed

```
Module not found: Can't resolve './component'
```

**Solution**: Check import paths and file extensions

#### Database Connection Failed

```
MongooseError: Operation failed after 30000ms
```

**Solution**:

- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user permissions

#### 404 on Refresh

**Solution**: Configure proper routing in `vercel.json` or server

---

## 📊 Monitoring (Optional)

### Error Tracking - Sentry

1. Create Sentry account
2. Add Sentry to both frontend and backend
3. Configure error reporting

### Analytics - Google Analytics

1. Create GA4 property
2. Add tracking code to frontend
3. Configure events

### Uptime Monitoring

1. Use services like UptimeRobot
2. Monitor both frontend and backend
3. Set up alerts

---

## 🔄 Updates and Maintenance

### Updating Production

1. Make changes in development
2. Test locally
3. Push to main branch
4. Automatic deployment via CI/CD
5. Verify deployment successful

### Database Backups

1. MongoDB Atlas automatic backups
2. Manual exports if needed
3. Test restoration process

### Security Updates

1. Regularly update dependencies
2. Monitor security advisories
3. Update secrets periodically
