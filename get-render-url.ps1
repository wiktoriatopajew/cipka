echo "🔍 Checking for DATABASE_URL..."
echo "DATABASE_URL: $env:DATABASE_URL"

echo ""
echo "📋 To migrate your local SQLite data to Render PostgreSQL:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click on your PostgreSQL database"  
echo "3. Copy the 'External Database URL'"
echo "4. Run this command:"
echo '   $env:DATABASE_URL="postgresql://your_connection_string"'
echo "5. Then run: node migrate-to-render.cjs"
echo ""
echo "Your External Database URL should look like:"
echo "postgresql://automentor_user:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com:5432/automentor"