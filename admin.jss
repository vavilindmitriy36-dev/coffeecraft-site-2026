// Авторизация
const authBlock = document.getElementById('authBlock');
const adminPanel = document.getElementById('adminPanel');

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const login = document.getElementById('adminLogin').value;
  const pass = document.getElementById('adminPass').value;

  if (login === 'admin' && pass === 'admin123') {
    sessionStorage.setItem('is_admin', 'true');
    showAdminPanel();
  } else {
    alert('Неверный логин или пароль!');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('is_admin');
  location.reload();
});

function showAdminPanel() {
  authBlock.style.display = 'none';
  adminPanel.style.display = 'block';
  loadOrders();
  loadBookings();
  loadAdminMenu();
  loadAdminPromos();
}

// Проверка сессии при загрузке
if (sessionStorage.getItem('is_admin') === 'true') {
  showAdminPanel();
}

// Переключение вкладок
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// 1. Управление Заказами
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('coffee_orders')) || [];
  const container = document.getElementById('ordersList');
  container.innerHTML = orders.length === 0 ? '<p>Заказов нет</p>' : '';

  orders.reverse().forEach(o => {
    const itemsStr = o.items.map(i => `${i.name} x${i.count}`).join(', ');
    const el = document.createElement('div');
    el.className = 'data-card';
    el.innerHTML = `
      <div><strong>Заказ #${o.id.toString().slice(-4)}</strong> <span class="status-badge ${o.status === 'Новый' ? 'status-new' : 'status-done'}">${o.status}</span></div>
      <div><strong>Клиент:</strong> ${o.customer} (${o.phone})</div>
      <div><strong>Тип:</strong> ${o.type === 'takeaway' ? 'С собой' : 'В заведении'}</div>
      <div><strong>Состав:</strong> ${itemsStr}</div>
      <div style="font-weight:bold; margin-top:5px;">Сумма: ${o.total} ₸</div>
      <div style="margin-top: 8px;">
        ${o.status === 'Новый' ? `<button class="action-btn btn-success" onclick="toggleOrderStatus(${o.id})">Выполнить</button>` : ''}
        <button class="action-btn btn-danger" onclick="deleteOrder(${o.id})">Удалить</button>
      </div>
    `;
    container.appendChild(el);
  });
}

window.toggleOrderStatus = function(id) {
  let orders = JSON.parse(localStorage.getItem('coffee_orders'));
  orders = orders.map(o => o.id === id ? { ...o, status: 'Завершён' } : o);
  localStorage.setItem('coffee_orders', JSON.stringify(orders));
  loadOrders();
};

window.deleteOrder = function(id) {
  let orders = JSON.parse(localStorage.getItem('coffee_orders'));
  orders = orders.filter(o => o.id !== id);
  localStorage.setItem('coffee_orders', JSON.stringify(orders));
  loadOrders();
};

// 2. Управление Бронированиями
function loadBookings() {
  const bookings = JSON.parse(localStorage.getItem('coffee_bookings')) || [];
  const container = document.getElementById('bookingsList');
  container.innerHTML = bookings.length === 0 ? '<p>Бронирований нет</p>' : '';

  bookings.reverse().forEach(b => {
    const el = document.createElement('div');
    el.className = 'data-card';
    el.innerHTML = `
      <div><strong>Бронь от:</strong> ${b.name} (${b.phone})</div>
      <div><strong>Дата и время:</strong> ${b.date} в ${b.time}</div>
      <div><strong>Гостей:</strong> ${b.guests}</div>
      <div style="margin-top:8px;">
        <button class="action-btn btn-danger" onclick="deleteBooking(${b.id})">Удалить</button>
      </div>
    `;
    container.appendChild(el);
  });
}

window.deleteBooking = function(id) {
  let bookings = JSON.parse(localStorage.getItem('coffee_bookings'));
  bookings = bookings.filter(b => b.id !== id);
  localStorage.setItem('coffee_bookings', JSON.stringify(bookings));
  loadBookings();
};

// 3. Управление Меню
function loadAdminMenu() {
  const products = JSON.parse(localStorage.getItem('coffee_products')) || [];
  const container = document.getElementById('adminMenuList');
  container.innerHTML = '';

  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'data-card';
    el.style.display = 'flex';
    el.style.justifyContent = 'space-between';
    el.style.alignItems = 'center';
    el.innerHTML = `
      <div>
        <strong>${p.name}</strong> (${p.price} ₸)
        <div style="font-size:0.8rem; color:#666;">${p.category}</div>
      </div>
      <button class="action-btn btn-danger" onclick="deleteProduct(${p.id})">Удалить</button>
    `;
    container.appendChild(el);
  });
}

document.getElementById('addProductForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const products = JSON.parse(localStorage.getItem('coffee_products')) || [];
  const newProduct = {
    id: Date.now(),
    name: document.getElementById('pName').value,
    category: document.getElementById('pCat').value,
    price: Number(document.getElementById('pPrice').value),
    desc: document.getElementById('pDesc').value,
    img: document.getElementById('pImg').value
  };

  products.push(newProduct);
  localStorage.setItem('coffee_products', JSON.stringify(products));
  alert('Товар добавлен в меню!');
  e.target.reset();
  loadAdminMenu();
});

window.deleteProduct = function(id) {
  let products = JSON.parse(localStorage.getItem('coffee_products'));
  products = products.filter(p => p.id !== id);
  localStorage.setItem('coffee_products', JSON.stringify(products));
  loadAdminMenu();
};

// 4. Управление Акциями
function loadAdminPromos() {
  const promos = JSON.parse(localStorage.getItem('coffee_promos')) || [];
  const container = document.getElementById('adminPromosList');
  container.innerHTML = '';

  promos.forEach(pr => {
    const el = document.createElement('div');
    el.className = 'data-card';
    el.style.display = 'flex';
    el.style.justifyContent = 'space-between';
    el.style.alignItems = 'center';
    el.innerHTML = `
      <div>
        <strong>${pr.title}</strong>
        <div style="font-size:0.8rem; color:#666;">${pr.desc}</div>
      </div>
      <button class="action-btn btn-danger" onclick="deletePromo(${pr.id})">Удалить</button>
    `;
    container.appendChild(el);
  });
}

document.getElementById('addPromoForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const promos = JSON.parse(localStorage.getItem('coffee_promos')) || [];
  const newPromo = {
    id: Date.now(),
    title: document.getElementById('prTitle').value,
    desc: document.getElementById('prDesc').value,
    img: document.getElementById('prImg').value
  };

  promos.push(newPromo);
  localStorage.setItem('coffee_promos', JSON.stringify(promos));
  alert('Акция добавлена!');
  e.target.reset();
  loadAdminPromos();
});

window.deletePromo = function(id) {
  let promos = JSON.parse(localStorage.getItem('coffee_promos'));
  promos = promos.filter(pr => pr.id !== id);
  localStorage.setItem('coffee_promos', JSON.stringify(promos));
  loadAdminPromos();
};

