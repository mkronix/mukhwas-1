/**
 * @swagger
 * tags:
 *   - name: PurchaseOrders
 *     description: Purchase orders
 *
 * /admin/purchases/orders:
 *   get:
 *     tags: [PurchaseOrders]
 *     summary: List purchase orders
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [PurchaseOrders]
 *     summary: Create purchase order
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier_id, supplier_name, order_date, expected_delivery, items, subtotal_paisa, cgst_paisa, sgst_paisa, total_paisa]
 *             properties:
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *               supplier_name:
 *                 type: string
 *               order_date:
 *                 type: string
 *               expected_delivery:
 *                 type: string
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [raw_material_id, raw_material_name, quantity, unit, unit_price_paisa, taxable_paisa, gst_amount_paisa, total_paisa]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 0
 *                     unit:
 *                       type: string
 *                     unit_price_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     hsn_code:
 *                       type: string
 *                     gst_slab:
 *                       type: string
 *                     taxable_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     gst_amount_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     total_paisa:
 *                       type: integer
 *                       minimum: 0
 *               status:
 *                 type: string
 *                 enum: [draft, sent, received, billed, cancelled]
 *               notes:
 *                 type: string
 *               subtotal_paisa:
 *                 type: integer
 *                 minimum: 0
 *               cgst_paisa:
 *                 type: integer
 *                 minimum: 0
 *               sgst_paisa:
 *                 type: integer
 *                 minimum: 0
 *               total_paisa:
 *                 type: integer
 *                 minimum: 0
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/purchases/orders/{id}:
 *   get:
 *     tags: [PurchaseOrders]
 *     summary: Get purchase order
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *
 * /admin/purchases/orders/{id}/status:
 *   patch:
 *     tags: [PurchaseOrders]
 *     summary: Update PO status
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, sent, received, billed, cancelled]
 *     responses:
 *       200:
 *         description: Updated
 *
 * /pos/purchases/orders:
 *   get:
 *     tags: [PurchaseOrders]
 *     summary: List purchase orders (POS)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [PurchaseOrders]
 *     summary: Create purchase order (POS)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier_id, supplier_name, order_date, expected_delivery, items, subtotal_paisa, cgst_paisa, sgst_paisa, total_paisa]
 *             properties:
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *               supplier_name:
 *                 type: string
 *               order_date:
 *                 type: string
 *               expected_delivery:
 *                 type: string
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [raw_material_id, raw_material_name, quantity, unit, unit_price_paisa, taxable_paisa, gst_amount_paisa, total_paisa]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 0
 *                     unit:
 *                       type: string
 *                     unit_price_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     hsn_code:
 *                       type: string
 *                     gst_slab:
 *                       type: string
 *                     taxable_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     gst_amount_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     total_paisa:
 *                       type: integer
 *                       minimum: 0
 *               status:
 *                 type: string
 *                 enum: [draft, sent, received, billed, cancelled]
 *               notes:
 *                 type: string
 *               subtotal_paisa:
 *                 type: integer
 *                 minimum: 0
 *               cgst_paisa:
 *                 type: integer
 *                 minimum: 0
 *               sgst_paisa:
 *                 type: integer
 *                 minimum: 0
 *               total_paisa:
 *                 type: integer
 *                 minimum: 0
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /pos/purchases/orders/{id}:
 *   put:
 *     tags: [PurchaseOrders]
 *     summary: Update purchase order (POS)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *               supplier_name:
 *                 type: string
 *               order_date:
 *                 type: string
 *               expected_delivery:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     unit_price_paisa:
 *                       type: integer
 *                     hsn_code:
 *                       type: string
 *                     gst_slab:
 *                       type: string
 *                     taxable_paisa:
 *                       type: integer
 *                     gst_amount_paisa:
 *                       type: integer
 *                     total_paisa:
 *                       type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, sent, received, billed, cancelled]
 *               notes:
 *                 type: string
 *               subtotal_paisa:
 *                 type: integer
 *               cgst_paisa:
 *                 type: integer
 *               sgst_paisa:
 *                 type: integer
 *               total_paisa:
 *                 type: integer
 *               created_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */

export {};
