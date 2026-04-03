/**
 * @swagger
 * tags:
 *   - name: Auth (Storefront)
 *     description: Customer authentication
 *   - name: Auth (Admin)
 *     description: Staff authentication
 *   - name: Auth (POS)
 *     description: POS staff authentication
 *   - name: Auth (Refresh)
 *     description: Token refresh
 *
 * /auth/storefront/signup:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Register a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered
 *       409:
 *         description: Email already exists
 *
 * /auth/storefront/login:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Login customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /auth/storefront/logout:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Logout customer
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Logged out
 *
 * /auth/storefront/verify-email:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Verify email with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 *
 * /auth/storefront/resend-verification:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Resend verification email
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Verification email sent
 *
 * /auth/storefront/forgot-password:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent if email exists
 *
 * /auth/storefront/reset-password:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset
 *
 * /auth/storefront/change-password:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Change password (authenticated)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed, new tokens returned
 *
 * /auth/storefront/google:
 *   post:
 *     tags: [Auth (Storefront)]
 *     summary: Sign in with Google
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_token]
 *             properties:
 *               id_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google login successful
 *
 * /auth/admin/login:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: Login admin staff
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with role and permissions
 *       401:
 *         description: Invalid credentials
 *
 * /auth/admin/logout:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: Logout admin
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Logged out
 *
 * /auth/admin/forgot-password:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: Request admin password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent if email exists
 *
 * /auth/admin/reset-password:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: Reset admin password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Password reset
 *
 * /auth/admin/change-password:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: Change admin password
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Password changed
 *
 * /auth/admin/me:
 *   get:
 *     tags: [Auth (Admin)]
 *     summary: Get current admin session
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Staff with role and permissions
 *
 * /auth/pos/staff:
 *   get:
 *     tags: [Auth (POS)]
 *     summary: List POS-eligible staff for login screen
 *     responses:
 *       200:
 *         description: Staff list
 *
 * /auth/pos/login:
 *   post:
 *     tags: [Auth (POS)]
 *     summary: POS PIN login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [staffId, pin]
 *             properties:
 *               staffId:
 *                 type: string
 *               pin:
 *                 type: string
 *                 pattern: "^\\d{4}$"
 *                 description: Exactly 4 numeric digits
 *     responses:
 *       200:
 *         description: POS login successful
 *       429:
 *         description: Account locked due to failed attempts
 *
 * /auth/pos/logout:
 *   post:
 *     tags: [Auth (POS)]
 *     summary: POS logout
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Logged out
 *
 * /auth/pos/me:
 *   get:
 *     tags: [Auth (POS)]
 *     summary: Get current POS session
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: POS staff session
 *
 * /auth/refresh:
 *   post:
 *     tags: [Auth (Refresh)]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token, surface]
 *             properties:
 *               refresh_token:
 *                 type: string
 *               surface:
 *                 type: string
 *                 enum: [storefront, admin, pos]
 *     responses:
 *       200:
 *         description: New token pair
 *       401:
 *         description: Invalid or expired refresh token
 */
export {};
