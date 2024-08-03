"use client"
import { Button, ConfigProvider, Tooltip } from "antd";
import { PlayCircleFilled } from '@ant-design/icons';
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface Voice {
  name: string;
  category: string;
  preview_url:string;
  labels: {
    description: string;
    age: string;
    gender: string;
    accent: string;
    use_case: string;
  };
  description: string;
}

export default function Voices() {
  const router = useRouter();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        const data = await response.json();
        if (response.ok) {
          setVoices(data.voices);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Deu erro");
      } finally {
        setLoading(false);
      }
    }
    fetchVoices();
  }, []);
  const playAudio = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      
    }
  }

  const handlePage = (path: string) => {
    router.push(path);
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F76F00',
          borderRadius: 5,
        },
      }}
    >
      <div className={styles.container}>
        <div className={styles.selectFunction}>
          <Button type="primary" className={styles.mainBtn} onClick={() => handlePage("/")}>Vozes</Button>
          <Button type="primary" className={styles.mainBtn} onClick={() => handlePage("/converts")}>Texto para voz</Button>
          
        </div>

        <div className={styles.voiceInfo}>
          {loading ? (
            <p>Loading voices...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <ul className={styles.list}>
              {voices.map((voice) => (
                <li key={voice.name} className={styles.voice}>
                <span className={styles.name}>{voice.name} </span> 
                <div className={styles.labelsContainer}>
                  <span className={styles.label}>Categoria: {voice.category}</span> 
                  <span className={styles.label}>Descrição: {voice.labels.description}</span> 
                  <span className={styles.label}>Idade: {voice.labels.age}</span> 
                  <span className={styles.label}>Acento: {voice.labels.accent}</span> 
                  <span className={styles.label}>Gênero: {voice.labels.gender}</span> 
                  <span className={styles.label}>Caso de uso: {voice.labels.use_case}</span> 
                   
                </div>
                
                  <Button
                    className={styles.btnPrimary}
                    type="primary"
                    shape="circle"
                    onClick={() => playAudio(voice.preview_url)}
                    icon={<PlayCircleFilled />}
                  />
                
              </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}
