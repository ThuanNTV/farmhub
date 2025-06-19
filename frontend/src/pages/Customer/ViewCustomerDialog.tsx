import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getData } from "./data"; // Giả sử bạn có hàm này để lấy dữ liệu
import type { Customers } from "@/pages/Customer/columns";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ViewCustomerDialogProps {
  CustomerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCustomerDialog({
  CustomerId,
  open,
  onOpenChange,
}: ViewCustomerDialogProps) {
  const [data, setData] = useState<Customers[]>([]);
  const [loading, setLoading] = useState(true);
  const [Customer, setCustomer] = useState<Customers | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getData();
        const filteredData = res.filter((item) => !item.is_deleted);
        setData(filteredData);
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (CustomerId && data.length > 0) {
      const found = data.find((item) => item.id === CustomerId) || null;
      setCustomer(found);
    }
  }, [CustomerId, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {loading
              ? "Đang tải..."
              : Customer?.name || "Không tìm thấy khách hàng"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            Đang tải thông tin khách hàng...
          </div>
        ) : Customer ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">
                  Số điện thoại:
                </p>
                <p>{Customer.phone}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Tiền nợ:</p>
                <p className="text-lg font-semibold text-primary">
                  {Customer.total_debt.toLocaleString("vi-VN")} VND
                </p>
              </div>
            </div>

            <div>
              <p className="font-medium text-muted-foreground">Ghi chú:</p>
              <p className="text-sm">{Customer.note || "-"}</p>
            </div>

            <div>
              <p className="font-medium text-muted-foreground">
                Ngày tạo khách hàng:
              </p>
              <p className="text-sm">
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  timeZone: "Asia/Ho_Chi_Minh",
                }).format(new Date(Customer.created_at))}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8 text-muted-foreground">
            Không tìm thấy thông tin khách hàng
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
