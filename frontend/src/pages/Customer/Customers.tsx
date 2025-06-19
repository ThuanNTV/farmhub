import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerFormDialog } from "@/pages/Customer/AddCustomerDialog";
import { DataTable } from "@/components/data-table";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { getData } from "./data"; // Giả sử bạn có hàm này để lấy dữ liệu
import type { Customers } from "@/pages/Customer/columns";
import { columns } from "./columns";

export default function Customers() {
  const [data, setData] = useState<Customers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getData(); // 👈 giả sử bạn có hàm fetch dữ liệu
      if (!res || res.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }
      // Kiểm tra xem dữ liệu có đúng định dạng không
      for (const item of res) {
        if (item["is_deleted"] == true) {
          // Loại bỏ sản phẩm đã bị xóa
          res.splice(res.indexOf(item), 1);
          continue; // Bỏ qua sản phẩm đã bị xóa
        }
      }
      setData(res);
      setLoading(false);
    };

    fetchData();
  }, []);
  return (
    <Card className="p-2 h-full">
      <CardContent className="text-muted-foreground h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Customer</h2>
          <Separator aria-orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center space-x-2">
            {/* Thêm các nút hoặc chức năng khác nếu cần */}
            <CustomerFormDialog
              trigger={<Button variant="default">+ Add customer</Button>}
            />
            {/* Nút thêm khách hàng */}
            {/* Bạn có thể thêm các nút khác như Import, Export, v.v. */}
            <Button variant="outline">Import</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="container mx-auto py-1 h-full">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={data} type="customer" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
