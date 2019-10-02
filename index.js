const express = require("express");
const {
    getImages,
    insertImages,
    getImageData,
    insertComments,
    getCommentData,
    getMoreImages,
    deleteImage
} = require("./utils/db.js");

const app = express();
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const config = require("./config");

// file upload bilerplate
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

app.use(express.json());

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
// ///////////// itlistens to the file, handles it and send it to upload directory

app.use(express.static("public"));

app.get("/images", (req, res) => {
    getImages()
        .then(data => {
            // console.log("IMAGES DATA ", data);

            res.json(data);
        })
        .catch(error => {
            console.log(error);
        });
});

app.post("/comments", (req, res) => {
    // req.file refers to the file that was just uploaded
    // req.body still refers to the values we type in the input fields

    const { comment, username, image_id } = req.body;
    // console.log("BODY IS ", comment, username, image_id);

    insertComments(comment, username, image_id)
        .then(data => {
            // console.log("LAST UPLOADED COMMENTS", data);
            res.json(data);
        })
        .catch(error => {
            console.log(error);
            res.json(false);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // req.file refers to the file that was just uploaded
    // req.body still refers to the values we type in the input fields

    const { filename } = req.file;
    const url = config.s3Url + filename;
    // console.log(url);
    const { title, username, description } = req.body;

    insertImages(url, username, title, description)
        .then(data => {
            // console.log("LAST UPLOADED DATA", data);
            res.json(data);
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/imagedata/:image_id", (req, res) => {
    Promise.all([
        getImageData(req.params.image_id),
        getCommentData(req.params.image_id)
    ])
        .then(data => {
            console.log("DATA", data);
            // console.log("PREVIOUS ID", res.data[0][0].prevID);
            // console.log("NEXT ID", res.data[0][0].nextID);
            // let time = new Date(res.data[1][0].created_at);
            // console.log("TIME", time);
            res.json(data);
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/moreimages/:lowestId", (req, res) => {
    getMoreImages(req.params.lowestId)
        .then(data => {
            // console.log("IMAGES DATA ", data);
            // console.log("More images", data);
            res.json(data);
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/delete/:image_id", (req, res) => {
    console.log("IMAGE ID", req.params.image_id);
    deleteImage(req.params.image_id)
        .then(() => {
            res.sendStatus("200");
        })
        .catch(error => {
            console.log(error);
        });
});

app.listen(8080, () => {
    console.log("My image board server is UP");
});
