/**
 * @swagger
 * tags:
 *   - name: InventoryFinished
 *     description: Finished goods inventory
 *
 * /admin/inventory/finished-goods:
 *   get:
 *     tags: [InventoryFinished]
 *     summary: List finished goods inventory
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *
 * /admin/inventory/finished-goods/stats:
 *   get:
 *     tags: [InventoryFinished]
 *     summary: Valuation stats
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 * /admin/inventory/finished-goods/{variantId}/adjust:
 *   post:
 *     tags: [InventoryFinished]
 *     summary: Adjust finished goods stock
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: variantId
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
 *               reference:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Adjusted
 * /admin/inventory/finished-goods/{variantId}/movements:
 *   get:
 *     tags: [InventoryFinished]
 *     summary: Variant movement history
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: movement_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated movements
 */

export {};
