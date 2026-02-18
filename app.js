// app.js
// Lógica principal: render de productos, filtros, carrito y WhatsApp.
// Comentarios en inglés (como te gusta), pero puedes cambiar a español si quieres.

const WHATSAPP_NUMBER = "+526561361647"; // <-- CAMBIA ESTO (ej. 526561234567)
const STORE_NAME = "Maval Cuarzos y Minerales";

const elGrid = document.getElementById("productsGrid");
const elSearch = document.getElementById("searchInput");
const elCategory = document.getElementById("categorySelect");
const elSort = document.getElementById("sortSelect");
const elCartCount = document.getElementById("cartCount");
const elYear = document.getElementById("year");

const btnWhatsTop = document.getElementById("btnWhatsTop");
const btnWhatsBottom = document.getElementById("btnWhatsBottom");
const btnCheckout = document.getElementById("btnCheckout");
const btnClearCart = document.getElementById("btnClearCart");

let cart = []; // Each item: { id, qty }

function formatMoney(amount, currency){
  // Simple currency formatting
  return new Intl.NumberFormat("es-MX", { style:"currency", currency }).format(amount);
}

function buildWhatsLink(message){
  // Builds a wa.me link with an encoded message
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function uniqueCategories(products){
  const set = new Set(products.map(p => p.category));
  return ["all", ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
}

function getProductById(id){
  return PRODUCTS.find(p => p.id === id);
}

function cartCount(){
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function setCartCountUI(){
  elCartCount.textContent = String(cartCount());
}

function addToCart(productId){
  const found = cart.find(i => i.id === productId);
  if(found) found.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  setCartCountUI();
}

function clearCart(){
  cart = [];
  setCartCountUI();
}

function cartMessage(){
  // Generates the WhatsApp message for the whole cart
  if(cart.length === 0){
    return `Hola 👋 Quiero información sobre sus productos (${STORE_NAME}).`;
  }

  let lines = [];
  lines.push(`Hola 👋 Quiero hacer un pedido en ${STORE_NAME}:`);
  lines.push("");
  let total = 0;

  for(const item of cart){
    const p = getProductById(item.id);
    if(!p) continue;
    const subtotal = p.price * item.qty;
    total += subtotal;
    lines.push(`• ${p.name}  x${item.qty}  = ${formatMoney(subtotal, p.currency)}`);
  }

  lines.push("");
  lines.push(`Total aproximado: ${formatMoney(total, "MXN")}`);
  lines.push("¿Me confirmas disponibilidad, envío y forma de pago?");
  return lines.join("\n");
}

function productQuickMessage(p){
  // Message for a single product button
  return `Hola 👋 Me interesa: ${p.name} (${formatMoney(p.price, p.currency)}). ¿Sigue disponible?`;
}

function applyFilters(){
  const q = elSearch.value.trim().toLowerCase();
  const cat = elCategory.value;
  const sort = elSort.value;

  let list = [...PRODUCTS];

  // Filter by category
  if(cat !== "all"){
    list = list.filter(p => p.category === cat);
  }

  // Filter by search query
  if(q.length > 0){
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.note || "").toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if(sort === "priceAsc"){
    list.sort((a,b) => a.price - b.price);
  } else if(sort === "priceDesc"){
    list.sort((a,b) => b.price - a.price);
  } else if(sort === "nameAsc"){
    list.sort((a,b) => a.name.localeCompare(b.name));
  } else {
    // Featured first
    list.sort((a,b) => (b.featured === true) - (a.featured === true));
  }

  renderProducts(list);
}

function renderProducts(products){
  elGrid.innerHTML = "";

  if(products.length === 0){
    elGrid.innerHTML = `<div class="muted">No encontré productos con esos filtros.</div>`;
    return;
  }

  for(const p of products){
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card__img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="card__body">
        <h4 class="card__title">${p.name}</h4>
        <div class="card__meta">
          <span>${formatMoney(p.price, p.currency)}</span>
          <span class="badge">${p.status}</span>
        </div>
        <div class="muted small">${p.note || ""}</div>
        <div class="card__buttons">
          <button class="btn btn--ghost" data-add="${p.id}">Agregar</button>
          <a class="btn" target="_blank" rel="noopener" href="${buildWhatsLink(productQuickMessage(p))}">
            WhatsApp
          </a>
        </div>
      </div>
    `;

    elGrid.appendChild(card);
  }

  // Bind "Add" buttons
  const addButtons = elGrid.querySelectorAll("button[data-add]");
  addButtons.forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function init(){
  // Footer year
  elYear.textContent = String(new Date().getFullYear());

  // WhatsApp generic buttons
  const genericMsg = `Hola 👋 Quiero información sobre ${STORE_NAME}.`;
  const genericLink = buildWhatsLink(genericMsg);
  btnWhatsTop.href = genericLink;
  btnWhatsBottom.href = genericLink;

  // Build categories dropdown
  const cats = uniqueCategories(PRODUCTS);
  for(const c of cats){
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = (c === "all") ? "Todas las categorías" : c;
    elCategory.appendChild(opt);
  }

  // Events
  elSearch.addEventListener("input", applyFilters);
  elCategory.addEventListener("change", applyFilters);
  elSort.addEventListener("change", applyFilters);

  btnCheckout.addEventListener("click", () => {
    const link = buildWhatsLink(cartMessage());
    window.open(link, "_blank", "noopener");
  });

  btnClearCart.addEventListener("click", () => clearCart());
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const intent = chip.dataset.intent;
      const map = {
        calma: "amatista cuarzo",
        proteccion: "obsidiana turmalina",
        claridad: "cuarzo cristal fluorita",
        amor: "cuarzo rosa",
        abundancia: "citrino pirita"
      };
      elSearch.value = map[intent] || "";
      applyFilters();
    });
  });

  // Initial render
  setCartCountUI();
  applyFilters();
}

init();
