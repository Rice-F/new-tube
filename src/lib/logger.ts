import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.align(),
  format.printf(({ level, timestamp, message }) => `${level}: [${timestamp}]: ${message}`)
);

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",  // 日志文件路径和命名
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,               // 是否压缩归档
  maxSize: "20m",                   // 单个日志文件最大20MB
  maxFiles: "14d",                  // 保留14天日志
  level: "info",                   // 记录 info 及以上级别日志
});

const logger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console(),       // 控制台输出
    dailyRotateFileTransport        // 文件输出
  ],
  exitOnError: false,
});

export default logger;
