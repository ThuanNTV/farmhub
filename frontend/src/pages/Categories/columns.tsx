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
// import { ViewCategoriesDialog } from "@/pages/Categories/ViewCategoriesDialog";
// import { EditCategoriesDialog } from "@/pages/Categories/EditCategoriesDialog";
import { useState } from "react";

export type Categories = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

// Hàm xử lý xóa khách hàng
const handleDeleteCategories = async (
  CategoriesId: string,
  CategoriesName: string
) => {
  try {
    // TODO: Thay thế bằng API call thực tế
    const response = await fetch(`/api/Categories/${CategoriesId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete Categories");
    }
    toast(`Xóa thành công: Khách hàng "${CategoriesName}" đã được xóa.`);

    // TODO: Refresh data hoặc remove từ state
    // window.location.reload(); // Tạm thời reload page
  } catch (error) {
    console.error("Error deleting Categories:", error);
    toast(
      `Lỗi: Không thể xóa khách hàng "${CategoriesName}". Vui lòng thử lại.`
    );
  }
};

// Hàm copy ID
const handleCopyId = (CategoriesName: string, CategoriesId: string) => {
  navigator.clipboard.writeText(CategoriesId);
  toast(`Đã sao chép ID khách hàng: ${CategoriesName}`);
};

// Component Actions để tránh re-render
// eslint-disable-next-line react-refresh/only-export-components
function CategoriesActions({ Categories }: { Categories: Categories }) {
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
            onClick={() => handleCopyId(Categories.name, Categories.id)}
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
      {/* <ViewCategoriesDialog
        CategoriesId={Categories.id}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      /> */}

      {/* Edit Dialog */}
      {/* <EditCategoriesDialog
        Categories={Categories}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      /> */}

      {/* Delete Confirmation Dialog */}
      {/* <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng "
              <strong>{Categories.name}</strong>" không? Hành động này không thể
              hoàn tác.
              {Categories.total_debt > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Khách hàng này còn nợ{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(Categories.total_debt)}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-white hover:bg-muted/80">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCategories(Categories.id, Categories.name)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
}

export const columns: ColumnDef<Categories>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-white flex items-center space-x-2"
        >
          Tên loại sản phẩm
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
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => {
      const note = row.getValue("description") as string;
      return note ? (
        <div
          className="max-w-[700px] truncate text-muted-foreground text-sm"
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
    accessorKey: "is_active",
    header: () => <div className="text-right">Active?</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;

      return (
        <div className="text-right">
          {isActive ? (
            <span className="text-green-600">Active</span>
          ) : (
            <span className="text-red-600">Inactive</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const Categories = row.original;
      return <CategoriesActions Categories={Categories} />;
    },
  },
];
