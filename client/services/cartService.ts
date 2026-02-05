// client/services/cartService.js

import { BASE_URL } from "../config/api";

/*
BASE_URL should be:
https://your-site.netlify.app/.netlify/functions
*/

// ----------------------------
// Get Cart Items
// ----------------------------
export const getCart = async () => {
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "GET",
    });

    return await res.json();
  } catch (err) {
    console.log("Get cart error:", err);
    return [];
  }
};

// ----------------------------
// Add To Cart
// ----------------------------
export const addToCart = async (product) => {
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    return await res.json();
  } catch (err) {
    console.log("Add cart error:", err);
  }
};

// ----------------------------
// Remove From Cart
// ----------------------------
export const removeFromCart = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/cart/${id}`, {
      method: "DELETE",
    });

    return await res.json();
  } catch (err) {
    console.log("Remove cart error:", err);
  }
};
