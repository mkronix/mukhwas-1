/**
 * @swagger
 * tags:
 *   - name: InventoryRaw
 *     description: Raw materials inventory
 *
 * /admin/inventory/raw-materials:
 *   get:
 *     tags: [InventoryRaw]
 *     summary: List raw inventory
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 * /admin/inventory/raw-materials/stats:
 *   get:
 *     tags: [InventoryRaw]
 *     summary: Valuation stats
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 * /admin/inventory/raw-materials/{materialId}/adjust:
 *   post:
 *     tags: [InventoryRaw]
 *     summary: Adjust raw material stock
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, quantity, reason]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [add, remove]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               reason:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Adjusted
 */

export {};
