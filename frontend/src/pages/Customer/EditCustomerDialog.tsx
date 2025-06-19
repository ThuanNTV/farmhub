import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Customers } from "./columns";

interface EditCustomerDialogProps {
  customer: Customers;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
}: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  // Reset form khi dialog mở
  useEffect(() => {
    if (open && customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        note: customer.note,
      });
    }
  }, [open, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Thay thế bằng API call thực tế
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      toast(
        `Cập nhật thành công: Thông tin khách hàng "${formData.name}" đã được cập nhật.`
      );

      onOpenChange(false);

      // TODO: Refresh data hoặc update state
      // window.location.reload(); // Tạm thời reload page
    } catch (error) {
      console.error("Error updating customer:", error);
      toast(`Lỗi: Không thể cập nhật thông tin khách hàng. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên khách hàng *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="Nhập tên khách hàng"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={handleInputChange("address")}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={handleInputChange("note")}
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="default"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
