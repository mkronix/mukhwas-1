/**
 * @swagger
 * tags:
 *   - name: InventoryMovements
 *     description: Stock movement log
 *
 * /admin/inventory/movements:
 *   get:
 *     tags: [InventoryMovements]
 *     summary: Unified movements log
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 * /admin/inventory/movements/export:
 *   get:
 *     tags: [InventoryMovements]
 *     summary: Export movements CSV
 *     security: [{ BearerAuth: [] }]
 *     parameters:
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
 *         name: item_type
 *         schema:
 *           type: string
 *           enum: [finished_good, raw_material]
 *       - in: query
 *         name: search
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
 *         description: CSV exported
 */

export {};
