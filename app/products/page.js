'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Icon from '../../components/ui/Icon';
import ImageCropper from '../../components/ui/ImageCropper';
import { supabaseHelpers } from '../../lib/supabase';
import { uploadImages } from '../../lib/storage';
import { insertProduct } from '../../lib/db';
import Image from 'next/image';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [rating, setRating] = useState('');
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSizeCheckboxChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedSizes([...selectedSizes, value]);
    } else {
      setSelectedSizes(selectedSizes.filter(size => size !== value));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // For now, just add the first file to crop
      const file = files[0];
      setImageToCrop(file);
      setShowImageCropper(true);
    }
  };

  const handleMultipleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Add all files directly without cropping for now
      setSelectedImages(prev => [...prev, ...files]);
    }
  };

  const handleCropComplete = (croppedFile) => {
    setSelectedImages(prev => [...prev, croppedFile]);
    setShowImageCropper(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop(null);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseHelpers.getProducts();
      
      if (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        // Fallback to mock data for women's fashion
        setProducts([
          { id: 1, title: "Floral Summer Dress", price: 89.99, quantity: 45, category: "clothing", images: ["👗"], description: "Beautiful floral summer dress" },
          { id: 2, title: "Designer Handbag", price: 199.99, quantity: 23, category: "accessories", images: ["👜"], description: "Elegant designer handbag" },
          { id: 3, title: "High Heel Sandals", price: 129.99, quantity: 67, category: "shoes", images: ["👠"], description: "Stylish high heel sandals" },
          { id: 4, title: "Statement Necklace", price: 49.99, quantity: 12, category: "jewelry", images: ["💎"], description: "Eye-catching statement necklace" },
          { id: 5, title: "Silk Scarf", price: 39.99, quantity: 89, category: "accessories", images: ["🧣"], description: "Luxurious silk scarf" },
          { id: 6, title: "Designer Sunglasses", price: 159.99, quantity: 3, category: "accessories", images: ["🕶️"], description: "Trendy designer sunglasses" },
          { id: 7, title: "Cashmere Sweater", price: 179.99, quantity: 7, category: "clothing", images: ["🧥"], description: "Soft cashmere sweater" },
          { id: 8, title: "Pearl Earrings", price: 89.99, quantity: 15, category: "jewelry", images: ["👂"], description: "Classic pearl earrings" }
        ]);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (quantity) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity <= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-pink-100 text-pink-800';
  };

  const getStatusText = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
  };

  // Button handlers
  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSizes(product.sizes || []);
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabaseHelpers.deleteProduct(productId);
        if (error) {
          console.error('Error deleting product:', error);
          setError('Failed to delete product');
        } else {
          setProducts(products.filter(p => p.id !== productId));
          setSuccessMessage('Product deleted successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to delete product');
      }
    }
  };

  const handleImportProducts = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Import functionality would process: ${file.name}`);
        // Here you would implement the actual import logic
      }
    };
    input.click();
  };

  const handleExportProducts = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const title = product.title || '';
    const description = product.description || '';
    const category = product.category || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || 
                           category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div>
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      
       �<Header />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
            <p className="text-gray-600">Manage your fashion inventory and product catalog</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleAddProduct}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
                >
                  <Icon name="products" className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
                <button 
                  onClick={handleImportProducts}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Import Products
                </button>
                <button 
                  onClick={handleExportProducts}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Export Products
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>All Categories</option>
                  <option>Clothing</option>
                  <option>Shoes</option>
                  <option>Accessories</option>
                  <option>Jewelry</option>
                  <option>Bags</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Product List</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image
                          src={product.images?.[0] }
                          width={100}
                          height={100}
                          alt=''
                          />
                          
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.quantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.quantity)}`}>
                          {getStatusText(product.quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">Add New Product</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                  setSelectedImages([]);
                  setSelectedSizes([]);
                  setRating('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex-shrink-0">
                {error}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-product-form" onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setError(null);
                
                const formData = new FormData(e.target);
                
                try {
                  // Upload images if any
                  let imageUrls = [];
                  if (selectedImages.length > 0) {
                    imageUrls = await uploadImages(selectedImages);
                  } else {
                    // Fallback to emoji if no images uploaded
                    imageUrls = [formData.get('image') || '👗'];
                  }

                  const newProduct = {
                    title: formData.get('title'),
                    price: parseFloat(formData.get('price')),
                    quantity: parseInt(formData.get('quantity')),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    images: imageUrls,
                    rating: parseFloat(formData.get('rating')) || 0,
                    sizes: selectedSizes
                  };
                  
                  const { data, error } = await insertProduct(newProduct);
                  if (error) {
                    console.error('Error creating product:', error);
                    setError('Failed to create product: ' + error.message);
                  } else {
                    setProducts([data, ...products]);
                    setShowAddModal(false);
                    setSuccessMessage('Product added successfully!');
                    e.target.reset(); // Reset form
                    setSelectedImages([]);
                    setSelectedSizes([]);
                    setRating('');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }
                } catch (err) {
                  console.error('Error:', err);
                  setError('Failed to create product: ' + err.message);
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                      <input type="text" name="title" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                        <option value="">Select category</option>
                        <option value="Kurtis">Kurtis</option>
                        <option value="Lehengas">Lehengas</option>
                        <option value="Sarees">Sarees</option>
                        <option value="Western Wear">Western Wear</option>
                        <option value="Co-ords">Co-ords</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  {/* Price, Quantity, Rating */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input type="number" step="0.01" name="price" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input type="number" name="quantity" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                      <input type="number" name="rating" min="1" max="5" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"></textarea>
                  </div>

                  {/* Available Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {sizeOptions.map(size => (
                        <label key={size} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            value={size}
                            checked={selectedSizes.includes(size)}
                            onChange={handleSizeCheckboxChange}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
                    <div className="flex flex-wrap gap-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-xs text-gray-500 text-center">Upload & Crop</span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                      
                      {/* Multiple Image Upload without cropping */}
                      <div className="mt-4">
                        <label
                          htmlFor="multiple-image-upload"
                          className="flex items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="w-6 h-6 mr-2 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span className="text-sm text-gray-500">Upload Multiple (No Crop)</span>
                        </label>
                        <input
                          id="multiple-image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleImageSelect}
                          className="hidden"
                        />
                      </div>

                      {/* Image previews */}
                      {selectedImages.map((img, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 relative group"
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setImageToCrop(img);
                                  setShowImageCropper(true);
                                }}
                                className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                                title="Crop"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                title="Remove"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Upload images with crop & rotate options, or use emoji fallback below</p>
                  </div>

                  {/* Emoji Fallback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image (Emoji Fallback)</label>
                    <input type="text" name="image" placeholder="👗" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                  setSelectedImages([]);
                  setSelectedSizes([]);
                  setRating('');
                }} 
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="add-product-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{isSubmitting ? 'Adding...' : 'Add Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setError(null);
                  setSelectedSizes([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex-shrink-0">
                {error}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-product-form" onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              
              const formData = new FormData(e.target);
              const updates = {
                title: formData.get('title'),
                price: parseFloat(formData.get('price')),
                quantity: parseInt(formData.get('quantity')),
                category: formData.get('category'),
                description: formData.get('description'),
                images: [formData.get('image')],
                rating: parseFloat(formData.get('rating')) || 0,
                sizes: selectedSizes
              };
              
              try {
                const { data, error } = await supabaseHelpers.updateProduct(selectedProduct.id, updates);
                if (error) {
                  console.error('Error updating product:', error);
                  setError('Failed to update product: ' + error.message);
                } else {
                  setProducts(products.map(p => p.id === selectedProduct.id ? data : p));
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setSuccessMessage('Product updated successfully!');
                  setTimeout(() => setSuccessMessage(''), 3000);
                }
              } catch (err) {
                console.error('Error:', err);
                setError('Failed to update product: ' + err.message);
              } finally {
                setIsSubmitting(false);
              }
            }}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                      <input type="text" name="title" defaultValue={selectedProduct.title} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select name="category" defaultValue={selectedProduct.category} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                        <option value="">Select category</option>
                        <option value="Kurtis">Kurtis</option>
                        <option value="Lehengas">Lehengas</option>
                        <option value="Sarees">Sarees</option>
                        <option value="Western Wear">Western Wear</option>
                        <option value="Co-ords">Co-ords</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  {/* Price, Quantity, Rating */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input type="number" step="0.01" name="price" defaultValue={selectedProduct.price} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input type="number" name="quantity" defaultValue={selectedProduct.quantity} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                      <input type="number" name="rating" min="1" max="5" step="0.1" defaultValue={selectedProduct.rating || 0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" rows="3" defaultValue={selectedProduct.description} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"></textarea>
                  </div>

                  {/* Available Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {sizeOptions.map(size => (
                        <label key={size} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            value={size}
                            checked={selectedSizes.includes(size)}
                            onChange={handleSizeCheckboxChange}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image (Emoji)</label>
                    <input type="text" name="image" defaultValue={selectedProduct.images?.[0]} placeholder="👗" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setError(null);
                  setSelectedSizes([]);
                }} 
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="edit-product-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{isSubmitting ? 'Updating...' : 'Update Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">{selectedProduct.images?.[0]}</div>
                  <h4 className="text-xl font-semibold">{selectedProduct.title}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Price</label>
                  <p className="text-lg font-semibold text-gray-900">₹{selectedProduct.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Stock</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedProduct.quantity} units</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900 capitalize">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rating</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedProduct.rating || 'N/A'} ⭐</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProduct.quantity)}`}>
                    {getStatusText(selectedProduct.quantity)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Available Sizes</label>
                  <div className="flex flex-wrap gap-1">
                    {(selectedProduct.sizes || []).map(size => (
                      <span key={size} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-900">{selectedProduct.description}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }} 
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={showImageCropper}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        imageFile={imageToCrop}
        aspectRatio={1} // Square aspect ratio for product images
      />
    </div>
  );
};

export default ProductsPage;
