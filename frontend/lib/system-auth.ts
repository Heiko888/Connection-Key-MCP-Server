import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Lazy loading: Environment variables werden erst zur Laufzeit geprüft
function getSystemToken(): string {
  const token = process.env.AGENT_SYSTEM_TOKEN;
  if (!token) {
    throw new Error(
      '❌ AGENT_SYSTEM_TOKEN is not defined in environment variables'
    );
  }
  return token;
}

function getHmacSecret(): string {
  return process.env.AGENT_HMAC_SECRET || '';
}

function getAllowedIPs(): string[] {
  return (process.env.AGENT_ALLOWED_IPS || '')
    .split(',')
    .map(ip => ip.trim())
    .filter(ip => ip.length > 0);
}

export class SystemAuthError extends Error {
  status = 401;
  code = 'SYSTEM_AUTH_FAILED';
  constructor(message: string) {
    super(message);
    this.name = 'SystemAuthError';
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

function verifyIP(request: NextRequest) {
  const allowedIPs = getAllowedIPs();
  if (!allowedIPs.length) return;

  const ip = getClientIP(request);
  if (!allowedIPs.includes(ip)) {
    throw new SystemAuthError(`IP not allowed: ${ip}`);
  }
}

function verifyToken(request: NextRequest) {
  const token =
    request.headers.get('x-agent-token') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new SystemAuthError('Missing system authentication token');
  }

  const systemToken = getSystemToken();
  if (token !== systemToken) {
    throw new SystemAuthError('Invalid system authentication token');
  }
}

function verifyHMAC(request: NextRequest) {
  const hmacSecret = getHmacSecret();
  if (!hmacSecret) return; // HMAC optional if secret not set

  const signature = request.headers.get('x-agent-signature');
  const timestamp = request.headers.get('x-agent-timestamp');

  if (!signature || !timestamp) {
    throw new SystemAuthError('Missing HMAC headers (x-agent-signature, x-agent-timestamp)');
  }

  // Validate timestamp (prevent replay attacks)
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(now - requestTime);

  if (timeDiff > 300) { // 5 minutes tolerance
    throw new SystemAuthError('Request timestamp too old or too far in future');
  }

  // Note: For GET requests, body is empty
  // For POST/PUT/PATCH, we need to read the body
  // This is a simplified version - in production, you'd need to handle body parsing
  const body = request.method === 'GET' ? '' : '';
  const payload = `${timestamp}.${body}`;

  const expected = crypto
    .createHmac('sha256', hmacSecret)
    .update(payload)
    .digest('hex');

  if (signature !== expected) {
    throw new SystemAuthError('Invalid HMAC signature');
  }
}

/**
 * 🔐 System Authentication
 * 
 * Prüft System-Auth über Header:
 * - x-agent-token: <SYSTEM_TOKEN>
 * - Optional: x-agent-signature, x-agent-timestamp (HMAC)
 * - Optional: IP Whitelist
 * 
 * @param request - Next.js Request
 * @param options - Security options
 * @throws SystemAuthError if authentication fails
 */
export function requireSystemAuth(
  request: NextRequest,
  options: { hmac?: boolean; ip?: boolean } = {}
) {
  if (options.ip) {
    verifyIP(request);
  }
  
  verifyToken(request);
  
  if (options.hmac) {
    verifyHMAC(request);
  }
}

/**
 * Optional: Prüft ob Request ein System-Request ist
 * (z. B. für Dual-Mode Routes)
 */
export function isSystemRequest(request: NextRequest): boolean {
  try {
    const token =
      request.headers.get('x-agent-token') ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    const systemToken = getSystemToken();
    return token === systemToken;
  } catch {
    return false;
  }
}
