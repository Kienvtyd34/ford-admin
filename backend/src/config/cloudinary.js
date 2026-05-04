import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

//Cấu hình thông số Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//Thiết lập lưu trữ
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder: 'ford_cars', //thư mục lưu ảnh
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const uploadCloud = multer({storage});
export default uploadCloud;