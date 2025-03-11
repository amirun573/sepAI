// import { createLogger, format, transports } from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// /**
//  * 
//  * This code sets up a logger using Winston for logging messages and events in an application. The logger does two things:

// Console Logging: It outputs logs to the console, which is useful for real-time viewing, especially during development.

// File Logging with Rotation: It also saves logs to daily log files:

// Log Rotation: A new log file is created every day (e.g., application-2024-09-18.log).
// File Size Limit: If a log file becomes larger than 20 MB, it will create a new file.
// Log Retention: Only the last 14 days of logs are kept; older logs are deleted automatically.
// Compression: Old log files are compressed (zipped) to save disk space.
// This setup efficiently manages logs by saving them daily, limiting their size, and compressing older files.
//  */

// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp(),
//     format.json()
//   ),
//   transports: [
//     new transports.Console(),
//     new DailyRotateFile({
//       filename: 'logs/application-%DATE%.log',
//       datePattern: 'YYYY-MM-DD',
//       maxSize: '20m',      // Maximum file size before rotating
//       maxFiles: '14d',     // Retain logs for 14 days
//       zippedArchive: true  // Compress old log files
//     }),
//   ],
// })

// export default logger
