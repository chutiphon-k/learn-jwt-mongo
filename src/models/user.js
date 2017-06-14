import mongoose, { Schema } from 'mongoose'

const User = mongoose.model('User', new Schema({
	name: String,
	password: String,
	admin: Boolean
}))

export default User
