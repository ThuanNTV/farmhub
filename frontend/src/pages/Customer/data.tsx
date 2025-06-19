import type { Customers } from "./columns";

export async function getData(): Promise<Customers[]> {
  // Fetch data from your API here.
  return [
    {
      id: "CUS001",
      name: "Nguyễn Văn A",
      phone: "0987654321",
      address: "Thôn 3, Xã Phú Lộc, Huyện Đức Huệ, Long An",
      note: "Khách mua nợ nhiều lần, đáng tin cậy",
      total_debt: 1250000,
      created_at: "2024-09-12T09:00:00Z",
      is_deleted: false,
    },
    {
      id: "CUS002",
      name: "Trần Thị B",
      phone: "0912345678",
      address: "Ấp 4, Xã Mỹ Quý Tây, Huyện Đức Huệ",
      note: "Đã trả hết nợ kỳ trước",
      total_debt: 0,
      created_at: "2024-11-25T14:30:00Z",
      is_deleted: false,
    },
    {
      id: "CUS003",
      name: "Lê Văn C",
      phone: "0901234567",
      address: "Số 10, Đường 3/2, Thị trấn Đông Thành",
      note: "Cần nhắc nhở trước hạn thanh toán",
      total_debt: 3800000,
      created_at: "2025-02-01T08:15:00Z",
      is_deleted: false,
    },
    {
      id: "CUS004",
      name: "Phạm Thị D",
      phone: "0922334455",
      address: "Ấp 7, Xã Mỹ Thạnh Bắc",
      note: "Khách quen mua vật tư trồng rau",
      total_debt: 215000,
      created_at: "2025-03-18T11:45:00Z",
      is_deleted: false,
    },
    {
      id: "CUS005",
      name: "Võ Minh E",
      phone: "0933445566",
      address: "Số 5, Ấp Chánh, Xã Mỹ Bình",
      note: "",
      total_debt: 520000,
      created_at: "2025-05-10T16:00:00Z",
      is_deleted: false,
    },
  ];
}
