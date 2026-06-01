import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // Initialize server-side Gemini Client with modern @google/genai SDK
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  // API endpoint for AI Game Design assistant
  app.post('/api/chat-gdd', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'المحتوى المرسل فارغ. يرجى إرسال استشارتك.' });
    }

    if (!ai) {
      return res.status(500).json({ 
        error: 'لم يتم العثور على مفتاح GEMINI_API_KEY في النظام.',
        reply: 'عذراً يا كوتش، يبدو أن مفتاح الـ API للذكاء الاصطناعي لم يتم ضبطه في إعدادات النادي السرية (Secrets) حتى الآن. سأسرد المخطط الفني يدوياً لمساعدتكم!' 
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'أنت رئيس مصممي لطور مهنة المدرب (Lead Game Designer) في شركة تطوير ألعاب كروية عملاقة. تساعد المطورين والمهندسين في فهم وصياغة آليات ومعادلات رياضية وكوابيس الانتقالات وإدارة الفريق لطور "مهنة المدرب" الواقعي والمستوحى من أساليب ومميزات [FC 26]. نبرة صوتك احترافية، تحليلية، أكاديمية، وموضوعية بالكامل. اكتب دائماً باللغة العربية الفصحى البليغة، ودعّم إجاباتك عند الحاجة بمعادلات برمجية، شيفرات JSON مألوفة، جداول أو مقارنات واقعية لتسهيل التطبيق والتطوير البرمجي المباشر.'
        }
      });

      const replyText = response.text || 'لا يمكن استخلاص رد فني في الوقت الحالي.';
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ 
        error: error.message || 'حدث خطأ غير متوقع أثناء استدعاء الذكاء الاصطناعي.',
        reply: 'عذراً يا كوتش، يبدو أن هناك ضغطاً مؤقتاً على خوادم التصميم الفني. يمكنك الاستعانة بخطط التطوير والأداة التفاعلية المدمجة في الألسنة الأخرى مرحلياً!'
      });
    }
  });

  // Vite middleware for assets serving in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode - Mounting Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode - Serving static assets out of /dist');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical Error on starting backend server:', err);
});
