// ================= IA2 - Question 1: DOM Manipulation & Product / Cart =================

// Use localStorage to keep cart between pages
function getCart() {
  const stored = localStorage.getItem('rm_cart');
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('rm_cart', JSON.stringify(cart));
}

// Add an item to the cart (or increase qty)
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(p => p.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1
    });
  }
  saveCart(cart);
}

// Calculate subtotal, discount, tax and total
// Discount rule: 10% off if subtotal >= 20000
function calculateTotals(cart) {
  let subtotal = 0;
  for (let i = 0; i < cart.length; i++) {
    subtotal += cart[i].price * cart[i].qty;
  }

  let discountRate = 0;
  if (subtotal >= 20000) {
    discountRate = 0.10;
  }

  const discount = subtotal * discountRate;
  const taxableAmount = subtotal - discount;
  const taxRate = 0.15;
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  // Round to nearest dollar
  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    tax: Math.round(tax),
    total: Math.round(total)
  };
}

// Render the cart table on Cart.html
function renderCart() {
  const tbody = document.getElementById('cart-body');
  if (!tbody) return; // Not on cart page

  const cart = getCart();
  tbody.innerHTML = '';

  if (cart.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'Your cart is empty.';
    row.appendChild(cell);
    tbody.appendChild(row);
  } else {
    cart.forEach(item => {
      const row = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = item.name;

      const tdPrice = document.createElement('td');
      tdPrice.textContent = item.price.toLocaleString();

      const tdQty = document.createElement('td');
      tdQty.textContent = item.qty;

      const tdSub = document.createElement('td');
      const lineTotal = item.price * item.qty;
      tdSub.textContent = lineTotal.toLocaleString();

      row.appendChild(tdName);
      row.appendChild(tdPrice);
      row.appendChild(tdQty);
      row.appendChild(tdSub);

      tbody.appendChild(row);
    });
  }

  const totals = calculateTotals(cart);

  const subEl = document.getElementById('cart-subtotal');
  const discEl = document.getElementById('cart-discount');
  const taxEl = document.getElementById('cart-tax');
  const totEl = document.getElementById('cart-total');

  if (subEl) subEl.textContent = totals.subtotal.toLocaleString();
  if (discEl) discEl.textContent = totals.discount.toLocaleString();
  if (taxEl) taxEl.textContent = totals.tax.toLocaleString();
  if (totEl) totEl.textContent = totals.total.toLocaleString();
}

// Show totals on Checkout.html
function renderCheckoutSummary() {
  const totalSpan = document.getElementById('checkout-total');
  if (!totalSpan) return; // Not on checkout page

  const cart = getCart();
  const totals = calculateTotals(cart);
  totalSpan.textContent = totals.total.toLocaleString();
}

// ================= IA2 - Extra: Render Invoice Page =================

function renderInvoice() {
  const tbody = document.getElementById('invoice-body');
  if (!tbody) return; // Not on Invoice page

  // Read latest invoice data
  const stored = localStorage.getItem('rm_last_invoice');
  let invoice;
  try {
    invoice = stored ? JSON.parse(stored) : null;
  } catch (e) {
    invoice = null;
  }

  tbody.innerHTML = '';

  if (!invoice || !invoice.cart || invoice.cart.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No invoice data found. Please complete a checkout first.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  const cart = invoice.cart;
  const totals = invoice.totals || calculateTotals(cart);

  // Fill the table with items
  cart.forEach(item => {
    const row = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = item.name;

    const tdPrice = document.createElement('td');
    tdPrice.textContent = item.price.toLocaleString();

    const tdQty = document.createElement('td');
    tdQty.textContent = item.qty;

    const tdSub = document.createElement('td');
    tdSub.textContent = (item.price * item.qty).toLocaleString();

    row.appendChild(tdName);
    row.appendChild(tdPrice);
    row.appendChild(tdQty);
    row.appendChild(tdSub);

    tbody.appendChild(row);
  });

  // Totals
  const subEl = document.getElementById('invoice-subtotal');
  const discEl = document.getElementById('invoice-discount');
  const taxEl = document.getElementById('invoice-tax');
  const totEl = document.getElementById('invoice-total');
  const paidEl = document.getElementById('invoice-paid');
  const changeEl = document.getElementById('invoice-change');

  if (subEl) subEl.textContent = totals.subtotal.toLocaleString();
  if (discEl) discEl.textContent = totals.discount.toLocaleString();
  if (taxEl) taxEl.textContent = totals.tax.toLocaleString();
  if (totEl) totEl.textContent = totals.total.toLocaleString();
  if (paidEl && typeof invoice.amountPaid === 'number') {
    paidEl.textContent = invoice.amountPaid.toLocaleString();
  }
  if (changeEl && typeof invoice.change === 'number') {
    changeEl.textContent = invoice.change.toLocaleString();
  }

  // Customer info
  const nameSpan = document.getElementById('invoice-customer-name');
  const addrSpan = document.getElementById('invoice-customer-address');
  const phoneSpan = document.getElementById('invoice-customer-phone');

  if (invoice.customer) {
    if (nameSpan) nameSpan.textContent = invoice.customer.name || '';
    if (addrSpan) addrSpan.textContent = invoice.customer.address || '';
    if (phoneSpan) phoneSpan.textContent = invoice.customer.phone || '';
  }

  // Date
  const dateSpan = document.getElementById('invoice-date');
  if (dateSpan) {
    const today = new Date();
    dateSpan.textContent = today.toLocaleDateString();
  }
}



// ================= IA2 - Question 2: Event Handling =================

// Handle "Add to Cart" buttons on index.html
function initAddToCartButtons() {
  const buttons = document.querySelectorAll('.add-to-cart');
  if (!buttons || buttons.length === 0) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent default link if any

      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = Number(this.dataset.price);

      if (!id || !name || isNaN(price)) return;

      addToCart({ id, name, price });

      // Simple user feedback
      alert(name + ' was added to your cart.');

      // Optionally send them to Cart page
      window.location.href = 'Cart.html';
    });
  });
}


// ================= IA2 - Question 3: Form Validation (Registration & Login) =================

function showErrorMessage(containerId, message) {
  const el = document.getElementById(containerId);
  if (el) {
    el.textContent = message;
    el.style.color = 'red';
  } else {
    // Fallback if no container in HTML
    alert(message);
  }
}

// Registration form validation
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('reg-name');
    const dob = document.getElementById('reg-dob');
    const email = document.getElementById('reg-email');
    const username = document.getElementById('reg-username');
    const password = document.getElementById('reg-password');

    let valid = true;
    let msg = '';

    // Clear previous error styling
    [fullName, dob, email, username, password].forEach(inp => {
      if (inp) inp.style.borderColor = '';
    });

    if (!fullName.value.trim()) {
      valid = false;
      msg += 'Full Name is required.\n';
      fullName.style.borderColor = 'red';
    }

    if (!dob.value) {
      valid = false;
      msg += 'Date of Birth is required.\n';
      dob.style.borderColor = 'red';
    }

    const emailValue = email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailPattern.test(emailValue)) {
      valid = false;
      msg += 'Enter a valid email address.\n';
      email.style.borderColor = 'red';
    }

    if (!username.value.trim()) {
      valid = false;
      msg += 'Username is required.\n';
      username.style.borderColor = 'red';
    }

    if (!password.value.trim()) {
      valid = false;
      msg += 'Password is required.\n';
      password.style.borderColor = 'red';
    }

    if (!valid) {
      showErrorMessage('register-error', msg);
      return;
    }

    showErrorMessage('register-error', '');
    alert('Registration successful! You can now log in.');
    window.location.href = 'login.html';
  });
}

// Login form validation (simple non-empty check)
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('login-username');
    const password = document.getElementById('login-password');

    let valid = true;
    let msg = '';

    username.style.borderColor = '';
    password.style.borderColor = '';

    if (!username.value.trim()) {
      valid = false;
      msg += 'Username is required.\n';
      username.style.borderColor = 'red';
    }

    if (!password.value.trim()) {
      valid = false;
      msg += 'Password is required.\n';
      password.style.borderColor = 'red';
    }

    if (!valid) {
      showErrorMessage('login-error', msg);
      return;
    }

    showErrorMessage('login-error', '');
    alert('Login successful.');
    window.location.href = 'index.html';
  });
}


// ================= IA2 - Question 4: Checkout Logic & Buttons =================

function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const clearBtn = document.getElementById('btn-clear-all');
  const checkoutBtn = document.getElementById('btn-checkout');
  const closeBtn = document.getElementById('btn-close');

  const nameInput = document.getElementById('checkout-name');
  const addrInput = document.getElementById('checkout-address');
  const phoneInput = document.getElementById('checkout-phone');
  const amountInput = document.getElementById('amount-paying');
  const changeSpan = document.getElementById('checkout-change');

  // Ensure totals visible
  renderCheckoutSummary();

  // "Clear All" button - clears form and cart
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      form.reset();
      localStorage.removeItem('rm_cart');
      if (changeSpan) changeSpan.textContent = '0';
      alert('Form and cart have been cleared.');
    });
  }

  // "Check Out" / Confirm button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      const cart = getCart();
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }

      const totals = calculateTotals(cart);
      const total = totals.total;

      let valid = true;
      let msg = '';

      [nameInput, addrInput, phoneInput, amountInput].forEach(inp => {
        if (inp) inp.style.borderColor = '';
      });

      if (!nameInput.value.trim()) {
        valid = false;
        msg += 'Full Name is required.\n';
        nameInput.style.borderColor = 'red';
      }

      if (!addrInput.value.trim()) {
        valid = false;
        msg += 'Address is required.\n';
        addrInput.style.borderColor = 'red';
      }

      if (!phoneInput.value.trim()) {
        valid = false;
        msg += 'Phone Number is required.\n';
        phoneInput.style.borderColor = 'red';
      }

      const amountValue = Number(amountInput.value);
      if (isNaN(amountValue) || amountValue <= 0) {
        valid = false;
        msg += 'Enter a valid amount being paid.\n';
        amountInput.style.borderColor = 'red';
      } else if (amountValue < total) {
        valid = false;
        msg += 'Amount being paid is less than the total cost.\n';
        amountInput.style.borderColor = 'red';
      }

      if (!valid) {
        showErrorMessage('checkout-error', msg);
        return;
      }

      showErrorMessage('checkout-error', '');

            const change = amountValue - total;
      if (changeSpan) changeSpan.textContent = change.toLocaleString();

      // Save invoice data for the invoice page
      const invoiceData = {
        cart: cart,
        totals: totals,
        customer: {
          name: nameInput.value.trim(),
          address: addrInput.value.trim(),
          phone: phoneInput.value.trim()
        },
        amountPaid: amountValue,
        change: change
      };

      localStorage.setItem('rm_last_invoice', JSON.stringify(invoiceData));

      alert('Payment successful! Your change is JMD ' + change.toLocaleString());

      // Clear cart and go to invoice
      localStorage.removeItem('rm_cart');
      window.location.href = 'Invoice.html';

    });
  }
}


// ================= Initialise everything on each page =================

document.addEventListener('DOMContentLoaded', function () {
  initAddToCartButtons();
  renderCart();
  initRegisterForm();
  initLoginForm();
  initCheckoutPage();
  renderCheckoutSummary(); // in case only summary needed
  renderInvoice();
});
