import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { columns } from "./columns";
import type { Products } from "./columns";
import { DataTable } from "../../components/data-table";
import { getData } from "./data"; // Giả sử bạn có hàm này để lấy dữ liệu
import { ProductFormDialog } from "@/pages/products/AddProductDialog";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [data, setData] = useState<Products[]>([]);
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
    <Card className="p-2">
      <CardContent className="text-muted-foreground">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center space-x-2">
            {/* Thêm các nút hoặc chức năng khác nếu cần */}
            <ProductFormDialog
              trigger={<Button variant="default">+ Add Product</Button>}
            />
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="container mx-auto py-1 ">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={data} type="product" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
