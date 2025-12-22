export class CreateLifestyleLogDto {
  patientId: string;
  type: 'diet' | 'exercise' | 'sleep' | 'other';
  details: string;
}
