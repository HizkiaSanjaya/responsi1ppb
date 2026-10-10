import { Router } from 'express'
import { listBuku, getBuku } from '../controllers/buku.controller.js'

const router = Router()

router.get('/', listBuku)
router.get('/:id', getBuku)

export default router
