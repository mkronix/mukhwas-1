# masterplan.md
## Mukhwas Commerce OS — Phase 1 Blueprint
### Version 5.0 — Revised (Surface Restructure + New Modules)

---

## Changelog from v4.0

- POS surface restructured from a transaction terminal into a full business management + billing software
- Admin surface narrowed to storefront management + catalog + inventory items only — no billing UI, no employee management
- Production Orders moved exclusively to POS
- Recipes accessible from both Admin and POS
- Employee & Salary Management added as a new POS module
- Coupon / Discount Management added to both Storefront and POS
- Bill of Supply vs Tax Invoice document type system added with auto-suggest + manual override
- Sales Return invoice generation added to POS
- Purchase Return invoice generation added to POS
- Sundry Debtors added as a named report in POS reports
- Razorpay moved from Phase 3 to Phase 2 (post-backend API development)
- All permission modules updated to reflect new surface assignments
- Route structure updated for both Admin and POS
- Storefront design direction marked as TBD pending client confirmation
- Domain service boundaries updated to reflect POS expansion
- Mock data requirements updated
- Edge case table updated

---

## 1. App Overview

A **single-brand commerce operating system** for a mukhwas manufacturing and retail business. The platform covers the full business lifecycle — raw material procurement, in-house manufacturing via recipe-driven production, retail and online sales, and a complete GST-compliant double-entry financial ledger.

Three primary operational surfaces — each fully independent:

- **Storefront** — public-facing ecommerce for customers. Design direction: TBD pending client confirmation.
- **Admin** — storefront and catalog management for the store owner. Manages products, categories, inventory items, recipes, orders, customers, CMS, and system configuration. No billing UI. No employee management.
- **POS** — full business management and billing software for physical store staff. Handles transactions, billing (Tax Invoice + Bill of Supply), procurement, inventory operations, manufacturing, employee management, expenses, accounting ledger, GST, and all operational reports.

Structurally isolated from day 1 for a clean future repo split into three independent repositories.

---

## 2. Objectives

- Sell mukhwas products online and in-store
- Manufacture products in-house using recipe-driven production orders
- Track raw material procurement with full supplier ledger and GST-compliant purchase bills
- Maintain unified finished goods and raw material inventory (FIFO valuation)
- Run a full double-entry accounting ledger (supplier, customer, expenses, bank)
- Issue Tax Invoices (B2B) and Bills of Supply (B2C/exempt) correctly for all transactions
- Track employee attendance, calculate salaries, and manage advance payments
- Enforce fully granular role-based, module-based access control with no default role assumptions
- Support coupon and discount codes on both storefront and POS
- Provide complete GST reporting including GSTR-1, GSTR-2, ITC summary, and Sundry Debtors report
- Integrate Razorpay for online payments in Phase 2

---

## 3. Target Users

### Customers
Public storefront users. No login required to browse. Registration unlocks orders, wishlist, account. Unverified accounts can browse and add to cart but are **blocked from checkout** until email is verified.

### Store Staff / Cashiers
POS operators. PIN-based login (4–6 digits). Locked after 5 failed attempts. Handle walk-in, phone, and wholesale transactions. Role permissions determine which POS modules they can access.

### Admin / Management
Storefront and catalog managers. Email + password login. Access controlled by assigned role permissions. Scope is limited to storefront, catalog, inventory items, recipes, orders, customers, CMS, and system config.

### Developer (Hidden System Role)
- Auto-created on system initialization
- Invisible in all UI — tables, dropdowns, role lists, user search, permission editors
- Hardcoded mock credential: `developer@mukhwas.com` / `Dev@123456`
- **Must be replaced with secure credential before production deployment**
- Cannot be viewed, modified, or deleted by any role
- Full access to all modules across all surfaces, bypasses all permission checks
- Lives in `staff` model with `is_developer: true`
- Filtered at service layer — never reaches any UI query

---

## 4. Data Model — User Separation

### `customers` — Storefront only

### `staff` — All internal users (Admin + POS)

### `roles`

```
roles
  id
  name
  description
  is_system_role       (boolean — cannot be deleted)
  created_by           (FK → staff.id)
  created_at
```

### `role_permissions`

```
role_permissions
  id
  role_id
  module               (enum — full list in Section 8)
  surface              (enum: admin | pos — which surface this permission applies to)
  can_create / can_read / can_update / can_delete / can_export / can_view_reports
```

Note: `surface` field added to distinguish between access on Admin vs POS for shared modules like recipes and inventory.

---

## 5. Auth Architecture — Three Independent Modules

| Surface    | Model       | Method                        | Session Storage           |
|------------|-------------|-------------------------------|---------------------------|
| Storefront | `customers` | Email/password + Google OAuth | localStorage `sf_auth`    |
| Admin      | `staff`     | Email + password              | localStorage `adm_auth`   |
| POS        | `staff`     | PIN (staff picker → PIN)      | sessionStorage `pos_auth` |

Each surface has its own `AuthContext`, protected route guard, login/logout flow. Zero shared auth state.

### Storefront Auth Rules
- Unverified users: can browse, add to cart, use wishlist — **blocked at checkout**
- Verification email resendable from account page
- Google OAuth users auto-verified

### POS Auth Rules
- PIN lockout after 5 failed attempts
- Lockout duration: 15 minutes (configurable in POS settings)
- Short session timeout (configurable, default 4 hours)
- Cart persisted in `localStorage` during active session to survive browser crash

### Auth Pages
```
Storefront:  /login  /signup  /verify-email  /forgot-password  /reset-password
Admin:       /admin/login  /admin/forgot-password
POS:         /pos/login    /pos/forgot-password
```

---

## 6. Layout Architecture

```
StorefrontLayout        (header, footer, cart drawer)
StorefrontAuthLayout    (centered, minimal)
StorefrontAccountLayout (account sidebar + protected routes)

AdminAuthLayout         (centered login)
AdminDashboardLayout    (sidebar nav + topbar + content area — narrower scope)

POSAuthLayout           (PIN login screen)
POSLayout               (full-screen — dual mode: terminal view + toggleable management sidebar)
```

Zero shared layout components across surfaces.

### POS Layout Note
The POS surface has two distinct UI modes within a single layout:
- **Terminal mode** — full-screen transaction interface (product grid, cart, payment)
- **Management mode** — sidebar-navigated management interface (inventory, procurement, employees, ledger, reports, etc.)

The staff member switches between modes via a persistent navigation element. The active session and auth context are shared between both modes.

---

## 7. Route Structure

### Storefront
```
/                        Home
/store                   Product listing
/store/:slug             Product detail
/cart                    Cart
/checkout                Checkout (blocked if unverified)
/order-confirmation      Success

/login  /signup  /verify-email  /forgot-password  /reset-password

/account                 Overview (protected)
/account/orders          Order history
/account/orders/:id      Order detail + tracking
/account/wishlist        Wishlist
/account/profile         Profile
/account/returns         Return requests

/about  /contact  /privacy-policy  /terms
```

### Admin (Narrowed Scope)
```
/admin/login  /admin/forgot-password

/admin                        Dashboard (storefront KPIs, online orders, low stock)
/admin/products               Products (variants, bundles, inventory mode)
/admin/categories             Categories + subcategories
/admin/inventory/finished     Finished goods stock (view + adjust)
/admin/inventory/raw          Raw materials stock (view + adjust)
/admin/inventory/movements    Stock movement log
/admin/recipes                Recipe management + version history
/admin/orders                 Online sales orders (storefront + manual)
/admin/orders/:id             Order detail + address edit (pre-ship only)
/admin/returns                Online returns management
/admin/customers              Customer profiles + order history
/admin/leads                  Lead capture + follow-up
/admin/coupons                Coupon + discount code management
/admin/content                CMS blocks (sliders, banners, featured sections)
/admin/payments               Payment modes + Razorpay gateway config
/admin/config                 System config (store info, notifications, storefront settings)
/admin/reports                Storefront reports (sales, orders, customers, coupons)
```

### POS (Full Business Management + Billing)
```
/pos/login

-- Terminal
/pos                          Transaction terminal (product grid + cart + payment)

-- Billing
/pos/sales                    Sales invoice list (Tax Invoice + Bill of Supply)
/pos/sales/:id                Sale invoice detail + print
/pos/sales/returns            Sales returns list
/pos/sales/returns/:id        Sales return detail + print
/pos/purchases                Purchase order + bill list
/pos/purchases/:id            Purchase detail
/pos/purchases/returns        Purchase returns list
/pos/purchases/returns/:id    Purchase return detail + print

-- Inventory
/pos/inventory/finished       Finished goods stock
/pos/inventory/raw            Raw materials stock
/pos/inventory/movements      Stock movement log

-- Manufacturing
/pos/recipes                  Recipe management + version history (shared with admin)
/pos/production               Production orders (POS-exclusive)
/pos/production/:id           Production order detail

-- Procurement
/pos/suppliers                Supplier profiles + ledger
/pos/raw-materials            Raw materials master

-- Employees
/pos/employees                Employee list
/pos/employees/:id            Employee detail + salary history
/pos/employees/attendance     Attendance entry (monthly working days)
/pos/employees/salary         Salary calculation + disbursement

-- Accounting
/pos/ledger/journal           Journal entries
/pos/ledger/suppliers         Supplier ledger
/pos/ledger/customers         Customer ledger
/pos/ledger/expenses          Expense tracking
/pos/ledger/bank              Bank reconciliation

-- GST
/pos/gst                      GST config + GSTR-1 + GSTR-2 + ITC summary

-- Coupons (shared management, POS redemption side)
/pos/coupons                  Coupon list + POS redemption log

-- Units
/pos/units                    Units + conversion rules

-- Staff & Roles
/pos/staff                    Staff records + roles
/pos/roles                    Role + permission matrix

-- Reports
/pos/reports                  All operational reports
/pos/reports/closing          Daily cash reconciliation + session closing
```

---

## 8. Access Control

### Architecture Principle
There are **no hardcoded role assumptions** in any surface. Every module and every action is controlled entirely by the `role_permissions` table. No default criteria determines who sees what. The only exception is the Developer role which has full access to everything and is never visible in any UI.

### Role Hierarchy
```
Developer (hidden, immutable, full access)
  └── [All other roles defined and managed by Developer / authorized staff]
        └── Module + action permissions per surface
```

### Permission Modules — Admin Surface
```
products  categories  inventory_finished  inventory_raw
recipes  orders  returns  customers  leads
coupons  content  payments  config  reports_admin
```

### Permission Modules — POS Surface
```
pos_terminal  sales_invoices  sales_returns
purchases  purchase_returns  inventory_finished  inventory_raw
recipes  production  suppliers  raw_materials
employees  salary  attendance
ledger  gst_config  coupons  units
staff  roles  reports_pos
```

### Actions: `create` `read` `update` `delete` `export` `view_reports`

### POS Access Toggle
Each role has a dedicated `pos_access: boolean` flag. Only staff whose role has `pos_access: true` appear in the POS staff picker. Developer never appears.

---

## 9. Enterprise Architecture

### 9.1 Domain Service Boundaries

The system is divided into bounded domains. Each domain owns its data and exposes a clean service interface. No domain reaches into another domain's data directly.

```
┌─────────────────────────────────────────────────────┐
│  Storefront Domain                                  │
│  CustomerService  |  CartService  |  OrderService   │
│  CouponService (storefront redemption)              │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Catalog Domain  (Admin + shared read in POS)       │
│  ProductService  |  CategoryService  |  BundleService│
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Inventory Domain  (Admin view + POS full ops)      │
│  InventoryTransactionEngine (sole mutation layer)   │
│  StockQueryService  |  MovementLogService           │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Manufacturing Domain  (POS primary, Admin read)    │
│  RecipeService  |  ProductionOrderService           │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Procurement Domain  (POS)                          │
│  SupplierService  |  PurchaseOrderService           │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Billing Domain  (POS)                              │
│  InvoiceService  |  BillTypeService                 │
│  SalesReturnService  |  PurchaseReturnService       │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Employee Domain  (POS)                             │
│  EmployeeService  |  AttendanceService              │
│  SalaryService                                      │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Promotions Domain  (Admin management + POS + SF)   │
│  CouponService                                      │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Accounting Domain  (POS primary)                   │
│  LedgerService (event-driven)  |  GSTService        │
│  ExpenseService  |  BankReconciliationService       │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  POS Domain                                         │
│  POSSessionService  |  POSTransactionService        │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Identity Domain                                    │
│  StaffAuthService  |  CustomerAuthService           │
│  RolePermissionService                              │
└─────────────────────────────────────────────────────┘
```

---

### 9.2 Event-Driven Ledger Generation

No module posts journal entries directly. Every financial event is dispatched as a domain event, and `LedgerService` subscribes and generates the journal entry automatically.

```
Financial Event Occurs
  └── Domain dispatches event to EventBus
        └── LedgerService receives event
              └── JournalEntryFactory generates debit/credit lines
                    └── Journal entry written to ledger
```

**Event → Journal Entry mapping:**

| Event | Debit | Credit |
|---|---|---|
| `purchase_bill_created` | Purchases + GST ITC | Accounts Payable |
| `supplier_payment_made` | Accounts Payable | Cash / Bank |
| `sale_order_completed` | Cash / Receivable | Sales Revenue + GST Payable |
| `order_refunded` | Sales Returns + GST Payable | Cash / Bank |
| `purchase_return_created` | Accounts Payable | Purchase Returns + GST ITC |
| `expense_recorded` | Expense Account | Cash / Bank |
| `bank_transaction_imported` | Bank | Clearing Account |
| `salary_disbursed` | Salary Expense | Cash / Bank |
| `advance_paid` | Staff Advances | Cash / Bank |
| `advance_recovered` | Cash / Bank | Staff Advances |
| `pos_transaction_completed` | Cash / Receivable | Sales Revenue + GST Payable |
| `pos_session_closed` | (no ledger entry — reconciliation record only) | — |

---

### 9.3 Inventory Transaction Engine

All inventory mutations flow through a single transaction engine. Nothing writes to inventory directly.

```
InventoryTransactionEngine
  ├── checkStock(itemId, quantity)       → boolean
  ├── reserveStock(itemId, quantity)     → reservationId
  ├── commitReservation(reservationId)   → movement log entry
  ├── releaseReservation(reservationId)  → cancels reservation
  ├── adjustStock(itemId, delta, reason) → movement log entry
  └── reverseMovement(movementId)        → reversal log entry (immutable audit)
```

Rules:
- Inventory movements are immutable — never edited, only reversed
- Every mutation creates a movement log entry with `stock_before` and `stock_after`
- Reservations prevent race conditions between simultaneous production orders
- Reversal entries used for cancellations and returns — no direct stock edits

**FIFO valuation layer:**
```
FIFOValuationService
  ├── recordPurchaseCost(itemId, quantity, unitCost)
  ├── getCOGS(itemId, quantitySold)
  └── getInventoryValue(itemId)
```

---

## 10. Inventory & Supply Chain System

### 10.1 Units Management
- Standard units pre-loaded: `g`, `kg`, `mg`, `ml`, `L`, `pcs`, `box`, `packet`, `dozen`
- Units managed from POS (`/pos/units`). Admin has read access for inventory display.
- Unit conversion rules configurable
- Conversions applied in recipe calculations and purchase-to-stock normalization

### 10.2 Raw Materials

```
raw_materials
  id
  name / description
  unit_id              (FK → units)
  current_stock
  reorder_level
  preferred_supplier_id
  hsn_code
  gst_slab
  is_active
```

- Multiple suppliers linkable per raw material
- Stock updated only via InventoryTransactionEngine
- Low stock alerts triggered when current_stock falls below reorder_level

### 10.3 Suppliers

```
suppliers
  id
  name / contact_person / phone / email / address
  gstin / pan
  bank_name / account_number / ifsc
  payment_terms
  is_active
```

Each supplier has a dedicated ledger account. Purchase bills auto-post via EventBus → LedgerService.

### 10.4 Purchase Orders, Bills, and Returns

**Purchase flow:**
```
Create PO → Receive Goods → Generate Bill → InventoryTransactionEngine.commitStock()
  → EventBus: purchase_bill_created → LedgerService posts journal entry
  → FIFOValuationService.recordPurchaseCost()
  → GST ITC recorded
```

**Bill document type:**
- If supplier is GST registered and goods are taxable: **Tax Invoice**
- If supplier is unregistered or goods are GST-exempt: **Bill of Supply**
- System auto-suggests based on supplier GSTIN presence; staff can override manually

**Purchase Returns:**
```
purchase_returns
  id / purchase_bill_id / return_date / reason / status
  document_type        (tax_invoice_return | bill_of_supply_return)

purchase_return_items
  id / purchase_return_id / raw_material_id / quantity / unit_cost
```
Return → InventoryTransactionEngine.reverseMovement() → EventBus: purchase_return_created → LedgerService reversal entry.

### 10.5 Recipe Management

```
recipes
  id / product_variant_id / name
  output_quantity / output_unit_id
  version / is_active / notes

recipe_ingredients
  id / recipe_id / raw_material_id / quantity / unit_id
```

- Accessible from both Admin (`/admin/recipes`) and POS (`/pos/recipes`)
- Admin can create, edit, view history. POS can create, edit, view history.
- Production order locks recipe version at creation — subsequent recipe changes do not affect in-progress orders
- Recipe versioning: old versions archived, never deleted

### 10.6 Production Orders (POS only)

**Two flows:**

**Flow A — Auto-deduct on completion:**
```
Create Production Order (recipe version locked)
  → InventoryTransactionEngine.reserveStock() per ingredient
  → Status: in_progress
  → On completion: InventoryTransactionEngine.commitReservation()
  → Finished goods stock incremented
  → EventBus: production_completed
```

**Flow B — Manual adjustment:**
```
Staff adjusts stock directly via InventoryTransactionEngine.adjustStock(reason required)
```

**Partial completion supported:**
```
production_orders
  planned_quantity
  actual_quantity_produced   (can be less than planned)
  status: planned | in_progress | partially_completed | completed | cancelled
```

Raw materials deducted proportionally to `actual_quantity_produced`.
Insufficient stock on creation: allow, flag in inventory report.

### 10.7 Finished Goods Inventory

Two deduction modes per product variant:

| Mode | Behaviour |
|---|---|
| `finished_goods` | Sales deduct from finished goods stock. Production replenishes it. |
| `recipe_realtime` | Sales calculate raw material consumption from recipe and deduct directly. |

### 10.8 Bundle Availability

```
BundleStockService.getAvailableQuantity(bundleId)
  → For each component variant: floor(variantStock / requiredQty)
  → Return minimum across all components
```

Result cached in state layer. Recomputed on any component stock change.

### 10.9 Inventory Valuation (FIFO)

```
inventory_cost_layers
  id
  item_type              (raw_material | finished_good)
  item_id
  quantity_remaining
  unit_cost
  purchase_date
  purchase_reference_id
```

---

## 11. Billing System (POS)

### 11.1 Document Types

Every sale and purchase transaction in the POS generates one of two document types:

| Document | When Used |
|---|---|
| **Tax Invoice** | Buyer is GST-registered (has GSTIN) and goods are taxable |
| **Bill of Supply** | Buyer is unregistered, goods are GST-exempt, or transaction is below GST threshold |

**Auto-suggest logic:**
- If customer GSTIN is present on the transaction → suggest Tax Invoice
- If no GSTIN or goods are exempt → suggest Bill of Supply
- Staff can override the suggested type manually at time of billing
- Override is logged with the staff member's name

### 11.2 Sales Invoice

```
sales_invoices
  id
  invoice_number         (sequential, separate series for Tax Invoice and Bill of Supply)
  document_type          (tax_invoice | bill_of_supply)
  invoice_date
  customer_id            (nullable — walk-in allowed)
  customer_name          (for walk-in)
  customer_gstin         (nullable)
  billing_address
  pos_session_id         (FK → pos_sessions, if from POS terminal)
  source                 (pos | manual | storefront)
  items                  (FK → sales_invoice_items)
  subtotal
  discount_amount
  coupon_code            (nullable)
  coupon_discount        (nullable)
  taxable_value
  cgst_amount / sgst_amount / igst_amount
  total_amount
  payment_mode(s)
  payment_status         (paid | unpaid | partial)
  notes
  created_by             (FK → staff.id)
```

### 11.3 Sales Returns

```
sales_returns
  id
  return_number
  document_type          (tax_invoice_return | bill_of_supply_return — matches original)
  original_invoice_id    (FK → sales_invoices)
  return_date
  reason
  items                  (FK → sales_return_items)
  refund_amount
  refund_mode
  status                 (requested | approved | refunded)
  created_by
```

On confirm: InventoryTransactionEngine.adjustStock() for returned items → EventBus: order_refunded → LedgerService reversal entry.

### 11.4 Invoice Numbering

Separate sequential number series maintained per document type:
- Tax Invoice: `TI-YYYY-XXXXX`
- Bill of Supply: `BS-YYYY-XXXXX`
- Sales Return (Tax): `TR-YYYY-XXXXX`
- Sales Return (Bill of Supply): `BR-YYYY-XXXXX`
- Purchase Return: `PR-YYYY-XXXXX`

All series reset at financial year start (April 1).

---

## 12. Order System

**Sources:** Storefront, POS, Manual (phone/WhatsApp)

**Lifecycle:**
```
Placed → Payment Confirmed → Packed → Shipped → Delivered
```

**Payment states:** Pending, Paid, Failed, Refunded

### Order Cancellation Rules

```
cancelled_before_packing  → InventoryTransactionEngine.reverseMovement() auto-restores stock
cancelled_after_shipping  → manual return workflow required, no auto-restore
partially_shipped         → manual workflow, only unshipped items eligible for auto-restore
```

### Address Change Rule
Admin can modify shipping address until order status reaches Shipped. Locked after that.

### Returns & Refunds (Storefront / Online Orders)

```
returns
  id / order_id / requested_by / status
  (requested | approved | received | refunded | rejected)

return_items
  id / return_id / order_item_id / quantity / reason

return_types
  stock_return_and_refund    → stock re-enters inventory + refund issued
  refund_only                → refund issued, no stock return
  replacement                → replacement order created
```

On stock return: InventoryTransactionEngine.adjustStock() → movement log entry.
On refund: EventBus: order_refunded → LedgerService posts sales reversal entry.

### Payment Webhook (Phase 2 — Razorpay)

```
payment_webhook_events
  id / gateway / event_type / payload / processed / idempotency_key / created_at
```

Idempotency key ensures duplicate webhook deliveries are safely ignored.

---

## 13. Coupon and Discount System

### Coupon Model

```
coupons
  id
  code                   (unique, uppercase)
  description
  discount_type          (percentage | flat_amount)
  discount_value
  minimum_order_value    (nullable)
  maximum_discount_cap   (nullable — for percentage coupons)
  applicable_on          (all | specific_categories | specific_products)
  applicable_ids         (array of category or product IDs, nullable)
  valid_from / valid_until
  usage_limit            (nullable — total uses allowed)
  usage_limit_per_customer (nullable)
  times_used             (counter)
  is_active
  created_by             (FK → staff.id)
  surface                (storefront | pos | both)
```

### Redemption Rules
- Coupons with `surface: storefront` or `surface: both` are valid at storefront checkout
- Coupons with `surface: pos` or `surface: both` are valid at POS terminal
- Validation checks: active status, date range, usage limits, minimum order value, applicable items
- One coupon per transaction
- Coupon discount applied after line-item discounts, before GST calculation

### Management
- Created and managed from Admin (`/admin/coupons`)
- POS staff can apply valid coupons at terminal (`/pos/coupons` shows redemption log only)

---

## 14. Employee and Salary Management (POS)

### Employee Model

All employees are `staff` records. No separate employee table. The salary and attendance system operates on top of the existing `staff` model.

```
employee_salary_structures
  id
  staff_id               (FK → staff.id)
  salary_type            (fixed_monthly | daily_rate)
  monthly_amount         (nullable — for fixed_monthly)
  daily_rate             (nullable — for daily_rate)
  hra                    (nullable)
  travel_allowance       (nullable)
  other_allowances       (nullable)
  effective_from
  is_active

attendance_records
  id
  staff_id               (FK → staff.id)
  month                  (YYYY-MM)
  working_days_in_month  (total days in that month)
  days_present           (manually entered by manager)
  notes
  entered_by             (FK → staff.id)
  created_at

salary_disbursements
  id
  staff_id               (FK → staff.id)
  month                  (YYYY-MM)
  days_present
  basic_earned           (computed: daily_rate × days_present OR full monthly if fixed)
  hra_earned
  travel_allowance_earned
  other_allowances_earned
  gross_salary
  advance_deduction      (total advances recovered this month)
  other_deductions
  net_payable
  payment_mode           (cash | bank | upi)
  payment_reference
  status                 (draft | approved | paid)
  approved_by            (FK → staff.id)
  paid_at
  created_by

staff_advances
  id
  staff_id               (FK → staff.id)
  advance_date
  amount
  reason
  recovered_amount       (running total recovered)
  balance_outstanding
  created_by
```

### Salary Calculation Logic

```
For daily_rate employees:
  basic_earned = daily_rate × days_present

For fixed_monthly employees:
  basic_earned = monthly_amount (regardless of days — or prorated if configured)

gross_salary = basic_earned + hra_earned + travel_allowance_earned + other_allowances_earned
advance_deduction = advances recovered this month (entered manually)
other_deductions = fines or other manual deductions
net_payable = gross_salary - advance_deduction - other_deductions
```

### Disbursement Flow
1. Manager enters attendance for the month (days present per employee)
2. System computes salary breakdown (draft state — editable)
3. Manager reviews and approves
4. On approval: EventBus: salary_disbursed → LedgerService posts journal entry (DR Salary Expense, CR Cash/Bank)
5. Advance recoveries: EventBus: advance_recovered → LedgerService reversal entry

---

## 15. Accounting Ledger System (Double-Entry)

### 15.1 Chart of Accounts

System accounts pre-seeded (cannot be deleted):

```
1001  Cash
1002  Bank
1100  Accounts Receivable
1101  Staff Advances
2001  Accounts Payable
3001  Sales Revenue
3002  Sales Returns
4001  Purchases / COGS
4002  Purchase Returns
4003  Expenses
4004  Salary Expense
5001  GST Payable (Output Tax)
5002  GST Receivable / ITC
```

Custom accounts can be added from POS.

### 15.2 Journal Entries

```
journal_entries
  id / entry_date / reference_type / reference_id / description / created_by

journal_entry_lines
  id / journal_entry_id / account_id / debit_amount / credit_amount / notes
```

All entries generated by `JournalEntryFactory` via `LedgerService`. No module posts entries directly.

### 15.3 GST Rounding

```
gst_config
  rounding_precision: 2
  rounding_method: normal   (configurable: normal | bankers)
```

### 15.4 Supplier Ledger
Per-supplier running balance: bills (credit), payments (debit), outstanding payable.

### 15.5 Customer Ledger
Per-customer running balance: invoices (debit), receipts (credit), outstanding receivable.

### 15.6 Expense Tracking

```
expenses
  id / expense_date / category / amount / gst_amount
  account_id / paid_via / reference_number / notes / created_by
```

Auto-posts journal entry via EventBus on save.

### 15.7 Bank Reconciliation

```
bank_transactions
  id / transaction_date / description
  debit_amount / credit_amount / reference_number
  is_reconciled / matched_journal_entry_id
```

Staff matches bank statement lines against journal entries manually in POS.

---

## 16. GST System

### Configuration

```
gst_config
  is_gst_registered / gstin / state_code / business_name
  default_tax_type       (intra_state | inter_state)
  enable_gst_on_sales    (boolean)
  enable_itc             (boolean)
  rounding_precision: 2
  rounding_method: normal
```

### Per Item
- HSN code + GST slab (0%, 5%, 12%, 18%, 28%) on every product variant and raw material
- Tax type auto-determined: CGST + SGST (intra-state) or IGST (inter-state)

### Transaction-Level Override
Staff can apply GST exemption on individual transactions. Override logged with reason and staff name.

### GST Reports (POS)
- GSTR-1 summary (outward supplies)
- GSTR-2 summary (inward supplies / ITC)
- ITC utilization report
- GST payable vs receivable balance

---

## 17. POS Terminal System

### Auth & Session
- Staff picker → PIN entry
- Lockout after 5 failed attempts (15-minute lockout, configurable in POS settings)
- Cart persisted in `localStorage` — survives browser crash
- Phase 1: requires active network connection (offline mode is Phase 4 scope)

### Cash Reconciliation (Daily Closing)
```
pos_closing_report
  opening_cash
  + cash_sales
  - cash_refunds
  = expected_cash
  actual_cash_counted    (cashier enters this)
  cash_variance          (logged, flagged if non-zero)
```

### Terminal Features
- Product grid + search + barcode input
- Cart with line-item discounts
- Coupon code input at cart (validated against CouponService)
- Customer lookup and attach (with GSTIN field for B2B)
- Document type auto-suggest (Tax Invoice / Bill of Supply) with manual override
- Split payment (Cash + UPI + Card)
- Configurable payment modes (recording only — no payment gateway in POS)
- Receipt / invoice PDF generation
- Auto-posts sale journal entry via EventBus on transaction completion

---

## 18. Configuration Safety Rules

- Payment modes, GST slabs, units: soft-delete only (active flag toggled)
- Config records referenced by existing orders, bills, or journal entries are never hard-deleted
- Disabling a payment mode: existing transactions unaffected, mode unavailable for new transactions only
- System timezone defined in `system_config` — all date boundaries computed in system timezone

```
system_config
  timezone: "Asia/Kolkata"   (default, configurable)
```

---

## 19. Admin Modules Summary

| Module               | Key Capabilities                                                               |
|----------------------|--------------------------------------------------------------------------------|
| Dashboard            | Storefront KPIs, online orders, low stock alerts, customer signups             |
| Products             | Catalog, variants, bundles, inventory mode per variant                         |
| Categories           | Category + subcategory tree                                                    |
| Inventory (Finished) | Stock view + adjust, reorder alerts, movement log                              |
| Inventory (Raw)      | Raw material stock view + adjust, movement log                                 |
| Recipes              | Recipe builder, ingredient list, version history (shared with POS)             |
| Orders               | Online sales orders (storefront + manual), address edit, cancellation          |
| Returns              | Online return requests, type selection, stock re-entry, refund trigger         |
| Customers            | Profiles, order history, verification status                                   |
| Leads                | Lead capture, follow-up tracking                                               |
| Coupons              | Create + manage coupon codes for storefront and POS                            |
| Content (CMS)        | Sliders, banners, featured sections                                            |
| Payments             | Payment modes, Razorpay gateway config (Phase 2)                               |
| Configuration        | Store info, timezone, notifications, storefront settings                       |
| Reports              | Online sales, orders, customer, coupon performance                             |

---

## 20. POS Modules Summary

| Module                  | Key Capabilities                                                            |
|-------------------------|-----------------------------------------------------------------------------|
| Terminal                | Product grid, cart, billing, document type, coupon, split payment, receipt  |
| Sales Invoices          | Tax Invoice + Bill of Supply list, detail, print, download PDF              |
| Sales Returns           | Return invoice creation, stock re-entry, refund, print                      |
| Purchases               | PO creation, goods receipt, purchase bill (Tax Invoice / BoS), GST          |
| Purchase Returns        | Return against bill, inventory reversal, credit note                        |
| Inventory (Finished)    | Stock, reorder alerts, FIFO layers, movement log, low stock alerts          |
| Inventory (Raw)         | Raw material stock, reorder alerts, FIFO layers, movement log               |
| Recipes                 | Recipe builder, ingredient list, version history (shared with Admin)        |
| Production Orders       | Batch production, reservation, partial completion, material deduction       |
| Raw Materials           | Material master, unit, HSN, GST slab, supplier links                        |
| Suppliers               | Profiles, bank details, linked materials, ledger view                       |
| Employees               | Staff profiles, salary structures, advance management                       |
| Attendance              | Monthly working days entry per employee                                     |
| Salary                  | Salary computation, approval, disbursement, advance recovery                |
| Ledger                  | Journal entries, supplier/customer ledger, expenses, bank reconciliation    |
| GST                     | Config, GSTR-1, GSTR-2, ITC summary, transaction overrides                 |
| Coupons                 | Redemption log (management in Admin)                                        |
| Units                   | Standard + custom units, conversion rules                                   |
| Staff                   | Staff records, role assignment, PIN reset, lockout management               |
| Roles & Permissions     | Role creation, permission matrix (per surface)                              |
| Reports                 | Sales, purchase, inventory, production, procurement, financial, GST, POS    |
| Session Closing         | Daily cash reconciliation, cash variance, session summary                   |

---

## 21. Reports — Full List

### Admin Reports
- Sales overview (revenue, orders, AOV)
- Orders by status
- Customer acquisition and activity
- Coupon performance

### POS Reports
- Monthly Sale
- Sale Return
- Purchase
- Purchase Return
- Item-wise Sales
- Sundry Debtors (outstanding customer receivables)
- Account Ledger History (per supplier / per customer)
- Inventory Report (finished goods + raw materials stock value)
- GST Report (GSTR-1, GSTR-2, ITC summary)
- Staff-wise transaction summary
- Production report (batches, output, raw material consumed)
- Expense report (category-wise)
- Salary report (monthly disbursements)
- Daily / session cash reconciliation

All report tabs: Export CSV and Export PDF buttons.

---

## 22. Technical Architecture — Phase 1

### Stack

| Layer            | Technology                                     |
|------------------|------------------------------------------------|
| Framework        | React + TypeScript                             |
| Styling          | Tailwind CSS                                   |
| State Management | Redux Toolkit + RTK Query                      |
| Routing          | React Router v6                                |
| Theme            | System preference default (CSS vars + dark:)   |
| Build Tool       | Vite                                           |
| Icons            | Lucide React                                   |
| Charts           | Recharts                                       |
| Animations       | Framer Motion                                  |

### Data Flow

```
Mock Data (TypeScript constants)
  └── API Abstraction Layer (domain service functions per surface)
        └── RTK Query (endpoints, cache, loading/error states)
              └── Redux Store (per surface)
                    └── UI Components
```

Phase 2: swap mock service functions for real API calls. Zero UI changes required.

### EventBus (Phase 1 — in-memory)

```
EventBus
  .dispatch(eventType, payload)
  .subscribe(eventType, handler)
```

In Phase 1, simple in-memory pub/sub. In Phase 2, replaced with a real message queue without changing domain code.

---

## 23. Full Conceptual Data Model

```
-- Auth
customers                staff                  roles
role_permissions

-- Catalog
products                 product_variants       product_bundles
bundle_items             categories             subcategories

-- Recipes & Production
recipes                  recipe_ingredients     production_orders
production_order_materials

-- Raw Materials & Suppliers
raw_materials            supplier_raw_materials suppliers

-- Purchasing
purchase_orders          purchase_order_items   purchase_bills
purchase_returns         purchase_return_items

-- Inventory
inventory_finished       inventory_raw          inventory_movements
inventory_reservations   inventory_cost_layers

-- Billing
sales_invoices           sales_invoice_items    sales_returns
sales_return_items

-- Orders & Returns (Storefront)
orders                   order_items            order_status_history
payments                 returns                return_items
payment_webhook_events

-- POS
pos_sessions             pos_transactions       pos_closing_reports

-- Employee & Salary
employee_salary_structures   attendance_records
salary_disbursements         staff_advances

-- Promotions
coupons                  coupon_redemptions

-- Accounting
accounts                 journal_entries        journal_entry_lines
expenses                 bank_transactions

-- CRM
leads                    customer_addresses     wishlists
customer_reviews

-- Config & CMS
system_config            gst_config             payment_modes
units                    unit_conversions       notification_templates
cms_sliders              cms_banners            cms_featured_sections
```

---

## 24. Folder Structure (Repo-Split Ready)

```
src/
├── storefront/
│   ├── auth/
│   ├── layouts/
│   ├── pages/
│   ├── components/
│   ├── store/
│   ├── services/
│   │   ├── CustomerService.ts
│   │   ├── CartService.ts
│   │   ├── OrderService.ts
│   │   ├── CouponService.ts
│   │   └── events/
│   └── mock/
│
├── admin/
│   ├── auth/
│   ├── layouts/
│   ├── pages/
│   ├── components/
│   ├── store/
│   ├── services/
│   │   ├── ProductService.ts
│   │   ├── CategoryService.ts
│   │   ├── RecipeService.ts          (shared — read + write from admin)
│   │   ├── InventoryQueryService.ts  (read-only view for admin)
│   │   ├── CouponService.ts          (management from admin)
│   │   └── EventBus.ts
│   └── mock/
│
├── pos/
│   ├── auth/
│   ├── layouts/
│   ├── pages/
│   ├── components/
│   ├── store/
│   ├── services/
│   │   ├── POSSessionService.ts
│   │   ├── POSTransactionService.ts
│   │   ├── InvoiceService.ts
│   │   ├── BillTypeService.ts
│   │   ├── SalesReturnService.ts
│   │   ├── PurchaseOrderService.ts
│   │   ├── PurchaseReturnService.ts
│   │   ├── InventoryTransactionEngine.ts
│   │   ├── FIFOValuationService.ts
│   │   ├── LedgerService.ts
│   │   ├── JournalEntryFactory.ts
│   │   ├── GSTService.ts
│   │   ├── RecipeService.ts          (shared — read + write from POS)
│   │   ├── ProductionOrderService.ts
│   │   ├── SupplierService.ts
│   │   ├── EmployeeService.ts
│   │   ├── AttendanceService.ts
│   │   ├── SalaryService.ts
│   │   ├── BundleStockService.ts
│   │   ├── CouponService.ts          (redemption validation from POS)
│   │   ├── EventBus.ts
│   │   └── BankReconciliationService.ts
│   └── mock/
│
├── components/
│   └── ui/                  (shared shadcn-style UI primitives only)
│
└── main.tsx
```

---

## 25. Theme System

- Next-themes for theme management across all three surfaces
- Default: system preference (`prefers-color-scheme`) detected via next-themes
- Manual toggle per surface independently
- CSS custom properties for all color tokens — switching is instant with zero flash
- Tailwind `dark:` class-based dark mode applied to root element of each surface
- Persisted in localStorage namespaced per surface:
  - Storefront: `sf_theme`
  - Admin: `adm_theme`
  - POS: `pos_theme`
- Custom font: `bricola` (woff2), falls back to system sans-serif stack
- Theme transitions: 300ms ease on background-color, border-color, box-shadow. Inputs and elements with `.no-theme-transition` are excluded to prevent flicker.

### Admin and POS Theme

Clean, neutral, professional. Primary brand color is blue (`217 91% 60%`). Full light and dark mode.

```css
/* Admin + POS — Light */
--primary: 217 91% 60%;
--primary-foreground: 0 0% 100%;
--primary-hover: 217 91% 55%;
--background: 0 0% 100%;
--background-secondary: 220 14% 98%;
--foreground: 220 13% 13%;
--card: 0 0% 100%;
--card-foreground: 220 13% 13%;
--card-hover: 220 14% 99%;
--popover: 0 0% 100%;
--popover-foreground: 220 13% 13%;
--secondary: 220 14% 96%;
--secondary-foreground: 220 13% 26%;
--muted: 220 14% 96%;
--muted-foreground: 220 9% 46%;
--accent: 220 14% 96%;
--accent-foreground: 220 13% 13%;
--success: 152 76% 40%;
--success-foreground: 0 0% 100%;
--success-muted: 152 76% 95%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 100%;
--warning-muted: 38 92% 95%;
--destructive: 0 72% 51%;
--destructive-foreground: 0 0% 100%;
--destructive-muted: 0 72% 95%;
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
--info-muted: 217 91% 96%;
--border: 220 13% 91%;
--border-strong: 220 13% 85%;
--input: 220 13% 91%;
--ring: 217 91% 60%;
--radius: 0.75rem;
--radius-sm: 0.5rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;
--sidebar-background: 220 14% 98%;
--sidebar-foreground: 220 13% 26%;
--sidebar-primary: 217 91% 60%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 220 14% 94%;
--sidebar-accent-foreground: 220 13% 13%;
--sidebar-border: 220 13% 91%;
--sidebar-ring: 217 91% 60%;

/* Admin + POS — Dark */
--primary: 217 91% 65%;
--primary-hover: 217 91% 70%;
--background: 220 13% 6%;
--background-secondary: 220 13% 9%;
--foreground: 220 14% 96%;
--card: 220 13% 9%;
--card-foreground: 220 14% 96%;
--card-hover: 220 13% 11%;
--popover: 220 13% 9%;
--popover-foreground: 220 14% 96%;
--secondary: 220 13% 14%;
--secondary-foreground: 220 14% 90%;
--muted: 220 13% 14%;
--muted-foreground: 220 9% 55%;
--accent: 220 13% 14%;
--accent-foreground: 220 14% 96%;
--success: 152 76% 45%;
--success-muted: 152 50% 15%;
--warning: 38 92% 55%;
--warning-muted: 38 50% 15%;
--destructive: 0 72% 55%;
--destructive-muted: 0 50% 15%;
--info: 217 91% 65%;
--info-muted: 217 50% 15%;
--border: 220 13% 18%;
--border-strong: 220 13% 25%;
--input: 220 13% 18%;
--ring: 217 91% 65%;
--sidebar-background: 220 13% 9%;
--sidebar-foreground: 220 14% 70%;
--sidebar-primary: 217 91% 65%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 220 13% 14%;
--sidebar-accent-foreground: 220 14% 96%;
--sidebar-border: 220 13% 18%;
--sidebar-ring: 217 91% 65%;
```

### Storefront Theme

Off-white base with warm saffron primary, deep gold accent, and muted green for success states. Festive but clean — avoids garish saturation. Full light and dark mode.

```css
/* Storefront — Light */
--primary: 28 95% 52%;            /* saffron orange */
--primary-foreground: 0 0% 100%;
--primary-hover: 28 95% 46%;
--background: 36 33% 97%;         /* warm off-white */
--background-secondary: 36 25% 94%;
--foreground: 24 15% 12%;         /* warm near-black */
--card: 36 30% 98%;
--card-foreground: 24 15% 12%;
--card-hover: 36 25% 96%;
--popover: 36 30% 98%;
--popover-foreground: 24 15% 12%;
--secondary: 36 20% 92%;
--secondary-foreground: 24 12% 28%;
--muted: 36 18% 92%;
--muted-foreground: 24 8% 48%;
--accent: 43 85% 52%;             /* deep gold */
--accent-foreground: 24 15% 12%;
--success: 150 55% 38%;           /* muted green */
--success-foreground: 0 0% 100%;
--success-muted: 150 55% 93%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 100%;
--warning-muted: 38 92% 94%;
--destructive: 0 70% 50%;
--destructive-foreground: 0 0% 100%;
--destructive-muted: 0 70% 94%;
--info: 28 95% 52%;
--info-foreground: 0 0% 100%;
--info-muted: 28 95% 94%;
--border: 36 18% 88%;
--border-strong: 36 18% 80%;
--input: 36 18% 88%;
--ring: 28 95% 52%;
--radius: 0.75rem;
--radius-sm: 0.5rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;

/* Storefront — Dark */
--primary: 28 92% 58%;
--primary-hover: 28 92% 63%;
--background: 24 14% 7%;          /* warm dark */
--background-secondary: 24 13% 10%;
--foreground: 36 20% 94%;
--card: 24 13% 10%;
--card-foreground: 36 20% 94%;
--card-hover: 24 12% 13%;
--popover: 24 13% 10%;
--popover-foreground: 36 20% 94%;
--secondary: 24 12% 15%;
--secondary-foreground: 36 15% 85%;
--muted: 24 12% 15%;
--muted-foreground: 24 8% 55%;
--accent: 43 80% 55%;
--accent-foreground: 24 14% 8%;
--success: 150 55% 42%;
--success-muted: 150 40% 14%;
--warning: 38 88% 55%;
--warning-muted: 38 50% 14%;
--destructive: 0 70% 55%;
--destructive-muted: 0 50% 14%;
--info: 28 92% 58%;
--info-muted: 28 60% 14%;
--border: 24 12% 18%;
--border-strong: 24 12% 24%;
--input: 24 12% 18%;
--ring: 28 92% 58%;
```

**Storefront design direction:** TBD — pending client confirmation on final visual aesthetic. The token set above is the working direction (warm off-white + saffron + gold) and will be updated once confirmed.

---

## 26. Mock Data Coverage

Full realistic mock data required for every module:

- Products, variants, bundles with inventory modes set
- Categories and subcategories
- Customers (verified and unverified states)
- Online orders across all statuses and payment states
- Online returns in various states
- Staff users with diverse roles and PIN hashes (no default permission assumptions)
- Roles with varied permission matrices across both surfaces
- Raw materials with FIFO cost layers and low stock states
- Suppliers with linked materials and bank details
- Purchase orders, bills, and returns with GST breakdowns (Tax Invoice and Bill of Supply examples)
- Sales invoices (Tax Invoice and Bill of Supply examples across POS and manual source)
- Sales returns with refund states
- Recipes with version history
- Production orders (planned, in-progress, partially completed, completed, cancelled)
- Inventory movements log across all types
- Inventory reservations
- Employee salary structures (fixed and daily rate employees)
- Attendance records for 3 months
- Salary disbursements (draft, approved, paid states)
- Staff advances (active and fully recovered)
- Coupons (percentage and flat, storefront-only, POS-only, both, expired, active)
- Journal entries balanced for all transaction types including salary
- Supplier and customer ledger views
- Expenses across categories
- Bank transactions (reconciled and unreconciled)
- GST config set to registered with GSTIN
- POS sessions with cash reconciliation data and a small variance example
- Sundry debtors data (customers with outstanding balances)
- CMS blocks, sliders, banners
- System config with timezone set to Asia/Kolkata
- Analytics datasets for all report tabs in both Admin and POS

---

## 27. Development Phases

### Phase 1 — UI + Mock Data Architecture (Current)
All three surfaces fully built with mock data, RTK Query, RBAC enforcement, domain service layer, EventBus (in-memory). Full POS billing software including Tax Invoice, Bill of Supply, sales returns, purchase returns, employee and salary management, coupon system, complete accounting ledger, GST reporting including Sundry Debtors, dark/light theme, pixel-perfect responsive.

### Phase 2 — Backend Integration + Razorpay
Real API swap, JWT auth per surface, order engine, inventory sync, email notifications, real EventBus (BullMQ/Redis). Razorpay integration for storefront checkout and webhook handling.

### Phase 3 — Operations
POS hardware integration, SMS/WhatsApp notifications, GST return filing exports, advanced bank reconciliation automation.

### Phase 4 — Growth
POS offline mode (service worker + sync queue), logistics integrations, marketing automation, advanced analytics, mobile apps, multi-store / franchise with inter-branch transfers, Tally-compatible export.

---

## 28. Edge Case Rules Reference

| Edge Case | Rule |
|---|---|
| Order cancelled before packing | Auto-restore stock via reversal movement |
| Order cancelled after shipping | Manual return workflow, no auto-restore |
| Partial shipment cancellation | Only unshipped items eligible for auto-restore |
| Insufficient raw material on production order | Allow, flag in inventory report |
| Simultaneous production orders | Reservation system prevents over-commitment |
| Bundle stock calculation | Computed by BundleStockService, cached in state |
| Recipe changed during active production | Production order locks recipe version at creation |
| Partial production completion | Supported, materials deducted proportionally |
| POS browser crash | Cart survives via localStorage |
| POS network loss | Phase 1 requires network — offline is Phase 4 |
| POS PIN brute force | Lockout after 5 attempts, 15-minute timeout |
| Cash variance at closing | Logged, surfaced in POS reports |
| Unverified customer at checkout | Blocked — must verify email first |
| Google OAuth customers | Auto-verified, no email verification step |
| Developer credential | Mock only — replaced before production deployment |
| Address change on order | Allowed until status reaches Shipped |
| GST exempt transaction | Transaction-level override with logged reason and staff name |
| Bill type override | Staff can override auto-suggested Tax Invoice / Bill of Supply, logged |
| Invoice number series | Separate sequential series per document type, resets at financial year |
| GST rounding | precision: 2, method: normal (configurable) |
| Payment mode disabled with existing transactions | Soft-disable only, existing records unaffected |
| Config records referenced by transactions | Never hard-deleted |
| Daily report timezone boundary | All boundaries computed in system timezone (Asia/Kolkata default) |
| Duplicate payment webhook | Idempotency key on `payment_webhook_events` |
| Coupon usage limit reached | Reject at validation, show clear error |
| Coupon applied to ineligible items | Discount applies only to eligible items in cart |
| Advance recovery exceeds disbursement | Cap deduction at net payable — carry forward remainder to next month |
| Salary for partial month (fixed) | Prorate by default; configurable to pay full month regardless |
| Role has no permissions assigned | Staff with that role sees a blank surface — no modules accessible |
| Staff with no POS access | Never appears in POS staff picker |

---

## 29. Future Expansion

- Marketplace integrations (Amazon, Flipkart)
- WhatsApp ordering
- Loyalty and rewards program
- Franchise / multi-location with inter-branch stock transfers
- Full Tally-compatible export
- B2B wholesale portal with custom pricing tiers
- Customer mobile app
- POS offline mode with sync queue

---

*Blueprint version 5.0 — Revised. Surface restructure complete. All client requirements mapped.*
*Storefront design direction pending client confirmation.*#   m u k h w a s - 1  
 