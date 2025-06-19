import type { Categories } from "./columns";

export async function getData(): Promise<Categories[]> {
  // Fetch data from your API here.
  return [
    {
      id: "CAT001",
      name: "Máy cưa",
      slug: "may-cua",
      description:
        "Các loại máy cưa phục vụ nông nghiệp, lâm nghiệp và xây dựng.",
      parent_id: null,
      image: "https://example.com/images/cat-may-cua.png",
      is_active: true,
      created_at: "2024-01-10T09:00:00Z",
      updated_at: "2025-06-19T17:52:51Z",
      is_deleted: false,
    },
    {
      id: "CAT002",
      name: "Máy cắt cỏ",
      slug: "may-cat-co",
      description:
        "Đa dạng các loại máy cắt cỏ cầm tay, đẩy tay, chạy xăng, chạy điện.",
      parent_id: null,
      image: "https://example.com/images/cat-may-cat-co.png",
      is_active: true,
      created_at: "2024-01-10T09:05:00Z",
      updated_at: "2025-06-19T17:52:51Z",
      is_deleted: false,
    },
    {
      id: "CAT003",
      name: "Dụng cụ điện",
      slug: "dung-cu-dien",
      description:
        "Các thiết bị điện cầm tay phục vụ công việc xây dựng và sửa chữa.",
      parent_id: null,
      image: "https://example.com/images/cat-dung-cu-dien.png",
      is_active: true,
      created_at: "2024-02-15T11:20:00Z",
      updated_at: "2025-06-19T17:52:51Z",
      is_deleted: false,
    },
    {
      id: "CAT00301",
      name: "Máy khoan",
      slug: "may-khoan",
      description: "Máy khoan cầm tay, khoan búa, khoan bê tông các loại.",
      parent_id: "CAT003",
      image: "https://example.com/images/cat-may-khoan.png",
      is_active: true,
      created_at: "2024-03-01T14:00:00Z",
      updated_at: "2025-06-19T17:52:51Z",
      is_deleted: false,
    },
  ];
}
