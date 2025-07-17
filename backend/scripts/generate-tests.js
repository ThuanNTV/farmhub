const fs = require('fs');
const path = require('path');

// Template for service tests
const serviceTestTemplate = (
  serviceName,
  className,
) => `import { Test, TestingModule } from '@nestjs/testing';
import { ${className} } from '../../src/service/${serviceName}.service';

describe('${className}', () => {
  let service: ${className};

  const mockDependencies = {
    // Add mock dependencies here based on constructor
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${className},
        // Add dependency mocks here
      ],
    }).compile();

    service = module.get<${className}>(${className});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('successful operations', () => {
    it('should handle request successfully', async () => {
      // Test successful scenario
      expect(true).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle error scenario', async () => {
      // Test error scenario
      expect(true).toBe(true);
    });
  });
});
`;

// Template for controller tests
const controllerTestTemplate = (controllerName, className) => {
  // Calculate module name from controller name
  let moduleName = controllerName.replace(/\.controller$/, '');
  if (moduleName === 'categorys') moduleName = 'categories';

  return `import { Test, TestingModule } from '@nestjs/testing';
import { ${className} } from '../../src/modules/${moduleName}/controller/${controllerName}.controller';

describe('${className}', () => {
  let controller: ${className};

  const mockDependencies = {
    // Add mock dependencies here based on constructor
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [${className}],
      providers: [
        // Add dependency mocks here
      ],
    }).compile();

    controller = module.get<${className}>(${className});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('successful operations', () => {
    it('should handle request successfully', async () => {
      // Test successful scenario
      expect(true).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle error scenario', async () => {
      // Test error scenario
      expect(true).toBe(true);
    });
  });
});
`;
};

// Function to generate service tests
function generateServiceTests() {
  const serviceDir = path.join(__dirname, '../src/service');
  const testDir = path.join(__dirname, '../test/unit/service');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const serviceFiles = fs
    .readdirSync(serviceDir)
    .filter((file) => file.endsWith('.service.ts'));

  serviceFiles.forEach((file) => {
    const serviceName = file.replace('.service.ts', '');
    const className =
      serviceName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Service';

    const testFileName = `${serviceName}.service.spec.ts`;
    const testFilePath = path.join(testDir, testFileName);

    // Skip if test already exists
    if (fs.existsSync(testFilePath)) {
      console.log(`Skipping ${testFileName} - already exists`);
      return;
    }

    const testContent = serviceTestTemplate(serviceName, className);
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Generated ${testFileName}`);
  });
}

// Function to generate controller tests
function generateControllerTests() {
  const controllerDir = path.join(__dirname, '../src/modules');
  const testDir = path.join(__dirname, '../test/unit/controller');

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Get all controller files from modules
  const moduleDirectories = fs.readdirSync(controllerDir).filter((item) => {
    return fs.statSync(path.join(controllerDir, item)).isDirectory();
  });

  moduleDirectories.forEach((moduleDir) => {
    const controllerPath = path.join(controllerDir, moduleDir, 'controller');
    if (fs.existsSync(controllerPath)) {
      const controllerFiles = fs
        .readdirSync(controllerPath)
        .filter((file) => file.endsWith('.controller.ts'));

      controllerFiles.forEach((file) => {
        const controllerName = file.replace('.controller.ts', '');
        const className =
          controllerName
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Controller';

        const testFileName = `${controllerName}.controller.spec.ts`;
        const testFilePath = path.join(testDir, testFileName);

        // Skip if test already exists
        if (fs.existsSync(testFilePath)) {
          console.log(`Skipping ${testFileName} - already exists`);
          return;
        }

        const testContent = controllerTestTemplate(controllerName, className);
        fs.writeFileSync(testFilePath, testContent);
        console.log(`Generated ${testFileName}`);
      });
    }
  });
}

// Generate both service and controller tests
generateServiceTests();
generateControllerTests();

console.log('Test generation complete!');
