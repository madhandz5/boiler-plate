const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

const config = require('./config/key')

const {User} = require("./models/User")

// Application /x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// Application /Json
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error(err))


app.get('/', (req, res) => res.send('Hello World!'))


app.post('/register', (req, res) => {

//    회원가입할 떄 필요한 정보들을 client 에서 가져오면 DB에 넣어준다.
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if (err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
