/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product catalog
 *
 * /admin/products/categories-with-counts:
 *   get:
 *     tags: [Products]
 *     summary: Categories with product counts
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List
 *
 * /admin/products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated products
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category_id, base_price_paisa, variants]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               subcategory_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               base_price_paisa:
 *                 type: integer
 *                 minimum: 0
 *               gst_slab:
 *                 type: string
 *                 enum: [0, 5, 12, 18, 28]
 *               hsn_code:
 *                 type: string
 *               inventory_mode:
 *                 type: string
 *                 enum: [finished_goods, recipe_realtime]
 *               is_active:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               images:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         is_primary:
 *                           type: boolean
 *               meta_title:
 *                 type: string
 *                 nullable: true
 *               meta_description:
 *                 type: string
 *                 nullable: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               ui:
 *                 type: object
 *                 nullable: true
 *                 additionalProperties: true
 *               variants:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [name, price_paisa]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     sku:
 *                       type: string
 *                     weight_grams:
 *                       type: number
 *                       minimum: 0
 *                     price_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     compare_at_price_paisa:
 *                       type: integer
 *                       minimum: 0
 *                       nullable: true
 *                     stock_quantity:
 *                       type: integer
 *                       minimum: 0
 *                     low_stock_threshold:
 *                       type: integer
 *                       minimum: 0
 *                     is_active:
 *                       type: boolean
 *                     barcode:
 *                       type: string
 *                       nullable: true
 *               is_bundle:
 *                 type: boolean
 *               bundle_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [variant_id, quantity]
 *                   properties:
 *                     variant_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Created
 *
 * /admin/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Product detail
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Product
 *   put:
 *     tags: [Products]
 *     summary: Update product
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
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               subcategory_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               base_price_paisa:
 *                 type: integer
 *                 minimum: 0
 *               gst_slab:
 *                 type: string
 *                 enum: [0, 5, 12, 18, 28]
 *               hsn_code:
 *                 type: string
 *               inventory_mode:
 *                 type: string
 *                 enum: [finished_goods, recipe_realtime]
 *               is_active:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               images:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         is_primary:
 *                           type: boolean
 *               meta_title:
 *                 type: string
 *                 nullable: true
 *               meta_description:
 *                 type: string
 *                 nullable: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               ui:
 *                 type: object
 *                 nullable: true
 *                 additionalProperties: true
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     sku:
 *                       type: string
 *                     weight_grams:
 *                       type: number
 *                       minimum: 0
 *                     price_paisa:
 *                       type: integer
 *                       minimum: 0
 *                     compare_at_price_paisa:
 *                       type: integer
 *                       minimum: 0
 *                       nullable: true
 *                     stock_quantity:
 *                       type: integer
 *                       minimum: 0
 *                     low_stock_threshold:
 *                       type: integer
 *                       minimum: 0
 *                     is_active:
 *                       type: boolean
 *                     barcode:
 *                       type: string
 *                       nullable: true
 *               is_bundle:
 *                 type: boolean
 *               bundle_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variant_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Products]
 *     summary: Soft delete product
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Deleted
 *
 * /admin/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Add product image
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded
 *   delete:
 *     tags: [Products]
 *     summary: Remove product image
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             oneOf:
 *               - type: object
 *                 required: [url]
 *                 properties:
 *                   url:
 *                     type: string
 *               - type: object
 *                 required: [public_id]
 *                 properties:
 *                   public_id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Updated
 *
 * /admin/products/{id}/archive:
 *   patch:
 *     tags: [Products]
 *     summary: Archive product
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Archived
 *
 * /storefront/products:
 *   get:
 *     tags: [Products]
 *     summary: Public product listing
 *     responses:
 *       200:
 *         description: Paginated products
 *
 * /storefront/products/slug/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Product by slug
 *     responses:
 *       200:
 *         description: Product with related
 *
 * /storefront/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Product by id
 *     responses:
 *       200:
 *         description: Product with related
 *
 * /pos/products:
 *   get:
 *     tags: [Products]
 *     summary: POS product catalog
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Products
 */

export {};
