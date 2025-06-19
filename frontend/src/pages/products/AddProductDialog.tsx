"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Checkbox } from "@radix-ui/react-checkbox";

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  credit_price: number;
  stock: number;
  images: string;
  specs: string;
  is_active: boolean;
};

export function ProductFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ProductForm>();
  const [open, setOpen] = useState(false);

  const isActive = watch("is_active");

  const onSubmit = (data: ProductForm) => {
    // Tách chuỗi thành mảng
    const product = {
      ...data,
      images: data.images.split(",").map((url) => url.trim()),
      specs: data.specs.split("\n").map((line) => line.trim()),
      created_at: new Date().toISOString(),
      id: `PRD_${Date.now()}`, // Hoặc uuid
      is_deleted: false,
    };

    console.log("🆕 Product submitted:", product);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {[
            { id: "name", label: "Tên sản phẩm" },
            { id: "slug", label: "Slug (viết không dấu, dấu -)-- Tự tạo" },
            { id: "category", label: "Danh mục" },
            { id: "brand", label: "Thương hiệu" },
            { id: "price", label: "Giá bán", type: "number" },
            { id: "credit_price", label: "Giá bán trả góp", type: "number" },
            { id: "stock", label: "Tồn kho", type: "number" },
          ].map(({ id, label, type }) => (
            <div key={id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={id} className="text-right">
                {label}
              </Label>
              <Input
                id={id}
                type={type || "text"}
                {...register(id as keyof ProductForm)}
                className="col-span-3"
              />
            </div>
          ))}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Mô tả
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="images" className="text-right">
              Ảnh sản phẩm (ngăn cách bởi dấu phẩy)
            </Label>
            <Textarea
              id="images"
              {...register("images")}
              className="col-span-3"
              placeholder="https://...jpg, https://...jpg"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="specs" className="text-right">
              Thông số (1 dòng 1 dòng)
            </Label>
            <Textarea
              id="specs"
              {...register("specs")}
              className="col-span-3"
              placeholder="Công suất: 600W\nTrọng lượng: 2kg"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              Đang hoạt động
            </Label>
            <Checkbox />
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(val) => setValue("is_active", val)}
            />
          </div>

          <DialogFooter>
            <Button type="submit">Lưu sản phẩm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
