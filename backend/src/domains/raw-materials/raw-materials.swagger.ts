/**
 * @swagger
 * tags:
 *   - name: Raw Materials
 *     description: Raw material management
 *
 * /admin/raw-materials:
 *   get:
 *     tags: [Raw Materials]
 *     summary: List raw materials
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list
 *   post:
 *     tags: [Raw Materials]
 *     summary: Create raw material
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, unit_id, hsn_code, gst_slab]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               unit_id:
 *                 type: string
 *                 format: uuid
 *               current_stock:
 *                 type: number
 *                 minimum: 0
 *               reorder_level:
 *                 type: number
 *                 minimum: 0
 *               preferred_supplier_id:
 *                 type: string
 *                 nullable: true
 *               hsn_code:
 *                 type: string
 *               gst_slab:
 *                 type: string
 *                 enum: [0, 5, 12, 18, 28]
 *               cost_per_unit_paisa:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/raw-materials/{id}:
 *   get:
 *     tags: [Raw Materials]
 *     summary: Get raw material detail
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Raw material detail
 *   put:
 *     tags: [Raw Materials]
 *     summary: Update raw material
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
 *               description:
 *                 type: string
 *               unit_id:
 *                 type: string
 *                 format: uuid
 *               reorder_level:
 *                 type: number
 *                 minimum: 0
 *               preferred_supplier_id:
 *                 type: string
 *                 nullable: true
 *               hsn_code:
 *                 type: string
 *               gst_slab:
 *                 type: string
 *                 enum: [0, 5, 12, 18, 28]
 *               cost_per_unit_paisa:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Raw Materials]
 *     summary: Delete raw material
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Deleted
 *
 * /admin/raw-materials/{id}/movements:
 *   get:
 *     tags: [Raw Materials]
 *     summary: Stock movement history
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated movements
 *
 * /admin/raw-materials/{id}/suppliers:
 *   post:
 *     tags: [Raw Materials]
 *     summary: Link supplier
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier_id]
 *             properties:
 *               supplier_id:
 *                 type: string
 *               is_preferred:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Supplier linked
 *
 * /admin/raw-materials/{id}/suppliers/{supplierId}:
 *   delete:
 *     tags: [Raw Materials]
 *     summary: Unlink supplier
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Supplier unlinked
 */
export {};
