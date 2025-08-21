#!/usr/bin/env node

const APIDocGenerator = require('../server/utils/apiDocs');

console.log('🚀 Generating API Documentation...\n');

try {
  const generator = new APIDocGenerator();
  const documentation = generator.generate();
  
  console.log('✅ API Documentation generated successfully!');
  console.log('📄 Documentation saved to: docs/API_DOCUMENTATION.md');
  console.log(`📊 Total routes documented: ${generator.routes.length}`);
  
  // Show summary of documented routes
  const routeGroups = generator.groupRoutesByCategory();
  console.log('\n📋 Documentation Summary:');
  Object.keys(routeGroups).forEach(category => {
    console.log(`  ${category}: ${routeGroups[category].length} routes`);
  });
  
  console.log('\n🎉 Documentation generation complete!');
  
} catch (error) {
  console.error('❌ Error generating API documentation:', error.message);
  process.exit(1);
}
