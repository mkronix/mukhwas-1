/**
 * @swagger
 * tags:
 *   - name: Suppliers
 *     description: Supplier management
 *
 * /admin/suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: List suppliers
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated suppliers
 *   post:
 *     tags: [Suppliers]
 *     summary: Create supplier
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *                 maxLength: 200
 *               phone:
 *                 type: string
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               gstin:
 *                 type: string
 *                 nullable: true
 *               pan:
 *                 type: string
 *                 nullable: true
 *               payment_terms:
 *                 type: string
 *                 enum: [immediate, net_15, net_30, net_45, net_60]
 *               is_active:
 *                 type: boolean
 *               bank_name:
 *                 type: string
 *               account_number:
 *                 type: string
 *               ifsc_code:
 *                 type: string
 *               account_holder:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/suppliers/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Supplier detail
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Supplier
 *   put:
 *     tags: [Suppliers]
 *     summary: Update supplier
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
 *               contact_person:
 *                 type: string
 *                 maxLength: 200
 *               phone:
 *                 type: string
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               gstin:
 *                 type: string
 *                 nullable: true
 *               pan:
 *                 type: string
 *                 nullable: true
 *               payment_terms:
 *                 type: string
 *                 enum: [immediate, net_15, net_30, net_45, net_60]
 *               is_active:
 *                 type: boolean
 *               bank_name:
 *                 type: string
 *               account_number:
 *                 type: string
 *               ifsc_code:
 *                 type: string
 *               account_holder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Suppliers]
 *     summary: Soft delete supplier
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Deleted
 *
 * /admin/suppliers/{id}/ledger:
 *   get:
 *     tags: [Suppliers]
 *     summary: Supplier ledger entries
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated ledger
 */

export {};
