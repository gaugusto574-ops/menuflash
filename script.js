document.addEventListener('DOMContentLoaded', () => {
    // State
    let menuItems = [];
    let cart = [];
    let storeConfig = {};

    // DOM Elements
    const menuList = document.getElementById('menu-list');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModalBtn = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    
    // Admin DOM Elements
    const addItemForm = document.getElementById('add-item-form');
    const adminMenuItems = document.getElementById('admin-menu-items');
    const saveConfigBtn = document.getElementById('save-config-btn');

    // View Switching
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    const navMenuBtn = document.getElementById('nav-menu');
    const navAdminBtn = document.getElementById('nav-admin');

    const STORAGE_KEY = 'digital-menu-items';
    const CONFIG_STORAGE_KEY = 'storeConfig';

    // --- INITIALIZATION ---
    function init() {
        loadStoreConfig();
        applyStoreConfig();
        loadMenuItems();
        renderMenu();
        renderCart();
        renderAdminMenu();
        setupEventListeners();
    }

    function setupEventListeners() {
        menuList.addEventListener('click', handleMenuClick);
        cartItemsList.addEventListener('click', handleCartClick);
        checkoutBtn.addEventListener('click', () => toggleModal(true));
        closeModalBtn.addEventListener('click', () => toggleModal(false));
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) toggleModal(false);
        });
        checkoutForm.addEventListener('submit', handleCheckout);

        // Admin Listeners
        addItemForm.addEventListener('submit', handleAddItem);
        adminMenuItems.addEventListener('click', handleDeleteItem);
        saveConfigBtn.addEventListener('click', saveStoreConfig);

        // View Switching Listeners
        navMenuBtn.addEventListener('click', () => switchView('user'));
        navAdminBtn.addEventListener('click', () => switchView('admin'));
    }
    
    // --- DATA PERSISTENCE ---
    function loadStoreConfig() {
        storeConfig = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY) || '{}');
        document.getElementById('storeName').value = storeConfig.name || '';
        document.getElementById('storeColor').value = storeConfig.color || '#ff5722';
    }

    function saveStoreConfig() {
        storeConfig = {
            name: document.getElementById('storeName').value,
            color: document.getElementById('storeColor').value
        };
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(storeConfig));
        applyStoreConfig();
        alert('Configurações salvas!');
    }

    function applyStoreConfig() {
        if (storeConfig.name) {
            document.querySelector('header h1').textContent = storeConfig.name;
            document.title = storeConfig.name;
        }
        if (storeConfig.color) {
            const color = storeConfig.color;
            document.querySelector('header').style.background = color;
            document.querySelectorAll('h2').forEach(h => {
                h.style.color = color;
                h.style.borderColor = color;
            });
            document.querySelectorAll('.menu-item button, .modal-content button').forEach(btn => btn.style.backgroundColor = color);
            document.querySelectorAll('.nav button').forEach(btn => {
                btn.style.borderColor = color;
                btn.style.color = color;
            });
            document.querySelectorAll('.nav button.active, .nav button:hover').forEach(btn => {
                 // We need to use a more specific rule or !important to override hover.
                 // Let's create a dynamic style rule for this.
            });

            // Create or update a style tag for dynamic hover/active effects
            let dynamicStyle = document.getElementById('dynamic-styles');
            if (!dynamicStyle) {
                dynamicStyle = document.createElement('style');
                dynamicStyle.id = 'dynamic-styles';
                document.head.appendChild(dynamicStyle);
            }
            dynamicStyle.innerHTML = `
                .nav button.active, .nav button:hover { background-color: ${color} !important; color: white !important; }
                .menu-item button:hover { background: ${getDarkerColor(color, 20)}; }
            `;
        }
    }

    function loadMenuItems() {
        const storedItems = localStorage.getItem(STORAGE_KEY);
        if (storedItems) {
            menuItems = JSON.parse(storedItems);
        } else {
            // Default items if localStorage is empty
            menuItems = [
                { id: 1, name: 'Hambúrguer Clássico', description: 'Pão, carne, queijo, alface e tomate', price: 25.50, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' },
                { id: 2, name: 'Pizza Margherita', description: 'Molho de tomate, mussarela e manjericão', price: 40.00, image: 'https://images.unsplash.com/photo-1598021680133-eb3a7fb15438?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' },
                { id: 3, name: 'Salada Caesar', description: 'Alface, frango grelhado, croutons e molho caesar', price: 22.00, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' },
                { id: 4, name: 'Batata Frita', description: 'Porção generosa de batatas fritas crocantes', price: 15.00, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600' },
            ];
            saveMenuItems();
        }
    }

    function saveMenuItems() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
    }

    // --- RENDER FUNCTIONS ---
    function renderMenu() {
        menuList.innerHTML = '';
        menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <img src="${item.image || 'https://placehold.co/600x400?text=Comida'}" alt="${item.name}">
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-price">R$ ${item.price.toFixed(2)}</div>
                    <button data-id="${item.id}">Adicionar ao Carrinho</button>
                </div>
            `;
            menuList.appendChild(itemElement);
        });
    }

    function renderCart() {
        cartItemsList.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li>Seu carrinho está vazio.</li>';
        } else {
            cart.forEach(cartItem => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <span>${cartItem.name} (x${cartItem.quantity})</span>
                    <div class="cart-item-controls">
                        <span>R$ ${(cartItem.price * cartItem.quantity).toFixed(2)}</span>
                        <button class="quantity-btn" data-id="${cartItem.id}" data-change="-1">-</button>
                        <button class="quantity-btn" data-id="${cartItem.id}" data-change="1">+</button>
                        <button class="remove-btn" data-id="${cartItem.id}">×</button>
                    </div>
                `;
                cartItemsList.appendChild(li);
                total += cartItem.price * cartItem.quantity;
            });
        }
        cartTotal.textContent = total.toFixed(2);
    }
    
    function renderAdminMenu() {
        adminMenuItems.innerHTML = '';
        menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'admin-item';
            itemElement.innerHTML = `
                <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
                <button data-id="${item.id}">Excluir</button>
            `;
            adminMenuItems.appendChild(itemElement);
        });
    }

    // --- EVENT HANDLERS ---
    function handleMenuClick(e) {
        if (e.target.tagName === 'BUTTON') {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        }
    }

    function handleCartClick(e) {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('quantity-btn')) {
            const change = parseInt(e.target.dataset.change);
            updateCartQuantity(id, change);
        }
        if (e.target.classList.contains('remove-btn')) {
            removeFromCart(id);
        }
    }

    function handleCheckout(e) {
        e.preventDefault();
        const customerName = document.getElementById('customer-name').value;
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        alert(`Obrigado pelo seu pedido, ${customerName}!\nSeu pedido foi enviado para a cozinha.`);
        cart = [];
        renderCart();
        toggleModal(false);
        checkoutForm.reset();
    }
    
    function handleAddItem(e) {
        e.preventDefault();
        const name = document.getElementById('item-name').value;
        const description = document.getElementById('item-description').value;
        const price = parseFloat(document.getElementById('item-price').value);
        const image = document.getElementById('item-image').value;

        if (name && description && !isNaN(price)) {
            const newItem = {
                id: Date.now(),
                name,
                description,
                price,
                image
            };
            menuItems.push(newItem);
            saveMenuItems();
            renderMenu();
            renderAdminMenu();
            addItemForm.reset();
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    }

    function handleDeleteItem(e) {
        if (e.target.tagName === 'BUTTON') {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Tem certeza que deseja excluir este item?')) {
                menuItems = menuItems.filter(item => item.id !== id);
                saveMenuItems();
                renderMenu();
                renderAdminMenu();
            }
        }
    }

    // --- CORE LOGIC ---
    function addToCart(itemId) {
        const menuItem = menuItems.find(item => item.id === itemId);
        const cartItem = cart.find(item => item.id === itemId);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...menuItem, quantity: 1 });
        }
        renderCart();
    }


    function updateCartQuantity(itemId, change) {
        const cartItem = cart.find(item => item.id === itemId);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) {
                removeFromCart(itemId);
            } else {
                renderCart();
            }
        }
    }
    
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        renderCart();
    }
    
    function toggleModal(show) {
        if (show) {
            if (cart.length === 0) {
                alert('Adicione itens ao carrinho antes de finalizar o pedido.');
                return;
            }
            checkoutModal.classList.add('show');
        } else {
            checkoutModal.classList.remove('show');
        }
    }

    function switchView(view) {
        if (view === 'admin') {
            adminView.style.display = 'block';
            userView.style.display = 'none';
            navAdminBtn.classList.add('active');
            navMenuBtn.classList.remove('active');
        } else { // 'user'
            userView.style.display = 'block';
            adminView.style.display = 'none';
            navMenuBtn.classList.add('active');
            navAdminBtn.classList.remove('active');
        }
    }

    function getDarkerColor(hex, percent) {
        hex = hex.replace(/^\s*#|\s*$/g, '');
        if(hex.length == 3){
            hex = hex.replace(/(.)/g, '$1$1');
        }
        let r = parseInt(hex.substr(0, 2), 16),
            g = parseInt(hex.substr(2, 2), 16),
            b = parseInt(hex.substr(4, 2), 16);

        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);

        return '#' + 
               ('00' + r.toString(16)).slice(-2) + 
               ('00' + g.toString(16)).slice(-2) + 
               ('00' + b.toString(16)).slice(-2);
    }

    // Start the app
    init();
});