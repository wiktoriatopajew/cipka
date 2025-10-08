
-- Fix admin users on Render PostgreSQL
-- Run this on your Render database

-- Option 1: Make admin@wp.pl an admin
UPDATE users 
SET "isAdmin" = true, "hasSubscription" = true 
WHERE email = 'admin@wp.pl';

-- Option 2: Make wiktoriatopajew@gmail.com an admin  
UPDATE users 
SET "isAdmin" = true, "hasSubscription" = true 
WHERE email = 'wiktoriatopajew@gmail.com';

-- Check results
SELECT id, username, email, "isAdmin", "hasSubscription", "createdAt"
FROM users 
WHERE "isAdmin" = true;

-- Show all users for verification
SELECT username, email, "isAdmin", "hasSubscription" 
FROM users 
ORDER BY "createdAt" DESC;
