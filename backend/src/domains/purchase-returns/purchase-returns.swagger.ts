/**
 * @swagger
 * tags:
 *   - name: PurchaseReturns
 *     description: Purchase returns
 *
 * /admin/purchases/returns:
 *   get:
 *     tags: [PurchaseReturns]
 *     summary: List returns
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [PurchaseReturns]
 *     summary: Create return
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bill_id, bill_number, supplier_id, supplier_name, return_date, items, total_paisa]
 *             properties:
 *               bill_id:
 *                 type: string
 *                 format: uuid
 *               bill_number:
 *                 type: string
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *               supplier_name:
 *                 type: string
 *               return_date:
 *                 type: string
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [raw_material_name, quantity, unit, amount_paisa]
 *                   properties:
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
 *                     amount_paisa:
 *                       type: integer
 *                       minimum: 0
 *               total_paisa:
 *                 type: integer
 *                 minimum: 0
 *               reason:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [requested, approved, sent, credited]
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/purchases/returns/{id}/status:
 *   patch:
 *     tags: [PurchaseReturns]
 *     summary: Update return status
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
 *                 enum: [requested, approved, sent, credited]
 *     responses:
 *       200:
 *         description: Updated
 *
 * /pos/purchases/returns:
 *   get:
 *     tags: [PurchaseReturns]
 *     summary: List returns (POS)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [PurchaseReturns]
 *     summary: Create return (POS)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bill_id, bill_number, supplier_id, supplier_name, return_date, items, total_paisa]
 *             properties:
 *               bill_id:
 *                 type: string
 *                 format: uuid
 *               bill_number:
 *                 type: string
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *               supplier_name:
 *                 type: string
 *               return_date:
 *                 type: string
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [raw_material_name, quantity, unit, amount_paisa]
 *                   properties:
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
 *                     amount_paisa:
 *                       type: integer
 *                       minimum: 0
 *               total_paisa:
 *                 type: integer
 *                 minimum: 0
 *               reason:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [requested, approved, sent, credited]
 *     responses:
 *       201:
 *         description: Created
 */

export {};
