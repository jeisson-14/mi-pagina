// User authentication state
let currentUser = null;
let isAdmin = false;

// Show login modal
function showLoginForm() {
    document.getElementById('login-modal').style.display = 'block';
}

// Close login modal
function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Here you would typically make an API call to verify credentials
    // For demo purposes, we'll use a simple check
    if (email === 'admin@pequepies.com' && password === 'admin123') {
        currentUser = { email, name: 'Admin' };
        isAdmin = true;
        closeLoginModal();
        showAdminInterface();
        updateLoginButton();
        // Scroll to admin section
        document.getElementById('product-management').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Credenciales inválidas');
    }
}

// Show admin interface
function showAdminInterface() {
    const adminSection = document.getElementById('product-management');
    adminSection.style.display = 'block';
    loadProducts();
    
    // Add admin indicator
    const adminIndicator = document.createElement('div');
    adminIndicator.className = 'admin-indicator';
    adminIndicator.innerHTML = '<i class="fas fa-user-shield"></i> Modo Administrador';
    adminSection.insertBefore(adminIndicator, adminSection.firstChild);
}

// Update login button based on auth state
function updateLoginButton() {
    const loginLink = document.getElementById('login-link');
    if (isAdmin) {
        loginLink.innerHTML = '<i class="fas fa-user-check"></i> Admin';
        loginLink.onclick = function() {
            if (confirm('¿Desea cerrar sesión?')) {
                currentUser = null;
                isAdmin = false;
                document.getElementById('product-management').style.display = 'none';
                updateLoginButton();
            }
        };
    } else {
        loginLink.innerHTML = '<i class="fas fa-user"></i> Admin';
        loginLink.onclick = showLoginForm;
    }
}

// Show add product form
function showAddProductForm() {
    const form = document.getElementById('add-product-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
    
    // Reset form
    form.querySelector('form').reset();
}

// Handle image preview
document.getElementById('product-image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        const preview = document.getElementById('image-preview');
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
        }
        
        reader.readAsDataURL(file);
    }
});

// Handle adding new product
function handleAddProduct(event) {
    event.preventDefault();
    
    const imageFile = document.getElementById('product-image').files[0];
    if (!imageFile) {
        alert('Por favor seleccione una imagen');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const product = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            price: document.getElementById('product-price').value,
            image: e.target.result, // Store the image as base64
            sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value)
        };

        // Validate sizes
        if (product.sizes.length === 0) {
            alert('Por favor seleccione al menos una talla');
            return;
        }

        // If "Serie Completa" is selected, add all sizes
        if (product.sizes.includes('serie')) {
            product.sizes = ['17', '18', '19', '20', 'serie'];
        }

        // Store in localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));

        // Reset form and reload products
        event.target.reset();
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('add-product-form').style.display = 'none';
        loadProducts();
        
        // Show success message
        alert('Producto agregado exitosamente');
    };

    reader.readAsDataURL(imageFile);
}

// Load products for admin view
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const adminGrid = document.getElementById('admin-products-grid');
    adminGrid.innerHTML = '';

    if (products.length === 0) {
        adminGrid.innerHTML = '<p class="no-products">No hay productos disponibles. ¡Agrega tu primer producto!</p>';
        return;
    }

    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'producto-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="descripcion">${product.description}</p>
            <p class="precio">$${product.price}</p>
            <p class="categoria">Categoría: ${product.category === 'ninos' ? 'Niños' : 'Niñas'}</p>
            <p class="tallas">Tallas: ${product.sizes.includes('serie') ? 'Serie Completa (17-20)' : product.sizes.join(', ')}</p>
            <div class="admin-actions">
                <button onclick="editProduct(${index})" class="edit-button">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="deleteProduct(${index})" class="delete-button">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        adminGrid.appendChild(productCard);
    });
}

// Show products by category
function showCategoryProducts(category) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const categoryProducts = products.filter(product => product.category === category);
    const productsGrid = document.querySelector(`.categoria-productos:has(h3:contains('${category === 'ninos' ? 'Niños' : 'Niñas'}')) .productos-grid`);
    
    // Clear and populate grid
    productsGrid.innerHTML = '';
    
    if (categoryProducts.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No hay productos disponibles en esta categoría.</p>';
    } else {
        categoryProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'producto-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="descripcion">${product.description}</p>
                <p class="precio">$${product.price}</p>
                <select class="size-select">
                    ${product.sizes.includes('serie') 
                        ? '<option value="serie">Serie Completa (17-20)</option>' 
                        : product.sizes.map(size => `<option value="${size}">Talla ${size}</option>`).join('')}
                </select>
                <button type="button" class="add-to-cart" data-producto="${product.name}" data-precio="${product.price}" data-imagen="${product.image}">
                    <i class="fas fa-cart-plus"></i> Agregar al carrito
                </button>
            `;
            productsGrid.appendChild(productCard);
        });
    }
    
    // Scroll to the category section
    productsGrid.closest('.categoria-productos').scrollIntoView({ behavior: 'smooth' });
}

// Edit product
function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products[index];
    
    // Populate form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    
    // Check the appropriate size checkboxes
    document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
        checkbox.checked = product.sizes.includes(checkbox.value);
    });

    // Show form and scroll to it
    const form = document.getElementById('add-product-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });

    // Remove the old product
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
}

// Delete product
function deleteProduct(index) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        alert('Producto eliminado exitosamente');
    }
}

// Show hero settings form
function showHeroSettings() {
    const form = document.getElementById('hero-settings');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
    
    // Load current settings
    const heroSettings = JSON.parse(localStorage.getItem('heroSettings') || '{}');
    document.getElementById('hero-title').value = heroSettings.title || 'Pequepies';
    document.getElementById('hero-subtitle').value = heroSettings.subtitle || 'El calzado ortopédico ideal para tu bebé';
    
    // Show current image if exists
    if (heroSettings.image) {
        document.getElementById('hero-image-preview').innerHTML = 
            `<img src="${heroSettings.image}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
    }
}

// Handle hero image preview
document.getElementById('hero-image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        const preview = document.getElementById('hero-image-preview');
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
        }
        
        reader.readAsDataURL(file);
    }
});

// Handle hero settings form submission
function handleHeroSettings(event) {
    event.preventDefault();
    
    const heroImage = document.getElementById('hero-image').files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const heroSettings = {
            title: document.getElementById('hero-title').value,
            subtitle: document.getElementById('hero-subtitle').value,
            image: heroImage ? e.target.result : JSON.parse(localStorage.getItem('heroSettings') || '{}').image
        };
        
        // Save settings
        localStorage.setItem('heroSettings', JSON.stringify(heroSettings));
        
        // Update hero section
        updateHeroSection(heroSettings);
        
        // Hide form and show success message
        document.getElementById('hero-settings').style.display = 'none';
        alert('Configuración guardada exitosamente');
    };
    
    if (heroImage) {
        reader.readAsDataURL(heroImage);
    } else {
        reader.onload();
    }
}

// Update hero section with new settings
function updateHeroSection(settings) {
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero');
    
    // Update text content
    heroContent.querySelector('h2').textContent = settings.title;
    heroContent.querySelector('p').textContent = settings.subtitle;
    
    // Update background image if provided
    if (settings.image) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${settings.image}')`;
    }
}

// Load hero settings on page load
document.addEventListener('DOMContentLoaded', () => {
    const heroSettings = JSON.parse(localStorage.getItem('heroSettings') || '{}');
    if (Object.keys(heroSettings).length > 0) {
        updateHeroSection(heroSettings);
    }
    updateLoginButton();
    // Load products for both categories
    showCategoryProducts('ninos');
    showCategoryProducts('ninas');
}); 