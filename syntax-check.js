try {
  require('./src/template-bootstrapper.js');
  console.log('✅ Syntax is valid');
} catch (error) {
  console.error('❌ Syntax error:', error.message);
  console.error('Stack:', error.stack);
}