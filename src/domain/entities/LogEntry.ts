// /src/domain/entities/LogEntry.ts
export interface LogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  payload: any; // ข้อมูลที่เกี่ยวข้องกับ event
  source: string; // เช่น ชื่อระบบที่ส่ง event หรือผู้ใช้
}
