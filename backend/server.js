const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// استيراد الوظائف والمكونات الأخرى
const connectDB = require('./config/db.config');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const scrapItems = require('./routes/scrapItemsRoutes');
require('./scheduled/cronJobs'); // استيراد وظائف الجدولة إذا كانت ضرورية

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// إعداد التطبيق
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow frontend to connect
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// إعداد المكونات الوسيطة
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// التحقق من وجود مفتاح JWT — بدونه سيفشل تسجيل الدخول
if (!process.env.JWT_SECRET) {
    console.error('❌  JWT_SECRET is missing! Add it to backend/.env — login and token verification will fail without it.');
}

// الاتصال بقاعدة البيانات
connectDB();

// إعداد المسارات
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/scrap', scrapItems);

// بدء الخادم
app.listen(PORT, () => {
    console.log(`✅  Server is running on http://localhost:${PORT}`);
});
