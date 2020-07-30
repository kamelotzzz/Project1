var mongoose = require('mongoose');
var url = `${process.env.DB_PROTOCOL}://${process.env.DB_HOST}/${process.env.DB_DATABASE}`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
var db = mongoose.connection
db.on('error', console.log.bind(console, 'connecttion error'))
db.once('open', function() {
    console.log('connecting...');
})

module.exports = mongoose