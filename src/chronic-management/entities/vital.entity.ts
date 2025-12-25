export class Vital {
  id: string;
  patientId: string;
  type: 'blood_pressure' | 'glucose' | 'weight' | 'other';
  value: string;
  timestamp: Date;
}
