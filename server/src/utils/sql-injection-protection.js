const crypto = require('crypto');

// SQL injection patterns and signatures
const SQL_INJECTION_PATTERNS = {
  // Basic SQL commands
  basic: [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b/i,
    /\b(USE|SHOW|DESCRIBE|EXPLAIN|ANALYZE|OPTIMIZE|REPAIR|CHECK)\b/i,
    /\b(GRANT|REVOKE|DENY|BACKUP|RESTORE|BULK|INSERT|MERGE)\b/i
  ],

  // Conditional statements
  conditional: [
    /\b(OR|AND)\b\s+\d+\s*[=<>]\s*\d+/i,
    /\b(OR|AND)\b\s+['"]?\w+['"]?\s*[=<>]\s*['"]?\w+['"]?/i,
    /\b(OR|AND)\b\s+\d+\s*IN\s*\(/i,
    /\b(OR|AND)\b\s+\w+\s*LIKE\s*['"]?%/i
  ],

  // Comments and special characters
  comments: [
    /--/,
    /\/\*/,
    /\*\//,
    /#/,
    /\/\*.*\*\//s
  ],

  // Stored procedures and functions
  procedures: [
    /\b(xp_|sp_|fn_|dt_)\w+/i,
    /\b(WAITFOR|DELAY|SLEEP)\b/i,
    /\b(BENCHMARK|SLEEP|GET_LOCK|RELEASE_LOCK)\b/i
  ],

  // Stacked queries
  stacked: [
    /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)/i,
    /;\s*(WAITFOR|DELAY|SLEEP)/i,
    /;\s*(xp_|sp_|fn_|dt_)/i
  ],

  // Time-based attacks
  timeBased: [
    /\b(WAITFOR|DELAY)\b\s+DELAY\s+['"]?\d+['"]?/i,
    /\b(SLEEP)\s*\(\s*\d+\s*\)/i,
    /\b(BENCHMARK)\s*\(\s*\d+\s*,\s*\w+\s*\)/i
  ],

  // Union attacks
  union: [
    /\b(UNION)\s+(ALL\s+)?(SELECT|INSERT|UPDATE|DELETE)/i,
    /\b(UNION)\s+(ALL\s+)?(SELECT\s+.*\s+FROM)/i
  ],

  // Error-based attacks
  errorBased: [
    /\b(AND|OR)\s+\d+\s*=\s*\d+\s*AND\s+1\s*=\s*1/i,
    /\b(AND|OR)\s+\d+\s*=\s*\d+\s*AND\s+1\s*=\s*2/i,
    /\b(AND|OR)\s+\d+\s*=\s*\d+\s*AND\s+\(\s*SELECT\s+\d+\s*\)/i
  ],

  // Boolean-based attacks
  booleanBased: [
    /\b(AND|OR)\s+1\s*=\s*1/i,
    /\b(AND|OR)\s+1\s*=\s*2/i,
    /\b(AND|OR)\s+TRUE/i,
    /\b(AND|OR)\s+FALSE/i
  ],

  // NoSQL injection patterns
  noSql: [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$gte/i,
    /\$lte/i,
    /\$in/i,
    /\$nin/i,
    /\$regex/i,
    /\$options/i
  ]
};

// XSS and HTML injection patterns
const XSS_PATTERNS = {
  // Script tags
  script: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<script\b[^>]*>/gi
  ],

  // Event handlers
  events: [
    /on\w+\s*=/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi
  ],

  // JavaScript protocols
  protocols: [
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /vbscript:/gi
  ],

  // Iframe and object tags
  iframe: [
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi
  ],

  // CSS expressions
  css: [
    /expression\s*\(/gi,
    /url\s*\(\s*javascript:/gi
  ]
};

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = {
  // Shell commands
  shell: [
    /[;&|`$()[\]]/,  // Removed {} as it's too common in JSON
    /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig)\b/i,
    /\b(rm|cp|mv|chmod|chown|kill|pkill)\b/i
  ],

  // Windows commands
  windows: [
    /\b(dir|type|copy|move|del|ren|md|rd|cd|cls|echo)\b/i,
    /\b(net|netstat|ipconfig|tasklist|taskkill|sc|reg)\b/i
  ]
};

/**
 * Check if input contains SQL injection patterns
 * @param {string|object} input - Input to check
 * @param {boolean} strict - Use strict mode for more thorough checking
 * @returns {Object} Detection result
 */
function detectSqlInjection(input, strict = false) {
  const result = {
    isSafe: true,
    threats: [],
    riskLevel: 'low',
    recommendations: []
  };

  if (!input) {
    return result;
  }

  const inputStr = typeof input === 'object' ? JSON.stringify(input) : String(input);
  const threats = [];

  // Check all SQL injection patterns
  Object.entries(SQL_INJECTION_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(inputStr)) {
        threats.push({
          category,
          pattern: pattern.source,
          severity: getThreatSeverity(category),
          description: getThreatDescription(category)
        });
      }
    });
  });

  // Additional checks for strict mode
  if (strict) {
    // Check for encoded/obfuscated patterns
    const decoded = decodeURIComponent(inputStr);
    if (decoded !== inputStr) {
      const decodedThreats = detectSqlInjection(decoded, false);
      if (decodedThreats.threats.length > 0) {
        threats.push(...decodedThreats.threats.map(t => ({
          ...t,
          category: 'encoded',
          description: 'Encoded/obfuscated ' + t.description
        })));
      }
    }

    // Check for hex-encoded patterns
    if (/[0-9a-fA-F]{4,}/.test(inputStr)) {
      try {
        const hexDecoded = Buffer.from(inputStr.replace(/[^0-9a-fA-F]/g, ''), 'hex').toString();
        const hexThreats = detectSqlInjection(hexDecoded, false);
        if (hexThreats.threats.length > 0) {
          threats.push(...hexThreats.threats.map(t => ({
            ...t,
            category: 'hex_encoded',
            description: 'Hex-encoded ' + t.description
          })));
        }
      } catch (e) {
        // Invalid hex string, ignore
      }
    }
  }

  if (threats.length > 0) {
    result.isSafe = false;
    result.threats = threats;
    result.riskLevel = calculateRiskLevel(threats);
    result.recommendations = generateRecommendations(threats);
  }

  return result;
}

/**
 * Check if input contains XSS patterns
 * @param {string|object} input - Input to check
 * @returns {Object} Detection result
 */
function detectXss(input) {
  const result = {
    isSafe: true,
    threats: [],
    riskLevel: 'low',
    recommendations: []
  };

  if (!input) {
    return result;
  }

  const inputStr = typeof input === 'object' ? JSON.stringify(input) : String(input);
  const threats = [];

  // Check all XSS patterns
  Object.entries(XSS_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(inputStr)) {
        threats.push({
          category,
          pattern: pattern.source,
          severity: getThreatSeverity(category),
          description: getThreatDescription(category)
        });
      }
    });
  });

  if (threats.length > 0) {
    result.isSafe = false;
    result.threats = threats;
    result.riskLevel = calculateRiskLevel(threats);
    result.recommendations = generateRecommendations(threats);
  }

  return result;
}

/**
 * Check if input contains command injection patterns
 * @param {string|object} input - Input to check
 * @returns {Object} Detection result
 */
function detectCommandInjection(input) {
  const result = {
    isSafe: true,
    threats: [],
    riskLevel: 'low',
    recommendations: []
  };

  if (!input) {
    return result;
  }

  const inputStr = typeof input === 'object' ? JSON.stringify(input) : String(input);
  const threats = [];

  // Check all command injection patterns
  Object.entries(COMMAND_INJECTION_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(inputStr)) {
        threats.push({
          category,
          pattern: pattern.source,
          severity: getThreatSeverity(category),
          description: getThreatDescription(category)
        });
      }
    });
  });

  if (threats.length > 0) {
    result.isSafe = false;
    result.threats = threats;
    result.riskLevel = calculateRiskLevel(threats);
    result.recommendations = generateRecommendations(threats);
  }

  return result;
}

/**
 * Comprehensive security check for all injection types
 * @param {string|object} input - Input to check
 * @param {boolean} strict - Use strict mode
 * @returns {Object} Comprehensive security analysis
 */
function comprehensiveSecurityCheck(input, strict = false) {
  const sqlCheck = detectSqlInjection(input, strict);
  const xssCheck = detectXss(input);
  const commandCheck = detectCommandInjection(input);

  const allThreats = [
    ...sqlCheck.threats.map(t => ({ ...t, type: 'sql_injection' })),
    ...xssCheck.threats.map(t => ({ ...t, type: 'xss' })),
    ...commandCheck.threats.map(t => ({ ...t, type: 'command_injection' }))
  ];

  const isSafe = sqlCheck.isSafe && xssCheck.isSafe && commandCheck.isSafe;
  const riskLevel = calculateOverallRiskLevel([sqlCheck, xssCheck, commandCheck]);

  return {
    isSafe,
    threats: allThreats,
    riskLevel,
    categories: {
      sqlInjection: sqlCheck,
      xss: xssCheck,
      commandInjection: commandCheck
    },
    recommendations: generateOverallRecommendations([sqlCheck, xssCheck, commandCheck]),
    timestamp: new Date().toISOString()
  };
}

/**
 * Sanitize input to remove dangerous patterns
 * @param {string} input - Input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }

  const {
    removeHtml = true,
    removeSql = true,
    removeCommands = true,
    allowUrls = false,
    maxLength = 1000
  } = options;

  let sanitized = input;

  // Remove HTML tags
  if (removeHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove SQL patterns
  if (removeSql) {
    Object.values(SQL_INJECTION_PATTERNS).flat().forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Remove command injection patterns
  if (removeCommands) {
    Object.values(COMMAND_INJECTION_PATTERNS).flat().forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }

  // Remove XSS patterns
  Object.values(XSS_PATTERNS).flat().forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove dangerous characters
  sanitized = sanitized
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Generate secure hash for input validation
 * @param {string} input - Input to hash
 * @returns {string} Secure hash
 */
function generateInputHash(input) {
  if (typeof input !== 'string') {
    input = JSON.stringify(input);
  }

  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Validate input against known safe patterns
 * @param {string} input - Input to validate
 * @param {string} type - Type of input (email, username, text, etc.)
 * @returns {Object} Validation result
 */
function validateInputPattern(input, type) {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9_-]{3,30}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,128}$/,
    url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    time: /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
    numeric: /^\d+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    text: /^[\w\s\-.,!?;:'"()]+$/
  };

  const pattern = patterns[type];
  if (!pattern) {
    return {
      isValid: false,
      error: `Unknown input type: ${type}`
    };
  }

  const isValid = pattern.test(input);
  return {
    isValid,
    error: isValid ? null : `Input does not match expected pattern for ${type}`
  };
}

// Helper functions
function getThreatSeverity(category) {
  const severityMap = {
    basic: 'high',
    conditional: 'high',
    comments: 'medium',
    procedures: 'high',
    stacked: 'critical',
    timeBased: 'high',
    union: 'critical',
    errorBased: 'high',
    booleanBased: 'medium',
    noSql: 'high',
    script: 'critical',
    events: 'high',
    protocols: 'high',
    iframe: 'high',
    css: 'medium',
    shell: 'critical',
    windows: 'high'
  };

  return severityMap[category] || 'medium';
}

function getThreatDescription(category) {
  const descriptionMap = {
    basic: 'SQL command detected',
    conditional: 'SQL conditional statement detected',
    comments: 'SQL comment detected',
    procedures: 'Stored procedure detected',
    stacked: 'Stacked query detected',
    timeBased: 'Time-based attack detected',
    union: 'UNION attack detected',
    errorBased: 'Error-based attack detected',
    booleanBased: 'Boolean-based attack detected',
    noSql: 'NoSQL injection detected',
    script: 'Script tag detected',
    events: 'Event handler detected',
    protocols: 'Dangerous protocol detected',
    iframe: 'Iframe/object tag detected',
    css: 'CSS expression detected',
    shell: 'Shell command detected',
    windows: 'Windows command detected'
  };

  return descriptionMap[category] || 'Unknown threat detected';
}

function calculateRiskLevel(threats) {
  if (threats.length === 0) {return 'low';}

  const severityScores = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };

  const totalScore = threats.reduce((sum, threat) => {
    return sum + severityScores[threat.severity];
  }, 0);

  const averageScore = totalScore / threats.length;

  if (averageScore >= 3.5) {return 'critical';}
  if (averageScore >= 2.5) {return 'high';}
  if (averageScore >= 1.5) {return 'medium';}
  return 'low';
}

function calculateOverallRiskLevel(checks) {
  const riskLevels = checks.map(check => check.riskLevel);
  const riskScores = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };

  const maxScore = Math.max(...riskLevels.map(level => riskScores[level]));

  for (const [level, score] of Object.entries(riskScores)) {
    if (score === maxScore) {return level;}
  }

  return 'low';
}

function generateRecommendations(threats) {
  const recommendations = [];

  threats.forEach(threat => {
    switch (threat.type || threat.category) {
    case 'sql_injection':
    case 'basic':
    case 'conditional':
    case 'procedures':
      recommendations.push('Use parameterized queries or ORM');
      recommendations.push('Validate and sanitize all inputs');
      recommendations.push('Implement input length restrictions');
      break;

    case 'xss':
    case 'script':
    case 'events':
      recommendations.push('Escape HTML output');
      recommendations.push('Use Content Security Policy');
      recommendations.push('Validate input content');
      break;

    case 'command_injection':
    case 'shell':
    case 'windows':
      recommendations.push('Avoid shell command execution');
      recommendations.push('Use built-in functions instead');
      recommendations.push('Validate file paths and names');
      break;

    default:
      recommendations.push('Implement comprehensive input validation');
      recommendations.push('Use security headers and middleware');
      recommendations.push('Regular security audits and testing');
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}

function generateOverallRecommendations(checks) {
  const allRecommendations = checks.flatMap(check => check.recommendations || []);
  return [...new Set(allRecommendations)];
}

module.exports = {
  detectSqlInjection,
  detectXss,
  detectCommandInjection,
  comprehensiveSecurityCheck,
  sanitizeInput,
  generateInputHash,
  validateInputPattern,
  SQL_INJECTION_PATTERNS,
  XSS_PATTERNS,
  COMMAND_INJECTION_PATTERNS
};
