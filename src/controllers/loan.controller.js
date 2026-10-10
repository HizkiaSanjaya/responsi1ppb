import { requireSupabase } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created } from '../utils/response.js'
import {
  createLoanSchema,
  updateLoanSchema,
  loanFilterSchema,
} from '../validators/loan.validator.js'

const TABLE = 'peminjaman'
const SELECT_RELATION = '*, anggota(nama, nim), buku(judul, penulis)'

export const listLoans = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const filters = loanFilterSchema.parse(req.query)

  let query = supabase
    .from(TABLE)
    .select(SELECT_RELATION)
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.anggota_id) query = query.eq('anggota_id', filters.anggota_id)
  if (filters.buku_id) query = query.eq('buku_id', filters.buku_id)

  const { data, error } = await query
  if (error) throw new ApiError(500, error.message)

  return ok(res, data, 'Daftar peminjaman berhasil diambil')
})

export const getLoan = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { id } = req.params

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_RELATION)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new ApiError(404, 'Peminjaman tidak ditemukan')
    throw new ApiError(500, error.message)
  }

  return ok(res, data, 'Data peminjaman berhasil diambil')
})

export const createLoan = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const body = createLoanSchema.parse(req.body)

  const { data, error } = await supabase
    .from(TABLE)
    .insert(body)
    .select(SELECT_RELATION)
    .single()

  if (error) {
    if (error.code === '23503') {
      throw new ApiError(400, 'anggota_id atau buku_id tidak valid (tidak ditemukan)')
    }
    throw new ApiError(500, error.message)
  }

  return created(res, data, 'Peminjaman berhasil dibuat')
})

export const updateLoan = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { id } = req.params
  const body = updateLoanSchema.parse(req.body)

  const { data, error } = await supabase
    .from(TABLE)
    .update(body)
    .eq('id', id)
    .select(SELECT_RELATION)
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new ApiError(404, 'Peminjaman tidak ditemukan')
    if (error.code === '23503') {
      throw new ApiError(400, 'anggota_id atau buku_id tidak valid (tidak ditemukan)')
    }
    throw new ApiError(500, error.message)
  }

  return ok(res, data, 'Peminjaman berhasil diperbarui')
})

export const deleteLoan = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { id } = req.params

  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new ApiError(404, 'Peminjaman tidak ditemukan')
    throw new ApiError(500, error.message)
  }

  return ok(res, data, 'Peminjaman berhasil dihapus')
})
