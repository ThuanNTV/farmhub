import { DataSource } from 'typeorm';
import { User } from 'src/entities/global/user.entity';
import { dbConfig } from 'src/config/db/dbglobal/dbConfig';

async function checkUsers() {
  const dataSource = new DataSource({
    ...dbConfig,
    name: 'checkConnection',
  } as any);

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database successfully!');

    const userRepository = dataSource.getRepository(User);

    // Get all users
    const users = await userRepository.find({
      select: [
        'user_id',
        'user_name',
        'email',
        'full_name',
        'role',
        'is_active',
        'is_deleted',
        'is_superadmin',
      ],
    });

    console.log(`📊 Found ${users.length} users in database:`);

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run "npm run create-test-user" to create a test user');
    } else {
      users.forEach((user, index) => {
        console.log(`\n👤 User ${index + 1}:`);
        console.log(`   ID: ${user.user_id}`);
        console.log(`   Username: ${user.user_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Full Name: ${user.full_name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Deleted: ${user.is_deleted}`);
        console.log(`   Superadmin: ${user.is_superadmin}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking users:', error);
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
checkUsers()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
