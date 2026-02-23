# Sales and management system for clothing stores
Description:
- Developed a full-featured e-commerce platform for browsing products, advanced search, shopping cart, seamless order placement, and comprehensive order management for both customers and admins.
- Implemented secure Google OAuth 2.0 authentication for easy login/registration, combined with JWT-based session management and role-based authorization (admin/user).
- Built a responsive, mobile-first frontend with client-side cart logic, checkout flow, and dynamic UI updates.
- Created a secure admin dashboard for managing products, orders, users, branches, and inventory.
- Integrated multiple payment methods: VietQR (bank transfer QR codes) and COD (cash on delivery).
- Connected to GHN API for automated order creation, shipping label generation, and real-time tracking updates.
- Enabled real-time customer-support chat using WebSocket, with Redis for efficient session caching and pub/sub messaging.
- Built an AI-powered customer support chatbot that queries product data from the database and provides personalized JSON responses with product recommendations.
- Added intelligent product recommendation engine (related/similar items) displayed on product detail pages to improve user experience and potential sales.
Tech Stack: 
- Frontend: React.js, TailwindCSS
- Backend: Node.js + Express.js (RESTful APIs), Flask (for AI chatbot)
- Database: MySQL, Sequelize ORM
- Authentication & Security: Google OAuth 2.0, JWT, role-based authorization
- Integrations: Cloudinary , GHN API, VietQR payments, GeminiAI
- Real-time & Caching: Socket.io , Redis
- Tools: Git, Github
