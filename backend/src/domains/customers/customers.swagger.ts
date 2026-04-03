/**
 * @swagger
 * tags:
 *   - name: Customers (Admin)
 *     description: Admin customer management
 *   - name: Customers (Storefront)
 *     description: Storefront customer profile
 *   - name: Customers (POS)
 *     description: POS customer onboarding (staff with POS access only)
 *
 * /pos/customers:
 *   post:
 *     tags: [Customers (POS)]
 *     summary: Create customer at POS
 *     description: Creates a verified customer record marked as POS-originated. Requires staff role with pos_access and a POS session token.
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *               email: { type: string, format: email }
 *               phone: { type: string, maxLength: 20 }
 *     responses:
 *       201:
 *         description: Customer created
 *       403:
 *         description: No POS access
 *
 * /admin/customers:
 *   get:
 *     tags: [Customers (Admin)]
 *     summary: List customers
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated customer list
 *
 * /admin/customers/{id}:
 *   get:
 *     tags: [Customers (Admin)]
 *     summary: Get customer detail
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Customer detail with addresses
 *   put:
 *     tags: [Customers (Admin)]
 *     summary: Update customer
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Customer updated
 *
 * /admin/customers/{id}/status:
 *   patch:
 *     tags: [Customers (Admin)]
 *     summary: Toggle customer active status
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status toggled
 *
 * /admin/customers/{id}/orders:
 *   get:
 *     tags: [Customers (Admin)]
 *     summary: Customer order history
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated orders
 *
 * /admin/customers/{id}/addresses:
 *   get:
 *     tags: [Customers (Admin)]
 *     summary: Customer addresses
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Address list
 *
 * /storefront/customers/me:
 *   get:
 *     tags: [Customers (Storefront)]
 *     summary: Get profile
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Customer profile
 *   put:
 *     tags: [Customers (Storefront)]
 *     summary: Update profile
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /storefront/customers/me/addresses:
 *   get:
 *     tags: [Customers (Storefront)]
 *     summary: List addresses
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Address list
 *   post:
 *     tags: [Customers (Storefront)]
 *     summary: Add address
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [line1, city, state, pincode]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *               line1:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               line2:
 *                 type: string
 *                 maxLength: 255
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               state:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               pincode:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created
 *
 * /storefront/customers/me/addresses/{id}:
 *   put:
 *     tags: [Customers (Storefront)]
 *     summary: Update address
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *               line1:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               line2:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 255
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               state:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               pincode:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated
 *   delete:
 *     tags: [Customers (Storefront)]
 *     summary: Delete address
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Address deleted
 *
 * /storefront/customers/me/addresses/{id}/default:
 *   patch:
 *     tags: [Customers (Storefront)]
 *     summary: Set default address
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Default set
 */
export {};
