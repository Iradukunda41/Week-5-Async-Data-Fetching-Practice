
import { escapeHTML } from "./utils.js";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function renderStatus(state) {
  if (state.status === "loading") {
    return `
      <p class="mb-5 text-sm text-stone-500" role="status" aria-live="polite">
        Finding great products for you...
      </p>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        ${Array.from({ length: 8 }, () => `
          <article class="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white p-4">
            <div class="h-48 rounded-xl bg-stone-100"></div>
            <div class="mt-5 h-4 w-3/4 rounded bg-stone-100"></div>
            <div class="mt-3 h-3 w-full rounded bg-stone-100"></div>
            <div class="mt-3 h-3 w-1/2 rounded bg-stone-100"></div>
          </article>
        `).join("")}
      </div>
    `;
  }

  if (state.status === "error") {
    return `
      <section class="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center" role="alert">
        <div class="mb-4 text-4xl" aria-hidden="true">!</div>
        <h2 class="text-2xl font-bold text-stone-900">
          Oops! Something went wrong.
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-stone-600">
          ${escapeHTML(state.error || "We couldn't load the products.")}
        </p>
        <button type="button" data-action="retry"
          class="mt-6 rounded-xl bg-orange-700 px-6 py-3 font-semibold text-white transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
          Try Again
        </button>
      </section>
    `;
  }

  return `
    <section class="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center" role="status" aria-live="polite">
      <div class="mb-4 text-5xl" aria-hidden="true">⌕</div>
      <h2 class="text-2xl font-bold text-stone-900">
        Your next great find is still out there!
      </h2>
      <p class="mx-auto mt-3 max-w-lg text-stone-500">
        No matching products found. Try another search or explore a different category.
      </p>
      <button type="button" data-action="clear-filters"
        class="mt-6 rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white transition hover:bg-orange-700">
        Explore All Products
      </button>
    </section>
  `;
}

function renderCard(product, favorites) {
  const {
    id,
    title,
    description,
    category,
    price,
    rating,
    thumbnail,
    brand,
    discountPercentage,
  } = product;

  const safeTitle = escapeHTML(title || "Untitled product");
  const safeImage = escapeHTML(thumbnail || "");
  const isFavorite = favorites.includes(id);

  return `
    <article class="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">

      <button type="button"
        data-action="details"
        data-id="${Number(id)}"
        aria-label="Discover details for ${safeTitle}"
        class="relative block h-56 w-full overflow-hidden bg-stone-50 p-5 text-left">

        ${
          safeImage
            ? `<img src="${safeImage}" alt="${safeTitle}" loading="lazy"
                class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" />`
            : `<span class="flex h-full items-center justify-center text-stone-400">No image available</span>`
        }

        ${
          Number(discountPercentage) > 0
            ? `<span class="absolute left-3 top-3 rounded-full bg-orange-700 px-3 py-1 text-xs font-bold text-white shadow">
                -${Math.round(discountPercentage)}%
              </span>`
            : ""
        }
      </button>

      <div class="flex flex-1 flex-col p-5">

        <div class="mb-3 flex items-center justify-between gap-2">
          <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold capitalize text-orange-800">
            ${escapeHTML(category || "Other")}
          </span>

          <span class="text-sm font-semibold text-amber-600">
            ★ ${Number(rating || 0).toFixed(1)}
          </span>
        </div>

        <h3 class="line-clamp-1 text-lg font-bold text-stone-900 transition-colors group-hover:text-orange-700">
          ${safeTitle}
        </h3>

        <p class="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-stone-500">
          ${escapeHTML(description || "Discover more about this product.")}
        </p>

        <div class="mt-auto flex items-center justify-between gap-3 pt-5">
          <div>
            <p class="text-xl font-extrabold text-orange-800">
              ${money(price)}
            </p>
            <p class="mt-1 text-xs text-stone-400">
              ${escapeHTML(brand || "Unbranded")}
            </p>
          </div>

          <button type="button"
            data-action="favorite"
            data-id="${Number(id)}"
            aria-pressed="${isFavorite}"
            aria-label="${isFavorite ? "Remove from" : "Add to"} favorites"
            class="rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            }">
            ${isFavorite ? "♥ Saved" : "♡ Save"}
          </button>
        </div>

        <button type="button"
          data-action="details"
          data-id="${Number(id)}"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
          Discover More <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  `;
}

function renderDetails(state) {
  const product = state.selectedProduct;

  if (!product) return "";

  let content = "";

  if (state.detailStatus === "loading") {
    content = `
      <p class="py-12 text-center text-stone-500" role="status">
        Getting product details ready...
      </p>
    `;
  } else if (state.detailStatus === "error") {
    content = `
      <div class="py-8 text-center">
        <h2 id="details-title" class="text-2xl font-bold">
          Details temporarily unavailable
        </h2>
        <p class="mt-3 text-stone-500">
          ${escapeHTML(state.detailError || "Please try again.")}
        </p>
        <button type="button" data-action="retry-details"
          data-id="${Number(product.id)}"
          class="mt-5 rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-800">
          Try Again
        </button>
      </div>
    `;
  } else {
    const isFavorite = state.favorites.includes(product.id);

    content = `
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="flex min-h-64 items-center justify-center rounded-2xl bg-stone-50 p-5">
          <img src="${escapeHTML(product.thumbnail || "")}"
            alt="${escapeHTML(product.title || "Product image")}"
            class="max-h-72 w-full object-contain" />
        </div>

        <div>
          <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold capitalize text-orange-800">
            ${escapeHTML(product.category || "Other")}
          </span>

          <h2 id="details-title" class="mt-4 text-2xl font-extrabold text-stone-900">
            ${escapeHTML(product.title || "Untitled product")}
          </h2>

          <p class="mt-3 leading-7 text-stone-600">
            ${escapeHTML(product.description || "Discover more about this product.")}
          </p>

          <p class="mt-5 text-3xl font-extrabold text-orange-800">
            ${money(product.price)}
          </p>

          <dl class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <dt class="text-stone-500">Brand</dt>
              <dd class="font-semibold text-stone-900">${escapeHTML(product.brand || "Unbranded")}</dd>
            </div>

            <div class="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <dt class="text-stone-500">Rating</dt>
              <dd class="font-semibold text-amber-600">★ ${Number(product.rating || 0).toFixed(1)} / 5</dd>
            </div>

            <div class="flex justify-between gap-4 border-b border-stone-100 pb-2">
              <dt class="text-stone-500">Stock</dt>
              <dd class="font-semibold text-stone-900">${Number(product.stock || 0)} units</dd>
            </div>
          </dl>

          <button type="button" data-action="favorite"
            data-id="${Number(product.id)}"
            aria-pressed="${isFavorite}"
            class="mt-6 w-full rounded-xl px-5 py-3 font-semibold transition ${
              isFavorite
                ? "bg-rose-50 text-rose-700"
                : "bg-orange-700 text-white hover:bg-orange-800"
            }">
            ${isFavorite ? "♥ Saved to Favorites" : "♡ Add to Favorites"}
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm"
      data-action="close-details">

      <section role="dialog" aria-modal="true"
        aria-labelledby="details-title"
        class="my-auto w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8"
        data-modal-content>

        <div class="mb-5 flex justify-end">
          <button type="button" data-action="close-details"
            aria-label="Close product details"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-2xl text-stone-600 transition hover:bg-stone-200">
            ×
          </button>
        </div>

        ${content}
      </section>
    </div>
  `;
}

export function render(state) {
  const app = document.querySelector("#app");

  if (!app) {
    console.error('Cannot render: missing element with id="app".');
    return;
  }

  const shouldRestoreSearchFocus =
    document.activeElement?.id === "search-input";

  const cursorPosition = shouldRestoreSearchFocus
    ? document.activeElement.selectionStart
    : null;

  const categoryOptions = state.categories
    .map((category) => `
      <option value="${escapeHTML(category)}"
        ${state.filter === category ? "selected" : ""}>
        ${escapeHTML(category.replaceAll("-", " "))}
      </option>
    `)
    .join("");

  const visibleItems = state.visibleItems || [];

  const content =
    state.status !== "success"
      ? renderStatus(state)
      : visibleItems.length > 0
        ? `
          <p class="mb-5 text-sm text-stone-500" role="status" aria-live="polite">
            Showing <strong class="text-stone-900">${visibleItems.length}</strong>
            of ${state.items.length} products.
            ${state.favoritesOnly ? " Favorites only." : ""}
          </p>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            ${visibleItems.map((product) => renderCard(product, state.favorites)).join("")}
          </div>
        `
        : renderStatus({ ...state, status: "empty" });

  app.innerHTML = `
    <div class="min-h-screen bg-[#faf8f5] text-stone-900">

      <header class="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <a href="#top" class="flex items-center gap-3" aria-label="Atlas home">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-700 text-xl font-black text-white shadow-sm">
              A
            </span>

            <span class="text-2xl font-black tracking-tight">
              atlas<span class="text-orange-700">.</span>
              <span class="block text-[10px] font-bold tracking-[0.2em] text-stone-500">
                PRODUCT EXPLORER
              </span>
            </span>
          </a>

          <span class="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            Discover something wonderful
          </span>
        </div>
      </header>

      <main id="top" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <section class="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <span class="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold tracking-[0.16em] text-orange-800">
              YOUR NEXT GREAT FIND STARTS HERE
            </span>

            <h1 class="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Discover your next
              <span class="block font-serif italic text-orange-700">
                favorite find.
              </span>
            </h1>

            <p class="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
              Great finds start here. Explore exciting products,
              discover new favorites, compare prices, and save
              the items you love all in one place.
            </p>

            <a href="#explorer-heading"
              class="mt-8 inline-flex items-center gap-3 rounded-xl bg-orange-700 px-6 py-4 font-bold text-white shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              Explore Products <span aria-hidden="true">→</span>
            </a>
          </div>

          <div class="relative hidden min-h-80 items-center justify-center lg:flex">
            <div class="absolute h-72 w-72 rounded-full border border-orange-200"></div>
            <div class="absolute h-56 w-56 rounded-full border border-orange-300"></div>
            <div class="absolute h-40 w-40 rounded-full bg-orange-100"></div>

            <div class="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-orange-700 text-6xl text-white shadow-2xl shadow-orange-900/20">
              ✳
            </div>

            <span class="absolute left-8 top-16 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-stone-700 shadow-lg">
              DISCOVER
            </span>

            <span class="absolute bottom-14 right-5 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-stone-700 shadow-lg">
              YOUR FAVORITES
            </span>
          </div>
        </section>

        <section class="grid grid-cols-2 gap-4 pb-16 lg:grid-cols-4"
          aria-label="Catalogue statistics">

          <article class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-bold tracking-wider text-stone-500">PRODUCTS</p>
            <p class="mt-3 text-2xl font-black sm:text-3xl">${state.items.length.toLocaleString("en-US")}</p>
            <p class="mt-2 text-xs text-stone-500">Ready to explore</p>
          </article>

          <article class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-bold tracking-wider text-stone-500">AVERAGE PRICE</p>
            <p class="mt-3 text-2xl font-black text-orange-800 sm:text-3xl">${money(state.stats.averagePrice)}</p>
            <p class="mt-2 text-xs text-stone-500">Across loaded products</p>
          </article>

          <article class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-bold tracking-wider text-stone-500">AVERAGE RATING</p>
            <p class="mt-3 text-2xl font-black text-amber-600 sm:text-3xl">★ ${Number(state.stats.averageRating || 0).toFixed(1)}</p>
            <p class="mt-2 text-xs text-stone-500">Based on listed ratings</p>
          </article>

          <article class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-bold tracking-wider text-stone-500">TOTAL STOCK</p>
            <p class="mt-3 text-2xl font-black sm:text-3xl">${Number(state.stats.totalStock || 0).toLocaleString("en-US")}</p>
            <p class="mt-2 text-xs text-stone-500">Listed units in stock</p>
          </article>
        </section>

        <section class="pb-20" aria-labelledby="explorer-heading">
          <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span class="text-xs font-bold tracking-[0.18em] text-orange-700">A WORLD OF FINDS</span>
              <h2 id="explorer-heading" class="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Find something you'll love
              </h2>
              <p class="mt-3 max-w-xl leading-7 text-stone-500">
                Browse the collection, discover new picks, and save the products that catch your eye.
              </p>
            </div>

            <span class="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-600 ring-1 ring-stone-200">
              ${visibleItems.length} products shown
            </span>
          </div>

          <div class="mb-8 grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">

            <label for="search-input" class="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
              <span class="text-xl text-stone-500" aria-hidden="true">⌕</span>
              <input id="search-input" type="search"
                placeholder="Find something you'll love..."
                value="${escapeHTML(state.query)}"
                autocomplete="off"
                class="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400" />
            </label>

            <label for="category-filter" class="block">
              <span class="mb-2 block text-xs font-bold text-stone-500">CATEGORY</span>
              <select id="category-filter"
                class="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                <option value="all">All categories</option>
                ${categoryOptions}
              </select>
            </label>

            <label for="sort-select" class="block">
              <span class="mb-2 block text-xs font-bold text-stone-500">SORT BY</span>
              <select id="sort-select"
                class="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100">

                <option value="default" ${state.sort === "default" ? "selected" : ""}>Featured</option>
                <option value="price-asc" ${state.sort === "price-asc" ? "selected" : ""}>Price: low to high</option>
                <option value="price-desc" ${state.sort === "price-desc" ? "selected" : ""}>Price: high to low</option>
                <option value="name-asc" ${state.sort === "name-asc" ? "selected" : ""}>Name: A–Z</option>
                <option value="rating-desc" ${state.sort === "rating-desc" ? "selected" : ""}>Top rated</option>
              </select>
            </label>

            <button type="button" data-action="toggle-favorites-only"
              aria-pressed="${state.favoritesOnly}"
              class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                state.favoritesOnly
                  ? "bg-rose-100 text-rose-700"
                  : "border border-stone-200 bg-white text-stone-700 hover:bg-rose-50 hover:text-rose-700"
              }">
              ♥ Favorites
              <span class="rounded-full bg-white px-2 py-1 text-xs shadow-sm">${state.favorites.length}</span>
            </button>
          </div>

          <div id="results-region">
            ${content}
          </div>
        </section>

        <footer class="border-t border-stone-200 py-10">
          <div class="grid gap-8 md:grid-cols-2 md:items-start">

            <div>
              <a href="#top" class="text-3xl font-black tracking-tight">
                atlas<span class="text-orange-700">.</span>
              </a>

              <p class="mt-2 text-xs font-bold tracking-[0.17em] text-orange-800">
                DISCOVER MORE. LOVE WHAT YOU FIND.
              </p>

              <p class="mt-4 max-w-md text-sm leading-7 text-stone-500">
                Your place to discover new finds, explore products,
                find your favorites, and save your top picks for later.
              </p>
            </div>

              <p class="mt-5 text-xs text-stone-400">
                © 2026 Atlas Product Explorer. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      ${renderDetails(state)}
    </div>
  `;

  if (shouldRestoreSearchFocus) {
    const search = document.querySelector("#search-input");
    search?.focus();

    if (cursorPosition !== null) {
      search?.setSelectionRange(cursorPosition, cursorPosition);
    }
  }
}
