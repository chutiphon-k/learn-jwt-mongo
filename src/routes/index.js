import { Router } from 'express'

import web from 'routes/web'
import example from 'routes/example'

const router = Router()

router.use('/api', example)
router.use('/', web)

export default router
