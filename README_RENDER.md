# AutoMentor - Render Deployment

## Quick Deploy to Render

### 1. One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=YOUR_REPO_URL)

### 2. Manual Setup

1. **Fork this repository** to your GitHub account

2. **Create a new Web Service** on Render:
   - Connect your GitHub repository
   - Name: `automentor`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Create PostgreSQL Database**:
   - Create a new PostgreSQL database on Render
   - Name: `automentor-db`

4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[auto-filled from PostgreSQL database]
   SESSION_SECRET=[generate random string]
   STRIPE_SECRET_KEY=[your Stripe secret key]
   STRIPE_PUBLISHABLE_KEY=[your Stripe publishable key]
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=[your Gmail address]
   SMTP_PASS=[your Gmail app password]
   ```

5. **Deploy**:
   - Click "Deploy" and wait for the build to complete
   - Your app will be available at `https://automentor.onrender.com`

## Features

- ✅ Full-stack Express.js + React application
- ✅ PostgreSQL database with automatic migrations
- ✅ File uploads and static file serving
- ✅ Stripe payment integration
- ✅ Email notifications via SMTP
- ✅ Real-time chat functionality
- ✅ Admin panel
- ✅ User authentication and sessions
- ✅ Responsive design

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production) | ✅ |
| `PORT` | Server port (10000) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SESSION_SECRET` | Session encryption key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚠️ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ⚠️ |
| `SMTP_HOST` | Email server host | ⚠️ |
| `SMTP_PORT` | Email server port | ⚠️ |
| `SMTP_USER` | Email username | ⚠️ |
| `SMTP_PASS` | Email password | ⚠️ |

⚠️ = Optional but recommended for full functionality

## Database

The application automatically:
- Detects PostgreSQL in production
- Creates all necessary tables
- Handles migrations
- Sets up admin users

## Support

- Health check endpoint: `/api/health`
- Admin panel: `/admin`
- API documentation: Available in code comments

## Architecture

```
AutoMentor/
├── client/          # React frontend
├── server/          # Express.js backend
├── shared/          # Database schema
├── dist/            # Built application
└── render.yaml      # Render configuration
```