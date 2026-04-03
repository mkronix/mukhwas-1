/**
 * @swagger
 * tags:
 *   - name: Units
 *     description: Unit management
 *
 * /admin/units:
 *   get:
 *     tags: [Units]
 *     summary: List units
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Weight, Volume, Count, Other]
 *       - in: query
 *         name: is_system
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated unit list
 *   post:
 *     tags: [Units]
 *     summary: Create custom unit
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, abbreviation, type]
 *             properties:
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Weight, Volume, Count, Other]
 *     responses:
 *       201:
 *         description: Unit created
 *
 * /admin/units/{id}:
 *   put:
 *     tags: [Units]
 *     summary: Update custom unit
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               abbreviation:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *               type:
 *                 type: string
 *                 enum: [Weight, Volume, Count, Other]
 *     responses:
 *       200:
 *         description: Unit updated
 *   delete:
 *     tags: [Units]
 *     summary: Delete custom unit
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Unit deleted
 *
 * /admin/units/conversions:
 *   get:
 *     tags: [Units]
 *     summary: List unit conversions
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated conversion list
 *   post:
 *     tags: [Units]
 *     summary: Create unit conversion
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from_unit, to_unit, factor]
 *             properties:
 *               from_unit:
 *                 type: string
 *               to_unit:
 *                 type: string
 *               factor:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Conversion created
 *
 * /admin/units/conversions/{id}:
 *   put:
 *     tags: [Units]
 *     summary: Update conversion
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [factor]
 *             properties:
 *               factor:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Conversion updated
 *   delete:
 *     tags: [Units]
 *     summary: Delete conversion
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Conversion deleted
 */
export {};
