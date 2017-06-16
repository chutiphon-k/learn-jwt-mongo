import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

let UserSchema = new mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['Client', 'Manager', 'Admin'],
		default: 'Client'
	}
})

UserSchema.pre('save', function (next) {
	console.log(this)
	let user = this
	if (user.isModified('password') || user.isNew) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) {
				return next(err)
			}
			bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) {
					return next(err)
				}
				user.password = hash
				next()
			})
		})
	} else {
		return next()
	}
})

UserSchema.methods.comparePassword = function (pw, cb) {
	bcrypt.compare(pw, this.password, (err, isMatch) => {
		if (err) {
			return cb(err)
		}
		cb(null, isMatch)
	})
}

export default mongoose.model('User', UserSchema)
