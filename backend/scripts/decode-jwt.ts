import * as jwt from 'jsonwebtoken';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiYWQzMzdhZmEtODZjNS00NWMyLTkxNTYtMzIyZjAzMDgzZWIxIiwicm9sZSI6ImFkbWluX2dsb2JhbCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJzZXNzaW9uSWQiOiJzZXNzaW9uXzE3NTIyNjk1MzE5MTBfZDNzc2U4dDk1IiwiaWF0IjoxNzUyMjY5NTMxLCJleHAiOjE3NTIyNzMxMzF9.rOsN2N_4faCiejNUX3cdia0HZpkKpbck1RgXoctaaKE';

function decodeJWT() {
  try {
    console.log('🔍 Decoding JWT token...');

    // Decode without verification first
    const decoded = jwt.decode(token);
    console.log('📋 Decoded payload:');
    console.log(JSON.stringify(decoded, null, 2));

    // Try to verify with the secret
    const secret = process.env.JWT_SECRET ?? 'secretKey';
    console.log('\n🔑 Using secret:', secret);

    const verified = jwt.verify(token, secret);
    console.log('✅ Token verified successfully!');
    console.log('📋 Verified payload:');
    console.log(JSON.stringify(verified, null, 2));

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const exp = (verified as any).exp;
    const iat = (verified as any).iat;

    console.log('\n⏰ Token timing:');
    console.log('   Issued at:', new Date(iat * 1000).toISOString());
    console.log('   Expires at:', new Date(exp * 1000).toISOString());
    console.log('   Current time:', new Date(now * 1000).toISOString());
    console.log('   Is expired:', now > exp ? 'Yes' : 'No');
    console.log('   Time remaining:', exp - now, 'seconds');
  } catch (error) {
    console.error('❌ Error decoding/verifying JWT:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

decodeJWT();
