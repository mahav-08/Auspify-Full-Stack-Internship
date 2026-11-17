let products = [];
let cart = [];

const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

async function loadProducts() {
    try {
        const response = await fetch("/api/products");
        products = await response.json();
        displayProducts();
    } catch (error) {
        productList.textContent = "Unable to load products.";
    }
}

function displayProducts() {
    productList.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <h1>🛍️</h1>
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p>Price: ₹${product.price}</p>
            <button onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        `;

        productList.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    displayCart();
}

function displayCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const element = document.createElement("p");
        element.textContent =
            `${item.name} - ₹${item.price} × ${item.quantity}`;

        cartItems.appendChild(element);
    });

    cartTotal.textContent = total;
}

document.getElementById("checkoutBtn").addEventListener("click", async () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        alert("Order placed successfully! Order ID: " + result.order.id);

        cart = [];
        displayCart();

    } catch (error) {
        alert("Unable to place order. Please try again.");
    }
});

loadProducts();
displayCart();

// User Registration
document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();
    document.getElementById("accountMessage").textContent = result.message;

    if (response.ok) {
        this.reset();
    }
});

// User Login
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    document.getElementById("accountMessage").textContent = result.message;

    if (response.ok) {
        this.reset();
    }
});
// View Order History
document.getElementById("viewOrdersBtn").addEventListener("click", async function () {
    try {
        const response = await fetch("/api/orders");
        const orders = await response.json();

        const orderHistory = document.getElementById("orderHistory");
        orderHistory.innerHTML = "";

        if (orders.length === 0) {
            orderHistory.textContent = "No orders found.";
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement("div");

            orderDiv.innerHTML = `
                <h3>Order ID: ${order.id}</h3>
                <p>Total: ₹${order.total}</p>
                <p>Date: ${new Date(order.date).toLocaleString()}</p>
                <h4>Products:</h4>
                ${order.items.map(item =>
                    `<p>${item.productName} - ₹${item.price} × ${item.quantity}</p>`
                ).join("")}
                <hr>
            `;

            orderHistory.appendChild(orderDiv);
        });

    } catch (error) {
        alert("Unable to load order history.");
    }
});