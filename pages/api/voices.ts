import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      try {
        const apiUrl = 'https://api.elevenlabs.io/v1/voices';

  
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        
        if (!response.ok) {
          const responseBody = await response.text();
          throw new Error(`Erro: Status: ${response.status}. Response: ${responseBody}`);
        }
  
        const data = await response.json();
        const voices = data.voices.map((voice: any) => ({
          name: voice.name,
          id: voice.voice_id,
          category: voice.category,
          labels: voice.labels,
          description: voice.description,
          preview_url: voice.preview_url,
        }));
  
        res.status(200).json({ voices });
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Erro 500' });
        }
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Erro 405 ${req.method} `);
    }
  }
