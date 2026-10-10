import { Router } from 'express'
import { listAnggota, getAnggota } from '../controllers/anggota.controller.js'

const router = Router()

router.get('/', listAnggota)
router.get('/:id', getAnggota)

export default router
