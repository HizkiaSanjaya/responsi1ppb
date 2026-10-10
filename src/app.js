import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { ZodError } from 'zod'

import loanRoutes from './routes/loan.routes.js'
import anggotaRoutes from './routes/anggota.routes.js'
import bukuRoutes from './routes/buku.routes.js'

const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'API Pencatatan Peminjaman Buku Perpustakaan',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Cek kesehatan layanan',
      'GET /loans': 'Daftar peminjaman (filter: status, anggota_id, buku_id)',
      'GET /loans/:id': 'Detail satu peminjaman',
      'POST /loans': 'Buat peminjaman baru',
      'PUT /loans/:id': 'Perbarui peminjaman',
      'DELETE /loans/:id': 'Hapus peminjaman',
      'GET /anggota': 'Daftar anggota',
      'GET /buku': 'Daftar buku (filter: judul)',
    },
  })
})

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'perpustakaan-loans-api',
      timestamp: new Date().toISOString(),
    },
  })
})

app.use('/loans', loanRoutes)
app.use('/anggota', anggotaRoutes)
app.use('/buku', bukuRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' })
})

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
  })
})

export default app
