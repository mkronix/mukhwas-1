import { DatePicker } from "@/admin/components/DatePicker";
import { ExportButton } from "@/admin/components/ExportButton";
import { useReportData } from "@/admin/hooks/useReports";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { DataTableOne } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/ui/permission-guard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Action, Module } from "@/constant/permissions";
import { format } from "date-fns";
import {
  BarChart3,
  IndianRupee,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";

const ReportsPage: React.FC = () => {
  const [tab, setTab] = useState("sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { salesData: rawSales, inventoryData: rawInventory, productionData: rawProduction, procurementData: rawProcurement, financialData: rawFinancial, staffData: rawStaff, loading: reportLoading } = useReportData();

  const salesData = useMemo(() => {
    let data = rawSales.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_id: o.customer_id,
      status: o.status,
      total: formatINR(o.total_paisa),
      total_paisa: o.total_paisa,
      payment: o.payment,
      date: o.date,
    }));
    if (dateFrom) data = data.filter((d) => d.date >= dateFrom);
    if (dateTo) data = data.filter((d) => d.date <= dateTo);
    if (statusFilter !== "all")
      data = data.filter((d) => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.order_number.toLowerCase().includes(q));
    }
    return data;
  }, [rawSales, dateFrom, dateTo, statusFilter, search]);

  const inventoryData = useMemo(() => {
    let data = [...rawInventory];
    if (statusFilter !== "all")
      data = data.filter((d) => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.product.toLowerCase().includes(q) ||
          d.sku.toLowerCase().includes(q),
      );
    }
    return data;
  }, [rawInventory, statusFilter, search]);

  const productionData = useMemo(() => {
    let data = [...rawProduction];
    if (statusFilter !== "all")
      data = data.filter((d) => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.recipe.toLowerCase().includes(q));
    }
    return data;
  }, [rawProduction, statusFilter, search]);

  const procurementData = useMemo(() => {
    let data = rawProcurement.map((p) => ({
      ...p,
      total: formatINR(p.total_paisa),
    }));
    if (statusFilter !== "all")
      data = data.filter((d) => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.supplier.toLowerCase().includes(q));
    }
    return data;
  }, [rawProcurement, statusFilter, search]);

  const financialData = useMemo(() => {
    let data = rawFinancial.map((e) => ({
      ...e,
      amount: formatINR(e.amount_paisa),
    }));
    if (dateFrom) data = data.filter((d) => d.date >= dateFrom);
    if (dateTo) data = data.filter((d) => d.date <= dateTo);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.description.toLowerCase().includes(q));
    }
    return data;
  }, [rawFinancial, dateFrom, dateTo, search]);

  const staffData = useMemo(() => {
    return rawStaff.map((r) => ({
      id: r.id,
      staff_id: r.staff_id,
      period: `${r.period_start} — ${r.period_end}`,
      days: r.days,
      net: formatINR(r.net_paisa),
      net_paisa: r.net_paisa,
    }));
  }, [rawStaff]);

  const salesColumns: DataTableOneColumn<(typeof salesData)[0]>[] = [
    {
      key: "order",
      header: "Order #",
      sortable: true,
      sortValue: (r) => r.order_number,
      render: (r) => (
        <span className="text-[13px] font-mono text-primary">
          {r.order_number}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant="outline" className="text-[10px]">
          {r.status}
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortValue: (r) => r.total_paisa,
      render: (r) => <span className="text-[13px] font-medium">{r.total}</span>,
    },
    {
      key: "payment",
      header: "Payment",
      render: (r) => (
        <Badge variant="secondary" className="text-[10px]">
          {r.payment}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(r.date), "dd MMM yyyy")}
        </span>
      ),
    },
  ];

  const inventoryColumns: DataTableOneColumn<(typeof inventoryData)[0]>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (r) => r.product,
      render: (r) => (
        <span className="text-[13px] font-medium">{r.product}</span>
      ),
    },
    {
      key: "variant",
      header: "Variant",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.variant}</span>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (r) => (
        <span className="text-[11px] font-mono text-muted-foreground">
          {r.sku}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      sortValue: (r) => r.stock,
      render: (r) => <span className="text-[13px]">{r.stock}</span>,
    },
    {
      key: "reorder",
      header: "Reorder",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.reorder}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant={r.status === "in_stock" ? "secondary" : "destructive"}
          className="text-[10px]"
        >
          {r.status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  const productionColumns: DataTableOneColumn<(typeof productionData)[0]>[] = [
    {
      key: "order",
      header: "Order",
      render: (r) => (
        <span className="text-[13px] font-mono text-primary">
          {r.order_number}
        </span>
      ),
    },
    {
      key: "recipe",
      header: "Recipe",
      sortable: true,
      sortValue: (r) => r.recipe,
      render: (r) => (
        <span className="text-[13px] font-medium">{r.recipe}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant="outline" className="text-[10px]">
          {r.status}
        </Badge>
      ),
    },
    {
      key: "planned",
      header: "Planned",
      render: (r) => <span className="text-[13px]">{r.planned}</span>,
    },
    {
      key: "actual",
      header: "Actual",
      render: (r) => <span className="text-[13px]">{r.actual}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(r.date), "dd MMM yyyy")}
        </span>
      ),
    },
  ];

  const procurementColumns: DataTableOneColumn<(typeof procurementData)[0]>[] =
    [
      {
        key: "po",
        header: "PO #",
        render: (r) => (
          <span className="text-[13px] font-mono text-primary">
            {r.po_number}
          </span>
        ),
      },
      {
        key: "supplier",
        header: "Supplier",
        sortable: true,
        sortValue: (r) => r.supplier,
        render: (r) => (
          <span className="text-[13px] font-medium">{r.supplier}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <Badge variant="outline" className="text-[10px]">
            {r.status}
          </Badge>
        ),
      },
      {
        key: "total",
        header: "Total",
        render: (r) => (
          <span className="text-[13px] font-medium">{r.total}</span>
        ),
      },
      {
        key: "date",
        header: "Date",
        sortable: true,
        sortValue: (r) => r.date,
        render: (r) => (
          <span className="text-[13px] text-muted-foreground">{r.date}</span>
        ),
      },
    ];

  const financialColumns: DataTableOneColumn<(typeof financialData)[0]>[] = [
    {
      key: "cat",
      header: "Category",
      render: (r) => (
        <Badge variant="secondary" className="text-[10px]">
          {r.category}
        </Badge>
      ),
    },
    {
      key: "desc",
      header: "Description",
      sortable: true,
      sortValue: (r) => r.description,
      render: (r) => (
        <span className="text-[13px] font-medium">{r.description}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      sortValue: (r) => r.amount_paisa,
      render: (r) => (
        <span className="text-[13px] font-medium">{r.amount}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.date}</span>
      ),
    },
  ];

  const staffColumns: DataTableOneColumn<(typeof staffData)[0]>[] = [
    {
      key: "staff",
      header: "Staff ID",
      render: (r) => (
        <span className="text-[13px] font-mono">{r.staff_id}</span>
      ),
    },
    {
      key: "period",
      header: "Period",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.period}</span>
      ),
    },
    {
      key: "days",
      header: "Days",
      render: (r) => <span className="text-[13px]">{r.days}</span>,
    },
    {
      key: "net",
      header: "Net Payable",
      sortable: true,
      sortValue: (r) => r.net_paisa,
      render: (r) => <span className="text-[13px] font-medium">{r.net}</span>,
    },
  ];

  const totalRevenue = salesData.reduce((s, d) => s + d.total_paisa, 0);
  const totalExpenses = financialData.reduce((s, d) => s + d.amount_paisa, 0);

  const getExportRows = async () => {
    switch (tab) {
      case "sales":
        return salesData.map((d) => [
          d.order_number,
          d.status,
          d.total,
          d.payment,
          d.date,
        ]);
      case "inventory":
        return inventoryData.map((d) => [
          d.product,
          d.variant,
          d.sku,
          String(d.stock),
          String(d.reorder),
          d.status,
        ]);
      case "production":
        return productionData.map((d) => [
          d.order_number,
          d.recipe,
          d.status,
          String(d.planned),
          String(d.actual),
          d.date,
        ]);
      case "procurement":
        return procurementData.map((d) => [
          d.po_number,
          d.supplier,
          d.status,
          d.total,
          d.date,
        ]);
      case "financial":
        return financialData.map((d) => [
          d.category,
          d.description,
          d.amount,
          d.date,
        ]);
      case "staff":
        return staffData.map((d) => [
          d.staff_id,
          d.period,
          String(d.days),
          d.net,
        ]);
      default:
        return [];
    }
  };

  const getExportHeaders = () => {
    switch (tab) {
      case "sales":
        return ["Order #", "Status", "Total", "Payment", "Date"];
      case "inventory":
        return ["Product", "Variant", "SKU", "Stock", "Reorder", "Status"];
      case "production":
        return ["Order", "Recipe", "Status", "Planned", "Actual", "Date"];
      case "procurement":
        return ["PO #", "Supplier", "Status", "Total", "Date"];
      case "financial":
        return ["Category", "Description", "Amount", "Date"];
      case "staff":
        return ["Staff ID", "Period", "Days", "Net Payable"];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive reports with filtering, sorting, and export
          </p>
        </div>
        <PermissionGuard
          permission={{ module: Module.REPORTS_SALES, action: Action.EXPORT }}
        >
          <ExportButton
            onExportCSV={getExportRows}
            headers={getExportHeaders()}
            fileName={`${tab}_report`}
          />
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-bold text-foreground">
            {formatINR(totalRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Total Orders</p>
          <p className="text-lg font-bold text-foreground">
            {rawSales.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Total Expenses</p>
          <p className="text-lg font-bold text-foreground">
            {formatINR(totalExpenses)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted-foreground">Net Profit</p>
          <p className="text-lg font-bold text-success">
            {formatINR(totalRevenue - totalExpenses)}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="From date"
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={dateTo}
            onChange={setDateTo}
            placeholder="To date"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setStatusFilter("all");
          setSearch("");
        }}
      >
        <TabsList>
          <TabsTrigger value="sales" className="text-xs gap-1">
            <ShoppingCart className="h-3.5 w-3.5 hidden sm:block" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs gap-1">
            <Package className="h-3.5 w-3.5 hidden sm:block" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="production" className="text-xs gap-1">
            <BarChart3 className="h-3.5 w-3.5 hidden sm:block" />
            Production
          </TabsTrigger>
          <TabsTrigger value="procurement" className="text-xs gap-1">
            <TrendingUp className="h-3.5 w-3.5 hidden sm:block" />
            Procurement
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs gap-1">
            <IndianRupee className="h-3.5 w-3.5 hidden sm:block" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs gap-1">
            <Users className="h-3.5 w-3.5 hidden sm:block" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <DataTableOne
            columns={salesColumns}
            data={salesData}
            keyExtractor={(r) => r.id}
            emptyMessage="No sales data"
          />
        </TabsContent>
        <TabsContent value="inventory" className="mt-4">
          <DataTableOne
            columns={inventoryColumns}
            data={inventoryData}
            keyExtractor={(r) => r.id}
            emptyMessage="No inventory data"
          />
        </TabsContent>
        <TabsContent value="production" className="mt-4">
          <DataTableOne
            columns={productionColumns}
            data={productionData}
            keyExtractor={(r) => r.id}
            emptyMessage="No production data"
          />
        </TabsContent>
        <TabsContent value="procurement" className="mt-4">
          <DataTableOne
            columns={procurementColumns}
            data={procurementData}
            keyExtractor={(r) => r.id}
            emptyMessage="No procurement data"
          />
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <DataTableOne
            columns={financialColumns}
            data={financialData}
            keyExtractor={(r) => r.id}
            emptyMessage="No expense data"
          />
        </TabsContent>
        <TabsContent value="staff" className="mt-4">
          <DataTableOne
            columns={staffColumns}
            data={staffData}
            keyExtractor={(r) => r.id}
            emptyMessage="No salary data"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
