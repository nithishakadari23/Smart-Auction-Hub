# Auction System Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement multiple product images, user role labels, admin product deletion, and a "Minimalist Gallery" visual upgrade.

**Architecture:** 
- Backend: Update `Product` model with `@ElementCollection` for image URLs and ensure `AdminController` has a delete endpoint.
- Frontend: Refactor `style.css` for the "Minimalist Gallery" theme and update `app.js` and `admin.html` for role labels and product deletion.

**Tech Stack:** Java, Spring Boot, JPA, Vanilla JS, CSS.

---

### Task 1: Update Product Model with Multiple Images

**Files:**
- Modify: `backend/src/main/java/com/auction/auction_system/model/Product.java`

- [ ] **Step 1: Add `@ElementCollection` for `imageUrls`**

```java
@ElementCollection
@CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
@Column(name = "image_url")
private List<String> imageUrls;
```

- [ ] **Step 2: Add getter and setter for `imageUrls`**

```java
public List<String> getImageUrls() {
    return imageUrls;
}

public void setImageUrls(List<String> imageUrls) {
    this.imageUrls = imageUrls;
}
```

- [ ] **Step 3: Run build to verify changes**

Run: `./mvnw clean compile` (in `backend/` directory)
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/auction/auction_system/model/Product.java
git commit -m "feat: add multiple images support to Product model"
```

### Task 2: Verify Admin Delete Product Endpoint

**Files:**
- Modify: `backend/src/main/java/com/auction/auction_system/controller/AdminController.java`

- [ ] **Step 1: Ensure the delete product endpoint exists and is correct**

```java
@DeleteMapping("/products/{id}")
public String deleteProduct(@PathVariable Long id) {
    productRepo.deleteById(id);
    return "Product deleted successfully";
}
```

- [ ] **Step 2: Run build to verify**

Run: `./mvnw clean compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/auction/auction_system/controller/AdminController.java
git commit -m "feat: ensure admin delete product endpoint is correct"
```

### Task 3: Implement "Minimalist Gallery" Visual Upgrade

**Files:**
- Modify: `frontend/css/style.css`

- [ ] **Step 1: Update `:root` variables for the new theme**

```css
:root {
    --bg-void: #ffffff;
    --surface-card: #ffffff;
    --surface-mid: #f9fafb;
    --surface-high: #f3f4f6;
    
    --accent-emerald: #111827;
    --accent-rose: #ef4444;
    --accent-amber: #f59e0b;
    
    --text-vivid: #111827;
    --text-base: #374151;
    --text-muted: #6b7280;
    
    --border-subtle: #e5e7eb;
    --border-vivid: #d1d5db;
    
    --radius-sm: 2px;
    --radius-md: 4px;
}
```

- [ ] **Step 2: Update global styles and card layouts**

Refactor `body`, `.app-container`, `.sidebar`, `.stat-panel`, and `.auction-card` to match the light "Minimalist Gallery" theme.

- [ ] **Step 3: Commit**

```bash
git add frontend/css/style.css
git commit -m "style: implement Minimalist Gallery visual upgrade"
```

### Task 4: Update Frontend Logic for Images and Role Labels

**Files:**
- Modify: `frontend/js/app.js`

- [ ] **Step 1: Update product card rendering to show the first image and seller's role**

In `displayProducts(products)`, update the HTML generation to:
- Use `p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : 'assets/images/placeholder.jpg'`
- Add seller role label next to owner name (fetch user details if necessary or use existing data).

- [ ] **Step 2: Commit**

```bash
git add frontend/js/app.js
git commit -m "feat: update frontend logic for images and role labels"
```

### Task 5: Add Delete Button to Admin Dashboard

**Files:**
- Modify: `frontend/admin.html`

- [ ] **Step 1: Add the "Delete" button to the product listing in `admin.html`**

Ensure the `deleteProduct` function is correctly wired to the button in the `loadAdminData` function.

```html
<button onclick="deleteProduct(${p.id})" style="color: #ef4444; border:none; background:none; cursor:pointer; font-weight: 600;">Remove Listing</button>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/admin.html
git commit -m "feat: add delete button to admin dashboard product list"
```
