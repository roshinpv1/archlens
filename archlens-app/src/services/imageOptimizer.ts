import sharp from 'sharp';

export interface ImageOptimizationResult {
  success: boolean;
  optimized_base64?: string;
  original_size_bytes?: number;
  optimized_size_bytes?: number;
  original_dimensions?: [number, number];
  optimized_dimensions?: [number, number];
  compression_ratio_percent?: number;
  quality_used?: number;
  base64_length?: number;
  error?: string;
}

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Optimize image using Sharp (JavaScript/Node.js)
 */
export async function optimizeImage(
  base64Data: string, 
  options: ImageOptimizationOptions = {}
): Promise<ImageOptimizationResult> {
  const {
    quality = 100,
    maxWidth = 512,
    maxHeight = 512
  } = options;

  try {
    // Clean base64 data
    const cleanBase64 = base64Data.replace(/^data:image\/[^;]+;base64,/, '');
    const originalBuffer = Buffer.from(cleanBase64, 'base64');
    const originalSize = originalBuffer.length;

    // Get original image metadata
    const originalImage = sharp(originalBuffer);
    const originalMetadata = await originalImage.metadata();
    const originalDimensions: [number, number] = [
      originalMetadata.width || 0, 
      originalMetadata.height || 0
    ];

    console.log(`🖼️ Processing image: ${originalDimensions[0]}x${originalDimensions[1]} (${Math.round(originalSize / 1024)}KB)`);

    // Create optimized image pipeline
    let pipeline = sharp(originalBuffer)
      .jpeg({ 
        quality, 
        progressive: true,
        mozjpeg: true // Use mozjpeg encoder for better compression
      });

    // Resize if needed
    if (originalDimensions[0] > maxWidth || originalDimensions[1] > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true // Don't upscale smaller images
      });
    }

    // Process the image
    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedSize = optimizedBuffer.length;
    
    // Get final dimensions
    const finalMetadata = await sharp(optimizedBuffer).metadata();
    const optimizedDimensions: [number, number] = [
      finalMetadata.width || originalDimensions[0],
      finalMetadata.height || originalDimensions[1]
    ];

    // Convert to base64
    const optimizedBase64 = optimizedBuffer.toString('base64');
    
    // Calculate compression ratio
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

    console.log(`✅ Optimization complete: ${Math.round(compressionRatio)}% compression`);

    return {
      success: true,
      optimized_base64: optimizedBase64,
      original_size_bytes: originalSize,
      optimized_size_bytes: optimizedSize,
      original_dimensions: originalDimensions,
      optimized_dimensions: optimizedDimensions,
      compression_ratio_percent: Math.round(compressionRatio * 100) / 100,
      quality_used: quality,
      base64_length: optimizedBase64.length
    };

  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    return {
      success: false,
      error: `Sharp optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Fallback JavaScript-based image optimization (basic)
 */
export function basicImageOptimization(base64Data: string): ImageOptimizationResult {
  try {
    // Simple base64 cleanup and validation
    const cleanBase64 = base64Data.replace(/^data:image\/[^;]+;base64,/, '');
    const originalLength = cleanBase64.length;
    
    // Basic validation
    if (originalLength < 100) {
      throw new Error('Invalid base64 image data');
    }
    
    // For fallback, we just return the cleaned data
    // In a real scenario, you might implement browser-based canvas compression
    return {
      success: true,
      optimized_base64: cleanBase64,
      original_size_bytes: Math.round(originalLength * 0.75), // Approximate
      optimized_size_bytes: Math.round(originalLength * 0.75),
      compression_ratio_percent: 0,
      quality_used: 100,
      base64_length: cleanBase64.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Fallback optimization failed: ${error}`
    };
  }
}

/**
 * Smart image optimization with fallback
 */
export async function smartOptimizeImage(
  base64Data: string,
  options: ImageOptimizationOptions = {}
): Promise<ImageOptimizationResult> {
  console.log('🖼️ Starting Sharp-based image optimization...');
  
  // Try Sharp-based optimization first
  const sharpResult = await optimizeImage(base64Data, options);
  
  if (sharpResult.success) {
    console.log(`✅ Sharp optimization successful: ${sharpResult.compression_ratio_percent}% compression`);
    return sharpResult;
  }
  
  console.warn('⚠️ Sharp optimization failed, using fallback:', sharpResult.error);
  
  // Fallback to basic optimization
  const fallbackResult = basicImageOptimization(base64Data);
  
  if (fallbackResult.success) {
    console.log('✅ Fallback optimization successful');
  } else {
    console.error('❌ All optimization methods failed');
  }
  
  return fallbackResult;
}
