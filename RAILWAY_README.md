# 🚂 School Canteen - Railway Deployment Template

This is a production-ready template for deploying the School Canteen Management System to Railway.

## 📦 What's Included

### Backend
- Node.js/Express API
- MongoDB database integration
- JWT authentication
- Image upload handling
- Admin & Kitchen dashboards
- Order management system

### Features
- ✅ Cash-only payment system
- ✅ Real-time order tracking
- ✅ Kitchen display system
- ✅ Product management
- ✅ Auto-incrementing order numbers
- ✅ Image uploads with Sharp optimization

---

## 🚀 Quick Deploy

### 1️⃣ Deploy Backend to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Click "Deploy on Railway"
2. Connect your GitHub account
3. Select this repository
4. Choose `Backend` as root directory
5. Railway will auto-detect Node.js

### 2️⃣ Add MongoDB Database

1. In Railway project, click "New Service"
2. Select "Database" → "MongoDB"
3. Railway creates database automatically
4. Connection string available in service variables

### 3️⃣ Configure Environment Variables

```env
NODE_ENV=production
PORT=${{PORT}}
MONGO_URI=${{MONGO_URL}}
ADMIN_EMAIL=admin@schoolcanteen.com
ADMIN_PASSWORD_HASH=<generate-using-script>
JWT_SECRET=<generate-random-secret>
JWT_EXPIRES_IN=12h
CORS_ORIGIN=https://your-frontend-domain.com
```

### 4️⃣ Generate Secrets

**Password Hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(console.log);"
```

**JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

---

## 📚 Full Documentation

- **Backend Deployment**: [Backend/RAILWAY_DEPLOYMENT.md](Backend/RAILWAY_DEPLOYMENT.md)
- **API Documentation**: [Backend/README.md](Backend/README.md)
- **Architecture**: [Backend/ARCHITECTURE.md](Backend/ARCHITECTURE.md)

---

## 🔧 Configuration Files

### Railway Configuration
- `railway.json` - Railway service configuration
- `Procfile` - Process commands
- `.nvmrc` - Node.js version

### Environment
- `.env.example` - Environment variables template
- Never commit actual `.env` file

---

## 🗂️ Project Structure

```
Backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Auth & validation
├── models/          # MongoDB schemas
├── routes/          # API routes
├── uploads/         # Image storage
├── utils/           # Helper functions
├── server.js        # Entry point
├── railway.json     # Railway config
├── Procfile         # Process file
└── .nvmrc          # Node version
```

---

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (Admin)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats

### Kitchen
- `GET /api/kitchen/orders` - Get pending orders
- `PATCH /api/kitchen/orders/:id/status` - Update order status

### Health Check
- `GET /api/health` - Server status

---

## 🔐 Security Features

- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ MongoDB injection prevention
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation with Joi

---

## 📊 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Image Processing**: Sharp + Multer
- **Security**: Helmet, CORS, Rate Limiting

---

## 🚦 Testing

### Local Testing
```bash
cd Backend
npm install
npm run dev
```

### API Testing
- Use Postman collection: `School_Canteen_API.postman_collection.json`
- Test health: `http://localhost:5000/api/health`

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | Environment (`production`) |
| `PORT` | ✅ | Server port (Railway auto) |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD_HASH` | ✅ | Hashed admin password |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `JWT_EXPIRES_IN` | ⚠️ | Token expiration (12h) |
| `CORS_ORIGIN` | ⚠️ | Allowed frontend origins |

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB service is running
- Ensure IP whitelist allows Railway

### CORS Errors
- Add frontend domain to `CORS_ORIGIN`
- Format: `https://domain1.com,https://domain2.com`

### Authentication Errors
- Verify `JWT_SECRET` is set
- Check `ADMIN_PASSWORD_HASH` is correct
- Ensure admin credentials match `.env`

---

## 💰 Cost Estimate

Railway Pricing:
- **Free Tier**: $5 credit/month
- **Pro Plan**: $20/month

Typical usage for this project:
- Backend: ~$3-5/month
- MongoDB: ~$2-3/month
- **Total**: ~$5-8/month (or free tier)

---

## 🔄 Auto-Deployment

Railway automatically deploys on git push:

1. Make code changes
2. `git commit -m "Update"`
3. `git push origin main`
4. Railway auto-deploys ✅

---

## 📱 Frontend Deployment

Deploy frontend separately:
- **Netlify**: Best for static sites
- **Vercel**: Great for frameworks
- **Railway**: Can host full-stack

Update frontend `environment.ts`:
```typescript
apiUrl: 'https://your-backend.railway.app/api'
```

---

## ✅ Pre-Deployment Checklist

- [ ] MongoDB database added
- [ ] All environment variables set
- [ ] JWT_SECRET generated (64+ chars)
- [ ] Admin password hash created
- [ ] CORS_ORIGIN configured
- [ ] Node.js version set (18+)
- [ ] Root directory set to `/Backend`
- [ ] Health endpoint tested

---

## 📞 Support & Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Community support
- **GitHub Issues**: Bug reports
- **API Docs**: See `Backend/README.md`

---

## 🎯 Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Verify database connection
3. ✅ Test admin login
4. ✅ Upload test products
5. ✅ Create test orders
6. 🎯 Deploy frontend
7. 🎯 Connect frontend to backend
8. 🎯 Full integration testing

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👥 Contributors

Built for school canteen management with ❤️

---

**Ready to deploy? Follow the deployment guide above! 🚀**

For detailed instructions, see [Backend/RAILWAY_DEPLOYMENT.md](Backend/RAILWAY_DEPLOYMENT.md)
