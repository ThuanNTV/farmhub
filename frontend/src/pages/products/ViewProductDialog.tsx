import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getData } from "./data"; // Giả sử bạn có hàm này để lấy dữ liệu
import type { Products } from "@/pages/products/columns";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ViewProductDialogProps {
  productId: string;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ViewProductDialog({
  productId,
  trigger,
  onOpenChange,
}: ViewProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Products | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getData();
        if (!res || res.length === 0) {
          setData([]);
          return;
        }

        // Lọc bỏ các sản phẩm đã bị xóa
        const filteredData = res.filter((item) => !item.is_deleted);
        setData(filteredData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tìm sản phẩm theo productId
  useEffect(() => {
    if (productId && data.length > 0) {
      const foundProduct = data.find((item) => item.id === productId) || null;
      setProduct(foundProduct);
    }
  }, [productId, data]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Xem</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {loading
              ? "Đang tải..."
              : product?.name || "Không tìm thấy sản phẩm"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-sm text-muted-foreground">
              Đang tải thông tin sản phẩm...
            </div>
          </div>
        ) : product ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">
                  Thương hiệu:
                </p>
                <p>{product.brand}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Danh mục:</p>
                <p>{product.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">Giá:</p>
                <p className="text-lg font-semibold text-primary">
                  {product.price.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Giá bán trả góp:
                </p>
                <p className="text-lg font-semibold text-primary">
                  {product.credit_price.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Còn trong kho:
                </p>
                <p className="text-lg font-semibold text-primary">
                  {product.stock} sản phẩm
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Có bán không?:
                </p>
                <p className="text-lg font-semibold text-primary">
                  {product.is_active ? "Có" : "Không"}
                </p>
              </div>
            </div>

            <div>
              <p className="font-medium text-muted-foreground">Mô tả:</p>
              <p className="text-sm leading-relaxed">{product.description}</p>
            </div>

            {product.specs && product.specs.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground mb-2">
                  Thông số kỹ thuật:
                </p>
                <ul className="space-y-1 pl-4 list-disc">
                  {product.specs.map((spec, idx) => (
                    <li key={idx} className="text-sm">
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.images && product.images.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground mb-2">
                  Hình ảnh:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${product.name} - hình ${i + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="font-medium text-muted-foreground">
                Được tạo ngày:
              </p>
              <p className="text-sm leading-relaxed">
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  // hour: "2-digit",
                  // minute: "2-digit",
                  // hour12: false,
                  timeZone: "Asia/Ho_Chi_Minh",
                }).format(new Date(product.created_at))}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-sm text-muted-foreground">
              Không tìm thấy thông tin sản phẩm
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            className="text-white"
            onClick={() => handleOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
