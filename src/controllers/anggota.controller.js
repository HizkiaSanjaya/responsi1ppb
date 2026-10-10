import { requireSupabase } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/response.js'

const TABLE = 'anggota'

export const listAnggota = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { data, error } = await supabase.from(TABLE).select('*').order('nama')
  if (error) throw new ApiError(500, error.message)
  return ok(res, data, 'Daftar anggota berhasil diambil')
})

export const getAnggota = asyncHandler(async (req, res) => {
  const supabase = requireSupabase()
  const { id } = req.params

  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') throw new ApiError(404, 'Anggota tidak ditemukan')
    throw new ApiError(500, error.message)
  }

  return ok(res, data, 'Data anggota berhasil diambil')
})
