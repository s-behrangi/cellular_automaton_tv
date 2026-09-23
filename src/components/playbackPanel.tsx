import React from 'react';
import { type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import DiagonalSwitchColumn from './diagonalSwitchColumn.tsx';
import ControlCluster from './controlCluster.tsx';
import './playbackPanel.css'

interface playbackPanelProps{
    simulation: Automaton,
    cRef: RefObject<HTMLCanvasElement | null>
}

const PlaybackPanel: React.FC<playbackPanelProps> = ({
    simulation,
    cRef,
}) => {
    const useCRT = useAutomatonStore((s) => s.useCRT);
    const setUseCRT = useAutomatonStore((s) => s.setUseCRT);

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
    
    return <div className="panel-horizontal playback-panel">
                <div className="control-column">
                    
                    <DiagonalSwitchColumn 
                        simulation={simulation}
                        cRef={cRef}
                    />
                    <div className="control-column playback-column">
                        <button onClick={screenshot}>&#x1F4F7;</button>
                        <button onClick={() => setUseCRT(!useCRT)}>CRT</button>
                    </div>
                    <ControlCluster
                        simulation={simulation}
                    />
                </div>
            </div>
};

export default React.memo(PlaybackPanel);