const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key')

const {User} = require("./models/User")

// Application /x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// Application /Json
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error(err))


app.get('/', (req, res) => res.send('Hello World!'))


app.post('/register', (req, res) => {

    //회원가입할 떄 필요한 정보들을 client 에서 가져오면 DB에 넣어준다.
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if (err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login', (req, res) => {

    //요청된 Email 을 DB 에서 찾음
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "입력한 Email 에 해당하는 유저가 없습니다."
            })
        }
        //요청된 Email 이 DB에 있다면 비밀번호가 맞는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({
                loginSuccess: false,
                message: "비밀번호가 틀렸습니다."
            })

            //비밀번호까지 맞으면, Token 생성하기
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err)

                // Token Cookie 에 저장
                res.cookie('x_auth', user.token)
                    .status(200)
                    .json({
                        loginSuccess: true,
                        userId: user._id
                    })
            })

        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
