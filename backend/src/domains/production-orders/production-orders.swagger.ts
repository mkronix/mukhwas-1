/**
 * @swagger
 * tags:
 *   - name: Production
 *     description: Production orders
 *
 * /admin/production/orders:
 *   get:
 *     tags: [Production]
 *     summary: List production orders
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [Production]
 *     summary: Create production order
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipe_id, recipe_name, product_variant, planned_quantity, unit, scheduled_date]
 *             properties:
 *               recipe_id:
 *                 type: string
 *                 format: uuid
 *               recipe_name:
 *                 type: string
 *               recipe_version:
 *                 type: integer
 *               output_variant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               product_variant:
 *                 type: string
 *               planned_quantity:
 *                 type: number
 *                 minimum: 0
 *               unit:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *               assigned_staff_id:
 *                 type: string
 *               assigned_staff_name:
 *                 type: string
 *               created_by:
 *                 type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [raw_material_id, raw_material_name, reserved_quantity, unit]
 *                   properties:
 *                     raw_material_id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_name:
 *                       type: string
 *                     reserved_quantity:
 *                       type: number
 *                       minimum: 0
 *                     unit:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/production/stats:
 *   get:
 *     tags: [Production]
 *     summary: Production stats
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *
 * /admin/production/orders/{id}:
 *   get:
 *     tags: [Production]
 *     summary: Get production order
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *
 * /admin/production/orders/{id}/status:
 *   patch:
 *     tags: [Production]
 *     summary: Patch production status
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
 *                 enum: [in_progress, cancelled]
 *               staff_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *
 * /admin/production/orders/{id}/complete:
 *   post:
 *     tags: [Production]
 *     summary: Complete production
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actual_quantity]
 *             properties:
 *               actual_quantity:
 *                 type: number
 *                 minimum: 0
 *               material_usage:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *                   minimum: 0
 *               staff_name:
 *                 type: string
 *               output_variant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Completed
 *
 * /pos/production/orders:
 *   get:
 *     tags: [Production]
 *     summary: List production orders (POS)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [Production]
 *     summary: Create production order (POS)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipe_id, recipe_name, product_variant, planned_quantity, unit, scheduled_date]
 *             properties:
 *               recipe_id:
 *                 type: string
 *                 format: uuid
 *               recipe_name:
 *                 type: string
 *               recipe_version:
 *                 type: integer
 *               output_variant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               product_variant:
 *                 type: string
 *               planned_quantity:
 *                 type: number
 *                 minimum: 0
 *               unit:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *               assigned_staff_id:
 *                 type: string
 *               assigned_staff_name:
 *                 type: string
 *               created_by:
 *                 type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [raw_material_id, raw_material_name, reserved_quantity, unit]
 *                   properties:
 *                     raw_material_id:
 *                       type: string
 *                       format: uuid
 *                     raw_material_name:
 *                       type: string
 *                     reserved_quantity:
 *                       type: number
 *                       minimum: 0
 *                     unit:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /pos/production/orders/{id}/status:
 *   patch:
 *     tags: [Production]
 *     summary: Patch production status (POS)
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
 *                 enum: [in_progress, cancelled]
 *               staff_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */

export {};
