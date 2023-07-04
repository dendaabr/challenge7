const mongoose = require('mongoose')
const dbconnect = require('../db')

//Call the db to connect the mongo db
dbconnect()

// User Schema
const UserSchema = mongoose.Schema({
    user_id: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String
    }
});

const User = module.exports = mongoose.model('users-game', UserSchema, 'users-game');

module.exports.authLogin = function (username, password, callback) {
    const query = { username, password }
    User.findOne(query, callback);
}

module.exports.register = function (username, password, callback) {
    const query = { username, password }
    User.insert(query, callback);
}

