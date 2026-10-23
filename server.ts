import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint 1: Transcribe Audio using model gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Mangler lyddata (audioBase64)' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transkriber denne lydoptagelse ordret. Returner kun de talte ord uden ekstra kommentarer (sandsynligvis på dansk eller engelsk).',
          },
        ],
      },
    });

    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Fejl ved transskribering:', err);
    res.status(500).json({ error: err.message || 'Transskribering mislykkedes' });
  }
});

// Endpoint 2: Search Grounded Freezer Advice using gemini-3.8-flash with googleSearch tool
app.post('/api/search-advice', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Mangler søgeforespørgsel (query)' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Du er en ekspert i fødevaresikkerhed og frysning. Søg efter opdateret og pålidelig viden på Google (f.eks. fra Fødevarestyrelsen, Samvirke, DTU Fødevareinstituttet eller USDA FoodKeeper) og svar på dansk på følgende spørgsmål om frysning, holdbarhed eller optøning:\n\n"${query}"\n\nGiv konkrete tidsrammer (måneder i fryseren), tips mod frostskader og sikker optøning. Hold svaret overskueligt, venligt og direkte anvendeligt.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Webkilde',
        url: chunk.web?.uri || '',
      })) || [];

    res.json({
      text: response.text || 'Ingen oplysninger fundet.',
      sources,
    });
  } catch (err: any) {
    console.error('Fejl ved søgning:', err);
    res.status(500).json({ error: err.message || 'Søgning mislykkedes' });
  }
});

// Mount Vite middlewares in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`FrostVault server kører på http://localhost:${PORT}`);
  });
}

startServer();
