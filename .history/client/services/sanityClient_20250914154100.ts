import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: 'm1wjb3wt', // Replace with your Sanity project ID
  dataset: 'production', // Replace with your dataset name
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
  token: 'skc4gFUka1EiXsRrUPwoaR4QTMSIXZAnrFCvnbtDL9EBWIbSNhmUX1f4kWgfclvkloMvtoYUcRHG08nDI2FdWtPhcBGTwJMhMORxwVBGPKRa400Vx5C7PZxksljN9TkAWkUEOmyCeiR8fOr1m8xzH5f9TPLUkpbGG7Xz5ScbPZnlkb75xTLR', // Updated API token
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
