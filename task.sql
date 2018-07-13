CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    description VARCHAR NOT NULL,
    done BOOLEAN,
    userid INTEGER NOT NULL
);