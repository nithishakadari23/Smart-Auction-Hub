# Feature Design Spec: Bid History, Admin Controls, Real-Time Notifications, Search + Filter

## Date: 2026-04-17

## Overview
This document outlines the design for adding four major feature areas to the existing auction system:
1. Bid History - View bid history for products
2. Admin Controls - Administrative functions for users, products, and auctions
3. Real-Time Notifications - Instant alerts for bid and auction events
4. Search + Filter - Ability to search and filter products and users

## Approach Selected
Extend existing controllers and services (rather than creating new service layers or CQRS). This approach leverages the current Spring Boot structure and minimizes architectural changes.

## Detailed Design

### 1. Bid History
**Backend:**
- Extend `BidController` with enhanced endpoint for product bid history
- Endpoint: `GET /bids/product/{productId}` (already exists) will be enhanced to include user details and support pagination
- Response will include bid amount, bid time, user name, and user ID
- Optional query parameters: `page`, `size` for pagination

**Frontend:**
- Add bid history section in `frontend/product.html`
- Fetch bid history via AJAX to `/bids/product/{productId}` on product page load
- Display in a table or list showing: bid amount, bidder name, bid time
- Include pagination controls if needed

### 2. Admin Controls
**Backend:**
- Add admin endpoints in existing controllers or create new `AdminController`
- User Management:
  - `GET /admin/users` - List all users with pagination
  - `GET /admin/users/{id}` - Get user details
  - `POST /admin/users` - Create new user
  - `PUT /admin/users/{id}` - Update user
  - `DELETE /admin/users/{id}` - Delete user
- Product/Auction Management:
  - `GET /admin/products` - List all products/auctions
  - `GET /admin/products/{id}` - Get product details
  - `POST /admin/products` - Create new product
  - `PUT /admin/products/{id}` - Update product
  - `DELETE /admin/products/{id}` - Delete product
  - `PUT /admin/products/{id}/start` - Start auction manually
  - `PUT /admin/products/{id}/end` - End auction manually
- System Monitoring:
  - `GET /admin/stats` - System statistics (active auctions, total bids, user counts)
  - `GET /admin/active-auctions` - List currently running auctions

**Frontend:**
- Create `frontend/admin.html`
- Implement role-based routing: only users with ADMIN role can access
- Layout: Tabs for User Management, Product/Auction Management, System Monitoring
- Each tab contains appropriate CRUD interfaces and data tables
- Use AJAX calls to backend admin endpoints
- Include forms for creating/editing users and products

### 3. Real-Time Notifications
**Backend:**
- Extend `BidWebSocketController` to send notifications for:
  - Bid events: new bid placed, user outbid
  - Auction events: auction started, auction ended
- Notifications sent to user-specific topics: `/topic/notifications/{userId}`
- Notification payload: `{ type: "BID_PLACED" | "OUTBID" | "AUCTION_STARTED" | "AUCTION_ENDED", productId, productName, amount (for bid events), timestamp }`
- Integrate notification sending in bid placement and auction lifecycle methods

**Frontend:**
- Modify `frontend/js/app.js` to subscribe to notification topic upon login
- Subscribe to `/topic/notifications/{currentUserId}`
- Implement notification handler to show toast/popup notifications
- Different notification types can have different visual styles (info, warning, success)
- Ensure notifications disappear after timeout or on user dismiss

### 4. Search + Filter
**Backend:**
- Add search endpoints in `ProductController` and `UserController`
- Product Search:
  - `GET /products/search?keyword=&minPrice=&maxPrice=&status=`
  - Supports: keyword (name/description), price range, status (PENDING/RUNNING/ENDED)
  - Uses JPQL or Criteria API in `ProductRepository`
- User Search:
  - `GET /users/search?keyword=&role=&dateFrom=&dateTo=`
  - Supports: keyword (name/email), role, registration date range
  - Uses JPQL or Criteria API in `UserRepository`
- Return paginated results

**Frontend:**
- Add search bar in `frontend/home.html` (main dashboard) and `frontend/product.html`
- Add filter sidebar in home.html for advanced filtering
- Implement AJAX calls to search endpoints on input change or search button click
- Display results in cards or lists similar to existing product listings
- For product search: show product image, name, current bid, time left
- For user search: show user name, email, role, registration date

## Data Flow
1. User interacts with frontend UI (buttons, forms, search)
2. Frontend makes AJAX calls to backend REST endpoints
3. Backend processes requests, accesses repositories, returns JSON responses
4. For real-time events: Backend sends WebSocket messages to specific topics
5. Frontend WebSocket clients receive messages and update UI accordingly

## Error Handling
- Backend: Return appropriate HTTP status codes (400 for bad requests, 401/403 for unauthorized, 404 for not found, 500 for server errors)
- Frontend: Handle AJAX errors, display user-friendly error messages
- Validation: Input validation on backend for all endpoints

## Testing
- Unit tests for new controller methods
- Integration tests for search functionality
- Manual testing of WebSocket notifications
- UI testing for admin controls and bid history display

## Security
- All admin endpoints secured: only accessible by users with ADMIN role
- Bid history access: users can view bid history for any product (no restriction)
- Search functionality: returns only data user is authorized to see (products: all active/ended; users: based on requester's role?)
- Notification security: WebSocket endpoints ensure users only receive their own notifications

## Open Questions / Decisions Needed
1. Should bid history include unsuccessful bids only, or also winning bid? (Decision: include all bids)
2. Should admin be able to reactivate ended auctions? (Decision: not in scope for v1)
3. Should search results include closed auctions? (Decision: yes, with status filter)
4. Should notifications include email/SMS fallback? (Decision: WebSocket only for v1)
