const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxLength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function (next) {
    let user = this

    // 비밀번호를 저장할 때만 암호화한다.
    if (user.isModified('password'))
        //비밀번호를 암호화
        bcrypt.genSalt(saltRounds, (err, salt) => {

            if (err) return next(err)
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) return next(err)
                this.password = hash
                next()
            })
        })
    else {
        next()
    }

})

//Bcrypt로 입력한 비밀번호와 암호화된 비밀번호 비교하기
userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if (err) return cb(err)

        cb(null, isMatch)
    })
}

//JWT 로 토큰 만들기
userSchema.methods.generateToken = function (cb)  {
    let user = this

    let token = jwt.sign(this._id.toHexString(), 'secretToken')

    user.token = token
    user.save((err, user) => {
        if (err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function (token, cb)  {
    let user = this

//    Decode Token
    jwt.verify(token, 'secretToken', (err, decoded) => {
        //    _id 를 이용하여 유저를 찾고, 가져온 Token 과 DB의 Token 이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, (err, user) => {
            if (err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}
