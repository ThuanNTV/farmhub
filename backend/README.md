<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🚀 FARMHUB - NESTJS BACKEND

## Description

FarmHub là hệ thống quản lý nông nghiệp toàn diện được xây dựng trên [NestJS](https://github.com/nestjs/nest) framework với TypeScript. Hệ thống hỗ trợ quản lý đơn hàng, sản phẩm, khách hàng, thanh toán và nhiều tính năng khác.

## 🎯 Tính năng chính

- **Quản lý đơn hàng** - Tạo, theo dõi và quản lý đơn hàng
- **Quản lý sản phẩm** - Catalog sản phẩm với inventory tracking
- **Quản lý khách hàng** - CRM và customer management
- **Hệ thống thanh toán** - Multiple payment methods
- **Audit logging** - Theo dõi hoạt động hệ thống
- **Multi-tenant** - Hỗ trợ nhiều store/cửa hàng
- **Performance optimization** - Caching, partitioning, indexing

## 🚀 Performance Features

- **Redis Caching** - Cache products, configs, reports
- **Database Partitioning** - Monthly partitions cho large tables
- **Query Optimization** - Indexes và query tuning
- **Atomic Transactions** - ACID compliance cho critical operations

## 🛠️ Project setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0 (for caching)

### Installation

```bash
# Install dependencies
$ npm install

# Install Redis dependencies
$ npm install cache-manager ioredis cache-manager-ioredis
```

### Environment Configuration

Tạo file `.env` với các cấu hình sau:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=farmhub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=600

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

## 🚀 Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🧪 Performance Testing

```bash
# Run performance tests
$ npm run test:performance

# Or run directly
$ npx ts-node scripts/test-performance.ts
```

## 🗄️ Database Setup

```bash
# Run partition and index script
$ psql -h localhost -U postgres -d farmhub -f scripts/partition_and_index.sql

# Check partitions
$ psql -h localhost -U postgres -d farmhub -c "\dt audit_log*"
```

## 🧪 Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

# performance tests
$ npm run test:performance
```

## 🚀 Deployment

### Performance Optimization

Hệ thống FarmHub đã được tối ưu hiệu năng với:

- **Database Partitioning** - Chia nhỏ bảng lớn theo tháng
- **Redis Caching** - Cache dữ liệu thường xuyên truy cập
- **Query Optimization** - Indexes và query tuning
- **Atomic Transactions** - Đảm bảo tính nhất quán dữ liệu

### Production Deployment

Xem hướng dẫn chi tiết tại: [Deployment Guide](./docs/13_deployment_guide.md)

```bash
# Install PM2 for production
$ npm install -g pm2

# Start application
$ pm2 start ecosystem.config.js --env production

# Monitor application
$ pm2 monit
```

### Performance Monitoring

```bash
# Check cache statistics
$ redis-cli info memory

# Monitor database performance
$ psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Run health checks
$ ./scripts/health-check.sh
```

## 📚 Documentation

### Core Documentation

- [Project Overview](./docs/01_project_overview.md) - Tổng quan dự án
- [Functional Requirements](./docs/02_functional_requirements.md) - Yêu cầu chức năng
- [Architecture](./docs/03_architecture.md) - Kiến trúc hệ thống
- [API Contract](./docs/05_api_contract.yaml) - Định nghĩa API
- [Performance Optimization](./docs/12_performance_optimization.md) - Tối ưu hiệu năng
- [Deployment Guide](./docs/13_deployment_guide.md) - Hướng dẫn triển khai

### Development Guides

- [Development Checklist](./docs/09_development_checklist.md) - Checklist phát triển
- [Atomic Transaction Guide](./docs/10_atomic_transaction_guide.md) - Hướng dẫn transaction
- [Database Architecture](./docs/06_database_architecture_refactor.md) - Kiến trúc database

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com) - Framework documentation
- [TypeORM Documentation](https://typeorm.io/) - Database ORM
- [Redis Documentation](https://redis.io/documentation) - Caching solution
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
