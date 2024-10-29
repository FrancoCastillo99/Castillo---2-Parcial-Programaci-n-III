import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import Swal from 'sweetalert2';


let products = [];
let currentCategory = 'todo';
let currentSort = null;
let currentSearch = '';
let cart = [];
let currentEditingProduct = null;

const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'down' },
  types: [
    {
      type: 'info',
      background: '#3b82f6',
      icon: {
        className: 'fas fa-info-circle',
        tagName: 'i',
        text: ''
      }
    }
  ]
});

/* =========Render Productos========== */

function renderProducts() {
  const productsContainer = document.getElementById('products');
  const noResultsElement = document.getElementById('no-results');
  productsContainer.innerHTML = '';

  let filteredProducts = products;

  // Filtrar productos por categoría
  if (currentCategory !== 'todo') {
    filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
  }

  // Filtrar productos por búsqueda
  if (currentSearch) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }

  if (currentSort === 'asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Ordenar productos por categoría
  const categories = ['hamburguesa', 'papas', 'bebidas']; 
  const sortedProducts = categories.reduce((acc, category) => {
    const productsInCategory = filteredProducts.filter(product => product.category === category);
    acc.push(...productsInCategory);
    return acc;
  }, []);


  // Comprobar si hay productos para mostrar
  if (sortedProducts.length === 0) {
    productsContainer.style.display = 'none';
    noResultsElement.style.display = 'block';
  } else {
    productsContainer.style.display = 'grid';
    noResultsElement.style.display = 'none';

    sortedProducts.forEach(product => {
      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Precio: $${product.price}</p>
        <div>
          <button class="add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
          <button class="edit-product" data-id="${product.id}">Editar</button>
        </div>
      `;
      productsContainer.appendChild(productElement);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', addToCart);
    });

    // Add event listeners to "Edit" buttons
    document.querySelectorAll('.edit-product').forEach(button => {
      button.addEventListener('click', openEditModal);
    });
  }

  const categoryLinks = document.querySelectorAll('.sidebar ul li a');

  categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        // Remueve la clase 'selected' de todos los enlaces
        categoryLinks.forEach(l => l.classList.remove('selected'));

        // Añade la clase 'selected' al enlace seleccionado
        link.classList.add('selected');

        // Actualiza el filtro de productos según la categoría seleccionada.
        const selectedCategory = link.getAttribute('data-category');
        console.log("Categoría seleccionada:", selectedCategory); // Ejemplo de acción
    });
  });
}

/* =========Carrito========== */

function addToCart(event) {
  const productId = parseInt(event.target.dataset.id);
  const product = products.find(p => p.id === productId);
  
  // Muestra la notificación de éxito
  notyf.success(`${product.name} ha sido agregado al carrito!`);

  if (product) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    

    updateCartCount();
  }
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';

  let total = 0;

  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item'); // Clase para cada ítem
    itemElement.innerHTML = `
      <img class= "product-img" src="${item.image}" alt="${item.name}">
      <span class="product-name">${item.name}</span>
      <span class="product-price">$${item.price}</span>
      <div class="quantity-control">
        <button class="quantity-btn minus" data-id="${item.id}">-</button>
        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
        <button class="quantity-btn plus" data-id="${item.id}">+</button>
      </div>
      <button class="remove-from-cart" data-id="${item.id}">
        <span class="material-symbols-outlined">delete</span>
      </button>
    `;
    cartItems.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `Total: $${total.toFixed(2)}`;

  // Add event listeners to quantity buttons and inputs
  document.querySelectorAll('.quantity-btn.minus').forEach(button => {
    button.addEventListener('click', decreaseQuantity);
  });

  document.querySelectorAll('.quantity-btn.plus').forEach(button => {
    button.addEventListener('click', increaseQuantity);
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', updateQuantity);
  });

  // Add event listeners to "Remove from Cart" buttons
  document.querySelectorAll('.remove-from-cart').forEach(button => {
    button.addEventListener('click', removeFromCart);
  });
}

function decreaseQuantity(event) {
  const productId = parseInt(event.target.dataset.id);
  const item = cart.find(item => item.id === productId);
  if (item && item.quantity > 1) {
    item.quantity--;
    updateCartCount();
    renderCart();
  }
}

function increaseQuantity(event) {
  const productId = parseInt(event.target.dataset.id);
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity++;
    updateCartCount();
    renderCart();
  }
}

function updateQuantity(event) {
  const productId = parseInt(event.target.dataset.id);
  const newQuantity = parseInt(event.target.value);
  const item = cart.find(item => item.id === productId);
  if (item && newQuantity > 0) {
    item.quantity = newQuantity;
    updateCartCount();
    renderCart();
  }
}

function removeFromCart(event) {
  const productId = parseInt(event.target.dataset.id);
  const index = cart.findIndex(item => item.id === productId);
  const product = cart.find(p => p.id === productId);
  
  if (index !== -1) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
    notyf.error(`${product.name} ha sido eliminado del carrito`);
  }
}

/* =========Abrir popUp editar========== */

function openEditModal(event) {
  const productId = parseInt(event.target.dataset.id);
  currentEditingProduct = products.find(p => p.id === productId);
  
  if (currentEditingProduct) {
    document.getElementById('edit-product-name').value = currentEditingProduct.name;
    document.getElementById('edit-product-price').value = currentEditingProduct.price;
    document.getElementById('edit-product-category').value = currentEditingProduct.category;
    document.getElementById('edit-product-image').value = currentEditingProduct.image;
    
    document.getElementById('edit-modal').style.display = 'block';
  }
}

/* =========Editar Producto========== */

document.getElementById('edit-product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (currentEditingProduct) {
    currentEditingProduct.name = document.getElementById('edit-product-name').value;
    currentEditingProduct.price = parseFloat(document.getElementById('edit-product-price').value);
    currentEditingProduct.category = document.getElementById('edit-product-category').value;
    currentEditingProduct.image = document.getElementById('edit-product-image').value;
    
    saveProductsToLocalStorage();
    renderProducts();
    document.getElementById('edit-modal').style.display = 'none';
    currentEditingProduct = null;
    notyf.open({
      type: 'info',
      message: 'Producto actualizado correctamente'
    });
  }
});

/* =========Filtros========== */

document.querySelectorAll('.sidebar ul li a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    currentCategory = e.target.dataset.category;
    renderProducts();
  });
});

document.getElementById('sort-asc').addEventListener('click', () => {
  currentSort = 'asc';
  renderProducts();
});

document.getElementById('sort-desc').addEventListener('click', () => {
  currentSort = 'desc';
  renderProducts();
});

document.getElementById('search').addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderProducts();
});

/* =========Local Storage========== */

function saveProductsToLocalStorage() {
  localStorage.setItem('products', JSON.stringify(products));
}

function loadProductsFromLocalStorage() {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    products = JSON.parse(storedProducts);
  }
}

/* =========Agregar Producto========== */

document.getElementById('add-product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const category = document.getElementById('product-category').value;
  const image = document.getElementById('product-image').value;

  const newProduct = {
    id: products.length + 1,
    name,
    price,
    category,
    image
  };

  products.push(newProduct);
  renderProducts();
  saveProductsToLocalStorage();

  e.target.reset();

  Swal.fire({
    title: "¡Producto agregado!",
    text: `El producto "${name}" ha sido agregado exitosamente.`,
    icon: "success",
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#3085d6"
  });
});


/* =========Eliminar Producto========== */

document.getElementById('delete-product-button').addEventListener('click', () => {
  if (currentEditingProduct) {
    // Llamada a SweetAlert para confirmar la eliminación
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        const index = products.findIndex(p => p.id === currentEditingProduct.id);

        if (index !== -1) {
          products.splice(index, 1);
          saveProductsToLocalStorage();
          renderProducts();
          document.getElementById('edit-modal').style.display = 'none';
          
          // Guarda el nombre antes de establecer a null
          const deletedProductName = currentEditingProduct.name;
          currentEditingProduct = null;

          // Notificación de confirmación de eliminación
          Swal.fire({
            title: "¡Eliminado!",
            text: "El producto ha sido eliminado.",
            icon: "success"
          });
        }
      }
    });
  }
});

/* =========Modales========== */

const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const editModal = document.getElementById('edit-modal');
const closeBtns = document.getElementsByClassName('close');

cartIcon.onclick = function() {
  cartModal.style.display = 'block';
  renderCart();
}

Array.from(closeBtns).forEach(btn => {
  btn.onclick = function() {
    cartModal.style.display = 'none';
    editModal.style.display = 'none';
  }
});

window.onclick = function(event) {
  if (event.target == cartModal) {
    cartModal.style.display = 'none';
  }
  if (event.target == editModal) {
    editModal.style.display = 'none';
  }
}

/* =========Compra========== */

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    Swal.fire({
      title: 'El carrito está vacío',
      text: 'Por favor agrega productos antes de realizar la compra.',
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6'
    });
  } else {
    Swal.fire({
      title: '¡Compra realizada con éxito!',
      text: 'Gracias por tu compra. Recibirás un correo de confirmación en breve.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6'
    }).then(() => {
      // Vaciar el carrito y actualizar la interfaz
      cart = [];
      updateCartCount();
      renderCart();
      cartModal.style.display = 'none';
    });
  }
});


loadProductsFromLocalStorage();
renderProducts();
updateCartCount();