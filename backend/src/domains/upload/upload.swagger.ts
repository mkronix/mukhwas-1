/**
 * @swagger
 * tags:
 *   - name: Upload (Admin)
 *     description: File upload management for admin surface
 *   - name: Upload (Storefront)
 *     description: File upload for storefront surface
 *
 * /admin/upload/image:
 *   post:
 *     tags: [Upload (Admin)]
 *     summary: Upload a single image
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           enum: [general, products, categories, staff, customers, recipes, content, invoices, documents]
 *           default: general
 *         description: Target folder for the upload
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
 *                 description: "Allowed: jpeg, png, webp, gif, svg"
 *     responses:
 *       201:
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UploadResult'
 *       400:
 *         description: No file or unsupported type
 *       401:
 *         description: Unauthorized
 *
 * /admin/upload/images:
 *   post:
 *     tags: [Upload (Admin)]
 *     summary: Upload multiple images (max 10)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: general
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded
 *       400:
 *         description: No files provided
 *
 * /admin/upload/document:
 *   post:
 *     tags: [Upload (Admin)]
 *     summary: Upload a single document (PDF, DOC, DOCX, XLS, XLSX, CSV)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: general
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
 *         description: Document uploaded
 *
 * /admin/upload/video:
 *   post:
 *     tags: [Upload (Admin)]
 *     summary: Upload a single video (MP4, WebM, MOV, max 50MB)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: general
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
 *         description: Video uploaded
 *
 * /admin/upload/any:
 *   post:
 *     tags: [Upload (Admin)]
 *     summary: Upload any supported file type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: general
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
 *         description: File uploaded
 *
 * /admin/upload/bulk:
 *   post:
 *     tags: [Upload (Admin)]
 *     summary: Upload multiple files of any type (max 10)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: general
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded
 *
 * /admin/upload:
 *   delete:
 *     tags: [Upload (Admin)]
 *     summary: Delete an uploaded file by public_id
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [public_id]
 *             properties:
 *               public_id:
 *                 type: string
 *                 example: mukhwas/products/abc123
 *     responses:
 *       200:
 *         description: File deleted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to delete
 *
 * /storefront/upload/image:
 *   post:
 *     tags: [Upload (Storefront)]
 *     summary: Upload a profile image (storefront customers)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: general
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
 *         description: Image uploaded
 *
 * components:
 *   schemas:
 *     UploadResult:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: https://res.cloudinary.com/xxx/image/upload/v123/mukhwas/products/abc.jpg
 *         public_id:
 *           type: string
 *           example: mukhwas/products/abc
 *         width:
 *           type: integer
 *           example: 800
 *         height:
 *           type: integer
 *           example: 600
 *         format:
 *           type: string
 *           example: jpg
 *         bytes:
 *           type: integer
 *           example: 45230
 *         resource_type:
 *           type: string
 *           example: image
 */
export {};
