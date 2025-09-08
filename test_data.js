// Simple test script to verify comprehensive ERP data
const fs = require('fs');
const path = require('path');

try {
  // Read the original JSON file
  const jsonPath = path.join(__dirname, 'DatcoDemoData2.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log('✅ Original JSON data loaded successfully');
  console.log('📊 Data structure:');
  console.log('- Source file:', jsonData.source_file);
  console.log('- Export date:', jsonData.exported_at);
  console.log('- Sheets:', Object.keys(jsonData.sheets));
  
  // Count records in each sheet
  Object.entries(jsonData.sheets).forEach(([sheetName, data]) => {
    console.log(`  - ${sheetName}: ${Array.isArray(data) ? data.length : 0} records`);
  });
  
  console.log('\n✅ Data integration test completed successfully!');
  console.log('🎯 Ready for dashboard integration');
  
} catch (error) {
  console.error('❌ Error testing data:', error.message);
}
