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
import { useState } from "react";
import { DialogDescription } from "@radix-ui/react-dialog";

type CustomerForm = {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string;
  total_debt: number;
  created_at: string;
  is_deleted: boolean;
};

export function CustomerFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const { register, handleSubmit, reset, setValue } = useForm<CustomerForm>();
  const [open, setOpen] = useState(false);

  const onSubmit = (data: CustomerForm) => {
    // Tách chuỗi thành mảng
    const Customer = {
      ...data,
      created_at: new Date().toISOString(),
      id: `PRD_${Date.now()}`, // Hoặc uuid
      is_deleted: false,
    };

    console.log("🆕 Customer submitted:", Customer);
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
            { id: "name", label: "Tên khách hàng" },
            { id: "phone", label: "Số điện thoại" },
            { id: "address", label: "Địa chỉ" },
            { id: "total_debt", label: "Số tiền nợ", type: "number" },
          ].map(({ id, label, type }) => (
            <div key={id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={id} className="text-right">
                {label}
              </Label>
              <Input
                id={id}
                type={type || "text"}
                {...register(id as keyof CustomerForm)}
                className="col-span-3"
              />
            </div>
          ))}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Ghi chú
            </Label>
            <Textarea
              id="description"
              {...register("note")}
              className="col-span-3"
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
