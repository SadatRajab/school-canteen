# Railway Deployment Guide - School Canteen Backend

## 🚀 Quick Deploy to Railway

### Prerequisites
1. Railway account ([railway.app](https://railway.app))
2. GitHub repository with your code
3. MongoDB database (Railway provides MongoDB addon)

---

## 📋 Deployment Steps

### 1. Create New Project in Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select `Backend` folder as root directory

### 2. Add MongoDB Database
1. Click "New Service" in your project
2. Select "Database"
3. Choose "MongoDB"
4. Railway will automatically create a MongoDB instance
5. Copy the `MONGO_URL` from the MongoDB service variables

### 3. Configure Environment Variables
In Railway project settings, add these variables:

```env
# Server Configuration
NODE_ENV=production
PORT=${{PORT}}

# MongoDB Connection (from Railway MongoDB service)
MONGO_URI=${{MONGO_URL}}

# Admin Credentials
ADMIN_EMAIL=admin@schoolcanteen.com
ADMIN_PASSWORD_HASH=<your-hashed-password>

# JWT Configuration
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRES_IN=12h

# CORS Configuration (add your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

### 4. Generate Required Secrets

#### Generate Password Hash:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123', 10).then(hash => console.log(hash));"
```

#### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

---

## 🔧 Important Configuration

### Railway Port
Railway automatically assigns a port via `$PORT` environment variable. The server is already configured to use `process.env.PORT`.

### Root Directory
Make sure Railway is pointing to the `Backend` folder:
- Settings → Service → Root Directory: `/Backend`

### Build Command
Railway will automatically run:
```bash
npm install
```

### Start Command
```bash
npm start
```

---

## 🗄️ Database Options

### Option 1: Railway MongoDB (Recommended)
- Easy setup within Railway
- Automatic connection string
- Managed service

### Option 2: MongoDB Atlas
1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `MONGO_URI` environment variable

---

## ✅ Post-Deployment Checklist

1. **Test API Health**
   ```
   https://your-app.railway.app/api/health
   ```

2. **Test Admin Login**
   - Use Postman or similar tool
   - POST to `/api/admin/login`
   - Credentials from environment variables

3. **Update Frontend**
   - Update API URL in frontend environment files
   - Point to Railway backend URL

4. **Enable CORS**
   - Add frontend domain to `CORS_ORIGIN`
   - Multiple domains: `https://domain1.com,https://domain2.com`

---

## 🔐 Security Best Practices

1. **Never commit .env file**
   - Already in `.gitignore`
   - Use Railway environment variables

2. **Use Strong Secrets**
   - JWT_SECRET: 64+ random characters
   - Admin password: Strong and unique

3. **Enable HTTPS**
   - Railway provides free SSL
   - Always use in production

4. **Rate Limiting**
   - Already configured in the app
   - Prevents abuse

---

## 📊 Monitoring & Logs

### View Logs
1. Go to your Railway project
2. Click on the Backend service
3. Go to "Deployments" tab
4. Click on latest deployment
5. View logs in real-time

### Common Issues

#### Issue: Database Connection Failed
**Solution**: Check `MONGO_URI` is correctly set and database is running

#### Issue: CORS Error
**Solution**: Add frontend domain to `CORS_ORIGIN` environment variable

#### Issue: Authentication Failed
**Solution**: Verify `ADMIN_PASSWORD_HASH` and `JWT_SECRET` are set correctly

---

## 🌍 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port | `${{PORT}}` (Railway auto) |
| `MONGO_URI` | ✅ | MongoDB connection | `mongodb+srv://...` |
| `ADMIN_EMAIL` | ✅ | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD_HASH` | ✅ | Bcrypt hashed password | `$2a$10$...` |
| `JWT_SECRET` | ✅ | JWT signing key | Random 64 chars |
| `JWT_EXPIRES_IN` | ⚠️ | Token expiration | `12h` |
| `CORS_ORIGIN` | ⚠️ | Allowed origins | `https://example.com` |

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your GitHub repository:

1. Make changes to code
2. Commit and push to GitHub
3. Railway automatically detects changes
4. New deployment starts
5. Live in minutes!

---

## 💰 Pricing

Railway offers:
- **Free Tier**: $5 credit/month
- **Pro Plan**: $20/month + usage

The School Canteen backend typically uses:
- ~2-3 GB RAM
- Minimal CPU
- Small database

Should fit within free tier for development/testing.

---

## 📝 Next Steps

1. ✅ Deploy Backend to Railway
2. ✅ Configure Environment Variables
3. ✅ Add MongoDB Database
4. ✅ Test API Endpoints
5. 🎯 Deploy Frontend (Netlify/Vercel)
6. 🎯 Connect Frontend to Backend
7. 🎯 Test Full Application

---

## 🆘 Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: Report bugs in your repository

---

## 📌 Quick Commands

```bash
# Install dependencies
npm install

# Run locally
npm start

# Development mode with auto-reload
npm run dev

# Generate password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password', 10).then(console.log);"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

---

**Happy Deploying! 🚀**
