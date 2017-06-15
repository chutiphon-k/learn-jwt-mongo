import { Router } from 'express'

const router = Router()

router.route('/')
	.get((req, res) => {
		res.send('GET')
	})
	.post((req, res) => {
		res.send('POST')
	})
	.put((req, res) => {
		res.send('PUT')
	})
	.patch((req, res) => {
		res.send('PATCH')		
	})
	.delete((req, res) => {
		res.send('DELETE')
	})

export default router
