import express, { Router } from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import config from 'config'
import blueBird from 'bluebird'

import User from './app/models/user'
import passportFunc from './config/passport'

let port = 3000

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passport.initialize())

app.use(morgan('dev'))
mongoose.connect(config.Api.database)
mongoose.Promise = blueBird

passportFunc(passport)

let router = Router()

router.post('/register', (req, res) => {
	if (!req.body.email || !req.body.password) {
		res.json({success: false, message: 'Please enter an email and password to register'})
	} else {
		let newUser = new User({
			email: req.body.email,
			password: req.body.password
		})

		newUser.save((err) => {
			if (err) {
				return res.json({success: false, message: 'That email address already exists'})
			}
			res.json({success: true, message: 'Successfully created new user'})
		})
	}
})

router.post('/authenticate', (req, res) => {
	User.findOne({
		email: req.body.email
	}, (err, user) => {
		if (err) return err

		if (!user) {
			res.send({success: false, message: 'Authentication failed. User not found.'})
		} else {
			user.comparePassword(req.body.password, (err, isMatch) => {
				if (isMatch && !err) {
					let token = jwt.sign(user, config.Api.secret, {
						expiresIn: 10080
					})
					res.json({success: true, token: 'JWT ' + token})
				} else {
					res.send({success: false, message: 'Authentication failed. Password did not match.'})
				}
			})
		}
	})
})

router.get('/dashboard', passport.authenticate('jwt', {session: false}), (req, res) => {
	res.send('It worked! User id is:' + req.user._id + '.')
})

app.use('/api', router)

app.get('/', (req, res) => {
	res.send('GET')
})

app.listen(port, () => {
	console.log('PORT: ', port)
})
