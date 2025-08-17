const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fileList = findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.includes('migrate') && !file.includes('update-role')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update role references in a file
function updateRoleReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Update role references
    const replacements = [
      // Validation schemas
      { from: /role: Joi\.string\(\)\.valid\('super_admin', 'sub_admin'\)/g, to: "role: Joi.string().valid('admin', 'customer')" },
      { from: /role: Joi\.string\(\)\.valid\('super_admin', 'sub_admin', 'user'\)/g, to: "role: Joi.string().valid('admin', 'customer')" },
      { from: /role: Joi\.string\(\)\.valid\('super_admin', 'sub_admin'\)\.default\('sub_admin'\)/g, to: "role: Joi.string().valid('admin', 'customer').default('customer')" },
      
      // Role checks in middleware
      { from: /req\.user\.role !== 'super_admin'/g, to: "req.user.role !== 'admin'" },
      { from: /req\.user\.role !== 'sub_admin'/g, to: "req.user.role !== 'admin'" },
      { from: /req\.user\.role === 'super_admin'/g, to: "req.user.role === 'admin'" },
      { from: /req\.user\.role === 'sub_admin'/g, to: "req.user.role === 'admin'" },
      
      // Role checks in queries
      { from: /role: 'super_admin'/g, to: "role: 'admin'" },
      { from: /role: 'sub_admin'/g, to: "role: 'admin'" },
      { from: /role: \{ \$in: \['super_admin', 'sub_admin'\] \}/g, to: "role: { \$in: ['admin'] }" },
      
      // Aggregation queries
      { from: /\$cond: \[\{ \$eq: \['\$role', 'super_admin'\] \}, 1, 0\]/g, to: "$cond: [{ \$eq: ['\$role', 'admin'] }, 1, 0]" },
      { from: /\$cond: \[\{ \$eq: \['\$role', 'sub_admin'\] \}, 1, 0\]/g, to: "$cond: [{ \$eq: ['\$role', 'admin'] }, 1, 0]" },
      
      // Function names and comments
      { from: /requireSuperAdmin/g, to: "requireAdmin" },
      { from: /requireSubAdmin/g, to: "requireAdmin" },
      { from: /isSuperAdmin/g, to: "isAdmin" },
      { from: /isSubAdmin/g, to: "isAdmin" },
      
      // Error messages
      { from: /Super Admin access required/g, to: "Admin access required" },
      { from: /Sub Admin access required/g, to: "Admin access required" },
      { from: /Super Admin privileges/g, to: "Admin privileges" },
      { from: /Sub Admin privileges/g, to: "Admin privileges" }
    ];
    
    replacements.forEach(replacement => {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🔄 Starting role reference update...');
  
  const serverDir = path.join(__dirname, '..', 'server');
  const jsFiles = findJsFiles(serverDir);
  
  console.log(`📁 Found ${jsFiles.length} JavaScript files to check`);
  
  let updatedCount = 0;
  
  jsFiles.forEach(filePath => {
    if (updateRoleReferences(filePath)) {
      updatedCount++;
    }
  });
  
  console.log(`\n🎉 Role reference update completed!`);
  console.log(`📊 Files updated: ${updatedCount}/${jsFiles.length}`);
  
  if (updatedCount > 0) {
    console.log('\n⚠️  Please restart your server to apply the changes.');
  }
}

main();
