'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ImageCropper = ({ 
  isOpen, 
  onClose, 
  onCropComplete, 
  imageFile, 
  aspectRatio = 1 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async (imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        const rotRad = (rotation * Math.PI) / 180;

        // Calculate bounding box of the rotated image
        const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
          image.width,
          image.height,
          rotation
        );

        // Set canvas size to match the bounding box
        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;

        // Translate canvas context to a central location to allow rotating and flipping around the center
        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        ctx.translate(-image.width / 2, -image.height / 2);

        // Draw rotated image
        ctx.drawImage(image, 0, 0);

        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
          resolve(null);
          return;
        }

        // Set the size of the cropped canvas
        croppedCanvas.width = pixelCrop.width;
        croppedCanvas.height = pixelCrop.height;

        // Draw the cropped image onto the new canvas
        croppedCtx.drawImage(
          canvas,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        // As a blob
        croppedCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      image.src = imageSrc;
    });
  }, []);

  const rotateSize = (width, height, rotation) => {
    const rotRad = (rotation * Math.PI) / 180;

    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const handleCrop = async () => {
    if (!imageFile || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        URL.createObjectURL(imageFile),
        croppedAreaPixels,
        rotation
      );

      if (croppedImage) {
        // Create a new File object from the cropped blob
        const croppedFile = new File([croppedImage], imageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        onCropComplete(croppedFile);
        onClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleFlipHorizontal = () => {
    // This would require additional state for flip, but for now we'll skip it
    // as react-easy-crop doesn't have built-in flip support
  };

  const handleFlipVertical = () => {
    // This would require additional state for flip, but for now we'll skip it
    // as react-easy-crop doesn't have built-in flip support
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Crop & Rotate Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cropper */}
        <div className="flex-1 p-6">
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={URL.createObjectURL(imageFile)}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={setZoom}
              className="cropper-container"
              style={{
                containerStyle: {
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                },
                mediaStyle: {
                  maxWidth: '100%',
                  maxHeight: '100%',
                },
              }}
            />
          </div>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {/* Zoom Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Rotation Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRotateLeft}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Rotate Left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={handleRotateRight}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Rotate Right"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reset"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={isProcessing}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Apply Crop</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
