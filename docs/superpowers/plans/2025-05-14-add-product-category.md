# Add Category to Product Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a category field to products in the auction system, allowing users to select a category when listing items and seeing it in the product model.

**Architecture:** 
1. Update `Product` JPA entity to include a `category` String field.
2. Update `ProductController` to ensure `category` is handled (standard `@RequestBody` mapping).
3. Update `home.html` to include a category `<select>` dropdown in the "List New Asset" form.
4. Update `app.js` to send the selected category to the backend.

**Tech Stack:** Java 17, Spring Boot, JPA, JavaScript (Vanilla), HTML/CSS.

---

### Task 1: Update Product Model

**Files:**
- Modify: `backend/src/main/java/com/auction/auction_system/model/Product.java`

- [ ] **Step 1: Add category field and its getters/setters**

```java
<<<<
    private boolean isClosed;

    // ✅ Default constructor (VERY IMPORTANT)
====
    private String category;

    private boolean isClosed;

    // ✅ Default constructor (VERY IMPORTANT)
>>>>
<<<<
    public void setClosed(boolean closed) {
        isClosed = closed;
    }
}
====
    public void setClosed(boolean closed) {
        isClosed = closed;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/auction/auction_system/model/Product.java
git commit -m "feat: add category field to Product model"
```

### Task 2: Create Controller Test to Verify Category

**Files:**
- Create: `backend/src/test/java/com/auction/auction_system/ProductControllerTest.java`

- [ ] **Step 1: Write the failing test**

```java
package com.auction.auction_system;

import com.auction.auction_system.model.Product;
import com.auction.auction_system.model.User;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ProductControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    public void testAddProductWithCategory() {
        // Setup user
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole("SELLER");
        user = userRepository.save(user);

        // Setup product
        Product product = new Product();
        product.setName("Test Product");
        product.setBasePrice(100.0);
        product.setCategory("Electronics");

        // Execute
        ResponseEntity<String> response = restTemplate.postForEntity(
                "/products/add?userId=" + user.getId(),
                product,
                String.class
        );

        // Verify
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Product added successfully");

        Product savedProduct = productRepository.findAll().stream()
                .filter(p -> p.getName().equals("Test Product"))
                .findFirst()
                .orElseThrow();
        
        assertThat(savedProduct.getCategory()).isEqualTo("Electronics");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw test -Dtest=ProductControllerTest`
Expected: FAIL (or compilation error if Task 1 was skipped)

- [ ] **Step 3: Verify it passes (after Task 1 is done)**

Run: `./mvnw test -Dtest=ProductControllerTest`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/test/java/com/auction/auction_system/ProductControllerTest.java
git commit -m "test: add test for product category"
```

### Task 3: Update Frontend UI

**Files:**
- Modify: `frontend/home.html`

- [ ] **Step 1: Add Category dropdown to the form**

```html
<<<<
                        <div class="input-group">
                            <label class="input-label">Base Price (₹)</label>
                            <input type="number" id="basePrice" class="auction-input" placeholder="0.00">
                        </div>
                        <button onclick="createProduct()" class="btn-action" style="margin-top: 24px; height: 45px;">List Item</button>
====
                        <div class="input-group">
                            <label class="input-label">Base Price (₹)</label>
                            <input type="number" id="basePrice" class="auction-input" placeholder="0.00">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Category</label>
                            <select id="productCategory" class="auction-input">
                                <option value="Electronics">Electronics</option>
                                <option value="Art">Art</option>
                                <option value="Vehicles">Vehicles</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button onclick="createProduct()" class="btn-action" style="margin-top: 24px; height: 45px;">List Item</button>
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/home.html
git commit -m "feat: add category dropdown to home.html"
```

### Task 4: Update JavaScript Logic

**Files:**
- Modify: `frontend/js/app.js`

- [ ] **Step 1: Update createProduct to include category**

```javascript
<<<<
async function createProduct() {
    const user = getUser();
    const product = {
        name: document.getElementById("productName").value,
        basePrice: parseFloat(document.getElementById("basePrice").value)
    };
    if (!product.name || isNaN(product.basePrice)) return showToast("Invalid inputs", "error");
====
async function createProduct() {
    const user = getUser();
    const product = {
        name: document.getElementById("productName").value,
        basePrice: parseFloat(document.getElementById("basePrice").value),
        category: document.getElementById("productCategory").value
    };
    if (!product.name || isNaN(product.basePrice)) return showToast("Invalid inputs", "error");
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/js/app.js
git commit -m "feat: include category in createProduct request"
```

### Task 5: Final Verification

- [ ] **Step 1: Run all tests**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 2: Verify UI consistency**

Check `home.html` and `app.js` once more to ensure no typos in element IDs.
`productCategory` in `home.html` matches `document.getElementById("productCategory")` in `app.js`.
`category` in JS object matches `category` in Java model.

- [ ] **Step 3: Final Commit**

```bash
git commit -m "feat: complete category field implementation"
```
