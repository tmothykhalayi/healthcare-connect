export class CreateVitalDto {
  patientId: string;
  type: 'blood_pressure' | 'glucose' | 'weight' | 'other';
  value: string;
}
