const express = require('express')
const server = express()
const mysql = require('mysql')

const port = 2019

const userRouter = require('./src/routers/userRouter.js')
const taskRouter = require('./src/routers/taskRouter.js')

server.use(express.json())
server.use(userRouter)
server.use(taskRouter)


server.listen(port, ()=>{
    console.log('Connected to port ' + port)
})