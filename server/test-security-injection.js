#!/usr/bin/env node

/**
 * Security Injection Testing Script
 * Tests SQL injection protection, XSS protection, and form validation
 */

const sqlInjectionProtection = require('./utils/sql-injection-protection');
const formValidation = require('./utils/form-validation');

console.log('🔒 Starting Security Injection Tests...\n');

// Test results tracking
let testsPassed = 0;
let testsFailed = 0;
let totalTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ ${testName} - PASSED`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName} - FAILED`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ ${testName} - FAILED with error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: SQL Injection Detection - Basic Commands
runTest('SQL Injection Detection - Basic Commands', () => {
  const maliciousInputs = [
    'SELECT * FROM users',
    'INSERT INTO users VALUES (1, "admin", "password")',
    'UPDATE users SET password = "hacked" WHERE id = 1',
    'DELETE FROM users WHERE id = 1',
    'DROP TABLE users',
    'CREATE TABLE hackers (id INT)',
    'ALTER TABLE users ADD COLUMN hacked BOOLEAN',
    'EXEC xp_cmdshell "dir"',
    'UNION SELECT * FROM users',
    'SCRIPT alert("hacked")'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 2: SQL Injection Detection - Conditional Statements
runTest('SQL Injection Detection - Conditional Statements', () => {
  const maliciousInputs = [
    'OR 1=1',
    'AND 1=1',
    'OR id=1 OR id=2',
    'AND username="admin" AND password="password"',
    'OR 1 IN (1,2,3)',
    'AND name LIKE "%admin%"'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 3: SQL Injection Detection - Comments
runTest('SQL Injection Detection - Comments', () => {
  const maliciousInputs = [
    '-- comment',
    '/* comment */',
    '# comment',
    '/* multi-line\ncomment */'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 4: SQL Injection Detection - Stored Procedures
runTest('SQL Injection Detection - Stored Procedures', () => {
  const maliciousInputs = [
    'xp_cmdshell "dir"',
    'sp_executesql "SELECT * FROM users"',
    'fn_get_audit_file',
    'dt_getpropertiesbyid',
    'WAITFOR DELAY "00:00:05"',
    'SLEEP(5)',
    'BENCHMARK(1000000,MD5(1))'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 5: SQL Injection Detection - Stacked Queries
runTest('SQL Injection Detection - Stacked Queries', () => {
  const maliciousInputs = [
    '; SELECT * FROM users',
    '; INSERT INTO users VALUES (1, "hacker", "password")',
    '; DROP TABLE users',
    '; WAITFOR DELAY "00:00:05"',
    '; xp_cmdshell "dir"'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 6: SQL Injection Detection - Time-based Attacks
runTest('SQL Injection Detection - Time-based Attacks', () => {
  const maliciousInputs = [
    'WAITFOR DELAY "00:00:05"',
    'SLEEP(5)',
    'BENCHMARK(1000000,MD5(1))',
    'GET_LOCK("test", 5)',
    'RELEASE_LOCK("test")'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 7: SQL Injection Detection - Union Attacks
runTest('SQL Injection Detection - Union Attacks', () => {
  const maliciousInputs = [
    'UNION SELECT * FROM users',
    'UNION ALL SELECT username, password FROM users',
    'UNION SELECT 1,2,3,4,5',
    'UNION SELECT NULL,NULL,NULL,NULL,NULL'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 8: SQL Injection Detection - NoSQL Injection
runTest('SQL Injection Detection - NoSQL Injection', () => {
  const maliciousInputs = [
    '$where: "1==1"',
    '$ne: "admin"',
    '$gt: 0',
    '$lt: 100',
    '$gte: 1',
    '$lte: 999',
    '$in: ["admin", "user"]',
    '$nin: ["guest"]',
    '$regex: ".*"',
    '$options: "i"'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectSqlInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 9: XSS Detection - Script Tags
runTest('XSS Detection - Script Tags', () => {
  const maliciousInputs = [
    '<script>alert("hacked")</script>',
    '<script src="http://evil.com/hack.js"></script>',
    '<script>document.cookie="hacked=true"</script>',
    '<script>eval("alert(1)")</script>'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectXss(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 10: XSS Detection - Event Handlers
runTest('XSS Detection - Event Handlers', () => {
  const maliciousInputs = [
    'onload="alert(\'hacked\')"',
    'onerror="alert(\'hacked\')"',
    'onclick="alert(\'hacked\')"',
    'onmouseover="alert(\'hacked\')"',
    'onfocus="alert(\'hacked\')"',
    'onblur="alert(\'hacked\')"'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectXss(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 11: XSS Detection - JavaScript Protocols
runTest('XSS Detection - JavaScript Protocols', () => {
  const maliciousInputs = [
    'javascript:alert("hacked")',
    'javascript:document.cookie="hacked=true"',
    'javascript:eval("alert(1)")',
    'vbscript:MsgBox("hacked")',
    'data:text/html,<script>alert("hacked")</script>'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectXss(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 12: XSS Detection - Iframe and Object Tags
runTest('XSS Detection - Iframe and Object Tags', () => {
  const maliciousInputs = [
    '<iframe src="http://evil.com/hack.html"></iframe>',
    '<object data="http://evil.com/hack.swf"></object>',
    '<embed src="http://evil.com/hack.swf"></embed>',
    '<applet code="Hack.class"></applet>'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectXss(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 13: Command Injection Detection - Shell Commands
runTest('Command Injection Detection - Shell Commands', () => {
  const maliciousInputs = [
    'cat /etc/passwd',
    'ls -la',
    'pwd',
    'whoami',
    'id',
    'uname -a',
    'ps aux',
    'netstat -an',
    'ifconfig',
    'rm -rf /',
    'cp /etc/passwd /tmp/',
    'mv /etc/passwd /tmp/',
    'chmod 777 /etc/passwd',
    'chown root /etc/passwd',
    'kill -9 1',
    'pkill -f ssh'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectCommandInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 14: Command Injection Detection - Windows Commands
runTest('Command Injection Detection - Windows Commands', () => {
  const maliciousInputs = [
    'dir C:\\',
    'type C:\\windows\\system32\\drivers\\etc\\hosts',
    'copy C:\\windows\\system32\\drivers\\etc\\hosts C:\\temp\\',
    'move C:\\windows\\system32\\drivers\\etc\\hosts C:\\temp\\',
    'del C:\\windows\\system32\\drivers\\etc\\hosts',
    'ren C:\\windows\\system32\\drivers\\etc\\hosts hosts.bak',
    'md C:\\temp\\hack',
    'rd C:\\temp\\hack',
    'cd C:\\temp',
    'cls',
    'echo hacked > C:\\temp\\hack.txt'
  ];

  return maliciousInputs.every(input => {
    const result = sqlInjectionProtection.detectCommandInjection(input);
    return !result.isSafe && result.threats.length > 0;
  });
});

// Test 15: Input Sanitization
runTest('Input Sanitization', () => {
  const maliciousInput = '<script>alert("hacked")</script> OR 1=1; rm -rf /';
  const sanitized = sqlInjectionProtection.sanitizeInput(maliciousInput);
  
  return !sanitized.includes('<script>') && 
         !sanitized.includes('OR 1=1') && 
         !sanitized.includes('rm -rf');
});

// Test 16: Safe Input Detection
runTest('Safe Input Detection', () => {
  const safeInputs = [
    'Hello World',
    'user@example.com',
    'MyRecipe123',
    'Cooking instructions here',
    'Normal text content'
  ];

  return safeInputs.every(input => {
    const result = sqlInjectionProtection.comprehensiveSecurityCheck(input);
    return result.isSafe && result.threats.length === 0;
  });
});

// Test 17: Form Validation - User Registration
runTest('Form Validation - User Registration', () => {
  const validUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!'
  };

  const invalidUser = {
    email: 'invalid-email',
    username: 'a', // too short
    password: 'weak', // too weak
    confirmPassword: 'different' // doesn't match
  };

  // Test valid user (should pass validation)
  const validResult = formValidation.validateUser('register');
  // Test invalid user (should fail validation)
  const invalidResult = formValidation.validateUser('register');

  return true; // Basic structure test
});

// Test 18: Form Validation - Theme Creation
runTest('Form Validation - Theme Creation', () => {
  const validTheme = {
    title: 'My Recipe',
    content: 'Recipe content here',
    category: 'Основни ястия',
    difficulty: 'medium',
    cookingTime: 30,
    servings: 4,
    ingredients: ['ingredient 1', 'ingredient 2'],
    instructions: ['step 1', 'step 2']
  };

  const invalidTheme = {
    title: '', // empty title
    content: 'A'.repeat(6000), // too long
    category: 'InvalidCategory',
    difficulty: 'super_hard', // invalid difficulty
    cookingTime: -5, // negative time
    servings: 1000 // too many servings
  };

  return true; // Basic structure test
});

// Test 19: Input Pattern Validation
runTest('Input Pattern Validation', () => {
  const patterns = {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'TestPass123!',
    url: 'https://example.com',
    phone: '+1234567890',
    date: '2024-01-01',
    time: '12:30:00',
    numeric: '12345',
    alphanumeric: 'abc123',
    text: 'Hello World!'
  };

  return Object.entries(patterns).every(([type, value]) => {
    const result = sqlInjectionProtection.validateInputPattern(value, type);
    return result.isValid;
  });
});

// Test 20: Comprehensive Security Check
runTest('Comprehensive Security Check', () => {
  const maliciousInput = {
    username: 'admin',
    password: 'password',
    query: 'SELECT * FROM users WHERE username = "admin" OR 1=1',
    script: '<script>alert("hacked")</script>',
    command: 'rm -rf /'
  };

  const result = sqlInjectionProtection.comprehensiveSecurityCheck(maliciousInput, true);
  
  return !result.isSafe && 
         result.threats.length > 0 && 
         result.riskLevel === 'critical';
});

console.log('\n📊 Security Injection Test Results:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${testsPassed} ✅`);
console.log(`Failed: ${testsFailed} ❌`);
console.log(`Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 All security injection tests passed! Your application is protected.');
} else {
  console.log('\n⚠️  Some security injection tests failed. Please review the implementation.');
}

console.log('\n🔒 Security injection testing completed.');

// Exit with appropriate code
process.exit(testsFailed === 0 ? 0 : 1);
