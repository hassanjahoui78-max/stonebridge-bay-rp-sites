/**
 * STONEBRIDGE BAY RP — script.js
 * Gestione carrello, localStorage, UI interattiva
 */

// ────────────────────────────────────────────────
// STATO GLOBALE
// ────────────────────────────────────────────────
const STORAGE_KEY = 'sbbRP_cart';

let cart = loadCart();

// ────────────────────────────────────────────────
// PERSISTENZA LOCALSTORAGE
// ────────────────────────────────────────────────
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn('localStorage non disponibile:', e);
  }
}

// ────────────────────────────────────────────────
// OPERAZIONI CARRELLO
// ────────────────────────────────────────────────

/**
 * Aggiunge un prodotto al carrello.
 * @param {Object} product - { id, name, price, icon, category }
 */
function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  updateCartBadge();
  showToast(`✅ ${product.name} aggiunto al carrello`);
}

/**
 * Rimuove completamente un prodotto dal carrello.
 * @param {string|number} id
 */
function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    updateCartBadge();
    showToast(`🗑️ ${item.name} rimosso`, 'warn');
  }
}

/**
 * Modifica la quantità di un prodotto.
 * @param {string|number} id
 * @param {number} delta — +1 o -1
 */
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

/** Svuota l'intero carrello. */
function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
}

/** Calcola il totale carrello. */
function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/** Calcola il numero totale di articoli. */
function getCartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

// ────────────────────────────────────────────────
// RENDER CARRELLO (DRAWER)
// ────────────────────────────────────────────────
function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🛒</span>
        <p>Il tuo carrello è vuoto</p>
        <p style="font-size:.8rem;margin-top:.5rem;color:var(--text-muted);">
          Aggiungi qualcosa dallo shop!
        </p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-icon">${item.icon || '🎮'}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${escHtml(item.name)}</div>
          <div class="cart-item-price">€${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', +1)">+</button>
        </div>
        <button class="cart-remove" onclick="removeFromCart('${item.id}')" title="Rimuovi">✕</button>
      </div>
    `).join('');
  }

  if (totalEl) {
    totalEl.textContent = `€${getCartTotal().toFixed(2)}`;
  }

  // Aggiorna anche la pagina checkout se presente
  renderCheckout();
}

// ────────────────────────────────────────────────
// BADGE CARRELLO NAVBAR
// ────────────────────────────────────────────────
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ────────────────────────────────────────────────
// DRAWER APRI/CHIUDI
// ────────────────────────────────────────────────
function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ────────────────────────────────────────────────
// HAMBURGER MENU MOBILE
// ────────────────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById('nav-mobile')?.classList.toggle('open');
}

// ────────────────────────────────────────────────
// RENDER CHECKOUT PAGE
// ────────────────────────────────────────────────
function renderCheckout() {
  const listEl = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  const emptyMsg = document.getElementById('checkout-empty');
  const payBlock = document.getElementById('paypal-block');

  if (!listEl) return; // Non siamo in checkout.html

  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (payBlock) payBlock.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (payBlock) payBlock.style.display = 'block';

  listEl.innerHTML = cart.map(item => `
    <div class="checkout-item-row">
      <span class="checkout-item-name">
        <span>${item.icon || '🎮'}</span>
        ${escHtml(item.name)}
        ${item.qty > 1 ? `<span style="color:var(--text-muted);font-size:.85rem">x${item.qty}</span>` : ''}
      </span>
      <span class="checkout-item-price">€${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = `€${getCartTotal().toFixed(2)}`;
}

// ────────────────────────────────────────────────
// TOAST NOTIFICHE
// ────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast${type === 'warn' ? ' warn' : type === 'error' ? ' error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ────────────────────────────────────────────────
// PULSANTI "AGGIUNGI AL CARRELLO"
// ────────────────────────────────────────────────
function initProductButtons() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id       = btn.dataset.id;
      const name     = btn.dataset.name;
      const price    = parseFloat(btn.dataset.price);
      const icon     = btn.dataset.icon || '🎮';
      const category = btn.dataset.category || '';

      addToCart({ id, name, price, icon, category });

      // Feedback visivo sul bottone
      btn.classList.add('added');
      btn.textContent = '✓ Aggiunto';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = 'Aggiungi';
      }, 2000);
    });
  });
}

// ────────────────────────────────────────────────
// DISCORD OAUTH2 LINK
// ────────────────────────────────────────────────
const DISCORD_CLIENT_ID  = '1506207606027583548';
const DISCORD_REDIRECT   = encodeURIComponent('https://stonebridgebayrp.netlify.app/auth.html');
const DISCORD_SCOPE      = 'identify';
const DISCORD_LOGIN_URL  =
  `https://discord.com/oauth2/authorize` +
  `?client_id=${DISCORD_CLIENT_ID}` +
  `&redirect_uri=${DISCORD_REDIRECT}` +
  `&response_type=code` +
  `&scope=${DISCORD_SCOPE}`;

/** Reindirizza l'utente al login Discord. */
function discordLogin() {
  window.location.href = DISCORD_LOGIN_URL;
}

// ────────────────────────────────────────────────
// UTILITÀ
// ────────────────────────────────────────────────
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ────────────────────────────────────────────────
// INIT — eseguito al caricamento della pagina
// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Aggiorna badge e render iniziale
  renderCart();
  updateCartBadge();
  initProductButtons();

  // Overlay carrello → chiudi cliccando fuori
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Scrolla navbar: aggiungi classe "scrolled"
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  });
});
