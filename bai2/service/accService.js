var accModel = require('../model/accModel')

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function findAll() {
    return accModel.find()
}

function deleteOne(id) {
    return accModel.deleteOne({ _id: id })
}

function updateOne(id, userInfo) {
    return accModel.updateOne({ _id: id }, userInfo, { new: true })
}


function addData(username, password, email, age, school) {
    return accModel.create({
        username: username,
        password: password,
        email: email,
        age: age,
        school: school
    })
}

function checkLogin(username, password) {
    return accModel.find({
        username: username,
        password: password
    })
}

function checkUser(username) {
    return accModel.find({ username: username })
}

function checkID(id) {
    return accModel.findById({ _id: id })
}

function changeAtive(id) {
    return accModel.updateOne({ _id: id }, { isActive: true }, { new: true })
}

function findEmailAndUser(username, email) {
    return accModel.findOne({ username: username, email: email })
}

function updatePassword(id, password) {
    return accModel.updateOne({ _id: id }, { password: password }, { new: true })
}

module.exports = {
    isEmpty: isEmpty,
    findAll: findAll,
    addData: addData,
    checkLogin: checkLogin,
    checkUser: checkUser,
    deleteOne: deleteOne,
    updateOne: updateOne,
    checkID: checkID,
    changeAtive: changeAtive,
    findEmailAndUser: findEmailAndUser,
    updatePassword: updatePassword,
}