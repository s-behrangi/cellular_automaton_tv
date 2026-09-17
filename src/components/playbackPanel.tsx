import React from 'react';
import { useRef, useState, type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';

interface playbackPanelProps{
    simulation: Automaton,
    cRef: RefObject<HTMLCanvasElement | null>
}

const PlaybackPanel: React.FC<playbackPanelProps> = ({
    simulation,
    cRef,
}) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [isRecording, setIsRecording] = useState<boolean>(false);

    const useCRT = useAutomatonStore((s) => s.useCRT);
    const setUseCRT = useAutomatonStore((s) => s.setUseCRT);

    const toggleRecording = () => {
        setIsRecording((recording: boolean) => {
            if (recording) {
                mediaRecorderRef.current?.stop()!;
                setIsRecording(false);
            } else {
                chunksRef.current = [];

                const stream = cRef.current?.captureStream(30)!;

                const mediaRecorder = new MediaRecorder(stream, {
                    videoBitsPerSecond: 12_000_000,
                    mimeType: 'video/webm;codecs=vp9',
                })

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0){
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    downloadFile(url, 'video.webm');
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setTimeout(() => {
                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                }, 30_000);
            }
            return ! recording;
        })
    }

    const screenshot = () => {
        const dataUrl = cRef.current?.toDataURL()!;
        downloadFile(dataUrl, 'screenshot.png');
    }

    const downloadFile = (url: string, filename: string) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
    
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    
    return <div className="panel-horizontal">
        <div className="control-column playback-column">
            <button onClick={() => toggleRecording()}>&#128308;</button>
            <button onClick={() => simulation.stepSim()}>&#8658;</button>
            <button onClick={() => simulation.togglePlay()}>&#9199;</button>
            <button onClick={screenshot}>&#x1F4F7;</button>
            <button onClick={() => setUseCRT(!useCRT)}>CRT</button>
        </div>
    </div>
};

export default React.memo(PlaybackPanel);