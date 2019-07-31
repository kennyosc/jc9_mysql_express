const express = require('express')
const app = express()
const mysql = require('mysql')
const port2 = require('./src/config/port.js')

//process.env.PORT adalah port yang nantinya diberikan oleh heroku secara otomatis
// klau tidak ada port dari tempat lainnya, maka akan dijalankan 2019
const port = port2

const userRouter = require('./src/routers/userRouter.js')
const taskRouter = require('./src/routers/taskRouter.js')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


server.listen(port, ()=>{
    console.log('Connected to port ' + port)
})