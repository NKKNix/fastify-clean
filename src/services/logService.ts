// /src/application/services/LogService.ts
import { LogEntry } from "../domain/entities/LogEntry";
import { LogRepository } from "../domain/repositories/LogRepository";


export class LogService {
  constructor(private readonly logRepository: LogRepository) {}

  // Method สำหรับสร้าง log ใหม่
  async createLog(eventType: string, payload: any, source: string): Promise<void> {
    const log: LogEntry = {
      id: generateUniqueId(),
      timestamp: new Date(),
      eventType,
      payload,
      source,
    };
    await this.logRepository.create(log);
  }
  // Method สำหรับลบ log ตาม ID
  async deleteLogById(id: string): Promise<void> {
    await this.logRepository.deleteById(id);
  }
}

// ฟังก์ชันที่สร้าง ID แบบสุ่มหรือใช้ UUID
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}
