"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ViewCustomerDialog } from "@/pages/Customer/ViewCustomerDialog";
import { EditCustomerDialog } from "@/pages/Customer/EditCustomerDialog";
import { useState } from "react";

export type Customers = {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string;
  total_debt: number;
  created_at: string;
  is_deleted: boolean;
};

// Hàm xử lý xóa khách hàng
const handleDeleteCustomer = async (
  customerId: string,
  customerName: string
) => {
  try {
    // TODO: Thay thế bằng API call thực tế
    const response = await fetch(`/api/customers/${customerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete customer");
    }
    toast(`Xóa thành công: Khách hàng "${customerName}" đã được xóa.`);

    // TODO: Refresh data hoặc remove từ state
    // window.location.reload(); // Tạm thời reload page
  } catch (error) {
    console.error("Error deleting customer:", error);
    toast(`Lỗi: Không thể xóa khách hàng "${customerName}". Vui lòng thử lại.`);
  }
};

// Hàm copy ID
const handleCopyId = (customerName: string, customerId: string) => {
  navigator.clipboard.writeText(customerId);
  toast(`Đã sao chép ID khách hàng: ${customerName}`);
};

// Component Actions để tránh re-render
// eslint-disable-next-line react-refresh/only-export-components
function CustomerActions({ customer }: { customer: Customers }) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleCopyId(customer.name, customer.id)}
            className="cursor-pointer"
          >
            <Copy className="mr-2 h-4 w-4" />
            Sao chép ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setViewDialogOpen(true)}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setEditDialogOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <ViewCustomerDialog
        CustomerId={customer.id}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Dialog */}
      <EditCustomerDialog
        customer={customer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng "
              <strong>{customer.name}</strong>" không? Hành động này không thể
              hoàn tác.
              {customer.total_debt > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Khách hàng này còn nợ{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(customer.total_debt)}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-white hover:bg-muted/80">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const columns: ColumnDef<Customers>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Tên khách hàng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return <div className="font-mono text-sm">{phone}</div>;
    },
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return (
        <div className="max-w-[200px] truncate" title={address}>
          {address}
        </div>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Ghi chú",
    cell: ({ row }) => {
      const note = row.getValue("note") as string;
      return note ? (
        <div
          className="max-w-[150px] truncate text-muted-foreground text-sm"
          title={note}
        >
          {note}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "total_debt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="ml-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tổng nợ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const debt = parseFloat(row.getValue("total_debt"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(debt);

      return (
        <div
          className={`text-right font-medium ${
            debt > 0
              ? "text-red-600"
              : debt < 0
              ? "text-green-600"
              : "text-muted-foreground"
          }`}
        >
          {formatted}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-right">Ngày tạo</div>,
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;

      const formattedDate = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(createdAt));

      return (
        <div className="text-right text-sm text-muted-foreground">
          {formattedDate}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return <CustomerActions customer={customer} />;
    },
  },
];
