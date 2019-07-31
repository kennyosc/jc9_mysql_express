const express = require('express')
const server = express()
const mysql = require('mysql')

//process.env.PORT adalah port yang nantinya diberikan oleh heroku secara otomatis
// klau tidak ada port dari tempat lainnya, maka akan dijalankan 2019
const port = require('./src/config/port.js')

const userRouter = require('./src/routers/userRouter.js')
const taskRouter = require('./src/routers/taskRouter.js')

server.use(express.json())
server.use(userRouter)
server.use(taskRouter)


server.listen(port, ()=>{
    console.log('Connected to port ' + port)
})

/*
UPLOAD HEROKU
1. heroku login
2. heroku create <nama project>
3. git add .
4. git commit -m ''
5. git push origin master
6. git push heroku master
 */