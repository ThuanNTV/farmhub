# Testing Guide for FarmHub Backend

This document provides comprehensive guidance for testing the FarmHub NestJS backend application.

## 🏗️ Test Structure

```
test/
├── config/                    # Jest configuration files
│   ├── jest-unit.config.ts    # Unit test configuration
│   ├── jest-integration.config.ts # Integration test configuration
│   └── jest-e2e.config.ts     # E2E test configuration
├── unit/                      # Unit tests
│   ├── controller/            # Controller tests
│   │   ├── users.controller.spec.ts
│   │   ├── orders.controller.spec.ts
│   │   ├── products.controller.spec.ts
│   │   └── auth.controller.spec.ts
│   └── service/               # Service tests
│       ├── users.service.spec.ts
│       ├── orders.service.spec.ts
│       ├── products.service.spec.ts
│       └── auth.service.spec.ts
├── integration/               # Integration tests
│   ├── auth/
│   │   └── auth.integration.spec.ts
│   └── orders/
│       └── orders.integration.spec.ts
├── e2e/                       # End-to-end tests
│   └── app.e2e-spec.ts
├── setup.ts                   # Global test setup
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Environment variables** configured

### Installation

```bash
# Install dependencies
npm install

# Set up test environment
cp .env.example .env.test
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- users.controller.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

## 📋 Test Types

### 1. Unit Tests (`test/unit/`)

**Purpose**: Test individual functions, methods, and classes in isolation.

**Characteristics**:
- Fast execution (< 100ms per test)
- No external dependencies
- Mocked repositories and services
- Test business logic only

**Example Structure**:
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: Repository<User>;

  beforeEach(async () => {
    // Setup mocks
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Tests (`test/integration/`)

**Purpose**: Test the interaction between multiple components.

**Characteristics**:
- Real database connections
- HTTP requests using Supertest
- Test complete workflows
- Moderate execution time (1-5s per test)

**Example Structure**:
```typescript
describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup test application
  });

  it('should login and access protected route', async () => {
    // Test complete flow
  });
});
```

### 3. E2E Tests (`test/e2e/`)

**Purpose**: Test the entire application from end to end.

**Characteristics**:
- Full application lifecycle
- Real database and external services
- Complete user workflows
- Slower execution (5-30s per test)

## 🛠️ Testing Patterns

### Controller Testing

```typescript
describe('UsersController', () => {
  let controller: UsersController;
  let mockService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createDto = { /* ... */ };
      const expectedResult = { /* ... */ };
      mockService.createUser.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockService.createUser).toHaveBeenCalledWith(createDto);
    });
  });
});
```

### Service Testing

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User, 'globalConnection'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      // Test implementation
    });
  });
});
```

### Integration Testing

```typescript
describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should authenticate user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
  });
});
```

## 🎯 Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user flows only

### Coverage Report

```bash
# Generate coverage report
npm run test:cov

# View coverage in browser
open coverage/index.html
```

## 🔧 Configuration

### Jest Configuration

The application uses separate Jest configurations for different test types:

1. **Unit Tests** (`jest-unit.config.ts`):
   - Fast execution
   - Mocked dependencies
   - No database connections

2. **Integration Tests** (`jest-integration.config.ts`):
   - Real database connections
   - HTTP testing
   - Moderate timeouts

3. **E2E Tests** (`jest-e2e.config.ts`):
   - Full application testing
   - Extended timeouts
   - Real external services

### Environment Variables

Create `.env.test` for test-specific configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_DATABASE=farmhub_test

# JWT
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h

# App
NODE_ENV=test
PORT=3001
```

## 🧪 Test Utilities

### Global Test Utils

The `setup.ts` file provides global test utilities:

```typescript
// Create mock data
const mockUser = testUtils.createMockUser();
const mockOrder = testUtils.createMockOrder();
const mockProduct = testUtils.createMockProduct();

// Create mock repository
const mockRepo = testUtils.createMockRepository();
```

### Custom Matchers

```typescript
// JWT validation
expect(token).toBeValidJWT();

// UUID validation
expect(id).toBeValidUUID();
```

## 📝 Best Practices

### 1. Test Organization

- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking

- Mock external dependencies
- Use `jest.fn()` for function mocks
- Reset mocks between tests

### 3. Database Testing

- Use test database
- Clean up data after tests
- Use transactions for rollback

### 4. Error Testing

- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

### 5. Performance

- Keep unit tests fast (< 100ms)
- Use appropriate timeouts
- Mock heavy operations

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug
```

### Verbose Output

```bash
# Run with verbose output
npm test -- --verbose
```

### Single Test

```bash
# Run single test
npm test -- --testNamePattern="should create user"
```

## 📊 Test Reports

### Coverage Report

```bash
# Generate HTML coverage report
npm run test:cov

# Coverage will be available at:
# coverage/index.html
```

### Test Results

```bash
# Generate JUnit XML report
npm test -- --reporter=junit --outputDirectory=test-results
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test:cov"
    }
  }
}
```

## 🚨 Common Issues

### 1. Database Connection Issues

**Problem**: Tests fail due to database connection errors.

**Solution**: 
- Ensure test database is running
- Check environment variables
- Use proper database cleanup

### 2. Mock Issues

**Problem**: Mocks not working as expected.

**Solution**:
- Reset mocks in `afterEach`
- Use proper mock implementations
- Check import paths

### 3. Timeout Issues

**Problem**: Tests timing out.

**Solution**:
- Increase timeout for integration tests
- Mock heavy operations
- Use proper async/await

### 4. Coverage Issues

**Problem**: Low test coverage.

**Solution**:
- Add tests for uncovered code
- Use coverage reports to identify gaps
- Focus on critical business logic

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeORM Testing](https://typeorm.io/testing)

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns
2. Maintain high coverage
3. Use descriptive test names
4. Add integration tests for new endpoints
5. Update this documentation if needed

---

**Happy Testing! 🧪✨** 