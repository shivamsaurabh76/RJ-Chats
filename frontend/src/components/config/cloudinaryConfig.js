const cloudinaryConfig = {
  uploadUrl: process.env.REACT_APP_CLOUDINARY_URL,
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
};

export default cloudinaryConfig;