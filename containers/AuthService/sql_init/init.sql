SET GLOBAL event_scheduler=ON;
-- SET GLOBAL max_allowed_packet = 1024 * 1024 * 256;
-- SET GLOBAL interactive_timeout=6000;

CREATE DATABASE IF NOT EXISTS auth;
USE auth;

CREATE TABLE IF NOT EXISTS users (
    username varchar(50) PRIMARY KEY,
    password varchar(200) NOT NULL,
    email varchar(50),
    role varchar(8) CHECK (role='player' OR role='official' OR role='admin')
);

CREATE TABLE IF NOT EXISTS tokens (
    username varchar(50),
    token varchar(50) PRIMARY KEY,
    creation date,
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE EVENT token_expiration
	ON SCHEDULE EVERY 1 DAY
	DO
		DELETE FROM tokens WHERE DATEDIFF(creation, GETDATE())>7;
