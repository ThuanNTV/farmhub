import * as fs from 'fs';
import * as path from 'path';

const CHECKLIST_PATH = path.join(
  __dirname,
  '../backend/checklist/ALL_CHECKLISTS.md',
);
const ENTITY_DIRS = [
  path.join(__dirname, '../src/entities/tenant'),
  path.join(__dirname, '../src/entities/global'),
];
const SERVICE_DIR = path.join(__dirname, '../src/service');

function getEntities(): string[] {
  return ENTITY_DIRS.flatMap((dir) =>
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => f.endsWith('.ts'))
          .map((f) => f.replace('.entity.ts', '').replace('.ts', ''))
      : [],
  );
}

function getServices(): string[] {
  return fs.existsSync(SERVICE_DIR)
    ? fs
        .readdirSync(SERVICE_DIR)
        .filter((f) => f.endsWith('.service.ts'))
        .map((f) => f.replace('.service.ts', ''))
    : [];
}

function readChecklist(): string {
  return fs.existsSync(CHECKLIST_PATH)
    ? fs.readFileSync(CHECKLIST_PATH, 'utf8')
    : '';
}

function writeChecklist(content: string) {
  fs.writeFileSync(CHECKLIST_PATH, content, 'utf8');
}

function extractChecklistSections(
  content: string,
): { title: string; body: string }[] {
  // Tách từng checklist theo heading '# Checklist TODO:'
  const sections = content.split(/\n# Checklist TODO:/g);
  return sections
    .map((sec, i) => {
      if (i === 0 && !sec.trim().startsWith('Checklist'))
        return { title: '', body: sec };
      const lines = sec.split('\n');
      const title = lines[0]
        .replace(/\(.+\)/, '')
        .replace(/Entity /, '')
        .trim();
      return { title, body: lines.slice(1).join('\n') };
    })
    .filter((s) => s.title || s.body.trim());
}

function extractTodoSection(content: string): string {
  const match = content.match(/## TODO mới phát hiện(.|\n)+/);
  return match ? match[0] : '';
}

function optimizeChecklist() {
  const entities = getEntities();
  const services = getServices();
  const checklistRaw = readChecklist();
  const sections = extractChecklistSections(checklistRaw);
  const todoSection = extractTodoSection(checklistRaw);

  // Giữ lại checklist cho entity/service thực tế
  const keepSections = sections.filter((sec) => {
    const name = sec.title.toLowerCase();
    return (
      entities.some((e) => name.includes(e.toLowerCase())) ||
      services.some((s) => name.includes(s.toLowerCase())) ||
      name.includes('todo') // giữ lại mục TODO thực tế
    );
  });

  // Gộp checklist lặp lại (ưu tiên checklist dài nhất)
  const uniqueSections: { [key: string]: { title: string; body: string } } = {};
  for (const sec of keepSections) {
    const key = sec.title.toLowerCase();
    if (
      !uniqueSections[key] ||
      sec.body.length > uniqueSections[key].body.length
    ) {
      uniqueSections[key] = sec;
    }
  }

  // Bổ sung checklist còn thiếu cho entity/service thực tế
  for (const e of entities) {
    if (!Object.keys(uniqueSections).some((k) => k.includes(e.toLowerCase()))) {
      uniqueSections[e] = {
        title: e,
        body: `- [ ] Checklist mẫu cho entity ${e}\n  - Bổ sung validate, migration, quyền, API, ...`,
      };
    }
  }
  for (const s of services) {
    if (!Object.keys(uniqueSections).some((k) => k.includes(s.toLowerCase()))) {
      uniqueSections[s] = {
        title: s,
        body: `- [ ] Checklist mẫu cho service ${s}\n  - Kết nối DB, CRUD, validate, test, ...`,
      };
    }
  }

  // Xuất lại checklist tối ưu
  let result = '';
  for (const sec of Object.values(uniqueSections)) {
    result += `# Checklist TODO: ${sec.title}\n\n${sec.body}\n\n`;
  }
  if (todoSection) result += todoSection + '\n';
  writeChecklist(result);
  console.log('Đã tối ưu checklist tổng hợp!');
}

optimizeChecklist();
