const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { INVALID_FILE_TYPE } = require("./errorMessages");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profile";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error(INVALID_FILE_TYPE), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = {
  uploadProfilePhoto: upload.single("photo"),
};
