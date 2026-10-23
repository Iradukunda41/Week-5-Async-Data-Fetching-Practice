
import "./style.css";

import {
  getProducts,
  getCategories,
  getProductById,
} from "./api.js";

import {
  getVisibleItems,
  getStats,
} from "./utils.js";

import { render } from "./render.js";

const state = {
  status: "loading",
  items: [],
  categories: [],
  visibleItems: [],
  favorites: JSON.parse(
    localStorage.getItem("atlas-favorites") || "[]"
  ),
  query: "",
  filter: "all",
  sort: "default",
  favoritesOnly: false,
  error: "",
  stats: {
    averagePrice: 0,
    averageRating: 0,
    totalStock: 0,
  },
  selectedProduct: null,
  detailStatus: "idle",
  detailError: "",
};

function updateView() {
  state.visibleItems = getVisibleItems(state.items, state);
  state.stats = getStats(state.items);
  render(state);
}

async function loadData() {
  state.status = "loading";
  state.error = "";
  render(state);

  try {
    const [productsResult, categoriesResult] =
      await Promise.allSettled([
        getProducts(),
        getCategories(),
      ]);

    if (productsResult.status === "rejected") {
      throw productsResult.reason;
    }

    state.items = productsResult.value;
    state.categories =
      categoriesResult.status === "fulfilled"
        ? categoriesResult.value
        : [...new Set(state.items.map((product) => product.category))];

    state.status = "success";
    updateView();
  } catch (error) {
    state.status = "error";
    state.error = error.message || "Unable to load products.";
    render(state);
  }
}

async function openDetails(id) {
  state.selectedProduct = { id: Number(id) };
  state.detailStatus = "loading";
  state.detailError = "";
  render(state);

  try {
    const product = await getProductById(id);

    if (
      !state.selectedProduct ||
      Number(state.selectedProduct.id) !== Number(id)
    ) {
      return;
    }

    state.selectedProduct = product;
    state.detailStatus = "success";
    render(state);
  } catch (error) {
    if (
      !state.selectedProduct ||
      Number(state.selectedProduct.id) !== Number(id)
    ) {
      return;
    }

    state.detailStatus = "error";
    state.detailError =
      error.message || "Unable to load product details.";
    render(state);
  }
}

function closeDetails() {
  state.selectedProduct = null;
  state.detailStatus = "idle";
  state.detailError = "";
  render(state);
}

function toggleFavorite(id) {
  const productId = Number(id);

  state.favorites = state.favorites.includes(productId)
    ? state.favorites.filter((favoriteId) => favoriteId !== productId)
    : [...state.favorites, productId];

  localStorage.setItem(
    "atlas-favorites",
    JSON.stringify(state.favorites)
  );

  updateView();
}

function clearFilters() {
  state.query = "";
  state.filter = "all";
  state.sort = "default";
  state.favoritesOnly = false;
  updateView();
}

let searchTimer;

document.addEventListener("input", (event) => {
  if (event.target.id !== "search-input") return;

  clearTimeout(searchTimer);

  const query = event.target.value;

  searchTimer = setTimeout(() => {
    state.query = query;
    updateView();
  }, 300);
});

document.addEventListener("change", (event) => {
  if (event.target.id === "category-filter") {
    state.filter = event.target.value;
    updateView();
  }

  if (event.target.id === "sort-select") {
    state.sort = event.target.value;
    updateView();
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;

  switch (action) {
    case "retry":
      loadData();
      break;
    case "details":
      openDetails(id);
      break;
    case "favorite":
      toggleFavorite(id);
      break;
    case "toggle-favorites-only":
      state.favoritesOnly = !state.favoritesOnly;
      updateView();
      break;
    case "clear-filters":
      clearFilters();
      break;
    case "close-details":
      if (
        button.tagName === "BUTTON" ||
        event.target === button
      ) {
        closeDetails();
      }
      break;
    case "retry-details":
      openDetails(id);
      break;
  }
});

loadData();
