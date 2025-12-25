export class LifestyleLog {
  id: string;
  patientId: string;
  type: 'diet' | 'exercise' | 'sleep' | 'other';
  details: string;
  timestamp: Date;
}
