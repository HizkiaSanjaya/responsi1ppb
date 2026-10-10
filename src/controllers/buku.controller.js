import { requireSupabase } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/response.js'

const TABLE = 'buku'

export const listBuku = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { judul } = req.query

  let query = supabase.from(TABLE).select('*').order('judul')
  if (judul) query = query.ilike('judul', `%${judul}%`)

  const { data, error } = await query
  if (error) throw new ApiError(500, error.message)

  return ok(res, data, 'Daftar buku berhasil diambil')
})

export const getBuku = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { id } = req.params

  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') throw new ApiError(404, 'Buku tidak ditemukan')
    throw new ApiError(500, error.message)
  }

  return ok(res, data, 'Data buku berhasil diambil')
})
