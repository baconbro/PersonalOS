// Security utilities for PersonalOS
// Provides input validation, sanitization, and security helpers

/**
 * HTML sanitization utility to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Handle encoded brackets
    .trim();
}

/**
 * Sanitize text input for storage
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Enhanced password validation
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate goal title
 */
export function validateGoalTitle(title: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(title);
  
  if (!sanitized) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (sanitized.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters long' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: 'Title must be less than 100 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate goal description
 */
export function validateGoalDescription(description: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(description);
  
  if (sanitized.length > 2000) {
    return { valid: false, error: 'Description must be less than 2000 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate numeric input
 */
export function validateNumber(value: string | number, min: number = 0, max: number = 1000000): { valid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  
  if (num < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `Must be no more than ${max}` };
  }
  
  return { valid: true };
}

/**
 * Rate limiting helper (client-side basic implementation)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Content Security Policy violations logger
 */
export function logCSPViolation(violationEvent: any): void {
  console.warn('CSP Violation:', {
    blockedURI: violationEvent.blockedURI,
    violatedDirective: violationEvent.violatedDirective,
    originalPolicy: violationEvent.originalPolicy,
    timestamp: new Date().toISOString()
  });
  
  // In production, send this to your logging service
  // analyticsService.logSecurityEvent('csp_violation', violationEvent);
}

/**
 * Security audit logger
 */
export function logSecurityEvent(event: string, details: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔒 Security Event: ${event}`, details);
  }
  
  // In production, send to security monitoring service
  // securityMonitoringService.log(event, details);
}
