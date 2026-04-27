# Design Spec: Auction System Enhancements

Implement multiple product images, user role labels, admin product deletion, and a "Minimalist Gallery" visual upgrade.

## 1. Data Model & Storage

### 1.1 Product Entity
- **Images:** Add `@ElementCollection` of `String` (URLs) to `Product.java`.
- **Primary Image:** The first URL in the collection will be used as the primary thumbnail.

### 1.2 User Roles
- **Labels:** Append user role (Buyer/Seller) to names in UI components.
- **Logic:** Retrieve `role` from the `User` entity and display as `[Name] ([Role])`.

## 2. Admin Features

### 2.1 Product Management
- **Delete Product:** Enable the `deleteProduct` functionality in `AdminController.java` (already partially implemented).
- **UI:** Add a "Delete" button with a confirmation dialog to each product in the Admin Dashboard.

## 3. Visual & UI (Minimalist Gallery)

### 3.1 Styling Upgrade
- **Theme:** "Minimalist Gallery" (Light/Airy).
- **Colors:** White backgrounds, refined grays (#f9fafb), and high-contrast black typography (#111827).
- **Cards:** Clean borders, subtle shadows, and centered image placeholders.
- **Typography:** Refined, uppercase labels for secondary data (e.g., "SELLER: ALEX").

### 3.2 Product Cards
- **Structure:**
  - Header: Large product image with "LIVE" badge.
  - Body: Product Title, Seller Label (e.g., "Seller: John Doe").
  - Price/Timer Row: Current Bid (Large) and Countdown Timer.
  - Action: "Place Bid" button.

## 4. Implementation Details

### 4.1 Backend (Spring Boot)
- Update `Product.java` with `imageUrls` field.
- Ensure `AdminController.java` supports `DELETE /admin/products/{id}`.

### 4.2 Frontend (Vanilla JS/CSS)
- Refactor `style.css` to implement the new "Minimalist Gallery" theme.
- Update `app.js` and `admin.html` to handle multiple images and role labels.
- Add "Delete" button to the admin product listing.
