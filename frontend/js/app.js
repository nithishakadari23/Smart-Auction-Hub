const API_BASE = "http://localhost:8083";
const PRODUCTS_URL = `${API_BASE}/products`;
const USERS_URL = `${API_BASE}/users`;
const BIDS_URL = `${API_BASE}/bids`;

// --- UI UTILS ---
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    
    let icon = "✨";
    if (type === "error") {
        icon = "⚠️";
        toast.style.borderColor = "rgba(239, 68, 68, 0.2)";
    } else if (type === "success") {
        icon = "✅";
    }
    
    toast.innerHTML = `<span style="font-size: 16px;">${icon}</span> <span style="flex: 1;">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- AUTH UTILS ---
function getUser() {
    const userStr = localStorage.getItem("auctionUser");
    return userStr ? JSON.parse(userStr) : null;
}

function checkAuth() {
    const user = getUser();
    const currentPage = window.location.pathname.split("/").pop();
    
    if (!user && currentPage !== "login.html" && currentPage !== "register.html") {
        window.location.href = "login.html";
    }
}

function logout() {
    localStorage.removeItem("auctionUser");
    window.location.href = "login.html";
}

// --- DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    const currentPage = window.location.pathname.split("/").pop();

    const myAuctionsBtn = document.getElementById("myAuctionsLink");
    const myWinsBtn = document.getElementById("myWinsLink");
    const user = getUser();
    if (myAuctionsBtn) {
        if (user && user.role === "BUYER") {
            myAuctionsBtn.style.display = "none";
        } else {
            myAuctionsBtn.onclick = () => window.location.href = "home.html?filter=my-auctions";
        }
    }
    if (myWinsBtn) myWinsBtn.onclick = () => window.location.href = "home.html?filter=my-wins";

    if (currentPage === "login.html") initLogin();
    else if (currentPage === "register.html") initRegister();
    else if (currentPage === "home.html" || currentPage === "") initHome();
    else if (currentPage === "product.html") initProductDetails();
});

// --- AUTH LOGIC ---
function initLogin() {
    const form = document.getElementById("loginForm");
    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${USERS_URL}/login?email=${email}&password=${password}`, { method: "POST" });
            const data = await res.json();

            if (data.error) {
                showToast(data.error, "error");
            } else {
                localStorage.setItem("auctionUser", JSON.stringify(data));
                window.location.href = "home.html";
            }
        } catch (err) {
            console.error("Login Error:", err);
            showToast("Connection error to server", "error");
        }
    };
}

function initRegister() {
    const form = document.getElementById("registerForm");
    form.onsubmit = async (e) => {
        e.preventDefault();
        const user = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value
        };

        try {
            const res = await fetch(`${USERS_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });
            if (res.ok) {
                showToast("Account created! Please login.", "success");
                setTimeout(() => window.location.href = "login.html", 1500);
            }
        } catch (err) {
            showToast("Registration failed", "error");
        }
    };
}

// --- HOME / DASHBOARD ---
let productTimers = {};
let homeStompClient = null;
let allProducts = [];

function initHome() {
    const user = getUser();
    document.getElementById("userNameDisplay").textContent = user.name.toUpperCase();
    
    if (user.role === "SELLER" || user.role === "ADMIN") {
        document.getElementById("createSection").style.display = "block";
    }

    const nav = document.querySelector(".nav-links");
    const historyBtn = document.createElement("button");
    historyBtn.className = "nav-item";
    historyBtn.innerHTML = "<span>📝</span> My Bids";
    historyBtn.onclick = () => window.location.href = "history.html";
    nav.insertBefore(historyBtn, nav.querySelector(".nav-item[onclick='logout()']"));

    if (user.role === "ADMIN") {
        const adminBtn = document.createElement("button");
        adminBtn.className = "nav-item";
        adminBtn.innerHTML = "<span>🛠️</span> Admin Panel";
        adminBtn.onclick = () => window.location.href = "admin.html";
        nav.insertBefore(adminBtn, historyBtn);
    }

    loadProducts();
    loadStats();
    connectHomeWebSocket();
}

function connectHomeWebSocket() {
    if (typeof SockJS === 'undefined') return;
    const socket = new SockJS(`${API_BASE}/ws`);
    homeStompClient = Stomp.over(socket);
    homeStompClient.debug = null;
    homeStompClient.connect({}, (frame) => {
        homeStompClient.subscribe('/topic/bids', (update) => {
            const bid = JSON.parse(update.body);
            const priceEl = document.getElementById(`price-${bid.product.id}`);
            if (priceEl) {
                priceEl.textContent = `₹ ${bid.amount}`;
                priceEl.classList.remove("flash");
                void priceEl.offsetWidth; 
                priceEl.classList.add("flash");
            }
        });

        homeStompClient.subscribe('/topic/products', (update) => {
            const product = JSON.parse(update.body);
            const container = document.getElementById("productList");
            if (container && !document.getElementById(`price-${product.id}`)) {
                const card = createProductCard(product);
                container.prepend(card);
                startCountdown(product.id, product.endTime);
                showToast(`New Auction: ${product.name}`, "success");
            }
        });

        homeStompClient.subscribe('/topic/status', (update) => {
            const product = JSON.parse(update.body);
            updateProductStatusUI(product.id, true);
        });

        const user = getUser();
        if (user) {
            homeStompClient.subscribe(`/topic/notifications/${user.id}`, (update) => {
                const notif = JSON.parse(update.body);
                if (notif.type === "OUTBID") {
                    showToast(`⚠️ OUTBID! Someone bid higher on ${notif.productName}`, "error");
                }
            });
        }
    });
}

function createProductCard(p) {
    const now = new Date().getTime();
    const end = new Date(p.endTime).getTime();
    const isClosed = p.closed || (now >= end);
    
    const card = document.createElement("div");
    card.className = "auction-card";
    card.id = `card-${p.id}`;
    
    let imageUrl = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : 'assets/images/placeholder.jpg';
    if (imageUrl.startsWith("/uploads")) imageUrl = API_BASE + imageUrl;
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-badge">${isClosed ? 'ARCHIVED' : 'LIVE ASSET'}</div>
            <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="card-body">
            <div id="owner-${p.id}" style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                Loading seller...
            </div>
            <h3 class="product-title">${p.name}</h3>
            <div class="price-row">
                <div>
                    <div class="price-label">Current Bid</div>
                    <div id="price-${p.id}" class="current-price">₹ ${p.currentHighestBid}</div>
                </div>
                <div style="text-align: right;">
                    <div class="price-label">Status</div>
                    <div id="status-${p.id}" style="font-size: 11px; font-weight: 800; color: ${isClosed ? 'var(--accent-rose)' : 'var(--accent-emerald)'}">
                        ${isClosed ? 'CLOSED' : 'ACTIVE'}
                    </div>
                </div>
            </div>
            <div class="timer-row">
                <div class="price-label">Time Remaining</div>
                <div id="timer-${p.id}" class="timer-value">00:00:00</div>
            </div>
            <button onclick="window.location.href='product.html?id=${p.id}'" class="btn-action">
                ${isClosed ? 'View Results' : 'Enter Arena'}
            </button>
        </div>
    `;

    // Fetch owner info after card is created
    setTimeout(() => updateOwnerInfo(p.ownerId, `owner-${p.id}`), 0);
    
    return card;
}

function displayProducts(products) {
    const container = document.getElementById("productList");
    if (!container) return;
    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; padding: 60px; text-align: center; border: 1px dashed var(--border-subtle);"><p style="color: var(--text-muted); font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">No assets match your filters.</p></div>`;
        return;
    }

    products.forEach(p => {
        container.appendChild(createProductCard(p));
        const now = new Date().getTime();
        const end = new Date(p.endTime).getTime();
        if (p.closed || now >= end) updateProductStatusUI(p.id, true);
        else startCountdown(p.id, p.endTime);
    });
}

function updateProductStatusUI(id, isClosed) {
    const statusEl = document.getElementById(`status-${id}`);
    const timerEl = document.getElementById(`timer-${id}`);
    if (statusEl && isClosed) {
        fetch(`${PRODUCTS_URL}/winner/${id}`).then(r => r.text()).then(msg => {
            statusEl.textContent = msg.toUpperCase();
            statusEl.style.color = "var(--accent-emerald)";
        });
        if (timerEl) {
            timerEl.textContent = "AUCTION ENDED";
            timerEl.style.color = "var(--text-muted)";
            timerEl.classList.remove("timer-urgent");
        }
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${PRODUCTS_URL}/all`);
        allProducts = await res.json();
        applyFilters(); // Initial render
    } catch (err) { console.error(err); }
}

function applyFilters() {
    const user = getUser();
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const category = document.getElementById("categoryFilter")?.value || "All";
    const minPrice = parseFloat(document.getElementById("minPriceFilter")?.value) || 0;
    const maxPrice = parseFloat(document.getElementById("maxPriceFilter")?.value) || Infinity;

    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");

    let filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === "All" || p.category === category;
        const matchesPrice = p.currentHighestBid >= minPrice && p.currentHighestBid <= maxPrice;
        
        let matchesContext = true;
        if (filter === "my-wins") matchesContext = (p.winnerUserId === user.id);
        else if (filter === "my-auctions") matchesContext = (p.ownerId === user.id);

        return matchesSearch && matchesCategory && matchesPrice && matchesContext;
    });

    const container = document.getElementById("productList");
    if (!container) return;
    
    displayProducts(filtered);
}

async function loadStats() {
    const user = getUser();
    try {
        const [pAll, wins] = await Promise.all([
            fetch(`${PRODUCTS_URL}/all`).then(r => r.json()),
            fetch(`${BIDS_URL}/my-wins?userId=${user.id}`).then(r => r.json())
        ]);
        document.getElementById("stat-total").textContent = pAll.filter(p => !p.closed).length;
        document.getElementById("stat-wins").textContent = wins.length;
    } catch (err) {}
}

async function createProduct() {
    const user = getUser();
    const fileInput = document.getElementById("productImage");
    const file = fileInput.files[0];
    
    let imageUrls = [];
    if (file) {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const uploadRes = await fetch(`${PRODUCTS_URL}/upload`, {
                method: "POST",
                body: formData
            });
            const uploadedUrl = await uploadRes.text();
            if (uploadedUrl.startsWith("/uploads")) {
                imageUrls.push(uploadedUrl);
            } else {
                return showToast("Image upload failed", "error");
            }
        } catch (err) {
            return showToast("Upload error", "error");
        }
    }

    const product = {
        name: document.getElementById("productName").value,
        basePrice: parseFloat(document.getElementById("basePrice").value),
        category: document.getElementById("productCategory").value,
        imageUrls: imageUrls
    };

    if (!product.name || isNaN(product.basePrice)) return showToast("Invalid inputs", "error");

    try {
        const res = await fetch(`${PRODUCTS_URL}/add?userId=${user.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        });
        if (res.ok) {
            showToast("Asset Listed", "success");
            document.getElementById("productName").value = "";
            fileInput.value = "";
            document.getElementById("basePrice").value = "";
            loadProducts(); // Refresh list
        }
    } catch (err) { showToast("Listing failed", "error"); }
}

// --- TIMER LOGIC ---
function startCountdown(id, endTimeStr) {
    if (productTimers[id]) clearInterval(productTimers[id]);
    const targetDate = new Date(endTimeStr).getTime();

    productTimers[id] = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        const timerEl = document.getElementById(`timer-${id}`);
        
        if (!timerEl) { clearInterval(productTimers[id]); return; }
        if (distance < 0) { clearInterval(productTimers[id]); updateProductStatusUI(id, true); return; }

        const h = Math.floor(distance / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        if (distance < 60000) timerEl.classList.add("timer-urgent");
        else timerEl.classList.remove("timer-urgent");
    }, 1000);
}

// --- PRODUCT DETAILS ---
let stompClient = null;
let currentProductId = null;

async function initProductDetails() {
    const params = new URLSearchParams(window.location.search);
    currentProductId = params.get("id");
    if (!currentProductId) return (window.location.href = "home.html");
    await loadProductInfo();
    await loadBidHistory();
    connectWebSocket();
}

async function loadProductInfo() {
    try {
        const res = await fetch(`${PRODUCTS_URL}/${currentProductId}`);
        const p = await res.json();
        document.getElementById("pName").textContent = p.name;
        document.getElementById("pPrice").textContent = `₹ ${p.currentHighestBid}`;
        
        // Update image
        const imgContainer = document.querySelector(".asset-view > div:nth-child(2)");
        if (imgContainer) {
            let imageUrl = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : 'assets/images/placeholder.jpg';
            if (imageUrl.startsWith("/uploads")) imageUrl = API_BASE + imageUrl;
            imgContainer.innerHTML = `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: contain; border-radius: var(--radius-sm);" onerror="this.src='assets/images/placeholder.jpg'">`;
        }

        const user = getUser();
        const formContainer = document.getElementById("bidFormContainer");
        const bidInput = document.getElementById("bidAmount");
        
        if (user && p.ownerId === user.id) {
            formContainer.innerHTML = `<div style="padding: 20px; border: 1px solid var(--border-subtle); color: var(--accent-amber); font-size: 12px; text-transform: uppercase; text-align: center;">Asset Owner - Bidding Restricted</div>`;
        } else {
            const minNextBid = (p.currentHighestBid === p.basePrice && !p.winnerUserId) ? p.basePrice : p.currentHighestBid + 100;
            bidInput.min = minNextBid;
            bidInput.value = minNextBid;
            
            let hintMsg = document.getElementById("minBidHint");
            if(!hintMsg) {
                hintMsg = document.createElement("div");
                hintMsg.id = "minBidHint";
                hintMsg.style.fontSize = "11px";
                hintMsg.style.marginTop = "8px";
                hintMsg.style.color = "var(--text-muted)";
                bidInput.parentNode.appendChild(hintMsg);
            }
            hintMsg.textContent = `MINIMUM INCREMENTAL BID: ₹ ${minNextBid}`;
        }
        
        const targetDate = new Date(p.endTime).getTime();
        const timerInterval = setInterval(() => {
            const distance = targetDate - new Date().getTime();
            const timerEl = document.getElementById("pTimer");
            if (distance < 0) {
                clearInterval(timerInterval);
                timerEl.textContent = "CLOSED";
                timerEl.style.color = "var(--accent-rose)";
                if (formContainer) formContainer.style.display = "none";
                let overlay = document.getElementById("finalCountdownOverlay");
                if (overlay) overlay.style.display = "none";
                showWinner();
                return;
            }
            const totalSeconds = Math.floor(distance / 1000);
            if (totalSeconds <= 10 && totalSeconds >= 0) {
                let overlay = document.getElementById("finalCountdownOverlay");
                if (overlay) {
                    overlay.style.display = "flex";
                    document.getElementById("finalCountdownText").textContent = totalSeconds;
                }
            } else {
                let overlay = document.getElementById("finalCountdownOverlay");
                if (overlay) overlay.style.display = "none";
            }
            
            const h = Math.floor(distance / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            if (distance < 60000) timerEl.classList.add("timer-urgent");
        }, 1000);
    } catch (err) {}
}

async function loadBidHistory() {
    try {
        const res = await fetch(`${BIDS_URL}/product/${currentProductId}`);
        const bids = await res.json();
        const container = document.getElementById("bidHistoryList");
        if (bids.length > 0) container.innerHTML = "";
        bids.forEach(renderBid);
    } catch (err) {}
}

function renderBid(bid) {
    const container = document.getElementById("bidHistoryList");
    const bidItem = document.createElement("div");
    bidItem.className = "bid-item";
    bidItem.style.padding = "12px 16px";
    bidItem.style.borderBottom = "1px solid var(--border-subtle)";
    bidItem.innerHTML = `<span style="font-weight: 600; color: var(--text-vivid); font-size: 13px;">${bid.user.name.toUpperCase()}</span><span style="font-family: var(--font-data); color: var(--accent-emerald); font-weight: 700;">₹ ${bid.amount}</span>`;
    if (container.firstChild) container.insertBefore(bidItem, container.firstChild);
    else container.appendChild(bidItem);
}

async function showWinner() {
    try {
        const res = await fetch(`${PRODUCTS_URL}/winner/${currentProductId}`);
        const winnerMsg = await res.text();
        const statusBox = document.getElementById("bidStatus");
        statusBox.style.display = "block";
        statusBox.style.background = "var(--surface-high)";
        statusBox.style.color = "var(--accent-emerald)";
        statusBox.style.border = "1px solid var(--accent-emerald)";
        statusBox.textContent = `🏆 ${winnerMsg.toUpperCase()}`;
    } catch (err) {}
}

function connectWebSocket() {
    const socket = new SockJS(`${API_BASE}/ws`);
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, (frame) => {
        stompClient.subscribe('/topic/bids', (update) => {
            const bid = JSON.parse(update.body);
            if (bid.product.id == currentProductId) {
                const priceEl = document.getElementById("pPrice");
                priceEl.textContent = `₹ ${bid.amount}`;
                priceEl.classList.remove("flash");
                void priceEl.offsetWidth;
                priceEl.classList.add("flash");
                
                const bidInput = document.getElementById("bidAmount");
                if (bidInput) {
                    const minNextBid = bid.amount + 100;
                    bidInput.min = minNextBid;
                    bidInput.value = minNextBid;
                }
                renderBid(bid);
                showToast(`New Bid: ₹ ${bid.amount}`, "success");
            }
        });
        stompClient.subscribe('/topic/status', (update) => {
            const product = JSON.parse(update.body);
            if (product.id == currentProductId) location.reload();
        });

        const user = getUser();
        if (user) {
            stompClient.subscribe(`/topic/notifications/${user.id}`, (update) => {
                const notif = JSON.parse(update.body);
                if (notif.type === "OUTBID") {
                    showToast(`⚠️ OUTBID! Someone bid higher on ${notif.productName}`, "error");
                }
            });
        }
    });
}

async function placeBid() {
    const user = getUser();
    const bidInput = document.getElementById("bidAmount");
    if (!bidInput) return;
    const amount = parseFloat(bidInput.value);
    const minRequired = parseFloat(bidInput.min || 0);

    if (isNaN(amount) || amount < minRequired) return showToast("Invalid bid amount", "error");

    try {
        const res = await fetch(`${BIDS_URL}/place?productId=${currentProductId}&amount=${amount}&userId=${user.id}`, { method: "POST" });
        const msg = await res.text();
        if (msg.includes("successfully")) showToast("Bid Placed", "success");
        else showToast(msg, "error");
    } catch (err) { showToast("Network error", "error"); }
}

// --- USER UTILS ---
const userCache = {};
async function updateOwnerInfo(userId, elementId) {
    if (!userId) return;
    let user = userCache[userId];
    if (!user) {
        try {
            const res = await fetch(`${USERS_URL}/${userId}`);
            user = await res.json();
            userCache[userId] = user;
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    }

    const el = document.getElementById(elementId);
    if (el && user) {
        el.innerHTML = `Seller: <span style="color: var(--text-vivid); font-weight: 700;">${user.name}</span> 
                        <span style="font-size: 9px; background: var(--surface-high); padding: 2px 6px; border: 1px solid var(--border-subtle); margin-left: 6px; border-radius: 2px; color: var(--text-muted); font-weight: 800;">${user.role}</span>`;
    } else if (el) {
        el.textContent = "Seller: Unknown";
    }
}
