import { Injectable } from '@nestjs/common';
import { Together } from 'together-ai';
@Injectable()
export class chatService {
  private readonly together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  async askAva(prompt: string, role: 'doctor' | 'patient'): Promise<string> {
    const cleanedPrompt = prompt.toLowerCase().trim();

    const greetings = [
      'hi',
      'hello',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'bonjour',
      'salut',
      'habari',
      'shikamoo',
    ];
    if (greetings.some((g) => cleanedPrompt.startsWith(g))) {
      return `Hello! I'm Ava, How can I help you today?`;
    }

    const allowedKeywords = [
      // English
      'hospital',
      'clinic',
      'pharmacy',
      'medicine',
      'medication',
      'drug',
      'tablet',
      'capsule',
      'injection',
      'vaccine',
      'vaccination',
      'prescription',
      'dosage',
      'treatment',
      'therapy',
      'procedure',
      'surgery',
      'operation',
      'checkup',
      'diagnosis',
      'symptom',
      'pain',
      'fever',
      'cough',
      'headache',
      'appointment',
      'consultation',
      'doctor',
      'nurse',
      'midwife',
      'lab',
      'laboratory',
      'test',
      'scan',
      'x-ray',
      'mri',
      'ct scan',
      'ultrasound',
      'blood test',
      'urine test',
      'specimen',
      'results',
      'ward',
      'admission',
      'discharge',
      'referral',
      'follow-up',
      'recovery',
      'prescribe',
      'blood pressure',
      'heart rate',
      'temperature',
      'sick',
      'ill',
      'clinic visit',

      // Swahili
      'hospitali',
      'kliniki',
      'dawa',
      'madawa',
      'tembe',
      'sindano',
      'chanjo',
      'chanjo ya kinga',
      'agizo la dawa',
      'kipimo cha dawa',
      'matibabu',
      'tiba',
      'upasuaji',
      'upimaji',
      'vipimo',
      'uchunguzi',
      'dalili',
      'maumivu',
      'homa',
      'kikohozi',
      'kichwa kuuma',
      'miadi',
      'ushauri',
      'daktari',
      'muuguzi',
      'mkunga',
      'maabara',
      'uchunguzi wa damu',
      'uchunguzi wa mkojo',
      'majibu ya vipimo',
      'wodi',
  // English
  'hospital',
  'clinic',
  'pharmacy',
  'medicine',
  'medication',
  'drug',
  'tablet',
  'capsule',
  'injection',
  'vaccine',
  'vaccination',
  'prescription',
  'dosage',
  'treatment',
  'therapy',
  'procedure',
  'surgery',
  'operation',
  'checkup',
  'diagnosis',
  'symptom',
  'pain',
  'fever',
  'cough',
  'headache',
  'appointment',
  'consultation',
  'doctor',
  'nurse',
  'midwife',
  'lab',
  'laboratory',
  'test',
  'scan',
  'x-ray',
  'mri',
  'ct scan',
  'ultrasound',
  'blood test',
  'urine test',
  'specimen',
  'results',
  'ward',
  'admission',
  'discharge',
  'referral',
  'follow-up',
  'recovery',
  'prescribe',
  'blood pressure',
  'heart rate',
  'temperature',
  'sick',
  'ill',
  'clinic visit',
  // NEW (English) – Disease, treatment, cure-related
  'cure',
  'treat',
  'remedy',
  'healing',
  'disease',
  'illness',

  // Swahili
  'hospitali',
  'kliniki',
  'dawa',
  'madawa',
  'tembe',
  'sindano',
  'chanjo',
  'chanjo ya kinga',
  'agizo la dawa',
  'kipimo cha dawa',
  'matibabu',
  'tiba',
  'upasuaji',
  'upimaji',
  'vipimo',
  'uchunguzi',
  'dalili',
  'maumivu',
  'homa',
  'kikohozi',
  'kichwa kuuma',
  'miadi',
  'ushauri',
  'daktari',
  'muuguzi',
  'mkunga',
  'maabara',
  'uchunguzi wa damu',
  'uchunguzi wa mkojo',
  'majibu ya vipimo',
  'wodi',
  'kulazwa',
  'kuruhusiwa',
  'rejea',
  'afya',
  'shinikizo la damu',
  'moyo kupiga',
  'joto la mwili',
  'mgonjwa',
  'maradhi',
  'ziara ya kliniki',
  // NEW (Swahili)
  'kutibu',
  'kupona',
  'ugonjwa',

  // French
  'hôpital',
  'clinique',
  'pharmacie',
  'médicament',
  'médication',
  'comprimé',
  'capsule',
  'injection',
  'vaccin',
  'vaccination',
  'ordonnance',
  'posologie',
  'traitement',
  'thérapie',
  'procédure',
  'chirurgie',
  'opération',
  'examen médical',
  'diagnostic',
  'symptôme',
  'douleur',
  'fièvre',
  'toux',
  'mal de tête',
  'rendez-vous',
  'consultation',
  'médecin',
  'infirmier',
  'sage-femme',
  'laboratoire',
  'analyse',
  'test',
  'prise de sang',
  'analyse d’urine',
  'échantillon',
  'résultats',
  'salle',
  'hospitalisation',
  'sortie',
  'référence',
  'suivi',
  'rétablissement',
  'prescrire',
  'pression artérielle',
  'fréquence cardiaque',
  'température corporelle',
  'malade',
  'maladie',
  'visite médicale',
  // NEW (French)
  'guérir',
  'remède',
  'soigner',

    'kulazwa',
      'kuruhusiwa',
      'rejea',
      'afya',
      'shinikizo la damu',
      'moyo kupiga',
      'joto la mwili',
      'mgonjwa',
      'maradhi',
      'ziara ya kliniki',

      // French
      'hôpital',
      'clinique',
      'pharmacie',
      'médicament',
      'médication',
      'comprimé',
      'capsule',
      'injection',
      'vaccin',
      'vaccination',
      'ordonnance',
      'posologie',
      'traitement',
      'thérapie',
      'procédure',
      'chirurgie',
      'opération',
      'examen médical',
      'diagnostic',
      'symptôme',
      'douleur',
      'fièvre',
      'toux',
      'mal de tête',
      'rendez-vous',
      'consultation',
      'médecin',
      'infirmier',
      'sage-femme',
      'laboratoire',
      'analyse',
      'test',
      'prise de sang',
      'analyse d’urine',
      'échantillon',
      'résultats',
      'salle',
      'hospitalisation',
      'sortie',
      'référence',
      'suivi',
      'rétablissement',
      'prescrire',
      'pression artérielle',
      'fréquence cardiaque',
      'température corporelle',
      'malade',
      'maladie',
      'visite médicale',
    ];

    const medicalRegex =
  /\b(test|scan|profile|procedure|surgery|symptom|treatment|medication|disease|illness|lab|dose|x[- ]?ray|mri|ct|clinic|hospital|cure|remedy|therapy|treat|healing|flu|malaria|asthma|covid|diabetes)\b/i;

    const isRelevant =
      allowedKeywords.some((kw) => cleanedPrompt.includes(kw)) ||
      medicalRegex.test(cleanedPrompt);

    if (!isRelevant) {
      return `I'm only able to assist with hospital, medical, or pharmacy-related topics. Please ask a relevant question (English, French, or Kiswahili supported).`;
    }

    const systemPrompt =
      this.buildSystemPrompt(role) +
      ` Respond in the same language the user asked in. Support English, French, and Kiswahili.`;

    try {
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      });

      return (
        response.choices?.[0]?.message?.content ??
        'Sorry, Ava was unable to respond.'
      );
    } catch (error) {
      console.error('Ava AI (TogetherAI) Error:', error);
      return 'Sorry, Ava is currently unavailable. Please try again later.';
    }
  }

  private buildSystemPrompt(role: string): string {
    switch (role) {
      case 'doctor':
        return `You are Ava, a clinical AI assistant for doctors. Analyze symptoms, patient history, and suggest accurate diagnoses, tests, and treatment plans. Be medically sound, concise, and confident.`;
      case 'lab':
        return `You are Ava, a smart hospital lab advisor. Based on cases or test orders, suggest appropriate lab procedures, specimen requirements, and urgency recommendations.`;
      case 'pharmacy':
        return `You are Ava, the hospital's AI pharmacist. Suggest appropriate medications, dosages, instructions, and safety checks based on diagnoses or symptoms.`;
      case 'finance':
        return `You are Ava, the hospital billing assistant. Help explain medical costs, estimate treatment prices, and assist the finance team with clarity.`;
      case 'patient':
      default:
        return `You are Ava, a friendly AI health assistant for patients. Explain symptoms, procedures, medications, and care processes in clear, simple language. Be caring and helpful.`;
    }
  }
}