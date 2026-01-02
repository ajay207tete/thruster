import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'm1wjb3wt',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source) {
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
  const mappedProducts = products.map((product) => {
    const imageUrl = product.image ? urlFor(product.image).url() : null;
    return {
      ...product,
      imageUrl,
    };
  });
  return mappedProducts;
}

export async function getShopProductById(id) {
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
    imageUrl: product.image ? urlFor(product.image).url() : null,
  };
}
