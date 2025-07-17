import * as fs from 'fs';
import * as path from 'path';

const ENTITY_DIRS = [
  path.join(__dirname, '../src/entities/tenant'),
  path.join(__dirname, '../src/entities/global'),
];
const CHECKLIST_DIR = path.join(__dirname, '../backend/checklist');
const CONTROLLER_DIR = path.join(__dirname, '../src/controller');
const SERVICE_DIR = path.join(__dirname, '../src/service');
const DTO_DIR = path.join(__dirname, '../src/dto');

function getNowString() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 16);
}

function toChecklistName(entity: string) {
  return `checklist-${entity}-${getNowString()}.md`;
}

function readIfExists(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function findFileByName(dir: string, name: string): string | undefined {
  const files = fs.readdirSync(dir);
  return files.find((f) => f.toLowerCase().includes(name.toLowerCase()));
}

function analyzeEntity(entityPath: string) {
  const entityName = path.basename(entityPath).replace(/\..*$/, '');
  const entityContent = readIfExists(entityPath);
  // Heuristic: find soft delete, unique, foreign key, etc.
  const checklist: string[] = [];

  // Soft delete
  if (entityContent.match(/is_deleted/)) {
    if (!entityContent.match(/restore|recover/)) {
      checklist.push(
        '- [ ] **Thiếu API khôi phục (restore)**\n  - Có trường is_deleted nhưng chưa thấy logic/API khôi phục.',
      );
    }
  } else {
    checklist.push(
      '- [ ] **Thiếu soft delete (is_deleted)**\n  - Nên bổ sung trường is_deleted để hỗ trợ xóa mềm.',
    );
  }

  // Unique
  if (entityContent.match(/unique: true/)) {
    checklist.push(
      '- [ ] **Kiểm tra validate unique**\n  - Đảm bảo service/controller kiểm tra trùng giá trị unique khi tạo/sửa.',
    );
  }

  // Foreign key
  if (entityContent.match(/ManyToOne|JoinColumn/)) {
    checklist.push(
      '- [ ] **Kiểm tra validate foreign key**\n  - Đảm bảo các trường liên kết (ManyToOne, JoinColumn) được validate tồn tại khi tạo/sửa.',
    );
  }

  // created_by/updated_by
  if (entityContent.match(/created_by_user_id|updated_by_user_id/)) {
    checklist.push(
      '- [ ] **Kiểm tra mapping/validate created_by_user_id, updated_by_user_id**\n  - Đảm bảo mapping và kiểm tra quyền với các trường này.',
    );
  }

  // JSON fields
  if (entityContent.match(/type: 'json'|type: 'text'/)) {
    checklist.push(
      '- [ ] **Kiểm tra validate trường JSON/text**\n  - Nếu lưu JSON string, cần validate khi tạo/sửa.',
    );
  }

  // Migration
  checklist.push(
    '- [ ] **Kiểm tra migration/script chuyển đổi dữ liệu cũ (nếu có)**\n  - Nếu đã có dữ liệu cũ, cần script chuyển đổi sang chuẩn mới (nếu thay đổi logic).',
  );

  // Controller/Service/DTO
  const ctrlFile = findFileByName(CONTROLLER_DIR, entityName);
  const svcFile = findFileByName(SERVICE_DIR, entityName);
  const dtoDir = fs.existsSync(DTO_DIR) ? fs.readdirSync(DTO_DIR) : [];
  const dtoSubDir = dtoDir.find((d) =>
    d.toLowerCase().includes(entityName.toLowerCase()),
  );
  let extra = '';
  if (!ctrlFile) extra += `- [ ] **Thiếu controller cho entity này**\n`;
  if (!svcFile) extra += `- [ ] **Thiếu service cho entity này**\n`;
  if (!dtoSubDir) extra += `- [ ] **Thiếu DTO cho entity này**\n`;
  if (extra) checklist.push(extra);

  return checklist.join('\n');
}

function main() {
  if (!fs.existsSync(CHECKLIST_DIR))
    fs.mkdirSync(CHECKLIST_DIR, { recursive: true });
  for (const dir of ENTITY_DIRS) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
    for (const file of files) {
      const entityPath = path.join(dir, file);
      const entityName = path.basename(file, '.ts');
      const checklist = analyzeEntity(entityPath);
      const checklistFile = path.join(
        CHECKLIST_DIR,
        toChecklistName(entityName),
      );
      const content = `# Checklist TODO: Entity ${entityName}\n\n${checklist}\n\n> Checklist này được tạo tự động lúc ${new Date().toLocaleString('vi-VN')}. Vui lòng cập nhật trạng thái sau khi xử lý từng mục.`;
      fs.writeFileSync(checklistFile, content, 'utf8');
      console.log(`Đã tạo checklist cho entity: ${entityName}`);
    }
  }
}

main();
