var express = require('express');
var router = express.Router();
var userService = require('../bai2/service/accService')
var path = require('path')
var jwt = require('jsonwebtoken')
var nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;


var authAdmin = function(req, res, next) {
    var token = req.cookies.token
        // console.log(token);
    try {
        if (token) {
            var jwtDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
            userService.checkID(jwtDecode._id).then(function(data) {
                // console.log(data.role);
                if (data.role === "admin") {
                    next()
                } else if (data.role === "user") {
                    // res.json("You are not admin")
                    res.redirect("/Account/home-view");
                }
            })
        } else {
            // res.json("No token provided")
            res.redirect("/Account/gd-login");

        }
    } catch (error) {
        // res.json("Unauthorized")
        res.redirect("/Account/gd-login");

    }
}

// var authUser = function(req, res, next) {
//     var token = req.cookies.token
//     try {
//         if (token) {
//             var jwtDecode = jwt.verify(token, "nodemy");
//             userService.checkID(jwtDecode._id).then(function(data) {
//                 // console.log(data.role);
//                 if (data.role === "user") {
//                     return next()
//                 } else if (data.role === "user") {
//                     // res.json("You are not admin")
//                     res.redirect("/Account/gd-login");
//                 }
//             })
//         } else {
//             res.json("No token provided")
//         }
//     } catch (error) {
//         res.json("Unauthorized")
//     }
// }


var checkToken = function(req, res, next) {
    var token = req.cookies.token
    if (token === undefined) {
        res.redirect("/Account/gd-login")
    } else { next(); }
}

var tokenLogout = function(req, res, next) {
    var token = req.cookies.token
    if (!token) {
        res.redirect("/Account/gd-login")
    } else { next(); }
}

router.get('/home-data', authAdmin, function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/home.html"))
})

router.get('/home-view', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/home-view.html"))
})

router.get('/getAll', function(req, res, next) {
    userService.findAll().then(function(model) {
        res.json(model)
    }).catch(function(err) {
        console.log(err);
    })
})



router.get('/getPage1', function(req, res, next) {
    userService.findAll().limit(5).then(function(model) {
        res.json(model)
    }).catch(function(err) {
        console.log(err);
    })
})



router.get('/getPage/:page', function(req, res, next) {
    var page = parseInt(req.params.page);
    var perPage = (page - 1) * 5
    userService.findAll().skip(perPage).limit(5).then(function(model) {
        res.json(model)
    }).catch(function(err) {
        console.log(err);
    })
})


router.get('/getItem/:id', function(req, res, next) {
    var id = req.params.id;
    userService.checkID(id).then(function(data) {
        res.json(data)
    })
})

router.delete("/user/:id", function(req, res, next) {
    var id = req.params.id
    userService.deleteOne(id).then(function(data) {
        res.json("Deleted");
    }).catch(function(err) {
        res.json(err + "");
    })
})
router.put("/user/:id", async function(req, res, next) {
    console.log(req.body);
    var id = req.params.id
    var dataUser = await userService.checkID(id);
    console.log(dataUser);
    var userInfo = {}
    if (dataUser) {
        if (dataUser.username != req.body.username) {
            userInfo.username = req.body.username;
        }
        if (dataUser.password != req.body.password) {
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(req.body.password, salt);
            userInfo.password = hash;
            console.log(userInfo);
        }
        if (dataUser.age != req.body.age) {
            userInfo.age = req.body.age;
        }
        if (dataUser.email != req.body.email) {
            userInfo.email = req.body.email;
        }
        if (dataUser.school != req.body.school) {
            userInfo.school = req.body.school;
        }
        console.log(userInfo);
        userService.updateOne(id, userInfo).then(function(data) {
            res.json("updated")
        }).catch(function(err) {
            res.json(err + '')
        })
    } else {
        res.json({
            error: true,
            message: "cap nhap bi loi"
        })
    }


})
var checkTokenLogin = function(req, res, next) {
    var token = req.cookies.token
    if (token) {
        var jwtDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        userService.checkID(jwtDecode._id).then(function(data) {
            if (data.role === "admin")
                res.redirect("/Account/home-data");
            else if (data.role === "user")
                res.redirect("/Account/home-view");
        })
    } else {
        next();
    }
}

router.get('/gd-login', checkTokenLogin, function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/Login.html"))
})
router.post("/login", function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    userService.checkUser(username).then(function(data) {
        if (data.length > 0) {
            bcrypt.compare(password, data[0].password, function(err, result) {
                //     // result == true
                if (result) {
                    if (data[0].isActive) {
                        var token = jwt.sign({ _id: data[0]._id }, process.env.JWT_SECRET_KEY, { algorithm: 'HS256', expiresIn: "1h" });
                        // console.log("day la token:" + token);
                        res.cookie("token", token, { maxAge: 5 * 60 * 1000 })
                        return res.json({
                            error: false,
                            message: "Đăng nhập thành công",
                            dataUser: data,
                            // token: token
                        })
                    } else if (!data[0].isActive) {
                        res.json({ error: true, message: "Bạn chưa xác thực email!" })
                    }
                } else {
                    return res.json({
                        error: true,
                        message: "Sai tài khoản hoặc mật khẩu"
                    })
                }
            });
        } else {
            return res.json({
                error: true,
                message: "Sai tài khoản hoặc mật khẩu"
            })
        }
    })
})


router.get("/logout", function(req, res, next) {
    res.clearCookie('token');
    res.send("clear");
})

router.get('/gd-addData', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/Create.html"))
})


//send mail
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ACCOUNT_EMAIL,
        pass: process.env.PASSWORD_EMAIL
    }
});

var mailOptions = function(email, url) {
    return mailOptions = {
        from: process.env.ACCOUNT_EMAIL,
        to: email,
        subject: 'Verify Account',
        html: `<p>Click on this <a href="${url}">link</a> to verify:</p>
                `
    };

}

var sendMail = function(email, url) {
    transporter.sendMail(mailOptions(email, url), function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}




router.post('/CreateAccount', function(req, res, next) {
        var username = req.body.username;
        userService.checkUser(username).then(function(data) {
            if (data.length > 0) {
                return res.json({
                    error: true,
                    message: 'username da ton tai'
                })
            }
            next();
        }).catch(function(err) {
            res.json(err + '')
        })
    },
    function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        var age = req.body.age;
        var school = req.body.school;
        bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            userService.addData(username, hash, email, age, school).then(function() {
                next();
            }).catch(function(err) {
                res.json(err)
            })
        });
    },
    function(req, res, next) {
        var username = req.body.username;
        var email = req.body.email;
        userService.checkUser(username).then(function(user) {
            var tokenEmail = jwt.sign({ _id: user[0]._id }, process.env.JWT_SECRET_KEY, { algorithm: 'HS256', expiresIn: "1h" });
            // console.log(tokenEmail);
            var url = `http://localhost:3003/Account/verify/${tokenEmail}`
            sendMail(email, url);
            res.json({
                error: false,
                message: 'Đăng kí thành công',
            })
        })
    }
)

router.get('/verify/:tokenEmail', function(req, res, next) {
    tokenEmail = req.params.tokenEmail
    var tokenEmailDecode = jwt.verify(tokenEmail, process.env.JWT_SECRET_KEY)
    console.log(tokenEmailDecode);
    userService.changeAtive(tokenEmailDecode).then(function() {
        res.redirect('/Account/gd-login')
    })
})


router.get('/gd-forgotPassword', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/ForgotPass.html"))
})
router.post('/forgot-password', function(req, res, next) {
    email = req.body.email;
    username = req.body.username;
    userService.findEmailAndUser(username, email).then(function(data) {
        if (data) {
            var tokenEmail = jwt.sign({ _id: data._id }, process.env.JWT_SECRET_KEY, { algorithm: 'HS256', expiresIn: "1h" });
            res.cookie('token', tokenEmail, { maxAge: 1000 * 60 * 15 })
            console.log(tokenEmail);
            var url = `http://localhost:3003/Account/verify-changePassword/${tokenEmail}`;
            sendMail(email, url)
            res.json({
                error: false,
                message: 'Hãy xác thực email!!',
            })
        } else {
            res.json({
                error: true,
                message: "user or email not found"
            })
        }
    })
})

router.get('/verify-changePassword/:tokenEmail', function(req, res, next) {
    tokenEmail = req.params.tokenEmail
    var tokenEmailDecode = jwt.verify(tokenEmail, process.env.JWT_SECRET_KEY)
    console.log(tokenEmailDecode);
    if (tokenEmailDecode) {
        res.redirect('/Account/gd-changePassword')
    }
})

router.get('/gd-changePassword', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/ChangePasswordForm.html"))
})

router.put('/changePassword', function(req, res, next) {
    var token = req.cookies.token
    var idDecode = jwt.verify(token, process.env.JWT_SECRET_KEY)
    var nPassword = req.body.newPassword
    bcrypt.hash(nPassword, saltRounds, function(err, hash) {
        userService.updatePassword(idDecode._id, hash).then(function(data) {
            res.clearCookie("token")
            res.json({ error: false, message: 'thay doi mat khau thanh cong' })
        })
    })
})




router.get('/viewJquery', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../View/viewAjaxJquery.html"))
})

module.exports = router;