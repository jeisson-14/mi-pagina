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
        try {
            const product = {
                id: Date.now(),
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                description: document.getElementById('product-description').value,
                price: document.getElementById('product-price').value,
                image: e.target.result,
                sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value)
            };

            console.log('New product to add:', product);

            // Validate sizes
            if (product.sizes.length === 0) {
                alert('Por favor seleccione al menos una talla');
                return;
            }

            // If "Serie Completa" is selected, add all sizes
            if (product.sizes.includes('serie')) {
                product.sizes = ['17', '18', '19', '20', 'serie'];
            }

            // Get current products
            let products = [];
            try {
                const storedProducts = localStorage.getItem('products');
                if (storedProducts) {
                    products = JSON.parse(storedProducts);
                }
            } catch (error) {
                console.error('Error reading products from localStorage:', error);
                alert('Error al leer los productos existentes');
                return;
            }

            // Add new product
            products.push(product);

            // Try to save to localStorage
            try {
                localStorage.setItem('products', JSON.stringify(products));
                console.log('Products saved successfully. Total products:', products.length);
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                if (error.name === 'QuotaExceededError') {
                    alert('No se pueden almacenar más productos. El almacenamiento está lleno.');
                } else {
                    alert('Error al guardar el producto: ' + error.message);
                }
                return;
            }

            // Reset form and reload products
            event.target.reset();
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('add-product-form').style.display = 'none';
            
            // Recargar productos en todas las vistas
            loadProducts();
            showCategoryProducts('ninos');
            showCategoryProducts('ninas');
            
            // Show success message
            alert('Producto agregado exitosamente');
        } catch (error) {
            console.error('Error in handleAddProduct:', error);
            alert('Error al procesar el producto: ' + error.message);
        }
    };

    reader.readAsDataURL(imageFile);
}

// Función para formatear precios con puntos
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Load products for admin view
function loadProducts() {
    console.log('Loading products...');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    console.log('Products from localStorage:', products);
    const adminGrid = document.getElementById('admin-products-grid');
    adminGrid.innerHTML = '';

    if (products.length === 0) {
        console.log('No products found');
        adminGrid.innerHTML = '<p class="no-products">No hay productos disponibles. ¡Agrega tu primer producto!</p>';
        return;
    }

    products.forEach((product, index) => {
        console.log('Creating product card for:', product.name);
        const productCard = document.createElement('div');
        productCard.className = 'producto-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x200?text=Imagen+No+Disponible'">
            <h3>${product.name}</h3>
            <p class="descripcion">${product.description}</p>
            <p class="precio">${formatPrice(product.price)}</p>
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
    console.log('Showing products for category:', category);
    let products = [];
    
    try {
        const storedProducts = localStorage.getItem('products');
        console.log('Stored products:', storedProducts);
        
        if (!storedProducts) {
            console.log('No products in localStorage, loading samples...');
            products = loadSampleProducts();
        } else {
            products = JSON.parse(storedProducts);
        }
        
        console.log('All products:', products);
        const categoryProducts = products.filter(product => product.category === category);
        console.log('Filtered products for category:', categoryProducts);
        
        // Encontrar el contenedor correcto para la categoría
        const categoryTitle = category === 'ninos' ? 'Niños' : 'Niñas';
        const categoriaProductos = document.querySelectorAll('.categoria-productos');
        let productsGrid = null;
        
        categoriaProductos.forEach(container => {
            const title = container.querySelector('h3');
            if (title && title.textContent.includes(categoryTitle)) {
                productsGrid = container.querySelector('.productos-grid');
            }
        });
        
        console.log('Products grid element:', productsGrid);
        
        if (!productsGrid) {
            console.error('No se encontró el contenedor de productos para la categoría:', category);
            return;
        }
        
        // Limpiar y poblar el grid
        productsGrid.innerHTML = '';
        
        if (categoryProducts.length === 0) {
            console.log('No products found for category');
            productsGrid.innerHTML = '<p class="no-products">No hay productos disponibles en esta categoría.</p>';
            return;
        }

        categoryProducts.forEach(product => {
            console.log('Creating product card for:', product.name);
            const productCard = document.createElement('div');
            productCard.className = 'producto-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x200?text=Imagen+No+Disponible'">
                <h3>${product.name}</h3>
                <p class="descripcion">${product.description}</p>
                <p class="precio">${formatPrice(product.price)}</p>
                <div class="tallas-disponibles">
                    <h4>Tallas Disponibles:</h4>
                    <div class="tallas-grid">
                        ${['17', '18', '19', '20'].map(size => `
                            <label class="talla-option">
                                <input type="checkbox" name="talla-${product.name}" value="${size}">
                                <span>${size}</span>
                            </label>
                        `).join('')}
                        <label class="talla-option serie-completa">
                            <input type="checkbox" name="talla-${product.name}" value="serie">
                            <span>Serie Completa</span>
                        </label>
                    </div>
                </div>
                <button type="button" class="add-to-cart" onclick="addToCart(this)" 
                    data-producto="${product.name}" 
                    data-precio="${product.price}" 
                    data-imagen="${product.image}">
                    <i class="fas fa-cart-plus"></i> Agregar al carrito
                </button>
            `;
            productsGrid.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error showing category products:', error);
        productsGrid.innerHTML = '<p class="error">Error al cargar los productos. Por favor, recarga la página.</p>';
    }
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
    
    // Mostrar la imagen actual
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `<img src="${product.image}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
    
    // Check the appropriate size checkboxes
    document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
        checkbox.checked = product.sizes.includes(checkbox.value);
    });

    // Show form and scroll to it
    const form = document.getElementById('add-product-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });

    // Cambiar el botón de submit para actualizar
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Actualizar Producto';
    
    // Guardar el índice del producto que se está editando
    form.dataset.editIndex = index;
    
    // Cambiar el manejador del formulario
    form.onsubmit = function(event) {
        event.preventDefault();
        updateProduct(index);
    };
}

// Función para actualizar el producto
function updateProduct(index) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products[index];
    
    // Obtener los valores del formulario
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const sizes = Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value);
    
    // Validar campos
    if (!name || !category || !description || !price || sizes.length === 0) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Si "Serie Completa" está seleccionada, agregar todas las tallas
    if (sizes.includes('serie')) {
        sizes.splice(sizes.indexOf('serie'), 1);
        sizes.push('17', '18', '19', '20', 'serie');
    }
    
    // Actualizar el producto
    products[index] = {
        ...product,
        name,
        category,
        description,
        price,
        sizes
    };
    
    // Guardar en localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Resetear el formulario
    document.getElementById('add-product-form').reset();
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('image-preview').innerHTML = '';
    
    // Recargar productos
    loadProducts();
    showCategoryProducts('ninos');
    showCategoryProducts('ninas');
    
    // Mostrar mensaje de éxito
    alert('Producto actualizado exitosamente');
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

// Función para cargar productos de ejemplo
function loadSampleProducts() {
    console.log('Loading sample products...');
    const sampleProducts = [
        {
            id: 1,
            name: "Zapato Ortopédico Niño Azul",
            category: "ninos",
            description: "Zapato ortopédico para niño con soporte de arco y material transpirable",
            price: 85000,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            sizes: ["17", "18", "19", "20", "serie"]
        },
        {
            id: 2,
            name: "Zapato Ortopédico Niño Negro",
            category: "ninos",
            description: "Zapato ortopédico para niño con suela antideslizante y ajuste perfecto",
            price: 90000,
            image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            sizes: ["17", "18", "19", "20", "serie"]
        },
        {
            id: 3,
            name: "Zapato Ortopédico Niña Rosa",
            category: "ninas",
            description: "Zapato ortopédico para niña con diseño elegante y cómodo",
            price: 85000,
            image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            sizes: ["17", "18", "19", "20", "serie"]
        },
        {
            id: 4,
            name: "Zapato Ortopédico Niña Blanco",
            category: "ninas",
            description: "Zapato ortopédico para niña con detalles en rosa y suela flexible",
            price: 90000,
            image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            sizes: ["17", "18", "19", "20", "serie"]
        }
    ];

    try {
        localStorage.setItem('products', JSON.stringify(sampleProducts));
        console.log('Sample products saved to localStorage:', sampleProducts);
        return sampleProducts;
    } catch (error) {
        console.error('Error saving sample products:', error);
        return [];
    }
}

// Load hero settings on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Cargar configuración del hero
    const heroSettings = JSON.parse(localStorage.getItem('heroSettings') || '{}');
    if (Object.keys(heroSettings).length > 0) {
        updateHeroSection(heroSettings);
    }
    
    // Verificar si hay productos en localStorage
    let products = [];
    try {
        const storedProducts = localStorage.getItem('products');
        if (!storedProducts) {
            console.log('No products found, loading sample products');
            products = loadSampleProducts();
        } else {
            products = JSON.parse(storedProducts);
        }
        console.log('Products loaded on page load:', products);
    } catch (error) {
        console.error('Error loading products:', error);
        products = loadSampleProducts();
    }
    
    // Mostrar productos en ambas categorías
    showCategoryProducts('ninos');
    showCategoryProducts('ninas');
    
    updateLoginButton();
}); 