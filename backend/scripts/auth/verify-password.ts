import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { dbConfig } from 'src/config/db/dbglobal/dbConfig';
import { User } from 'src/entities/global/user.entity';

async function verifyPassword() {
  const dataSource = new DataSource({
    ...dbConfig,
    name: 'verifyConnection',
  });

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database successfully!');

    const userRepository = dataSource.getRepository(User);

    // Get admin user
    const adminUser = await userRepository.findOne({
      where: { user_name: 'admin' },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('👤 Admin user found:');
    console.log('   Username:', adminUser.user_name);
    console.log('   Email:', adminUser.email);
    console.log('   Password hash:', adminUser.password_hash);
    console.log('   Is active:', adminUser.is_active);
    console.log('   Is deleted:', adminUser.is_deleted);

    // Test password comparison
    const testPassword = 'admin123';
    console.log('\n🔍 Testing password comparison...');
    console.log('   Test password:', testPassword);

    if (!adminUser.password_hash) {
      console.log('❌ Admin user has no password hash!');
      return;
    }

    const isMatch = await bcrypt.compare(testPassword, adminUser.password_hash);
    console.log('   Password match:', isMatch);

    // Create a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('   New hash for same password:', newHash);

    const newHashMatch = await bcrypt.compare(testPassword, newHash);
    console.log('   New hash match:', newHashMatch);
  } catch (error) {
    console.error('❌ Error verifying password:', error);
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
verifyPassword()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
