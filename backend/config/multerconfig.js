
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const imageDirectory = path.join(__dirname, "..", "public", "images", "uploads");

fs.mkdirSync(imageDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imageDirectory);
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function (err, name) {
            if (err) return cb(err);

            const filename = name.toString("hex") + path.extname(file.originalname);
            cb(null, filename);
        });
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

module.exports = upload;
