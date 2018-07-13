CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    email varchar UNIQUE,
    password varchar
);