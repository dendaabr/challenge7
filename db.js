const mongoose = require('mongoose')

function connect() {
    mongoose.set('useCreateIndex', true);
    mongoose.connect('mongodb://127.0.0.1/chapter7', { useNewUrlParser: true })
}

module.exports = connect