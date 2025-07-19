import { DataSource } from 'typeorm';
import { User } from 'src/entities/global/user.entity';
import { dbConfig } from 'src/config/db/dbglobal/dbConfig';
import * as bcrypt from 'bcryptjs';
import { Logger } from 'winston';

import winston from 'winston';
const logger: Logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

async function createUserExample() {
  const dataSource = new DataSource({
    ...dbConfig,
    name: 'userExampleConnection',
  });

  try {
    logger.info('🔄 Connecting to database...');
    await dataSource.initialize();
    const userRepository = dataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'user@example.com' },
    });

    if (existingUser) {
      logger.warn('⚠️  User with email user@example.com already exists!');
      logger.info(`Username: ${existingUser.user_name}`);
      logger.info(`Email: ${existingUser.email}`);
      logger.info('Password: admin123');
      return;
    }

    // Create user
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    const testUser = userRepository.create({
      user_name: 'user',
      password_hash: passwordHash,
      full_name: 'Test User',
      email: 'user@example.com',
      role: 'store_manager',
      is_active: true,
      is_deleted: false,
      is_superadmin: false,
    });

    const savedUser = await userRepository.save(testUser);
    logger.info('✅ User created successfully!');
    logger.info('📋 Login credentials:');
    logger.info('Username: user');
    logger.info('Email: user@example.com');
    logger.info('Password: admin123');
    logger.info(`User ID: ${savedUser.user_id}`);
  } catch (error) {
    logger.error('❌ Error creating user:', error);
    if (error instanceof Error) {
      logger.error(`Error message: ${error.message}`);
      logger.error(`Error stack: ${error.stack}`);
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}
createUserExample()
  .then(() => {
    logger.info('🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Script failed:', error);
    process.exit(1);
  });
