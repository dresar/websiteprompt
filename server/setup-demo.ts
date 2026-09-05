import { userService } from '../src/lib/database';

async function setupDemoUser() {
  console.log('🔧 Membuat user demo...');
  
  try {
    // Buat user demo
    const result = await userService.createUser(
      'demo',
      'demo@example.com',
      'demo123'
    );
    
    if (result.success) {
      console.log('✅ User demo berhasil dibuat!');
      console.log('');
      console.log('📋 Kredensial Login:');
      console.log('   Email: demo@example.com');
      console.log('   Password: demo123');
      console.log('');
    } else {
      if (result.error?.includes('sudah digunakan')) {
        console.log('ℹ️  User demo sudah ada');
        console.log('');
        console.log('📋 Kredensial Login:');
        console.log('   Email: demo@example.com');
        console.log('   Password: demo123');
        console.log('');
      } else {
        console.error('❌ Gagal membuat user demo:', result.error);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupDemoUser();

