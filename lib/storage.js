const getCloudinaryConfig = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'products';

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  return { cloudName, uploadPreset, folder };
};

const toFile = (image, index) => {
  if (image instanceof File) {
    return image;
  }

  const fallbackName = `product-${Date.now()}-${index + 1}.jpg`;
  return new File([image], image?.name || fallbackName, {
    type: image?.type || 'image/jpeg',
  });
};

const uploadSingleImage = async (image, index) => {
  const { cloudName, uploadPreset, folder } = getCloudinaryConfig();
  const file = toFile(image, index);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Cloudinary upload failed');
  }

  return payload.secure_url || payload.url;
};

export const uploadImages = async (images) => {
  try {
    if (!Array.isArray(images) || images.length === 0) {
      return [];
    }

    return await Promise.all(images.map(uploadSingleImage));
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const deleteImage = async () => {
  throw new Error('Cloudinary deletion is not wired up in this client helper.');
};


