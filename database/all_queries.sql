CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL
);

ALTER table admin ADD column total_bank_deposits INT;
ALTER table admin ADD column total_lent_amount INT;

insert into admin(name,email,password,total_bank_deposits,total_lent_amount) values('saif','saif981@gmail.com','saif123',0,0);
select * from admin;

CREATE TABLE transfer(
	id INT AUTO_INCREMENT PRIMARY KEY,
    sender INT NOT NULL,
    receiver INT NOT NULL,
    amount INT
);
alter table transfer add column admin_id INT NOT NULL;

CREATE TABLE loan(
	id INT AUTO_INCREMENT PRIMARY KEY,
    account INT NOT NULL,
    amount INT,
    admin_id INT NOT NULL
);

CREATE TABLE deposit(
	id INT AUTO_INCREMENT PRIMARY KEY,
    account INT NOT NULL,
    amount INT,
    admin_id INT NOT NULL
);

CREATE TABLE withdraw(
	id INT AUTO_INCREMENT PRIMARY KEY,
    account INT NOT NULL,
    amount INT,
    admin_id INT NOT NULL
);

show tables;

CREATE TABLE customer(
	account_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name varchar(50) NOT NULL,
    email varchar(200) NOT NULL UNIQUE,
	password varchar(200) NOT NULL,
    balance INT,
    loan INT,
    message_id INT NOT NULL
);

CREATE table message_box(
	id INT NOT NULL,
    date datetime default CURRENT_TIMESTAMP,
    message TEXT
);

insert into 
	customer(account_no,name,email,password,balance,loan,message_id) 
	values(102030,'saif','saif2@gmail.com','saif20',0,0,1);
insert into 
	customer(name,email,password,balance,loan,message_id) 
	values('mush','mush@gmail.com','saif20',0,0,2);    
select * from customer;

select * from transfer;
select * from customer;

alter table message_box add column serial INT PRIMARY KEY auto_increment;
desc message_box;
