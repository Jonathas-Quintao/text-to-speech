import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { v4 as uuid } from 'uuid';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const AUDIO_DIR = 'public/audios';

if (!existsSync(AUDIO_DIR)) {
  mkdirSync(AUDIO_DIR);
}

// Tipos para o corpo da requisição
interface TextToSpeechRequest {
  text: string;
  voiceId: string;
}

// Tipos para a resposta da API
interface ApiResponse {
  fileName?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method === 'POST') {
    try {
      const { text, voiceId }: TextToSpeechRequest = req.body;
        
      if (!text || !voiceId) {
        return res.status(400).json({ error: 'Requisição em branco' });
      }

      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      console.log(url)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': `${ELEVEN_API_KEY}`,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
        }),
      });
    //   console.log('Response:', response);

    //   console.log('Response status:', response.status);
    //   console.log('Response body:', await response.text());

      if (!response.ok) {
        throw new Error(`Error de API: ${response.statusText}`);
      }

      const audioStream = response.body;

      if (!audioStream) {
        throw new Error('Deu erro ao obter o fluxo de áudio');
      }

      const fileName = `${AUDIO_DIR}/${uuid()}.mp3`;
      const fileStream = createWriteStream(fileName);

      audioStream.pipe(fileStream);

      fileStream.on('finish', () => res.status(200).json({ fileName }));
      fileStream.on('error', (err) => res.status(500).json({ error: err.message }));

    } catch (error) {
      console.error('Erro:', error); // Adicione um log para mais detalhes
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
