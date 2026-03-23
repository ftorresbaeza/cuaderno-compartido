#!/bin/bash

# Configurar secrets en Vercel
vercel env add DATABASE_URL production <<< 'postgresql://neondb_owner:npg_bNjfu53mZwPl@ep-misty-rice-amlfakja-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

vercel env add BLOB_READ_WRITE_TOKEN production <<< 'vercel_blob_rw_MLuB3lS8ybGutdMj_emyToVI6Apln4Wu2oiiY883O15romd'

vercel env add CRON_SECRET production <<< '0s0HzhAAje7nrEBs+ztcYgEqpGPt8GbjdxkwJEd8kH4='

vercel env add NEXT_PUBLIC_APP_URL production <<< 'https://cuaderno-compartido.vercel.app'

echo "Secrets configurados. Ejecutando deploy..."
vercel --prod
