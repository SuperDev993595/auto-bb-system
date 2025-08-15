import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import fs from 'fs';
import path from 'path';

async function compressImage() {
  try {
    console.log('Starting image compression...');
    
    const files = await imagemin(['public/banner.jpg'], {
      destination: 'public',
      plugins: [
        imageminMozjpeg({
          quality: 30,
          progressive: true,
          smooth: 1
        })
      ]
    });

    console.log('Compression completed!');
    console.log('Files:', files);
    
    // Check file sizes
    const originalSize = fs.statSync('public/banner-original.jpg').size;
    const compressedSize = fs.statSync('public/banner.jpg').size;
    
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compression ratio: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('Error compressing image:', error);
  }
}

compressImage();
