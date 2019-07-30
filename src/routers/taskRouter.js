const router = require('express').Router()
const conn = require('../connection/index.js')

//POST 1 TASKS
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

//READ ALL TASK BY ID
router.get('/users/:user_id/tasks', (req,res)=>{
    const sql = `SELECT * FROM tasks WHERE user_id = ${req.params.user_id}`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }

        res.send(results)
    })
})

//UPDATE TASK BY ID
router.patch('/users/tasks/:id', (req,res)=>{
    const sql = `UPDATE tasks SET completed = true WHERE id = ${req.params.id}`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(results)
        }
        res.send(results)
    })
})

//DELETE TASK BY ID
router.delete('/users/:user_id/tasks/:id',(req,res)=>{
    const sql = `DELETE FROM tasks WHERE user_id = ${req.params.user_id} AND id = ${req.params.id}`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }

        res.send(results)
    })
})
module.exports = router