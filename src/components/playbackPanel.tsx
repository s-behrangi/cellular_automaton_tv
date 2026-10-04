import React from 'react';
import { type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import DiagonalSwitchColumn from './diagonalSwitchColumn.tsx';
import ControlCluster from './controlCluster.tsx';
import './playbackPanel.css'
import SeesawSwitch from './inputDevices/seesawSwitch.tsx';
import gavazn from '../assets/gavazn.svg';
import PushButton from './inputDevices/pushButton.tsx';

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

    const ruleDraw = useAutomatonStore((s) => s.ruleDraw);
    const setRuleDraw = useAutomatonStore((s) => s.setRuleDraw);
    
    const fullscreen = useAutomatonStore((s) => s.fullscreen);
    const setFullscreen = useAutomatonStore((s) => s.setFullscreen);

    return <div className="panel-horizontal playback-panel">
                <div key={fullscreen ? 1 : 0} id="fullscreen-button" className='input-with-label'>
                    <span>FullScreen</span>
                    <PushButton 
                        onChange={(val: boolean) => val ? setFullscreen(true) : null}
                        toggle={false}
                        value={fullscreen}
                    />
                </div>

                <DiagonalSwitchColumn 
                    simulation={simulation}
                    cRef={cRef}
                />
                
                <div id="logo-cluster">
                    <img src={gavazn} alt="Gavazn 313" id="gavazn-logo"/>
                    <span id="logo-subtitle">Cellular Automata</span>
                </div>

                <ControlCluster
                    simulation={simulation}
                />

                <div className="control-column" id="playback-toggles">
                    <div className="input-with-label"> 
                        <span>RULE VIS</span>
                        <SeesawSwitch 
                            onChange={setRuleDraw}
                            value={ruleDraw}
                            toggle={true}
                            onOffMarks={true}
                        />
                    </div>
                    <div className="input-with-label"> 
                        
                        <SeesawSwitch 
                            onChange={setUseCRT}
                            value={useCRT}
                            toggle={true}
                        />
                        <span className="bottom-label">CRT</span>
                    </div>
                </div>
            </div>
};

export default React.memo(PlaybackPanel);