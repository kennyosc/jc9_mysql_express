const router = require('express').Router()
const conn = require('../connection/index.js')

router.post('/tasks', (req,res)=>{
    const sql = `INSERT INTO tasks SET ?`
    const data = req.body

    conn.query(sql,data,(err,results)=>{
        if(err){
            return res.send(err)
        }

        // res.send(results)
        //sekarang mau mengambil results.insertId

        //kita ingin tahu data yang berhasil diinput
        const sql2 = `SELECT * FROM tasks where id = ${results.insertId}`

        conn.query(sql2, (err,results2)=>{
            if(err){
                return res.send(err)
            }

            res.send(results2[0])
        })
    })
})