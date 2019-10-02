DROP TABLE IF EXISTS images;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR(300) NOT NULL CHECK (url <> ''),
    username VARCHAR(255) NOT NULL CHECK (username <> ''),
    title VARCHAR(255) NOT NULL CHECK (title <> ''),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment VARCHAR(280) NOT NULL CHECK (comment <> ''),
    username VARCHAR(255) NOT NULL CHECK (username <> ''),
    image_id INT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
