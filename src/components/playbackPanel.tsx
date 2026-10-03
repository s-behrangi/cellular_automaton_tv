import React, { useState } from 'react';
import { type RefObject } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import DiagonalSwitchColumn from './diagonalSwitchColumn.tsx';
import ControlCluster from './controlCluster.tsx';
import './playbackPanel.css'
import SeesawSwitch from './inputDevices/seesawSwitch.tsx';
import gavazn from '../assets/gavazn.svg';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/material';
import { MANUAL_ONE, MANUAL_TWO } from './manual.tsx';

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
    
    
    const [manualOpen, setManualOpen] = useState<boolean>(false);
    const [manualFirstPage, setManualFirstPage] = useState<boolean>(true);

    const handleManualOpen = () =>{
        setManualOpen(true);
    }

    const handleManualClose = () =>{
        setManualOpen(false);
        setManualFirstPage(true);
    }

    const manualStyle = {
        position: 'absolute',
        top: '50px',
        left: '20%',
        width: 1100,
        height: 720,
        bgcolor: 'background.paper',
        border: 'none',
        borderRadius: '2px',
        boxShadow: 24,
        p: 4,
        outline: 'none',
    };

    return <div className="panel-horizontal playback-panel">
                <Modal
                    open={manualOpen}
                    onClose={handleManualClose}
                    sx={{overflow:"auto"}}
                >
                    <Box sx={manualStyle}>
                        {manualFirstPage ? MANUAL_ONE : MANUAL_TWO}
                        <span 
                            id={`${manualFirstPage ? "to-second-page" : "to-first-page"}`}
                            onClick={() => setManualFirstPage((prev) => !prev)}
                            style={{
                                cursor: "pointer",
                                color: "black",
                                fontSize: "24px",
                                position: "absolute",
                                top: "95%",
                            }}
                        >
                            {manualFirstPage ? "→" : "←"}
                        </span>
                    </Box>
                </Modal>
                <DiagonalSwitchColumn 
                    simulation={simulation}
                    cRef={cRef}
                />
                
                <div id="logo-cluster">
                    <img src={gavazn} alt="Gavazn 313" id="gavazn-logo"/>
                    <span id="logo-subtitle">Cellular Automata</span>
                    <span id="help-button" onClick={handleManualOpen}>?</span>
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