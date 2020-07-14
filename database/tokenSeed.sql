-- DROP DATABASE IF EXISTS cryptoAPI;
CREATE DATABASE cryptoAPI;

USE cryptoAPI;
CREATE TABLE tokens
(
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    address VARCHAR(50) NOT NULL,
    decimals INT(10) NOT NULL,
    removed_account_1 VARCHAR(50),
    removed_account_2 VARCHAR(50),
    removed_account_3 VARCHAR(50),
    removed_account_4 VARCHAR(50),
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- ON UPDATE CURRENT_TIMESTAMP
    PRIMARY KEY(id)
);