import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  audios?: string[];
  error?: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const audioDir = path.join(process.cwd(), 'public', 'audios');

  if (req.method === 'GET') {
    try {
      const files = fs.readdirSync(audioDir);

      const audioFiles = files
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          return {
            file,
            createdAt: stats.birthtime, 
          };
        });


      const sortedAudioFiles = audioFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const audioUrls = sortedAudioFiles.map(file => `/audios/${file.file}`);

      res.status(200).json({ audios: audioUrls });
    } catch (error) {
      res.status(500).json({ error: 'Erro 500' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Erro 405 ${req.method} `);
  }
}
