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



