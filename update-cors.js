// Script to update CORS origins after deployment
// Run this after you get your Vercel URL

const fs = require('fs');
const path = require('path');

// Replace with your actual Vercel URL after deployment
const VERCEL_URL = 'https://your-app-name.vercel.app';

// Read the main.py file
const mainPyPath = path.join(__dirname, 'main.py');
let content = fs.readFileSync(mainPyPath, 'utf8');

// Update the CORS origins
const newCorsOrigins = `[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "${VERCEL_URL}",  # Production frontend URL
        "https://*.vercel.app",  # Vercel preview URLs
    ]`;

// Replace the CORS origins in the file
content = content.replace(
    /allow_origins=\[.*?\]/s,
    `allow_origins=${newCorsOrigins}`
);

// Write the updated file
fs.writeFileSync(mainPyPath, content);

console.log('✅ CORS origins updated successfully!');
console.log(`Frontend URL: ${VERCEL_URL}`);
console.log('Now redeploy your backend to Railway.');
