import React from 'react';
import { type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import DiagonalSwitchColumn from './diagonalSwitchColumn.tsx';
import ControlCluster from './controlCluster.tsx';
import './playbackPanel.css'
import SeesawSwitch from './inputDevices/seesawSwitch.tsx';

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
    
    return <div className="panel-horizontal playback-panel">
                <div className="control-column">
                    <div className="input-with-label"> 
                        <span>CRT</span>
                        <SeesawSwitch 
                            onChange={setUseCRT}
                            value={useCRT}
                            toggle={true}
                        />
                    </div>
                    <DiagonalSwitchColumn 
                        simulation={simulation}
                        cRef={cRef}
                    />
                    <ControlCluster
                        simulation={simulation}
                    />
                </div>
            </div>
};

export default React.memo(PlaybackPanel);