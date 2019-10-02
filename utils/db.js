const spicedPg = require("spiced-pg");
let db;

db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

exports.getImages = function() {
    return db
        .query(
            `SELECT *, (
                SELECT id FROM IMAGES
                ORDER BY id ASC
                LIMIT 1
            ) as "lowestId" FROM images
        ORDER BY id DESC
        LIMIT 8`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertImages = function(url, username, title, description) {
    return db
        .query(
            `INSERT INTO images (url, username, title, description)
     VALUES ($1, $2, $3, $4)
        RETURNING *`,
            [url, username, title, description]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getImageData = function(id) {
    return db
        .query(
            `SELECT *, (SELECT id FROM images
                WHERE id < $1
                ORDER BY id DESC
                LIMIT 1) as previd,
                (SELECT id FROM images
                    WHERE id> $1
                    ORDER BY id ASC
                    LIMIT 1) as nextid
            FROM images
            WHERE id=$1`,
            [id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertComments = function(comment, username, image_id) {
    return db
        .query(
            `INSERT INTO comments (comment, username, image_id)
     VALUES ($1, $2, $3)
        RETURNING *`,
            [comment, username, image_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};
exports.getCommentData = function(image_id) {
    return db
        .query(
            `SELECT * FROM comments
        WHERE image_id=$1
        ORDER BY id DESC`,
            [image_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getMoreImages = function(lowestId) {
    return db
        .query(
            `SELECT *, (
                SELECT id FROM IMAGES
                ORDER BY id ASC
                LIMIT 1
            ) as "lowestId" FROM images
            WHERE id < $1
        ORDER BY id DESC
        LIMIT 8`,
            [lowestId]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.deleteImage = function(image_id) {
    return db
        .query(`DELETE FROM images WHERE id=$1`, [image_id])
        .then(({ rows }) => {
            return rows;
        });
};
