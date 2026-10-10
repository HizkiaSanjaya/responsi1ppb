# API Pencatatan Peminjaman Buku Perpustakaan

REST API sederhana untuk mencatat peminjaman buku perpustakaan oleh anggota. Dibangun menggunakan **Node.js + Express.js** dengan basis data **Supabase (PostgreSQL)** dan siap dideploy ke **Vercel**.

## Daftar Isi

- [Deskripsi & Tujuan](#deskripsi--tujuan)
- [Teknologi](#teknologi)
- [Struktur Data / Schema](#struktur-data--schema)
- [Endpoint & Contoh Request/Response](#endpoint--contoh-requestresponse)
- [Panduan Instalasi & Menjalankan Lokal](#panduan-instalasi--menjalankan-lokal)
- [Deployment ke Vercel](#deployment-ke-vercel)
- [Struktur Proyek](#struktur-proyek)
- [Catatan Keamanan](#catatan-keamanan)

---

## Deskripsi & Tujuan

Proyek ini menyediakan antarmuka HTTP untuk operasi **CRUD** data peminjaman buku:

- **Create**: mencatat peminjaman baru oleh anggota
- **Read**: mengambil daftar atau detail peminjaman
- **Update**: memperbarui data peminjaman (misalnya mencatat tanggal pengembalian)
- **Delete**: menghapus catatan peminjaman

Selain itu tersedia **fitur filter query**, misalnya `GET /loans?status=Terlambat` untuk menampilkan peminjaman yang melewati jatuh tempo. Status peminjaman dihitung otomatis oleh basis data (melalui trigger) sehingga nilainya selalu konsisten dengan tanggal pinjam, jatuh tempo, dan tanggal kembali.

**Link terkait:**

- Repository GitHub: https://github.com/HizkiaSanjaya/responsi1ppb
- Deployment Vercel: https://responsi1ppb.vercel.app

## Teknologi

| Komponen    | Teknologi                                        |
| ----------- | ------------------------------------------------ |
| Runtime     | Node.js (>= 18)                                  |
| Framework   | Express.js 4                                     |
| Database    | Supabase (PostgreSQL)                            |
| ORM/Client  | `@supabase/supabase-js`                          |
| Validasi    | `zod`                                            |
| Deployment  | Vercel                                           |

## Struktur Data / Schema

Terdapat tiga tabel utama: `anggota`, `buku`, dan `peminjaman`.

### Tabel `anggota`

| Kolom        | Tipe       | Keterangan                          |
| ------------ | ---------- | ----------------------------------- |
| `id`         | `uuid`     | Primary key, otomatis               |
| `nama`       | `text`     | Nama anggota, wajib                 |
| `nim`        | `text`     | Nomor induk mahasiswa, unik         |
| `email`      | `text`     | Surel anggota, unik (opsional)      |
| `no_hp`      | `text`     | Nomor telepon (opsional)            |
| `created_at` | `timestamptz` | Waktu pembuatan data             |

### Tabel `buku`

| Kolom          | Tipe       | Keterangan                     |
| -------------- | ---------- | ------------------------------ |
| `id`           | `uuid`     | Primary key, otomatis          |
| `judul`        | `text`     | Judul buku, wajib              |
| `penulis`      | `text`     | Penulis, wajib                 |
| `isbn`         | `text`     | ISBN, unik (opsional)          |
| `tahun_terbit` | `int`      | Tahun terbit (opsional)        |
| `created_at`   | `timestamptz` | Waktu pembuatan data        |

### Tabel `peminjaman`

| Kolom                | Tipe       | Keterangan                                  |
| -------------------- | ---------- | ------------------------------------------- |
| `id`                 | `uuid`     | Primary key, otomatis                       |
| `anggota_id`         | `uuid`     | Foreign key ke `anggota(id)`                |
| `buku_id`            | `uuid`     | Foreign key ke `buku(id)`                   |
| `tanggal_pinjam`     | `date`     | Tanggal pinjam (default hari ini)           |
| `tanggal_jatuh_tempo`| `date`     | Tanggal jatuh tempo, wajib                  |
| `tanggal_kembali`    | `date`     | Tanggal pengembalian (nullable)             |
| `status`             | `enum`     | `Dipinjam`, `Dikembalikan`, `Terlambat`     |
| `created_at`         | `timestamptz` | Waktu pembuatan data                     |

### Aturan status otomatis

Nilai `status` tidak diisi manual, melainkan dihitung oleh *trigger* `set_status_peminjaman`:

1. Jika `tanggal_kembali` terisi, status menjadi `Dikembalikan`.
2. Jika belum dikembalikan dan `tanggal_jatuh_tempo` sudah lewat hari ini, status menjadi `Terlambat`.
3. Selain itu, status adalah `Dipinjam`.

## Endpoint & Contoh Request/Response

Base URL lokal: `http://localhost:3000` · Base URL produksi: **https://responsi1ppb.vercel.app**

### Ringkasan Endpoint

| Method   | Path             | Deskripsi                                   |
| -------- | ---------------- | ------------------------------------------- |
| `GET`    | `/health`        | Cek kesehatan layanan                       |
| `GET`    | `/loans`         | Daftar peminjaman (mendukung filter)        |
| `GET`    | `/loans/:id`     | Detail satu peminjaman                      |
| `POST`   | `/loans`         | Membuat peminjaman baru                     |
| `PUT`    | `/loans/:id`     | Memperbarui peminjaman                      |
| `DELETE` | `/loans/:id`     | Menghapus peminjaman                        |
| `GET`    | `/anggota`       | Daftar anggota                              |
| `GET`    | `/anggota/:id`   | Detail anggota                              |
| `GET`    | `/buku`          | Daftar buku (filter: `judul`)               |
| `GET`    | `/buku/:id`      | Detail buku                                 |

### 1. GET /health

```http
GET /health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "perpustakaan-loans-api",
    "timestamp": "2026-10-10T07:00:00.000Z"
  }
}
```

### 2. GET /loans (dengan filter status)

```http
GET /loans?status=Terlambat
```

```json
{
  "success": true,
  "message": "Daftar peminjaman berhasil diambil",
  "data": [
    {
      "id": "8f2c...",
      "anggota_id": "c0a1...",
      "buku_id": "1b3d...",
      "tanggal_pinjam": "2026-09-30",
      "tanggal_jatuh_tempo": "2026-10-07",
      "tanggal_kembali": null,
      "status": "Terlambat",
      "created_at": "2026-10-01T03:00:00+00:00",
      "anggota": { "nama": "Budi Santoso", "nim": "24060119120001" },
      "buku": { "judul": "Pemrograman JavaScript Modern", "penulis": "Andi Wijaya" }
    }
  ]
}
```

Filter yang didukung pada `GET /loans`:

- `status` (nilai: `Dipinjam`, `Dikembalikan`, `Terlambat`)
- `anggota_id` (UUID)
- `buku_id` (UUID)

Contoh kombinasi: `GET /loans?status=Dipinjam&anggota_id=c0a1...`

### 3. POST /loans

```http
POST /loans
Content-Type: application/json

{
  "anggota_id": "c0a1...",
  "buku_id": "1b3d...",
  "tanggal_jatuh_tempo": "2026-10-20"
}
```

Response (201 Created):

```json
{
  "success": true,
  "message": "Peminjaman berhasil dibuat",
  "data": {
    "id": "9d4e...",
    "anggota_id": "c0a1...",
    "buku_id": "1b3d...",
    "tanggal_pinjam": "2026-10-10",
    "tanggal_jatuh_tempo": "2026-10-20",
    "tanggal_kembali": null,
    "status": "Dipinjam",
    "created_at": "2026-10-10T07:00:00+00:00",
    "anggota": { "nama": "Budi Santoso", "nim": "24060119120001" },
    "buku": { "judul": "Pemrograman JavaScript Modern", "penulis": "Andi Wijaya" }
  }
}
```

### 4. PUT /loans/:id

Memperbarui peminjaman, misalnya mencatat pengembalian buku.

```http
PUT /loans/9d4e...
Content-Type: application/json

{
  "tanggal_kembali": "2026-10-15"
}
```

Response:

```json
{
  "success": true,
  "message": "Peminjaman berhasil diperbarui",
  "data": {
    "id": "9d4e...",
    "tanggal_kembali": "2026-10-15",
    "status": "Dikembalikan",
    "...": "..."
  }
}
```

### 5. DELETE /loans/:id

```http
DELETE /loans/9d4e...
```

Response:

```json
{
  "success": true,
  "message": "Peminjaman berhasil dihapus",
  "data": { "id": "9d4e..." }
}
```

### Contoh respons error validasi

```http
POST /loans
Content-Type: application/json

{ "anggota_id": "tidak-valid", "buku_id": "tidak-valid" }
```

```json
{
  "success": false,
  "message": "Validasi input gagal",
  "errors": [
    { "field": "anggota_id", "message": "Nilai harus berupa UUID yang valid" },
    { "field": "buku_id", "message": "Nilai harus berupa UUID yang valid" },
    { "field": "tanggal_jatuh_tempo", "message": "Format tanggal harus YYYY-MM-DD" }
  ]
}
```

## Panduan Instalasi & Menjalankan Lokal

### Prasyarat

- Node.js >= 18 dan npm
- Akun Supabase beserta proyek yang sudah dibuat

### Langkah 1: Clone repository

```bash
git clone https://github.com/<username>/<nama-repo>.git
cd <nama-repo>
```

### Langkah 2: Install dependensi

```bash
npm install
```

### Langkah 3: Siapkan basis data Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Buka menu **SQL Editor** → **New query**.
3. Salin seluruh isi file [`schema.sql`](./schema.sql), lalu klik **Run**. Tabel, trigger status, dan data contoh akan dibuat.
4. Buka **Project Settings** → **API**.
5. Salin **Project URL** dan **service_role key**.

### Langkah 4: Konfigurasi environment

```bash
cp .env.example .env
```

Isi file `.env`:

```env
SUPABASE_URL=https://abcdefghijklm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
PORT=3000
```

### Langkah 5: Jalankan server

```bash
npm start
```

Buka `http://localhost:3000/health` untuk memastikan layanan berjalan.

### Uji endpoint dengan curl

```bash
curl http://localhost:3000/loans
curl "http://localhost:3000/loans?status=Terlambat"
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{"anggota_id":"<uuid>","buku_id":"<uuid>","tanggal_jatuh_tempo":"2026-10-20"}'
```

## Deployment ke Vercel

### Langkah 1: Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

### Langkah 2: Deploy

```bash
npm i -g vercel
vercel login
vercel
```

Saat proses deploy, tambahkan *environment variables* yang sama dengan file `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Atau set lewat dashboard Vercel: **Project** → **Settings** → **Environment Variables**.

```bash
vercel --prod
```

### Hasil Deployment

- **Base URL**: https://responsi1ppb.vercel.app
- Contoh uji:
  - https://responsi1ppb.vercel.app/health
  - https://responsi1ppb.vercel.app/loans
  - https://responsi1ppb.vercel.app/loans?status=Terlambat

## Struktur Proyek

```
.
├── api/
│   └── index.js              # Entry point untuk Vercel
├── src/
│   ├── app.js                # Inisialisasi Express + middleware
│   ├── server.js             # Entry point lokal (npm start)
│   ├── config/
│   │   └── supabase.js       # Konfigurasi client Supabase
│   ├── controllers/          # Logika bisnis per resource
│   │   ├── loan.controller.js
│   │   ├── anggota.controller.js
│   │   └── buku.controller.js
│   ├── routes/               # Definisi routing
│   ├── validators/           # Validasi input (zod)
│   └── utils/                # Helper (error, response, async)
├── schema.sql                # Schema database + trigger + seed
├── .env.example              # Contoh environment variables
├── vercel.json               # Konfigurasi deployment Vercel
└── package.json
```

## Catatan Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` bersifat **rahasia** dan hanya boleh dipakai di sisi server (Vercel function), jangan pernah diekspos ke sisi klien atau dicommit ke repository.
- File `.env` sudah masuk `.gitignore`. Gunakan *environment variables* Vercel untuk produksi.
- Untuk kebutuhan produksi yang lebih ketat, disarankan memakai `anon key` + Row Level Security (RLS) + autentikasi supaya akses data dibatasi per pengguna.
