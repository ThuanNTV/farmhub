import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { categoriesFormDialog } from "@/pages/categories/AddcategoriesDialog";
import { DataTable } from "@/components/data-table";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { getData } from "./data"; // Giả sử bạn có hàm này để lấy dữ liệu
import type { Categories } from "@/pages/Categories/columns";
import { columns } from "@/pages/Categories/columns";

export default function Categories() {
  const [data, setData] = useState<Categories[]>([]);
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
          <h2 className="text-lg font-semibold">categories</h2>
          <Separator aria-orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center space-x-2">
            {/* Thêm các nút hoặc chức năng khác nếu cần */}
            {/* <categoriesFormDialog
              trigger={<Button variant="default">+ Add categories</Button>}
            /> */}
            {/* Nút thêm khách hàng */}
            {/* Bạn có thể thêm các nút khác như Import, Export, v.v. */}
            <Button variant="outline">Import</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="container mx-auto py-1 ">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={data} type="categories" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
