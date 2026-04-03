/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management
 *
 * /admin/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get category tree
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Category tree
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: uri
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created
 *
 * /admin/categories/flat:
 *   get:
 *     tags: [Categories]
 *     summary: Flat paginated category list
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list
 *
 * /admin/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Category deleted
 *
 * /admin/categories/reorder:
 *   put:
 *     tags: [Categories]
 *     summary: Reorder categories
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [id, sort_order]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     sort_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Reorder complete
 */
export {};
