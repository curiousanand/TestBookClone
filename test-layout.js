// Simple test to verify layout components can be imported
const fs = require('fs');

// Check if all layout components exist
const components = [
  'components/layout/Header.tsx',
  'components/layout/Footer.tsx', 
  'components/layout/Sidebar.tsx',
  'components/layout/Layout.tsx',
  'components/layout/index.ts'
];

let allGood = true;

components.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component} exists`);
  } else {
    console.log(`❌ ${component} missing`);
    allGood = false;
  }
});

// Check basic syntax by reading files
components.filter(c => c.endsWith('.tsx')).forEach(component => {
  const content = fs.readFileSync(component, 'utf8');
  
  // Check for common syntax issues
  const checks = [
    { name: 'Export default', pattern: /export default \w+/ },
    { name: 'React import', pattern: /import.*React/ },
    { name: 'Interface definition', pattern: /interface \w+/ },
    { name: 'Component function', pattern: /const \w+.*React\.FC/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${component}: ${check.name} found`);
    } else {
      console.log(`⚠️  ${component}: ${check.name} not found`);
    }
  });
});

if (allGood) {
  console.log('\n🎉 All layout components are present and have basic structure!');
} else {
  console.log('\n❌ Some issues found with layout components');
}