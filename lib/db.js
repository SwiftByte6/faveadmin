import { supabaseHelpers } from './supabase';

export const insertProduct = async (productData) => {
  try {
    const { data, error } = await supabaseHelpers.createProduct(productData);
    return { data, error };
  } catch (error) {
    console.error('Error inserting product:', error);
    return { data: null, error };
  }
};

export const updateProductData = async (id, productData) => {
  try {
    const { data, error } = await supabaseHelpers.updateProduct(id, productData);
    return { data, error };
  } catch (error) {
    console.error('Error updating product:', error);
    return { data: null, error };
  }
};

export const deleteProductData = async (id) => {
  try {
    const { data, error } = await supabaseHelpers.deleteProduct(id);
    return { data, error };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { data: null, error };
  }
};


