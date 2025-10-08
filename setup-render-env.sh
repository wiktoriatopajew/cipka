#!/bin/bash

# Script to set environment variables on Render
# You need to run this manually in Render Dashboard > Environment tab

echo "🔧 Environment Variables for Render Deployment"
echo "=============================================="
echo ""
echo "Go to your Render Dashboard:"
echo "1. Open https://dashboard.render.com"
echo "2. Find your 'cipka' service"
echo "3. Go to Environment tab"
echo "4. Add these variables:"
echo ""
echo "STRIPE_SECRET_KEY="
echo "sk_test_51NSmbFEqdkqBXQdXrEz0bAOIpvojgH0QcmYwxYME01B2UMzdBBMv6TujwyOi3cousrcjA6icA0MRDnC8OCS7gY3l006E7Gwo6h"
echo ""
echo "VITE_STRIPE_PUBLIC_KEY="
echo "pk_test_51NSmbFEqdkqBXQdX4uoBQAu2Y0Uk8RyulN1hXl8iJnMv3w6MVHUvy3T8usJoJNkZ6QB9AtwJtm0IgTZo5muaDFuC00Zc2YiOWp"
echo ""
echo "DATABASE_URL="
echo "postgresql://automentor_db_user:5VpcIDdEOOyvQWeE36f6nMir3ofwythZ@dpg-d3j3iojuibrs73dac2e0-a.oregon-postgres.render.com/automentor_db"
echo ""
echo "5. Click 'Save Changes'"
echo "6. Wait for automatic redeploy"
echo ""
echo "✅ After setting these variables, your Stripe payments should work!"