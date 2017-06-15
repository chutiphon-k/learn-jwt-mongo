import { Router } from 'express'
import User from 'models/user'
import jwt from 'jsonwebtoken'

import app from 'app'

const router = Router()

router.post('/auth', (req, res) => {
	User.findOne({ name: req.body.name }, (err, user) => {
		if (err) throw err

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' })
		} else if (user) {
			if (user.password !== req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' })
			} else {
				let token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: '1d'
				})

				res.json({
					success: true,
					message: 'Enjoy your token',
					token
				})
			}
		}
	})
})

router.use((req, res, next) => {
	let token = req.body.token || req.query.token || req.headers['x-access-token']

	if (token) {
		jwt.verify(token, app.get('superSecret'), (err, decoded) => {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' })
			} else {
				req.decoded = decoded
				next()
			}
		})
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided'
		})
	}
})

router.get('/setup', (req, res) => {
	let nick = new User({
		name: 'AAA',
		password: 'password',
		admin: true
	})

	nick.save((err) => {
		if (err) throw err

		console.log('User saved succeddfully')
		res.json({ success: true })
	})
})

router.get('/', (req, res) => {
	res.json({ message: 'Welcome to API' })
})

router.get('/users', (req, res) => {
	User.find({}, (err, users) => {
		if (err) throw err

		res.json(users)
	})
})

export default router
