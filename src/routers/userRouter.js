const conn = require('../connection')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const fs = require('fs')
const multer = require('multer')

const isEmail = require('validator/lib/isEmail')
const path = require('path')

const verifyEmail = require('../nodemailer/kirimemail.js')

//npm i --save nodemailer
// untuk send email verifikasi / email apapun

// PHOTO DIRECTORY
const rootdir = path.join(__dirname,'/../..')
//C:\Users\Kenny Oscar\Desktop\JC-9\jc9_backEndDev\jc9_sql_express
const photosdir = path.join(rootdir, '/upload/photos')

// configurasi storage untuk menaruh file
const folder = multer.diskStorage(
    {
        destination: function(req,file,cb){
            //photodir tempat kita akan menaruh images yang diupload oleh user
            cb(null, photosdir)
        },
        //pemberian nama pada file yang diupload
        filename: function(req,file,cb){
            // ex: 2019-0-26 'nama_file' . jpg/png/jpeg
            // console.log(file)
            /*
            { fieldname: 'apatar',
            originalname: 'destiny_avatar.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg' }
            */
           // di postman, harus di atasnya uname dulu, baru di bawahnya upload file avatar
            cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname))
        }
    }
)

const uploadStore = multer(
    {
        storage: folder,
        limits:{
            fileSize: 1000000 //byte
        },
        fileFilter(req,file,cb){
            if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
                cb(undefined, true)
            } else{
                cb(new Error('Please upload a .jpg .png .jpeg photo'))
            }
        }
    }
)


// USER BARU
router.post('/users', (req,res)=>{
    // var {username,name,email,password} = req.body

    //ada cara yang lebih singkat untuk membuat sql query
    // SET itu datang dari npm mysql, dimana akan diconvert jadi INSERT INTO ... VALUES...
    const sql1 = 'INSERT INTO users SET ?'
    const sql2 = 'SELECT * FROM users where id = ?'
    const data = req.body

    if(!isEmail(data.email)){
        return res.send('Email is not valid')
    }

    // MEMBUAT PASSWORD MENJADI HASH
    // hash doang adalah proses async, sehingga harus pake .then atau await
    // tpi kalau hashSync menjadikannya menjadi proses Synchronous
    data.password = bcrypt.hashSync(data.password,8)

    // const sql = `INSERT INTO users (username,name,email,password)
    //             VALUES ('${username}','${name}','${email}','${password}')`

    
    // MENJALANKAN QUERY
    // .query menerima 3 paramater(query yang ingin dijalankan, datanya apa, callback function)
    conn.query(sql1, data ,(err, results)=>{
        if(err){
            return res.send(err)
        }

        // res.send(results)
        /*
        hasil results
            {
                "fieldCount": 0,
                "affectedRows": 1,
                "insertId": 7,
                "serverStatus": 2,
                "warningCount": 0,
                "message": "",
                "protocol41": true,
                "changedRows": 0
            }
         */

        conn.query(sql2, results.insertId, (err, results2)=>{
            if(err){
                return res.send(err)
            }

            // ini adalah sebuah function yang diambil dari kirimemail.js
            //kirim email verifikasi
            verifyEmail(results2[0])

            res.send(results2)
        })
    })
})


// POST AVATAR PADA :USER_ID
router.post('/users/avatar', uploadStore.single('apatar'),(req,res)=>{
    const sql = 'SELECT * FROM users WHERE username = ?'
    const data = req.body.uname

    conn.query(sql,data, (err,results)=>{

        //kalau if 1 baris saja dengan return, tidak perlu kurung kurawal
        if(err) return res.send(err)

        // hasil results dalam bentuk array
        // kalau kita nyari 1 data saja, maka pasti akan dalam array 0
        const user = results[0]

        if(!user){
            return res.send('User not found')
        }

        //ketika uploadStore.single itu berhasil dilaksanakan
        // maka di dalam req(selain req.body, req.query, req.params) maka akan bertambah yang baru yaitu req.file
        const sql2 = `UPDATE users SET avatar='${req.file.filename}' WHERE username='${req.body.uname}'`

        conn.query(sql2, (err,results2)=>{
            if(err){
                return res.send(err)
            }

            res.send({
                status:'UPLOAD_SUCCESS',
                avatar_file: req.file.filename,
                log: results2
            })
            
        })
    })
})


// READ IMAGE
router.get('/users/avatar/:imageName', (req,res)=>{
    const options = {
        root: photosdir
    }

    const filename = req.params.imageName

    //res.sendFile(path [, options] [, fn])
    // Transfers the file at the given path
    //res.sendFile itu untuk  respon dari Node untuk mengirimkan image yang kita cari
    // image yang kita cari terdapat di const options dengan parameter filename
    res.sendFile(filename, options, function(err){
        if(err) return res.send(err)
    })
    
})

//DELETE AVATAR FROM USER
router.delete('/users/avatar', (req,res)=>{
    console.log(req.body.username)
    const sql = `SELECT * FROM users where username = '${req.body.username}'`
    const sql2 = `UPDATE users SET avatar = null WHERE username = '${req.body.username}'`

    //MENCARI USERNYA TERLEBIH DAHULU
    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }

        //name file
        const filename = results[0].avatar
        const imgpath = photosdir + '/' + filename
        
        //DELETE IMAGE SETELAH KETEMU USERNYA
        fs.unlink(imgpath, (err)=>{
            if(err){
                return res.send(err)
            }

            // mengubah menjadi null
            conn.query(sql2,(err,results2)=>{
                if(err){
                    return res.send(err)
                }

                res.send('Delete berhasil')
            })
        })
    })
})

// READ PROFILE
router.get('/users/profile/:username', (req,res)=>{
    // query sql akan menentukan hasil yang diinginkan apa saja, jika kita akhirnya membutuhkan avatar, maka harus SELECT avatar
    const sql = 'SELECT username, name,email,avatar FROM users WHERE username = ?'
    const data = req.params.username

    conn.query(sql,data, (err,results)=>{
        if(err){
            res.send(err)
        }
        //hasil dari results adalah an array of objects
        /* 
        [
            {
                "id": 1,
                "username": "kennyosc",
                "name": "Kenny Oscar",
                "email": "kenny@gmail.com",
                "password": "$2b$08$dUIeOmx6cKHqppqvZBK/ruvAQFZGHtflo.uJCHl3OWk0Q2myqgywO",
                "avatar": "1564116736412_apatar.jpg",
                "verified": 0
            }
        ]
        */
        const user = results[0]

        if(!user){
            res.send('User not found')
        }
        
        //link yang kita masukkan di <img src=''>, itu akan di send dari backend.
        // makanya kita harus res.send()  avatar yang berupa link
        const {username,name,email,avatar} = user
        res.send({
            user:user,
            username: username,
            name: name,
            email: email,
            avatar: `localhost:2019/users/avatar/${avatar}`
        })

        /*
        {
            "user": {
                "username": "kennyosc",
                "name": "Kenny Oscar",
                "email": "kenny@gmail.com",
                "avatar": "1564116736412_apatar.jpg"
            },
            "username": "kennyosc",
            "name": "Kenny Oscar",
            "email": "kenny@gmail.com",
            "avatar": "localhost:2019/users/avatar/1564116736412_apatar.jpg"
        }
        */
    })
})

//UPDATE PROFILE
router.patch('/users/profile/:username', (req,res)=>{
    //query apa yang ingin dijalankan untuk update
    // bisa menggunakan 2 '?'
    // SET ? tidak perlu di specify mau update apanya, karena di postman akan dibuat dalam bentuk object... mungkin di front-end juga harus dalam bentuk object?
    /*
    ini di dalam req.body
    {
	"username":"hennytirta",
	"name":"Henny Tirta",
	"email":"henny@gmail.com"
    }
    */
    const sql = 'UPDATE users SET ? WHERE username = ?'
    // karena ? lebih dari 1, maka const data akan menggunakan array
    // pengisian data nya harus urut SESUAI DENGAN '?' yang ada 
    const data = [req.body, req.params.username]

    conn.query(sql, data, (err,results)=>{
        if(err){
            res.send(err)
        }

        /*
        {
            "fieldCount": 0,
            "affectedRows": 1,
            "insertId": 0,
            "serverStatus": 2,
            "warningCount": 0,
            "message": "(Rows matched: 1  Changed: 1  Warnings: 0",
            "protocol41": true,
            "changedRows": 1
        }
        */
       // jika kita tidak mau lihat data yang di update, maka langsung res.send(results)
       // REMEMBER, you can only res.send 1 time
        // res.send(results)

        //jika kita mau liat hasilnya seperti apa, maka harus dibuat query sql kedua
        const sql2 = `SELECT username,name, email FROM users WHERE username= '${req.params.username}'`

        conn.query(sql2, (err,results)=>{
            if(err){
                res.send(err)
            }

            res.send(results[0])
            /*
            {
                "username": "yoshuakelvin",
                "name": "Yoshua Kelvin Winaga",
                "email": "yoshuakelvin@gmail.com"
            }
            */
        })
    })
})

//VERIFY USER
// ini .get karena ingin menampilkan di browser 'VERIFIKASI BERHASIL'
// sama seperti web pada umumnya, setelah klik verifikasi, website akan get untuk menunjukkan page verifikasi berhasil
router.get('/verify', (req,res)=>{
    const sql = `UPDATE users SET verified = true WHERE username = '${req.query.username}'`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }
        res.send(`<h1>Verifikasi berhasil</h1>`)
    })
})

module.exports = router

/* 
_ _ dirname
console.log(__dirname) 

// C:\Users\Kenny Oscar\Desktop\JC-9\jc9_backEndDev\jc9_sql_express\routers

*/