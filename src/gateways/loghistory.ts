import { LogService } from '../services/logService';

export class LogController {
  constructor(private readonly logService: LogService) {}

  async createLog(req: any, res: any): Promise<void> {
    const { eventType, payload, source } = req.body;
    await this.logService.createLog(eventType, payload, source);
    res.status(201).send({ message: 'Log created successfully' });
  }


  async deleteLog(req: any, res: any): Promise<void> {
    await this.logService.deleteLogById(req.params.id);
    res.status(200).send({ message: 'Log deleted successfully' });
  }
}
