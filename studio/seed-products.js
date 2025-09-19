import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: 'm1wjb3wt',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: 'skc4gFUka1EiXsRrUPwoaR4QTMSIXZAnrFCvnbtDL9EBWIbSNhmUX1f4kWgfclvkloMvtoYUcRHG08nDI2FdWtPhcBGTwJMhMORxwVBGPKRa400Vx5C7PZxksljN9TkAWkUEOmyCeiR8fOr1m8xzH5f9TPLUkpbGG7Xz5ScbPZnlkb75xTLR',
});

const sampleProducts = [
  {
    _type: 'shop',
    name: 'Cyberpunk Jacket',
    description: 'A sleek cyberpunk jacket with neon accents',
    price: 199.99,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Neon Blue', 'Red'],
    category: 'clothing',
    stock: 50,
    imageFile: '../client/assets/images/wp9355878-cyberpunk-ipad-4k-wallpapers.jpg',
  },
  {
    _type: 'shop',
    name: 'Digital Hoodie',
    description: 'Comfortable hoodie with digital patterns',
    price: 89.99,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black', 'White'],
    category: 'clothing',
    stock: 30,
    imageFile: '../client/assets/images/welcome.jpg',
  },
  {
    _type: 'shop',
    name: 'Tech Sneakers',
    description: 'High-tech sneakers with LED lights',
    price: 149.99,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Blue'],
    category: 'clothing',
    stock: 25,
    imageFile: '../client/assets/images/icon.png',
  },
];

async function seedProducts() {
  try {
    console.log('Seeding products...');
    for (const productData of sampleProducts) {
      const { imageFile, ...product } = productData;
      let imageAsset = null;
      if (imageFile && fs.existsSync(path.resolve(imageFile))) {
        console.log(`Uploading image: ${imageFile}`);
        const imageBuffer = fs.readFileSync(path.resolve(imageFile));
        imageAsset = await client.assets.upload('image', imageBuffer, {
          filename: path.basename(imageFile),
        });
        console.log(`Uploaded image asset: ${imageAsset._id}`);
      }
      const productWithImage = {
        ...product,
        image: imageAsset ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        } : null,
      };
      const result = await client.create(productWithImage);
      console.log(`Created product: ${result.name}`);
    }
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

seedProducts();
