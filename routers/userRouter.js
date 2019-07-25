const conn = require('../connection')
const router = require('express').Router()
const bcrypt = require('bcrypt')

const isEmail = require('validator/lib/isEmail')

router.post('/users', (req,res)=>{
    var {username,name,email,password} = req.body

    if(!isEmail(email)){
        return res.send('Email is not valid')
    }

    // hash doang adalah proses async, sehingga harus pake .then atau await
    // tpi kalau hashSync menjadikannya menjadi proses Synchronous
    password = bcrypt.hashSync(password,8)

    const sql = `INSERT INTO users (username,name,email,password)
                VALUES ('${username}','${name}','${email}','${password}')`

    conn.query(sql, (err, results)=>{
        if(err){
            return res.send(err)
        }

        return res.send(results)
    })
})

module.exports = router