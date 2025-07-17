# 🔧 TECHNICAL ISSUES CHECKLIST

## 🚨 **CRITICAL FIXES NEEDED**

### Issue #1: Jest Configuration Inconsistency

**Problem**: Paths và rootDir không nhất quán giữa các config files

- [ ] **Root Cause Analysis**
  - [ ] `jest.config.ts` có `rootDir: '..'`
  - [ ] `jest-unit.config.ts` có `roots: ['<rootDir>/../']`
  - [ ] Module resolution conflicts

- [ ] **Fix Steps**

  ```typescript
  // 1. Tạo jest.base.config.ts
  - [ ] Define base rootDir
  - [ ] Standard moduleNameMapper
  - [ ] Common transform settings

  // 2. Update all configs to extend base
  - [ ] jest.config.ts
  - [ ] jest-unit.config.ts
  - [ ] jest-integration.config.ts
  - [ ] jest-e2e.config.ts
  ```

- [ ] **Validation**
  - [ ] Test module imports work correctly
  - [ ] Coverage reports generate in right directories
  - [ ] No path resolution errors

---

### Issue #2: Environment Variables Confusion

**Problem**: E2E tests sử dụng `.env` thay vì `.env.test`

- [ ] **Files to Fix**
  - [ ] `test/setup/e2e-setup.ts` - Line 5: `config({ path: '.env' })`
  - [ ] Check other setup files for consistency

- [ ] **Fix Steps**

  ```typescript
  // In e2e-setup.ts
  - [ ] Change to: config({ path: '.env.test' })
  - [ ] Ensure .env.test exists
  - [ ] Verify test environment variables
  ```

- [ ] **Validation**
  - [ ] E2E tests use test database
  - [ ] No production data contamination
  - [ ] Environment isolation working

---

### Issue #3: Database Cleanup Race Conditions

**Problem**: Integration tests có thể conflict khi chạy parallel

- [ ] **Root Cause Analysis**
  - [ ] `TestDatabase.clearTables()` không atomic
  - [ ] Shared database instance
  - [ ] No transaction isolation

- [ ] **Fix Steps**

  ```typescript
  // 1. Add transaction support
  - [ ] Wrap each test in transaction
  - [ ] Rollback after each test
  - [ ] Isolate test data

  // 2. Improve cleanup strategy
  - [ ] Better table clearing order
  - [ ] Foreign key handling
  - [ ] Connection management
  ```

- [ ] **Validation**
  - [ ] Tests can run in parallel
  - [ ] No data leakage between tests
  - [ ] Consistent test results

---

### Issue #4: Mock Duplication and Conflicts

**Problem**: Bcrypt và JWT mocks ở nhiều nơi khác nhau

- [ ] **Files with Duplicated Mocks**
  - [ ] `test/setup.ts` - Lines 28-45
  - [ ] `test/unit/service/auth.service.spec.ts` - Lines 14-21
  - [ ] Other test files...

- [ ] **Fix Steps**

  ```typescript
  // 1. Centralize mocks
  - [ ] Create test/setup/mocks/bcrypt.mock.ts
  - [ ] Create test/setup/mocks/jwt.mock.ts
  - [ ] Create test/setup/mocks/index.ts

  // 2. Remove duplicate mocks
  - [ ] Clean up individual test files
  - [ ] Import from centralized location
  - [ ] Ensure consistent behavior
  ```

- [ ] **Validation**
  - [ ] All tests use same mock implementations
  - [ ] No mock conflicts
  - [ ] Consistent test behavior

---

### Issue #5: Coverage Configuration Discrepancies

**Problem**: Different coverage thresholds và collectCoverageFrom patterns

- [ ] **Current Issues**
  - [ ] Unit: 80% threshold
  - [ ] Integration: 70% threshold
  - [ ] Main config: 30% threshold
  - [ ] Different file exclusions

- [ ] **Standardization Steps**

  ```typescript
  // 1. Define standard coverage
  - [ ] Consistent collectCoverageFrom
  - [ ] Reasonable thresholds per test type
  - [ ] Exclude patterns standardization

  // 2. Update all configs
  - [ ] Use base coverage config
  - [ ] Override only what's necessary
  - [ ] Document threshold rationale
  ```

- [ ] **Validation**
  - [ ] Coverage reports consistent
  - [ ] Thresholds achievable
  - [ ] Proper file exclusions

---

## 🔧 **MEDIUM PRIORITY FIXES**

### Issue #6: Incomplete Test Fixtures

- [ ] Only `user.fixture.ts` exists
- [ ] Missing fixtures for core entities
- [ ] No relationship data in fixtures
- [ ] **Solution**: Create comprehensive fixture system

### Issue #7: TestHelpers Incomplete

- [ ] Limited utility functions
- [ ] No data generation helpers
- [ ] Missing assertion helpers
- [ ] **Solution**: Expand TestHelpers class

### Issue #8: No Test Templates

- [ ] Developers reinvent test structure
- [ ] Inconsistent test patterns
- [ ] No standard practices
- [ ] **Solution**: Create test templates

---

## 🔍 **INVESTIGATION NEEDED**

### Issue #9: Test Performance

- [ ] **Investigate**
  - [ ] Current test execution time
  - [ ] Memory usage during tests
  - [ ] Database connection overhead
  - [ ] Mock performance impact

- [ ] **Measure**
  - [ ] Baseline performance metrics
  - [ ] Identify slow tests
  - [ ] Database query analysis
  - [ ] Memory leak detection

### Issue #10: Flaky Tests

- [ ] **Investigate**
  - [ ] Run tests multiple times
  - [ ] Identify non-deterministic behavior
  - [ ] Timing-related issues
  - [ ] Resource cleanup problems

- [ ] **Analyze**
  - [ ] Test failure patterns
  - [ ] Environment dependencies
  - [ ] Async operation handling
  - [ ] External service mocking

---

## 📋 **IMPLEMENTATION ORDER**

### Phase 1: Critical Fixes (Day 1-2)

1. Jest configuration inconsistency
2. Environment variables confusion
3. Mock duplication cleanup

### Phase 2: Database Issues (Day 3-4)

4. Database cleanup race conditions
5. Coverage configuration standardization

### Phase 3: Enhancements (Day 5+)

6. Test fixtures expansion
7. TestHelpers improvement
8. Test templates creation

### Phase 4: Performance (Week 2)

9. Test performance optimization
10. Flaky test elimination

---

## ✅ **VERIFICATION CHECKLIST**

After each fix:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Coverage reports generate correctly
- [ ] No console errors or warnings
- [ ] Tests can run in parallel
- [ ] Performance hasn't degraded

---

## 📊 **TRACKING PROGRESS**

| Issue              | Priority      | Status | Assigned | Due Date | Notes |
| ------------------ | ------------- | ------ | -------- | -------- | ----- |
| #1 Jest Config     | Critical      | ⏳     |          |          |       |
| #2 Env Variables   | Critical      | ⏳     |          |          |       |
| #3 DB Cleanup      | Critical      | ⏳     |          |          |       |
| #4 Mock Conflicts  | Critical      | ⏳     |          |          |       |
| #5 Coverage Config | Medium        | ⏳     |          |          |       |
| #6 Test Fixtures   | Medium        | ⏳     |          |          |       |
| #7 TestHelpers     | Medium        | ⏳     |          |          |       |
| #8 Test Templates  | Low           | ⏳     |          |          |       |
| #9 Performance     | Investigation | ⏳     |          |          |       |
| #10 Flaky Tests    | Investigation | ⏳     |          |          |       |

**Legend**: ⏳ Pending | 🔄 In Progress | ✅ Complete | ❌ Blocked

---

_Track progress daily and update status accordingly_
