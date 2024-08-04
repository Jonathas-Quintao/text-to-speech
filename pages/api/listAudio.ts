import { list } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
     const result = await list({});
 
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files' });
  }
}
