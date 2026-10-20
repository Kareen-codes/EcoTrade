const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // مجلد حفظ الصور
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // استخدم الامتداد الأصلي
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }

});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('The file must be an image. (JPEG, PNG, GIF)'));
        }
    },

    limits: { fileSize: 1024 * 1024 * 2 }
});

module.exports = upload; 
