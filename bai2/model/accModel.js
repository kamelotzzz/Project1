var mongoose = require('../config/connectDB');

var Schema = mongoose.Schema;
var AccSchema = new Schema({
    username: String,
    password: String,
    email: String,
    age: Number,
    school: String,
    role: {
        type: String,
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { collection: "Account" })

var AccModel = mongoose.model("Account", AccSchema)


module.exports = AccModel