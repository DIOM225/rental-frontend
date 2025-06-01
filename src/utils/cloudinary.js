// src/utils/cloudinary.js
import axios from 'axios';

export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'diom_unsigned'); // your preset name

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/dgpzat6o4/image/upload`,
    formData
  );

  return response.data.secure_url; // Return the uploaded image URL
}
