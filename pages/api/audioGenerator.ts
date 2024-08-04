import { IncomingForm } from 'formidable';
import { v4 as uuid } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob'; 


interface TextToSpeechRequest {
  text: string;
  voiceId: string;
}


interface ApiResponse {
  fileName?: string;
  error?: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method === 'POST') {
    try {
      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao processar o formulário' });
        }

        const { text, voiceId }: TextToSpeechRequest = fields as any; 

        if (!text || !voiceId) {
          return res.status(400).json({ error: 'Requisição em branco' });
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
          }),
        });

        if (!response.ok) {
          throw new Error(`Error de API: ${response.statusText}`);
        }

        const audioStream = response.body;

        if (!audioStream) {
          throw new Error('Deu erro ao obter o fluxo de áudio');
        }

        const fileName = `${uuid()}.mp3`;
        

        const blob = await put(fileName, audioStream, {
          access: 'public',
        });

        res.status(200).json({ fileName: blob.url });
      });
    } catch (error) {
      console.error('Erro:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro 500' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Método não permitido');
  }
}
