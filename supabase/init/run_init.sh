#!/bin/bash

# ============================================================================
# Clar1ty AI - Database Initialization Runner
# ============================================================================
# This script initializes the Clar1ty AI database on Supabase
# Usage: bash run_init.sh
# ============================================================================

set -e  # Exit on error

echo "🚀 Initializing Clar1ty AI Database..."
echo ""

# Get Supabase credentials from environment or prompt
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "📝 Enter your Supabase database password:"
  read -s SUPABASE_DB_PASSWORD
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  SUPABASE_PROJECT_ID="uikvqvqkwgtwiyzttxgv"
fi

DB_HOST="db.${SUPABASE_PROJECT_ID}.supabase.co"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="postgres"

echo ""
echo "📦 Connecting to: postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""

# Run the master init script
psql postgresql://${DB_USER}:${SUPABASE_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME} \
  -f 00_MASTER_INIT.sql

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Set up authentication pages (/auth/sign-up, /auth/login)"
echo "   2. Configure Supabase Storage for image uploads"
echo "   3. Connect UI to database endpoints"
echo ""
