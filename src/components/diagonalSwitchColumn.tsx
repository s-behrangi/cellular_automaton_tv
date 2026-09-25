import React from 'react';
import { useRef, useState, type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import DiagonalSwitch from './inputDevices/diagonalSwitch.tsx';
import './diagonalSwitchColumn.css';

interface diagonalSwitchColumnProps{
    simulation: Automaton,
    cRef: RefObject<HTMLCanvasElement | null>
}

const DiagonalSwitchColumn: React.FC<diagonalSwitchColumnProps> = ({
    simulation,
    cRef,
}) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [isRecording, setIsRecording] = useState<boolean>(false);

    const isPlaying = useAutomatonStore((s) => s.isPlaying);
    const setIsPlaying = useAutomatonStore((s) => s.setIsPlaying);

    const handleStep = () => {
        setIsPlaying(false);
        simulation.stepSim();
    }

    const screenshot = () => {
        const dataUrl = cRef.current?.toDataURL()!;
        downloadFile(dataUrl, 'screenshot.png');
    }

    const toggleRecording = (val: boolean) => {
        setIsRecording((recording: boolean) => {
            if (!val) {
                if (!mediaRecorderRef.current) {
                    return false;
                }
                mediaRecorderRef.current?.stop()!;
            } else if (val){
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

    const downloadFile = (url: string, filename: string) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
    
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    
    return <div className="diagonal-switch-column">
        <div className="dummy-diagonal-switch top" />
        <div className="diagonal-switch-column-main">
            <div className="diagonal-switch-column-left">
                <div className="diagonal-switch-column-left-runner" />
                <div className="diagonal-switch-column-labels">
                    <span>PNG</span>
                    <span>&#128308;</span>
                    <span>&#8658;</span>
                    <span className="play-pause">&#9199;</span>
                </div>
            </div>
            <div className="diagonal-switch-column-switches">
                <DiagonalSwitch 
                    onChange={(val: boolean) => val ? screenshot() : null}
                    defaultValue={false}
                    toggle={false}
                />
                <DiagonalSwitch 
                    onChange={(val: boolean) => toggleRecording(val)}
                    defaultValue={isRecording}
                    toggle={true}
                />
                <DiagonalSwitch 
                    onChange={(val: boolean) => val ? handleStep() : null}
                    defaultValue={false}
                    toggle={false}
                />
                <DiagonalSwitch 
                    key={isPlaying ? "a" : "b"}
                    onChange={setIsPlaying}
                    defaultValue={isPlaying}
                    toggle={true}
                />
            </div>
        </div>
        <div className="diagonal-switch-column-bottom">
            <div className="dummy-diagonal-switch bottom" />
            <div className="dummy-diagonal-switch bottom-left" />
        </div>
    </div>
};

export default React.memo(DiagonalSwitchColumn);