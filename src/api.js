
const BASE_URL = "https://dummyjson.com";

// Reusable function for fetching JSON data
export async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// Get the product catalogue
export async function getProducts() {
  const data = await getJSON(
    `${BASE_URL}/products?limit=100`
  );

  return data.products;
}

// Get product categories
export async function getCategories() {
  return await getJSON(
    `${BASE_URL}/products/category-list`
  );
}

// Get one product using its ID
export async function getProductById(id) {
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    throw new Error("Invalid product ID.");
  }

  return await getJSON(
    `${BASE_URL}/products/${productId}`
  );
}
