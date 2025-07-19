import { DataSource } from 'typeorm';
import { User } from 'src/entities/global/user.entity';
import { dbConfig } from 'src/config/db/dbglobal/dbConfig';
import * as bcrypt from 'bcryptjs';

async function createTestUser() {
  const dataSource = new DataSource({
    ...dbConfig,
    name: 'testConnection',
  });

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database successfully!');

    const userRepository = dataSource.getRepository(User);

    // Check if test user already exists
    const existingUser = await userRepository.findOne({
      where: { user_name: 'admin' },
    });

    if (existingUser) {
      console.log('⚠️  Test user already exists!');
      console.log('Username: admin');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return;
    }

    // Create test user
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    const testUser = userRepository.create({
      user_name: 'admin',
      password_hash: passwordHash,
      full_name: 'Administrator',
      email: 'admin@example.com',
      role: 'admin_global',
      is_active: true,
      is_deleted: false,
      is_superadmin: true,
    });

    const savedUser = await userRepository.save(testUser);
    console.log('✅ Test user created successfully!');
    console.log('📋 Login credentials:');
    console.log('Username: admin');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('User ID:', savedUser.user_id);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log('🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
