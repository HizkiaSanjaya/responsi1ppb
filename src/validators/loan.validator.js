import { z } from 'zod'

const dateString = z
  .string({ invalid_type_error: 'Tanggal harus berupa string' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')

const uuidString = z.string().uuid('Nilai harus berupa UUID yang valid')

export const createLoanSchema = z.object({
  anggota_id: uuidString,
  buku_id: uuidString,
  tanggal_pinjam: dateString.optional(),
  tanggal_jatuh_tempo: dateString,
  tanggal_kembali: dateString.nullable().optional(),
})

export const updateLoanSchema = z
  .object({
    anggota_id: uuidString.optional(),
    buku_id: uuidString.optional(),
    tanggal_pinjam: dateString.optional(),
    tanggal_jatuh_tempo: dateString.optional(),
    tanggal_kembali: dateString.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Tidak ada field yang dikirim untuk diperbarui',
  })

export const loanFilterSchema = z.object({
  status: z.enum(['Dipinjam', 'Dikembalikan', 'Terlambat']).optional(),
  anggota_id: uuidString.optional(),
  buku_id: uuidString.optional(),
})
