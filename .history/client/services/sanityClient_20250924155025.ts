import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || 'm1wjb3wt',
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
  // Note: Token removed for security - use API key for authenticated requests if needed
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getShopProducts() {
  const query = `*[_type == "shop"]{
    _id,
    name,
    description,
    price,
    image,
    sizes,
    colors,
    category,
    stock
  }`;
  const products = await sanityClient.fetch(query);
  console.log('Fetched products from Sanity:', products);
  const mappedProducts = products.map((product: any) => {
    const imageUrl = product.image ? urlFor(product.image).url() : null;
    return {
      ...product,
      image: imageUrl,
    };
  });
  return mappedProducts;
}

export async function getShopProductById(id: string) {
  const query = `*[_type == "shop" && _id == $id][0]{
    _id,
    name,
    description,
    price,
    image,
    sizes,
    colors,
    category,
    stock
  }`;
  const product = await sanityClient.fetch(query, { id });
  if (!product) return null;
  return {
    ...product,
    image: product.image ? urlFor(product.image).url() : null,
  };
}
