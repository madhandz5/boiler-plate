const {User} = require('../models/User')

let auth = (req, res, next) => {
//    인증처리

//    Get Token from Client
    let token = req.cookies.x_auth

//    Decode Token -> Find User
    User.findByToken(token, (err, user) => {
        if (err) throw err
        if (!user) return res.json({isAuth: false, error: true})

        req.token = token
        req.user = user
        next();
    })

//    User -> Ok

//    No User -> No

}

module.exports = {auth}
