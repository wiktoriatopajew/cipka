# Blog Setup Instructions for Render Production

## Problem
Blog system code was deployed but database tables were not created in production PostgreSQL database.

## Solution Steps

### 1. Open Render Dashboard
Visit: https://dashboard.render.com/web/srv-cs0p71btq21c739vfrfg

### 2. Open Shell in Render Console
1. Click on your AutoMentor service
2. Go to "Shell" tab
3. Open a new shell session

### 3. Run Blog Setup Script
```bash
node setup-blog-render.cjs
```

This will:
- Create blog_posts, blog_categories, and blog_comments tables
- Add default automotive categories
- Insert 3 sample SEO-optimized blog posts
- Set up proper database indexes

### 4. Verify Setup (Optional)
```bash
node check-render-blog.cjs
```

### 5. Test Blog Functionality
- Visit https://chatwithmechanic.com/blog (should show blog posts)
- Visit https://chatwithmechanic.com/admin (login and check Blog tab)

## Expected Results
- ✅ Blog page shows 3 sample posts
- ✅ Admin panel has Blog management tab
- ✅ SEO optimization working (meta tags, structured data)
- ✅ Categories and commenting system ready

## Troubleshooting
If setup fails, check the error message. Most common issues:
- Database connection problems (retry after a few minutes)
- Permission issues (ensure DATABASE_URL is set)
- Table conflicts (use check-render-blog.cjs to diagnose)

## Post-Setup
Once working, you can:
1. Delete sample posts if needed
2. Create your own automotive content
3. Customize categories
4. Enable/disable commenting as needed