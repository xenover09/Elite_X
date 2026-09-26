/**
 * Lightweight structured logger.
 * Outputs JSON lines in production, human-readable in development.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const LEVELS = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

const ringBuffer = [];
const MAX_LOGS = 200;

function pushToBuffer(entry) {
  // Redact potential API keys (e.g. gsk_1234567890abcdef)
  if (entry.message) {
    entry.message = entry.message.replace(/gsk_[a-zA-Z0-9]{20,}/g, 'gsk_***[REDACTED]');
  }
  ringBuffer.push(entry);
  if (ringBuffer.length > MAX_LOGS) {
    ringBuffer.shift();
  }
}

/**
 * Formats and writes a log entry to stdout/stderr.
 * @param {'info'|'warn'|'error'|'debug'} level
 * @param {string} message
 * @param {...any} args
 */
function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const label = LEVELS[level] || 'LOG';

  if (IS_PRODUCTION) {
    const entry = {
      timestamp,
      level: label,
      message,
      ...(args.length > 0 && { details: args }),
    };
    pushToBuffer(entry);
    const output = JSON.stringify(entry);
    if (level === 'error') {
      process.stderr.write(output + '\n');
    } else {
      process.stdout.write(output + '\n');
    }
  } else {
    const extra = args.length > 0 ? ' ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ') : '';
    const line = `[${timestamp}] [${label}] ${message}${extra}`;
    pushToBuffer({ timestamp, level: label, message: message + extra });
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}

const logger = {
  info: (msg, ...args) => log('info', msg, ...args),
  warn: (msg, ...args) => log('warn', msg, ...args),
  error: (msg, ...args) => log('error', msg, ...args),
  debug: (msg, ...args) => {
    if (process.env.DEBUG === 'true') log('debug', msg, ...args);
  },
  getLogs: () => [...ringBuffer]
};

module.exports = logger;
