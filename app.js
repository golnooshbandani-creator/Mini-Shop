const productsContainer = document.querySelector("#productsContainer");
const searchInput = document.querySelector("#searchInput");
const categoryButtons = document.querySelectorAll(".category-btn");
const sortSelect = document.querySelector("#sortSelect");
let products = [];
let selectedCategory = "all";
let searchValue = "";
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.querySelector("#cartCount");
const cartBtn = document.querySelector("#cartBtn");
const cartModal = document.querySelector("#cartModal");
const closeCart = document.querySelector("#closeCart");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");
const checkoutBtn = document.querySelector("#checkoutBtn");

function displayProducts(products) {
  productsContainer.innerHTML = products
    .map((product) => {
      return `
        <div class="product-card">
        <img src="${product.image}" alt="${product.name}">

        <h3> ${product.name}</h3>
        <p>$${product.price}</p>

        <button class="add-to-cart" data-id="${product.id}">
          Add to Cart
        </button>

        </div>
        
        `;
    })
    .join("");
}

searchInput.addEventListener("input", function () {
  searchValue = searchInput.value.toLowerCase().trim();

  filterAndSortProducts();
});

categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCategory = button.dataset.category;

    categoryButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    filterAndSortProducts();
  });
});

sortSelect.addEventListener("change", function () {
  filterAndSortProducts();
});

productsContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("add-to-cart")) {
    const productId = Number(event.target.dataset.id);

    const product = products.find(function (product) {
      return product.id === productId;
    });

    const existingProduct = cart.find(function (item) {
      return item.id === productId;
    });

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    saveCart();
    updateCartCount();
    console.log(cart);
  }
});

function updateCartCount() {
  const totalItems = cart.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);

  cartCount.textContent = totalItems;
}
updateCartCount();

cartBtn.addEventListener("click", function () {
  cartModal.style.display = "flex";
  renderCart();
});

closeCart.addEventListener("click", function () {
  cartModal.style.display = "none";
});

cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    cartModal.style.display = "none";
  }
});

checkoutBtn.addEventListener("click", function () {
  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  alert("Order placed successfully!");

  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
});

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";
    return;
  }

  const total = cart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
  cartTotal.textContent = total.toFixed(2);

  cartItems.innerHTML = cart
    .map(function (item) {
      return `
    <div class="cart-item">
    <h3>${item.name}</h3>
    <p>$${item.price}</p>
    <p>Quantity: ${item.quantity}</p>

      <div class="quantity-controls">
      <button class="decrease-btn" data-id="${item.id}">-</button>

      <span>${item.quantity}</span>

      <button class="increase-btn" data-id="${item.id}">+</button>
      <button class="remove-btn" data-id="${item.id}">Remove</button>

      </div>

    </div>
    `;
    })
    .join("");
}

cartItems.addEventListener("click", function (event) {
  if (event.target.classList.contains("increase-btn")) {
    const productId = Number(event.target.dataset.id);
    const product = cart.find(function (item) {
      return item.id === productId;
    });
    product.quantity++;

    saveCart();
    renderCart();
    updateCartCount();
  }

  if (event.target.classList.contains("decrease-btn")) {
    const productId = Number(event.target.dataset.id);
    const product = cart.find(function (item) {
      return item.id === productId;
    });
    product.quantity--;

    if (product.quantity === 0) {
      cart = cart.filter(function (item) {
        return item.id !== productId;
      });
    }
    saveCart();
    renderCart();
    updateCartCount();
  }

  if (event.target.classList.contains("remove-btn")) {
    const productId = Number(event.target.dataset.id);

    cart = cart.filter(function (item) {
      return item.id !== productId;
    });

    saveCart();
    renderCart();
    updateCartCount();
  }
});

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function filterAndSortProducts() {
  let result = [...products];

  // Search
  if (searchValue) {
    result = result.filter(function (product) {
      return product.name.toLowerCase().includes(searchValue);
    });
  }

  // Category
  if (selectedCategory !== "all") {
    result = result.filter(function (product) {
      return product.category === selectedCategory;
    });
  }

  // Sort
  const sortValue = sortSelect.value;

  if (sortValue === "low") {
    result.sort(function (a, b) {
      return a.price - b.price;
    });
  }

  if (sortValue === "high") {
    result.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  if (result.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  displayProducts(result);
}

async function loadProducts() {
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";

  try {
    const response = await fetch("https://dummyjson.com/products");

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    products = data.products.map(function (product) {
      return {
        id: product.id,
        name: product.title,
        price: product.price,
        category: product.category,
        image: product.thumbnail,
      };
    });

    filterAndSortProducts();
    loadingMessage.style.display = "none";
  } catch (error) {
    console.log(error);

    loadingMessage.style.display = "none";
    errorMessage.style.display = "block";
    errorMessage.textContent = "Failed to load products";
  }
}

loadProducts();
