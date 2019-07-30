const mysql = require('mysql')

const conn = mysql.createConnection(
    {
        user: 'kennyosc',
        password: 'K3nnydb4free',
        host:'db4free.net',
        database: 'sql_express',
        port: 3306
    }
)

module.exports = conn