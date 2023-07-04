const mongoose = require('mongoose')
const dbconnect = require('../db')

//Call the db to connect the mongo db
dbconnect()

// User Schema
const UserHistory = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('users-history', UserHistory, 'users-history');