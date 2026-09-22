import React from 'react';
import { useRef, useState, type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import DiagonalSwitch from './inputDevices/diagonalSwitch.tsx';

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

    const framerate = useAutomatonStore((s) => s.framerate);
    const setFramerate = useAutomatonStore((s) => s.setFramerate);

    const isPlaying = useAutomatonStore((s) => s.isPlaying);
    const setIsPlaying = useAutomatonStore((s) => s.setIsPlaying);

    const handleStep = () => {
        console.log("handling it");
        setIsPlaying(false);
        simulation.stepSim();
    }

    const toggleRecording = (val: boolean) => {
        setIsRecording((recording: boolean) => {
            console.log(val, recording);
            if (!val) {
                console.log("stopped")
                if (!mediaRecorderRef.current) {
                    return false;
                }
                mediaRecorderRef.current?.stop()!;
                //setIsRecording(false);
            } else if (val){
                console.log("started")
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
            <div className="control-row">
                <span>&#128308;</span>
                <DiagonalSwitch 
                    onChange={(val: boolean) => toggleRecording(val)}
                    defaultValue={isRecording}
                    toggle={true}
                />
            </div>
            <div className="control-row">
                <span>&#8658;</span>
                <DiagonalSwitch 
                    onChange={(val: boolean) => val ? handleStep() : null}
                    defaultValue={false}
                    toggle={false}
                />
            </div>
            <div className="control-row">
                <span>&#9199;</span>
                <DiagonalSwitch 
                    key={isPlaying ? "a" : "b"}
                    onChange={setIsPlaying}
                    defaultValue={isPlaying}
                    toggle={true}
                />
            </div>
            <button onClick={screenshot}>&#x1F4F7;</button>
            <button onClick={() => setUseCRT(!useCRT)}>CRT</button>
            <button onClick={() => setFramerate(simulation.changeFramerate(1))}>&#9650;</button>
            <span>{framerate}</span>
            <button onClick={() => setFramerate(simulation.changeFramerate(-1))}>&#9660;</button>
        </div>
    </div>
};

export default React.memo(PlaybackPanel);