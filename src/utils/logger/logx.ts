import * as util from "util";

// ANSI color codes
const colorReset = "\u001b[0m";
const colorRed = "\u001b[31m";
const colorGreen = "\u001b[32m";
const colorYellow = "\u001b[33m";
const colorBlue = "\u001b[34m";
const colorPurple = "\u001b[35m";
const colorCyan = "\u001b[36m";
const colorWhite = "\u001b[37m";
const boldRed = "\u001b[1;31m";
const boldGreen = "\u001b[1;32m";
const boldYellow = "\u001b[1;33m";
const boldBlue = "\u001b[1;34m";
const boldPurple = "\u001b[1;35m";
const boldCyan = "\u001b[1;36m";
const boldWhite = "\u001b[1;37m";

// Logger level types
type LogLevel = "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "FATAL" | "TRACE";

class ColoredFormatter {
  private colors: Record<LogLevel, string> = {
    INFO: boldBlue,
    WARNING: boldYellow,
    ERROR: boldRed,
    SUCCESS: boldGreen,
    FATAL: boldRed,
    TRACE: boldPurple,
  };

  format(level: LogLevel, message: string): string {
    const logColor = this.colors[level] || colorWhite;
    return `${logColor}${level}${colorReset}: ${message}`;
  }
}

class Logger {
  private formatter: ColoredFormatter;

  constructor() {
    this.formatter = new ColoredFormatter();
  }

  info(msg: string): void {
    console.log(this.formatter.format("INFO", msg));
  }

  warning(msg: string): void {
    console.log(this.formatter.format("WARNING", msg));
  }

  error(msg: string): void {
    console.log(this.formatter.format("ERROR", msg));
  }

  success(msg: string): void {
    console.log(this.formatter.format("SUCCESS", msg));
  }

  critical(msg: string): void {
    console.log(this.formatter.format("FATAL", msg));
  }
}

// Configure logger
const logger = new Logger();

interface StackFrame {
  filename: string;
  lineno: number;
  name: string;
}

function getCallerInfo(depth: number = 3): StackFrame {
  const err = new Error();
  const stack = err.stack?.split("\n")[depth];

  // Simple regex to extract filename, line number and function name
  const matches =
    stack?.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
    stack?.match(/at\s+(.*):(\d+):(\d+)/);

  if (matches && matches.length >= 4) {
    return {
      name: matches[1] || "anonymous",
      filename: matches[2] || matches[1],
      lineno: parseInt(matches[3], 10),
    };
  }

  return {
    name: "unknown",
    filename: "unknown",
    lineno: 0,
  };
}

function functionLogger(color: string, depth: number = 4): void {
  const stack = getCallerInfo(depth);
  const path = `${stack.filename}:${stack.lineno}`;

  const funcPath = stack.name;
  logger.info(`${color}Function: ${funcPath} at ${path}${colorReset}`);
}

function logInfo(msg: string): void {
  logger.info(msg);
}

function logWarning(msg: string, depth: number = 4): void {
  logger.warning(`${colorYellow}${msg}${colorReset}`);
  functionLogger(boldYellow, depth);
}

function logError(err: string, depth: number = 4): void {
  logger.error(`${colorRed}${err}${colorReset}`);
  functionLogger(boldRed, depth);
}

function logSqlError(err: string, depth: number = 4): void {
  logger.error(`${boldRed}SQL - ${colorReset}${colorRed}${err}${colorReset}`);
  functionLogger(boldRed, depth);
}

function logSuccess(msg: string): void {
  logger.info(`${colorGreen}${msg}${colorReset}`);
}

function logFatal(msg: string): void {
  logger.critical(msg);
  process.exit(1);
}

function logFatalErr(msg: string, err: any): void {
  logger.critical(`${msg}: ${err}`);
  process.exit(1);
}

export {
  colorReset,
  colorRed,
  colorGreen,
  colorYellow,
  colorBlue,
  colorPurple,
  colorCyan,
  colorWhite,
  boldRed,
  boldGreen,
  boldYellow,
  boldBlue,
  boldPurple,
  boldCyan,
  boldWhite,
  functionLogger,
  logInfo,
  logWarning,
  logError,
  logSqlError,
  logSuccess,
  logFatal,
  logFatalErr,
};
