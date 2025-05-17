// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const contactForm = document.querySelector('.contacto-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Here you would typically send the data to a server
        console.log('Form submitted:', formObject);
        
        // Show success message
        alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
        this.reset();
    });
}

// Add scroll effect to header
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scroll Down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scroll Up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const dateTimeElement = document.getElementById('current-datetime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('es-ES', options);
    }
}

// Set static weather information
const weatherInfo = document.getElementById('weather-info');
if (weatherInfo) {
    weatherInfo.textContent = 'Ipiales - Clima templado';
}

// Initialize and update
updateDateTime();
setInterval(updateDateTime, 1000); // Update every second

// Initialize cart when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing cart...'); // Debug log
    
    // Add event listeners to all add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Button clicked:', this.dataset); // Debug log
            addToCart(this);
        });
    });
    
    updateCart();
});

// Cart functionality
let cart = [];

function addToCart(button) {
    console.log('Adding to cart:', button.dataset); // Debug log
    
    const producto = button.dataset.producto;
    const precio = parseFloat(button.dataset.precio);
    const imagen = button.dataset.imagen;
    
    // Get selected size
    const sizeSelect = button.parentElement.querySelector('.size-select');
    const talla = sizeSelect ? sizeSelect.value : '17';
    
    if (!producto || !precio || !imagen) {
        console.error('Missing product data:', { producto, precio, imagen });
        return;
    }
    
    const existingItem = cart.find(item => item.producto === producto && item.talla === talla);
    
    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        cart.push({
            producto,
            precio,
            imagen,
            talla,
            cantidad: 1
        });
    }
    
    updateCart();
    showNotification('Producto agregado al carrito');
}

window.updateCart = function() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-amount');
    
    if (!cartItems || !cartCount || !cartTotal) {
        console.error('Cart elements not found');
        return;
    }
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.imagen}" alt="${item.producto}">
            <div class="cart-item-info">
                <h4>${item.producto}</h4>
                <p>Talla: ${item.talla}</p>
                <p>$${item.precio.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button type="button" onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.cantidad}</span>
                <button type="button" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
        </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    cartTotal.textContent = total.toFixed(2);
}

window.updateQuantity = function(index, change) {
    if (index < 0 || index >= cart.length) {
        console.error('Invalid cart index:', index);
        return;
    }
    
    cart[index].cantidad += change;
    
    if (cart[index].cantidad <= 0) {
        cart.splice(index, 1);
    }
    
    updateCart();
}

window.clearCart = function() {
    cart = [];
    updateCart();
    showNotification('Carrito vaciado');
}

window.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

window.sendOrderToWhatsApp = function() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío');
        return;
    }
    
    const phoneNumber = '573105822406'; // Your WhatsApp number
    let message = '¡Nuevo pedido!\n\n';
    
    // Obtenemos la URL actual y nos aseguramos de que sea accesible
    const currentUrl = window.location.href;
    const productUrl = currentUrl.includes('localhost') 
        ? 'http://[::1]:8000/index.html#productos'  // URL para desarrollo local
        : currentUrl.split('#')[0] + '#productos';  // URL para producción
    
    // Primero enviamos el mensaje con los detalles del pedido
    cart.forEach(item => {
        message += `${item.producto}\n`;
        message += `Talla: ${item.talla}\n`;
        message += `Cantidad: ${item.cantidad}\n`;
        message += `Precio unitario: $${item.precio.toFixed(2)}\n`;
        message += `Subtotal: $${(item.precio * item.cantidad).toFixed(2)}\n`;
        message += `Ver producto: ${productUrl}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    message += `Total: $${total.toFixed(2)}\n\n`;
    
    // Agregamos información de la tienda
    message += 'Dirección de la tienda:\n';
    message += 'Calle 10 No. 10-74 Barrio Palermo, Ipiales\n\n';
    message += 'Horario de atención:\n';
    message += 'Lunes a Viernes: 9:00 - 18:00\n';
    message += 'Sábado: 9:00 - 14:00\n\n';
    
    message += 'Puede visitar nuestra tienda o ver el producto en nuestra página web usando el enlace proporcionado.';
    
    // Enviamos el mensaje de texto
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Log para depuración
    console.log('URL del producto:', productUrl);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-primary);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 2000;
        animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }

    .size-select {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
    }

    .size-select:focus {
        outline: none;
        border-color: var(--color-primary);
    }
`;
document.head.appendChild(style); 