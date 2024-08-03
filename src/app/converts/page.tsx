"use client";
import { Button, ConfigProvider, Select, Tooltip } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import styles from "./converts.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Tipagem para a voz
export interface Voice {
  id: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [audios, setAudios] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch("/api/voices");
        const data = await response.json();
        if (response.ok) {
          setVoices(data.voices);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Deu erro");
      }
    };

    const fetchAudios = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/savedAudiosApi");
        const data = await response.json();
        if (response.ok) {
          setAudios(data.audios || []);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Failed to fetch audio files");
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
    fetchAudios();
  }, [generatedAudio]);

  const handlePage = (path: string) => {
    router.push(path);
  };

  const handleGenerateAudio = async () => {
    try {
      const response = await fetch("/api/audioGenerator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voiceId: selectedVoice }), // Use voiceId
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Audio file created:", data.fileName);
        setGeneratedAudio(data.fileName);
      } else {
        console.error("Error creating audio file:", data.error);
      }
    } catch (error) {
      console.error("Error creating audio file:", error);
    }
  };

  const handlePlayAudio = (url: string) => {
    const audio = new Audio(url);
    console.log(audio);

    audio.onerror = (error) => {
      console.error("Erro ao reproduzir áudio:", error);
    };

    audio.play();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#F76F00",
          borderRadius: 5,
        },
      }}
    >
      <div className={styles.container}>
        <div className={styles.selectFunction}>
          <Button
            type="primary"
            className={styles.mainBtn}
            onClick={() => handlePage("/")}
          >
            Vozes
          </Button>
          <Button
            type="primary"
            className={styles.mainBtn}
            onClick={() => handlePage("/converts")}
          >
            Texto para voz
          </Button>
        </div>
        <div>
          <TextArea
            autoSize={{ minRows: 2, maxRows: 3 }}
            maxLength={210}
            className={styles.textArea}
            onChange={handleChange}
          />
        </div>
        <div className={styles.sendTxt}>
          <Select
            defaultValue={selectedVoice}
            onChange={(value) => {setSelectedVoice(value)}}
            style={{ width: 200 }}
            options={voices.map((voice) => ({
              value: voice.id,
              label: voice.name,
            }))}
          />
          <Button
            type="primary"
            shape="circle"
            style={{ width: "50px", height: "50px" }}
            icon={<PlayCircleFilled style={{ fontSize: "20px" }} />}
            onClick={handleGenerateAudio}
          />
        </div>
        {loading ? (
          <p>Loading voices...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <ul className={styles.list}>
            {audios.map((audio) => (
              <li key={audio} className={styles.voice}>
                <span className={styles.name}>{audio} </span>
                <Button
                  className={styles.btnPrimary}
                  type="primary"
                  shape="circle"
                  onClick={() => handlePlayAudio(audio)}
                  disabled={playingAudio === audio}
                  icon={<PlayCircleFilled />}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ConfigProvider>
  );
}
