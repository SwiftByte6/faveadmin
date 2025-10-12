import { supabase } from './supabase';

export const uploadImages = async (images) => {
  try {
    const uploadPromises = images.map(async (image) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, image);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};


