import { Injectable } from '@nestjs/common';
import { Together } from 'together-ai';
@Injectable()
export class chatService {
  private readonly together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  async askAva(prompt: string, role: 'doctor' | 'patient'): Promise<string> {
    const cleanedPrompt = prompt.toLowerCase().trim();

    // Intent detection
    if (cleanedPrompt.includes('book appointment') || cleanedPrompt.includes('schedule appointment')) {
      // TODO: Extract doctor, date, time from prompt (simple regex or LLM call)
      // Example: Book with Dr. Smith on 2024-06-10 at 10:00
      // For now, just return a placeholder
      return 'I can help you book an appointment. Please specify the doctor, date, and time.';
      // Example: Call appointmentsService.create({doctorId, patientId, date, time})
    }
    if (cleanedPrompt.includes('show my records') || cleanedPrompt.includes('medical records') || cleanedPrompt.includes('health records')) {
      // TODO: Fetch patient records from records service
      // For now, just return a placeholder
      return 'Here are your latest medical records: [Sample record 1, Sample record 2]';
      // Example: const records = await recordsService.getByPatientId(patientId)
    }
    if (cleanedPrompt.includes('order medicine') || cleanedPrompt.includes('pharmacy order') || cleanedPrompt.includes('order my prescription')) {
      // TODO: Extract medicine name and quantity
      // For now, just return a placeholder
      return 'I can help you order medicine. Please specify the medicine name and quantity.';
      // Example: Call pharmacyService.createOrder({patientId, medicineId, quantity})
    }

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
      return `Hello! I'm Ava, your Healthcare AI Assistant. I can help you with:
      
• Booking appointments with doctors
• Managing your medical records
• Pharmacy orders and prescriptions
• Payment and billing information
• Finding doctors and specialties
• General health information
• System navigation and features

How can I assist you today?`;
    }

    const allowedKeywords = [
      // Healthcare System Activities
      'appointment',
      'book appointment',
      'schedule appointment',
      'reschedule appointment',
      'cancel appointment',
      'appointment booking',
      'doctor appointment',
      'consultation',
      'medical consultation',
      
      // Medical Records
      'medical records',
      'health records',
      'patient records',
      'medical history',
      'download records',
      'view records',
      'medical file',
      'health file',
      
      // Pharmacy & Medicines
      'pharmacy',
      'pharmacy orders',
      'medicine orders',
      'prescription',
      'medicines',
      'medication',
      'drug',
      'tablet',
      'capsule',
      'injection',
      'dosage',
      'prescribe',
      'order medicine',
      'pharmacy payment',
      
      // Payments & Billing
      'payment',
      'payments',
      'billing',
      'bill',
      'cost',
      'price',
      'payment history',
      'payment method',
      'paystack',
      'online payment',
      'medical bill',
      
      // Doctors & Specialists
      'doctor',
      'doctors',
      'specialist',
      'specialization',
      'find doctor',
      'doctor list',
      'available doctors',
      'doctor availability',
      'specialty',
      'specialties',
      
      // System Features
      'dashboard',
      'overview',
      'patient dashboard',
      'admin dashboard',
      'doctor dashboard',
      'pharmacist dashboard',
      'settings',
      'profile',
      'account',
      'login',
      'register',
      'sign up',
      'sign in',
      
      // Health Information
      'symptom',
      'symptoms',
      'diagnosis',
      'treatment',
      'therapy',
      'procedure',
      'surgery',
      'operation',
      'checkup',
      'test',
      'scan',
      'x-ray',
      'mri',
      'ct scan',
      'ultrasound',
      'blood test',
      'urine test',
      'lab test',
      'laboratory',
      'results',
      
      // General Medical Terms
      'hospital',
      'clinic',
      'medicine',
      'medication',
      'vaccine',
      'vaccination',
      'pain',
      'fever',
      'cough',
      'headache',
      'blood pressure',
      'heart rate',
      'temperature',
      'sick',
      'ill',
      'disease',
      'illness',
      'cure',
      'treat',
      'remedy',
      'healing',
      'recovery',
      'ward',
      'admission',
      'discharge',
      'referral',
      'follow-up',
      
      // Swahili Healthcare Terms
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
      'kutibu',
      'kupona',
      'ugonjwa',
      'malipo',
      'bei',
      'gharama',
      'lipa',
      'pesa',
      
    ];

    const medicalRegex =
  /\b(test|scan|profile|procedure|surgery|symptom|treatment|medication|disease|illness|lab|dose|x[- ]?ray|mri|ct|clinic|hospital|cure|remedy|therapy|treat|healing|flu|malaria|asthma|covid|diabetes|appointment|booking|schedule|medical|records|pharmacy|payment|doctor|dashboard|overview|settings|profile|account|login|register|sign|up|in|malipo|bei|gharama|lipa|pesa|miadi|daktari|homa|maumivu|dawa|madawa|hôpital|clinique|pharmacie|médicament|rendez-vous|consultation|médecin|paiement|facture|coût|prix)\b/i;

    const isRelevant =
      allowedKeywords.some((kw) => cleanedPrompt.includes(kw)) ||
      medicalRegex.test(cleanedPrompt);

    if (!isRelevant) {
      return `I'm your Healthcare AI Assistant and I can help you with:

🔹 **Appointments**: Book, reschedule, or cancel appointments
🔹 **Medical Records**: View and download your health records
🔹 **Pharmacy**: Order medicines and track prescriptions
🔹 **Payments**: Handle billing and payment information
🔹 **Doctors**: Find specialists and check availability
🔹 **Dashboard**: Navigate system features and settings
🔹 **Health Info**: Get medical information and advice

Please ask about any of these healthcare system activities or general health questions. I support English and Kiswahili.`;
    }

    const systemPrompt =
      this.buildSystemPrompt(role) +
      ` Respond in the same language the user asked in. Support English, French, and Kiswahili. Focus on healthcare system activities and features.`;

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
        return `You are Ava, a clinical AI assistant for doctors in the healthcare system. You can help with:

🔹 **Patient Management**: View patient records, medical history, and appointments
🔹 **Appointment Management**: Schedule, reschedule, and manage patient consultations
🔹 **Medical Records**: Create, update, and access patient medical records
🔹 **Prescriptions**: Write and manage prescriptions for patients
🔹 **Diagnosis Support**: Analyze symptoms and suggest diagnostic tests
🔹 **Treatment Plans**: Recommend treatment options and follow-up care
🔹 **System Navigation**: Help with dashboard features and system usage

Be medically sound, concise, and confident. Focus on healthcare system activities and patient care.`;
      
      case 'lab':
        return `You are Ava, a smart hospital lab advisor. You can help with:

🔹 **Lab Procedures**: Suggest appropriate lab tests and procedures
🔹 **Specimen Requirements**: Provide guidance on sample collection
🔹 **Test Results**: Help interpret and explain lab results
🔹 **Urgency Recommendations**: Advise on test priority and timing
🔹 **Lab Orders**: Assist with test ordering and scheduling
🔹 **Quality Control**: Ensure proper lab protocols and standards

Focus on laboratory services and diagnostic testing within the healthcare system.`;
      
      case 'pharmacy':
        return `You are Ava, the hospital's AI pharmacist. You can help with:

🔹 **Medication Orders**: Process and manage pharmacy orders
🔹 **Prescription Review**: Check prescriptions for accuracy and safety
🔹 **Dosage Guidance**: Provide dosage and administration instructions
🔹 **Drug Interactions**: Check for potential drug interactions
🔹 **Side Effects**: Explain medication side effects and precautions
🔹 **Inventory Management**: Track medicine availability and stock
🔹 **Payment Processing**: Handle pharmacy payments and billing

Focus on pharmaceutical services and medication management within the healthcare system.`;
      
      case 'finance':
        return `You are Ava, the hospital billing assistant. You can help with:

🔹 **Cost Estimates**: Provide treatment and procedure cost estimates
🔹 **Payment Processing**: Handle online payments and Paystack integration
🔹 **Billing Inquiries**: Answer questions about medical bills and charges
🔹 **Insurance**: Assist with insurance claims and coverage
🔹 **Payment History**: Track payment records and transactions
🔹 **Financial Reports**: Generate billing and revenue reports
🔹 **Refund Processing**: Handle payment refunds and adjustments

Focus on financial services and billing within the healthcare system.`;
      
      case 'patient':
      default:
        return `You are Ava, a friendly AI health assistant for patients. You can help with:

🔹 **Appointment Booking**: Schedule, reschedule, or cancel appointments with doctors
🔹 **Medical Records**: View and download your health records and medical history
🔹 **Pharmacy Orders**: Order medicines and track prescription status
🔹 **Payment Management**: Handle billing, payments, and payment history
🔹 **Doctor Search**: Find available doctors and check their specialties
🔹 **Health Information**: Get medical advice and symptom explanations
🔹 **System Navigation**: Help with dashboard features and account settings
🔹 **Emergency Guidance**: Provide basic emergency medical information

Be caring, helpful, and focus on patient-centered healthcare system activities. Explain medical terms in simple language.`;
    }
  }
}