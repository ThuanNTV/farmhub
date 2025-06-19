"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewProductDialog } from "@/pages/products/ViewProductDialog";

export type Products = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  credit_price: number;
  stock: number;
  images: string[];
  specs: string[];
  created_at: string;
  is_active: boolean;
  is_deleted: boolean;
};

export const columns: ColumnDef<Products>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name products
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  // {
  //   accessorKey: "slug",
  //   header: "slug",
  // },
  // {
  //   accessorKey: "description",
  //   header: "description",
  // },
  {
    accessorKey: "category",
    header: "category",
  },
  {
    accessorKey: "brand",
    header: "brand",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          className="ml-auto text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);

      return (
        <div className="text-center font-medium text-green-600">
          {formatted}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "credit_price",
    header: () => <div className="text-center">Credit Price</div>,
    cell: ({ row }) => {
      const credit_price = parseFloat(row.getValue("credit_price"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(credit_price);

      return (
        <div className="text-center font-medium text-green-600">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-center">Stock</div>,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;

      return (
        <div className="text-center">
          {stock < 5 ? (
            <span className=" text-red-600 font-bold text-lg">{stock}</span>
          ) : (
            <span className="text-green-600">{stock}</span>
          )}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "images",
  //   header: "images",
  // },
  // {
  //   accessorKey: "specs",
  //   header: "specs",
  // },
  {
    accessorKey: "created_at",
    header: () => <div className="text-right">Created day</div>,
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;

      const formattedDate = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        // hour: "2-digit",
        // minute: "2-digit",
        // hour12: false,
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
  // {
  //   accessorKey: "is_deleted",
  //   header: "is_deleted",
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy Products ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ViewProductDialog
                productId={product.id}
                trigger={
                  <div className="w-full text-left cursor-pointer">
                    View product details
                  </div>
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem>...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
