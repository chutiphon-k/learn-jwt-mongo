import express from 'express'
import bodyParser from 'body-parser'
import nodeNotifier from 'node-notifier'
import errorhandler from 'errorhandler'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import config from 'config'
import blueBird from 'bluebird'
import http from 'http'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

// import routes from 'routes'

const app = express()
mongoose.connect(config.Api.database)
mongoose.Promise = blueBird

if (process.env.NODE_ENV === 'development') {
	app.use(errorhandler({log: errorNotification}))
}

function errorNotification (err, str, req) {
	if (err) {
		let title = 'Error in ' + req.method + ' ' + req.url

		nodeNotifier.notify({
			title: title,
			message: str
		})
	}
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())
app.use(cors())
app.use(morgan('dev'))
app.use(passport.initialize())
// app.use(passport.session())
// app.use('/', routes)

const server = http.Server(app)
const port = process.env.PORT || config.Api.port

server.listen(port, () => {
	console.log('[INFO] Listening on *:' + port)
})

let users = [
	{
		id: 1,
		name: 'jonathanmh',
		password: '%2yx4'
	}, {
		id: 2,
		name: 'test',
		password: 'test'
	}
]

let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader()
jwtOptions.secretOrKey = 'hello'

let strategy = new Strategy(jwtOptions, (jwtPayload, done) => {
	console.log('payload received', jwtPayload)
	let user = users.find((user) => user.id === jwtPayload.id)
	if (user) {
		console.log('a')
		done(null, user)
	} else {
		console.log('b')
		done(null, false)
	}
})

passport.use(strategy)

// passport.serializeUser((user, done) => {
// 	console.log('hello')
// 	done(null, user)
// })

// passport.deserializeUser((obj, done) => {
// 	done(null, obj)
// })

app.get('/', (req, res) => {
	res.json({message: 'Express is up!'})
})

app.post('/login', (req, res) => {
	// passport.serializeUser((user, done) => {
	// 	done(null, user.id)
	// })

	// passport.deserializeUser((id, done) => {
	// 	User.findById(id, (err, user) => {
	// 		done(err, user)
	// 	})
	// })

	let name, password
	if (req.body.name && req.body.password) {
		name = req.body.name
		password = req.body.password
	}

	let user = users.find((user) => user.name === name)

	if (!user) {
		res.status(401).json({ message: 'no such user found' })
	}

	if (user.password === password) {
		let payload = {
			id: user.id
		}
		let token = jwt.sign(payload, jwtOptions.secretOrKey)
		res.json({ message: 'ok', token })
	} else {
		res.status(401).json({ message: 'password did not match' })
	}
})

app.use(passport.authenticate('jwt', {
	session: false
	// successRedirect: '/',
	// failureRedirect: '/login'
}))

app.get('/secret', (req, res) => {
	console.log(req.user)
	res.json('Success! You can not see this without a token')
})

app.get('/secretDebug', (req, res, next) => {
	console.log(req.get('Authorization'))
	next()
}, (req, res) => {
	res.json('debugging')
})
