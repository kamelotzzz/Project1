require('dotenv').config();
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path')
var userRouter = require('./router/userRouter.js')
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(__dirname));
// app.use(express.static("public"));


app.use('/Account', userRouter)









// app.get('/Account/getPage/:id', function (req, res, next) {
//     var id = req.params.id;
//     var perpage = (id - 1) * 3;
//     AccModel.find().skip(perpage).limit(3).then(function (model) {
//         res.json(model)
//     }).catch(function (err) {
//         console.log(err);
//     })
// })

app.use('/router1', userRouter)

app.listen(process.env.PORT, function() {
    console.log('dang ket noi tai cong ' + process.env.PORT);
})