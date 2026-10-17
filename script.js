/* =========================================================
   BORA AÇAÍ — JAVASCRIPT
   Altere SOMENTE esta variável para colocar o WhatsApp real.
   Formato: código do país + DDD + número, sem +, espaços
   ou símbolos. Exemplo: 5581999999999
   ========================================================= */
const WHATSAPP_NUMBER = "558189263743";

const money = value => value.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});

let cart = JSON.parse(localStorage.getItem("boraAcaiCart") || "[]");

const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");

function saveCart() {
  localStorage.setItem("boraAcaiCart", JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function showToast(message = "Adicionado ao pedido ✦") {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(product, price, details = "") {
  const existing = cart.find(item => item.product === product && item.details === details);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: Date.now() + Math.random(),
      product,
      price: Number(price),
      details,
      qty: 1
    });
  }

  saveCart();
  renderCart();
  showToast("Adicionado ao pedido ✦");
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  cartCount.textContent = getCartCount();
  cartTotal.textContent = money(getCartTotal());

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span>🥣</span>
        <h3>Seu carrinho está vazio.</h3>
        <p>Escolha um combo ou monte seu açaí.</p>
        <a href="#combos" id="emptyCartLink">VER COMBOS</a>
      </div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <article class="cart-item">
      <div>
        <h4>${escapeHtml(item.product)}</h4>
        ${item.details ? `<p>${escapeHtml(item.details)}</p>` : ""}
        <div class="cart-item-price">${money(item.price * item.qty)}</div>
        <button class="remove" data-remove="${item.id}">remover</button>
      </div>
      <div class="qty">
        <button aria-label="Diminuir quantidade" data-qty="${item.id}" data-change="-1">−</button>
        <span>${item.qty}</span>
        <button aria-label="Aumentar quantidade" data-qty="${item.id}" data-change="1">+</button>
      </div>
    </article>
  `).join("");

  cartItems.querySelectorAll("[data-qty]").forEach(button => {
    button.addEventListener("click", () => changeQuantity(Number(button.dataset.qty), Number(button.dataset.change)));
  });

  cartItems.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => removeItem(Number(button.dataset.remove)));
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

document.getElementById("cartTrigger").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartBackdrop").addEventListener("click", closeCart);

document.addEventListener("click", event => {
  const addButton = event.target.closest(".add-button");
  if (!addButton) return;

  addToCart(
    addButton.dataset.product,
    Number(addButton.dataset.price),
    ""
  );
});

document.getElementById("checkout").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Adicione algo ao pedido primeiro.");
    return;
  }

  const lines = cart.map(item => {
    const details = item.details ? ` — ${item.details}` : "";
    return `${item.qty}x ${item.product}${details} — ${money(item.price * item.qty)}`;
  });

  const message = [
    "Olá! Gostaria de fazer um pedido:",
    "",
    "🍇 PEDIDO:",
    ...lines,
    "",
    `💰 TOTAL: ${money(getCartTotal())}`,
    "",
    "Gostaria de finalizar meu pedido!"
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
});

/* -------------------------
   MENU MOBILE
   ------------------------- */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

menuToggle.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* -------------------------
   CONSTRUTOR DO AÇAÍ
   ------------------------- */
const builderState = {
  size: "300ml",
  base: "Açaí tradicional",
  basePrice: 16.90,
  toppings: []
};

const builderTotal = document.getElementById("builderTotal");
const builderSummary = document.getElementById("builderSummary");
const builderToppings = document.getElementById("builderToppings");

function updateBuilder() {
  const toppingTotal = builderState.toppings.reduce((sum, topping) => sum + topping.price, 0);
  const total = builderState.basePrice + toppingTotal;

  builderTotal.textContent = money(total);
  builderSummary.textContent = `${builderState.size} · ${builderState.base}`;

  builderToppings.textContent = builderState.toppings.length
    ? builderState.toppings.map(item => item.name).join(" · ")
    : "Nenhum complemento ainda";
}

document.querySelectorAll(".size-options .choice").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".size-options .choice").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    builderState.size = button.dataset.size;
    builderState.basePrice = Number(button.dataset.price);
    updateBuilder();
  });
});

document.querySelectorAll(".base-choice").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".base-choice").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    builderState.base = button.dataset.base;
    updateBuilder();
  });
});

document.querySelectorAll(".topping").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.topping;
    const price = Number(button.dataset.price);
    const index = builderState.toppings.findIndex(item => item.name === name);

    if (index >= 0) {
      builderState.toppings.splice(index, 1);
      button.classList.remove("active");
    } else {
      builderState.toppings.push({ name, price });
      button.classList.add("active");
    }

    updateBuilder();
  });
});

document.getElementById("addCustom").addEventListener("click", () => {
  const toppingNames = builderState.toppings.map(item => item.name);
  const details = [
    `Tamanho: ${builderState.size}`,
    `Base: ${builderState.base}`,
    `Complementos: ${toppingNames.length ? toppingNames.join(", ") : "nenhum"}`
  ].join(" | ");

  const total = builderState.basePrice + builderState.toppings.reduce((sum, topping) => sum + topping.price, 0);

  addToCart(`Açaí ${builderState.size}`, total, details);
  openCart();
});

/* -------------------------
   SCROLL REVEAL
   ------------------------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

/* Inicializa o carrinho salvo e o construtor. */
renderCart();
updateBuilder();

/* Escape fecha o carrinho/menu. */
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
