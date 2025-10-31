#!/bin/sh
set -e

# Set npm registry
npm config set registry https://registry.npmmirror.com

# Install dependencies if needed
if [ ! -f node_modules/.bin/next ]; then
  npm ci
fi

# Export environment variables for Next.js
export NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}

# Start Next.js dev server
exec npm run dev -- -p 3000

