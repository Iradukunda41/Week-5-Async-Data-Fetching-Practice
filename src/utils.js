
export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function getVisibleItems(items, filters) {
  const {
    query = "",
    filter = "all",
    sort = "default",
    favoritesOnly = false,
    favorites = [],
  } = filters;

  const searchTerm = query.trim().toLowerCase();

  let visibleItems = items.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm);

    const matchesCategory =
      filter === "all" || product.category === filter;

    const matchesFavorite =
      !favoritesOnly || favorites.includes(Number(product.id));

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  switch (sort) {
    case "price-asc":
      visibleItems.sort((a, b) => a.price - b.price);
      break;

    case "price-desc":
      visibleItems.sort((a, b) => b.price - a.price);
      break;

    case "name-asc":
      visibleItems.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case "rating-desc":
      visibleItems.sort(
        (a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0)
      );
      break;

    default:
      break;
  }

  return visibleItems;
}

export function getStats(items) {
  if (items.length === 0) {
    return {
      averagePrice: 0,
      averageRating: 0,
      totalStock: 0,
    };
  }

  const totalPrice = items.reduce(
    (total, product) => total + (Number(product.price) || 0),
    0
  );

  const totalRating = items.reduce(
    (total, product) => total + (Number(product.rating?.rate) || 0),
    0
  );

  const totalStock = items.reduce(
    (total, product) => total + (Number(product.stock) || 0),
    0
  );

  return {
    averagePrice: totalPrice / items.length,
    averageRating: totalRating / items.length,
    totalStock,
  };
}
