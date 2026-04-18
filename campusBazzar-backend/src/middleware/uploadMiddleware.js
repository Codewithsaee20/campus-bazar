import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../utils/ApiError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only jpg, jpeg, png, and webp are allowed.', 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 3 },
});

const multerUpload = upload.array('images', 3);

export const uploadImages = (req, res, next) => {
  multerUpload(req, res, async (err) => {
    if (err) {
      return next(
        err instanceof ApiError
          ? err
          : new ApiError(400, err.message, 'UPLOAD_ERROR')
      );
    }

    try {
      let oldImageIds = req.body.oldImagePublicIds;
      if (oldImageIds) {
        if (typeof oldImageIds === 'string') {
          try {
            // It might be a JSON stringified array if sent from FormData
            const parsed = JSON.parse(oldImageIds);
            oldImageIds = Array.isArray(parsed) ? parsed : [oldImageIds];
          } catch (e) {
            oldImageIds = [oldImageIds];
          }
        }
        
        if (Array.isArray(oldImageIds) && oldImageIds.length > 0) {
          const deletePromises = oldImageIds.map(id => cloudinary.uploader.destroy(id));
          await Promise.all(deletePromises);
        }
      }

      req.uploadedImages = [];
      
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'campusbazar/listings' },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                  });
                }
              }
            );
            
            uploadStream.end(file.buffer);
          });
        });

        req.uploadedImages = await Promise.all(uploadPromises);
      }
      
      next();
    } catch (error) {
      next(new ApiError(500, 'Image processing failed to complete', 'CLOUDINARY_ERROR'));
    }
  });
};
