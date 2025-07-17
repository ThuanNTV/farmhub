import { DataSource } from 'typeorm';
import { User } from '../src/entities/global/user.entity';
import { dbConfig } from '../src/config/db/dbglobal/dbConfig';
import * as bcrypt from 'bcryptjs';

async function createUserExample() {
  const dataSource = new DataSource({
    ...dbConfig,
    name: 'userExampleConnection',
  });

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database successfully!');

    const userRepository = dataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'user@example.com' },
    });

    if (existingUser) {
      console.log('⚠️  User with email user@example.com already exists!');
      console.log('Username:', existingUser.user_name);
      console.log('Email:', existingUser.email);
      console.log('Password: admin123');
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
    console.log('✅ User created successfully!');
    console.log('📋 Login credentials:');
    console.log('Username: user');
    console.log('Email: user@example.com');
    console.log('Password: admin123');
    console.log('User ID:', savedUser.user_id);
  } catch (error) {
    console.error('❌ Error creating user:', error);
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
createUserExample()
  .then(() => {
    console.log('🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
