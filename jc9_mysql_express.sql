create database jc9_mysql_express;
use jc9_mysql_express;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(90) NOT NULL,
    avatar VARCHAR(40),
    -- boolean bisa diisi 1/0/true/false
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE tasks(
id INT PRIMARY KEY auto_increment,
user_id INT NOT NULL,
description VARCHAR(255) NOT NULL,
completed boolean default false,
CONSTRAINT FK_userId
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

drop table tasks;
select * from users;
select * from tasks;

ALTER USER 'kennyosc'@'localhost' IDENTIFIED WITH mysql_native_password BY 'K3nnymysql'