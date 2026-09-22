// Стартовый массив товаров (если LocalStorage пустой)
const defaultProducts = [
  { id: 1, name: "Капучино", category: "coffee", price: 1500, desc: "Классический кофе с пышной молочной пеной", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Латте", category: "coffee", price: 1600, desc: "Мягкий кофейный напиток с большим количеством молока", img: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Чизкейк Нью-Йорк", category: "desserts", price: 1800, desc: "Классический нежный творожный десерт", img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Матча Латте", category: "drinks", price: 1800, desc: "Японский зелёный чай матча с молоком", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80" }
];

// Инициализация товаров в LocalStorage
if (!localStorage.getItem('coffee_products')) {
  localStorage.setItem('coffee_products', JSON.stringify(defaultProducts));
}

let products = JSON.parse(localStorage.getItem('coffee_products'));
let cart = JSON.parse(localStorage.getItem('coffee_cart')) || [];
let currentCategory = 'all';
let searchQuery = '';

// Элементы DOM
document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const cartCount = document.getElementById('cartCount');
  const cartModal = document.getElementById('cartModal');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const searchInput = document.getElementById('searchInput');

  // Функция отображения товаров
  function renderProducts() {
    products = JSON.parse(localStorage.getItem('coffee_products')) || [];
    productsGrid.innerHTML = '';

    const filtered = products.filter(p => {
      const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Ничего не найдено 😔</p>';
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}" class="product-img">
        <div class="product-info">
          <div class="product-title">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-bottom">
            <span class="product-price">${p.price} ₸</span>
            <button class="add-btn" onclick="addToCart(event, ${p.id})">+</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  // Фильтр по категориям
  document.getElementById('categoryFilters').addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-btn')) {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      renderProducts();
    }
  });

  // Поиск
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Корзина с анимацией полёта товара
  window.addToCart = function(event, id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    // --- Анимация полёта картинки в корзину ---
    const button = event.target;
    const card = button.closest('.product-card');
    const img = card ? card.querySelector('.product-img') : null;
    const cartIcon = document.getElementById('cartToggleBtn');

    if (img && cartIcon) {
      const imgRect = img.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      const flyingImg = document.createElement('img');
      flyingImg.src = p.img;
      flyingImg.className = 'flying-item';
      
      flyingImg.style.top = imgRect.top + 'px';
      flyingImg.style.left = imgRect.left + 'px';
      flyingImg.style.width = imgRect.width + 'px';
      flyingImg.style.height = imgRect.height + 'px';
      
      document.body.appendChild(flyingImg);

      setTimeout(() => {
        flyingImg.style.top = (cartRect.top + 10) + 'px';
        flyingImg.style.left = (cartRect.left + 10) + 'px';
        flyingImg.style.width = '20px';
        flyingImg.style.height = '20px';
        flyingImg.style.opacity = '0.5';
      }, 10);

      setTimeout(() => {
        flyingImg.remove();
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
      }, 800);
    }
    // ------------------------------------------

    const item = cart.find(i => i.id === id);
    if (item) {
      item.count++;
    } else {
      cart.push({ ...p, count: 1 });
    }
    saveCart();
  };

  window.changeCount = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
      item.count += delta;
      if (item.count <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
    }
    saveCart();
  };

  function saveCart() {
    localStorage.setItem('coffee_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.count), 0);

    cartCount.textContent = totalCount;
    cartTotal.textContent = totalPrice;

    cartItems.innerHTML = cart.length === 0 ? '<p style="text-align:center; padding:10px;">Корзина пуста</p>' : '';
    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div>
          <div><strong>${item.name}</strong></div>
          <div style="font-size:0.85rem; color:#666;">${item.price} ₸ × ${item.count}</div>
        </div>
        <div>
          <button onclick="changeCount(${item.id}, -1)" style="padding: 2px 8px;">-</button>
          <span style="margin: 0 5px;">${item.count}</span>
          <button onclick="changeCount(${item.id}, 1)" style="padding: 2px 8px;">+</button>
        </div>
      `;
      cartItems.appendChild(el);
    });
  }

  // Открытие/закрытие корзины
  cartToggleBtn.addEventListener('click', () => cartModal.classList.add('active'));
  closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));

  // Оформление заказа
  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Добавьте товары в корзину!');

    const orders = JSON.parse(localStorage.getItem('coffee_orders')) || [];
    orders.push({
      id: Date.now(),
      customer: document.getElementById('clientName').value,
      phone: document.getElementById('clientPhone').value,
      type: document.getElementById('orderType').value,
      items: [...cart],
      total: cart.reduce((sum, i) => sum + (i.price * i.count), 0),
      status: 'Новый'
    });

    localStorage.setItem('coffee_orders', JSON.stringify(orders));
    cart = [];
    saveCart();
    cartModal.classList.remove('active');
    alert('Заказ успешно отправлен!');
    e.target.reset();
  });

  // Бронирование
  document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const bookings = JSON.parse(localStorage.getItem('coffee_bookings')) || [];
    bookings.push({
      id: Date.now(),
      name: document.getElementById('bookName').value,
      phone: document.getElementById('bookPhone').value,
      date: document.getElementById('bookDate').value,
      time: document.getElementById('bookTime').value,
      guests: document.getElementById('bookGuests').value
    });

    localStorage.setItem('coffee_bookings', JSON.stringify(bookings));
    alert('Столик успешно забронирован!');
    e.target.reset();
  });

  // Первоначальный рендер
  renderProducts();
  updateCartUI();
});
