# Bid History Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dedicated bid history page where users can see all their placed bids and their statuses.

**Architecture:** Create a new `history.html` page that fetches user bids from the backend and displays them. Update `app.js` to include a link to this page in the sidebar for all authenticated users.

**Tech Stack:** HTML, CSS, JavaScript (Vanilla)

---

### Task 1: Create history.html

**Files:**
- Create: `frontend/history.html`

- [ ] **Step 1: Create the history.html file with the provided content**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Bids | Auction</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="app-container">
        <aside class="sidebar">
            <div class="brand-identity">AUCTION</div>
            <nav class="nav-links">
                <button class="nav-item" onclick="window.location.href='home.html'">📊 Live Market</button>
                <button class="nav-item active">📝 My Bids</button>
                <button class="nav-item" onclick="logout()">Sign Out</button>
            </nav>
        </aside>
        <main class="main-viewport">
            <h2 style="color: var(--text-vivid);">Bidding Activity</h2>
            <div id="historyList" class="bid-stream" style="border-radius: 8px;"></div>
        </main>
    </div>
    <script src="js/app.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", async () => {
            const user = getUser();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            try {
                const res = await fetch(`${BIDS_URL}/user/${user.id}`);
                const bids = await res.json();
                const container = document.getElementById("historyList");
                container.innerHTML = "";
                
                if (bids.length === 0) {
                    container.innerHTML = '<div class="bid-item">No bidding activity found.</div>';
                    return;
                }

                bids.forEach(b => {
                    const status = b.product.winnerUserId === user.id ? 
                                   (b.product.closed ? "🏆 WON" : "✅ WINNING") : 
                                   (b.product.closed ? "❌ ENDED" : "⚠️ OUTBID");
                    const div = document.createElement("div");
                    div.className = "bid-item";
                    div.innerHTML = `<span>${b.product.name} - ₹${b.amount}</span>
                                    <span style="font-size:10px;">${status}</span>`;
                    container.appendChild(div);
                });
            } catch (err) {
                console.error("Error fetching bid history:", err);
            }
        });
    </script>
</body>
</html>
```

- [ ] **Step 2: Verify the file exists**

Run: `ls -l frontend/history.html`

### Task 2: Update app.js Sidebar

**Files:**
- Modify: `frontend/js/app.js`

- [ ] **Step 1: Add the "My Bids" link to the sidebar in `initHome()` function**

```javascript
<<<<
    if (user.role === "ADMIN") {
        const nav = document.querySelector(".nav-links");
        const adminBtn = document.createElement("button");
        adminBtn.className = "nav-item";
        adminBtn.innerHTML = "<span>🛠️</span> Admin Panel";
        adminBtn.onclick = () => window.location.href = "admin.html";
        nav.insertBefore(adminBtn, nav.querySelector(".nav-item[onclick='logout()']"));
    }
====
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
>>>>
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend/history.html frontend/js/app.js
git commit -m "feat: add bid history page with status indicators"
```
