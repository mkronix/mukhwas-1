/**
 * @swagger
 * tags:
 *   - name: PurchaseBills
 *     description: Purchase bills
 *
 * /admin/purchases/bills:
 *   get:
 *     tags: [PurchaseBills]
 *     summary: List bills
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [PurchaseBills]
 *     summary: Create bill
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier_id, supplier_name, bill_date, due_date, items, subtotal_paisa, cgst_paisa, sgst_paisa, total_paisa]
 *             properties:
 *               bill_number:
 *                 type: string
 *               po_id:
 *                 type: string
 *                 format: uuid
 *               po_number:
 *                 type: string
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *               supplier_name:
 *                 type: string
 *               supplier_gstin:
 *                 type: string
 *               bill_date:
 *                 type: string
 *               due_date:
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
 *               payment_status:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded, partial]
 *               paid_amount_paisa:
 *                 type: integer
 *                 minimum: 0
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     amount_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     date:
 *                       type: string
 *                     mode:
 *                       type: string
 *                     reference:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/purchases/bills/{id}:
 *   get:
 *     tags: [PurchaseBills]
 *     summary: Get bill
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *
 * /admin/purchases/bills/{id}/payments:
 *   post:
 *     tags: [PurchaseBills]
 *     summary: Record payment
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, date]
 *             properties:
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *               date:
 *                 type: string
 *               mode:
 *                 type: string
 *               reference:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded
 */

export {};
