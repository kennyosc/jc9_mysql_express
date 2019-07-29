const conn = require('../connection')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const fs = require('fs')
const multer = require('multer')

const isEmail = require('validator/lib/isEmail')
const path = require('path')

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
router.get('/users/avatar/:image', (req,res)=>{
    const options = {
        root: photosdir
    }

    const filename = req.params.image

    //res.sendFile(path [, options] [, fn])
    // Transfers the file at the given path
    res.sendFile(filename, options, function(err){
        if(err) return res.send(err)
    })
    
})

//DELETE AVATAR FROM USER
router.delete('/users/avatar', (req,res)=>{
    console.log(req.body.username)
    const sql = `SELECT * FROM users where username = '${req.body.username}'`
    const sql2 = `UPDATE users SET avatar = null WHERE username = '${req.body.username}'`

    conn.query(sql, (err,results)=>{
        if(err){
            return res.send(err)
        }

        //name file
        const filename = results[0].avatar
        const imgpath = photosdir + '/' + filename
        
        //delete image
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
    const sql = 'SELECT * FROM users WHERE username = ?'
    const data = req.params.usernamme

    conn.query(sql,data, (err,results)=>{
        if(err){
            res.send(err)
        }
        //hasil dari results adalah an array of objects
        res.send(results)
    })
})

module.exports = router

/* 
_ _ dirname
console.log(__dirname) 

// C:\Users\Kenny Oscar\Desktop\JC-9\jc9_backEndDev\jc9_sql_express\routers

*/