import { Strategy, ExtractJwt } from 'passport-jwt'
import config from 'config'

import User from '../app/models/user'

let passportFunc = (passport) => {
	let opts = {}
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader()
	opts.secretOrKey = config.Api.secret
	passport.use(new Strategy(opts, (jwtPayload, done) => {
		console.log('payload received', jwtPayload)
		User.findOne({id: jwtPayload.id}, (err, user) => {
			if (err) {
				return done(err, false)
			}
			if (user) {
				done(null, user)
			} else {
				done(null, false)
			}
		})
	}))
}

export default passportFunc
