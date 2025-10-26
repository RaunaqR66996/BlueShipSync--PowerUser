// Test script for Container Tracking API
// Run with: node test-container-tracking.js

const BASE_URL = 'http://localhost:3000';

async function testContainerTracking() {
  console.log('🚢 Testing Container Tracking API\n');

  const tests = [
    {
      name: 'Search by Container Number',
      query: 'MSCU1234567',
      type: 'container'
    },
    {
      name: 'Search by Vessel Name',
      query: 'MSC MANYA',
      type: 'vessel'
    },
    {
      name: 'Search by IMO',
      query: '9275397',
      type: 'vessel'
    },
    {
      name: 'Search by MMSI',
      query: '636015233',
      type: 'vessel'
    },
    {
      name: 'Invalid Container',
      query: 'INVALID123',
      shouldFail: true
    }
  ];

  for (const test of tests) {
    console.log(`\n📦 Test: ${test.name}`);
    console.log(`   Query: ${test.query}`);
    
    try {
      const url = `${BASE_URL}/api/container-tracking?query=${encodeURIComponent(test.query)}${test.type ? `&type=${test.type}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (test.shouldFail) {
        if (!data.success) {
          console.log('   ✅ Expected failure - passed');
        } else {
          console.log('   ❌ Should have failed but succeeded');
        }
      } else {
        if (data.success) {
          console.log('   ✅ Success');
          console.log(`   Vessel: ${data.vessel.name}`);
          console.log(`   Position: ${data.vessel.latitude}, ${data.vessel.longitude}`);
          console.log(`   Status: ${data.vessel.navigationStatus}`);
          console.log(`   Speed: ${data.vessel.speed} kn`);
          if (data.containerId) {
            console.log(`   Container: ${data.containerId}`);
          }
        } else {
          console.log('   ❌ Failed:', data.error);
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
  }

  console.log('\n\n🎯 Test Summary:');
  console.log('- All container tracking tests completed');
  console.log('- Visit http://localhost:3000/container-tracking to see the UI');
  console.log('- Try searching: MSCU1234567, MSC MANYA, MAERSK ESSEX\n');
}

// Run tests if server is running
testContainerTracking().catch(err => {
  console.error('❌ Test failed:', err.message);
  console.log('\n💡 Make sure your Next.js dev server is running:');
  console.log('   npm run dev\n');
});





















































