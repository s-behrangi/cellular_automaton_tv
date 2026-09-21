import React from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { DEFAULT_BRUSH_SIZE } from '../constants.ts';
import BinarySwitch from './inputDevices/binarySwitch.tsx';

interface drawPanelProps{
    simulation: Automaton,
}

const DrawPanel: React.FC<drawPanelProps> = ({
    simulation,
}) => {
    const brushSize = useAutomatonStore((s) => s.brushSize);
    const setBrushSize = useAutomatonStore((s) => s.setBrushSize);
    const [minBrushSize, maxBrushSize] = [1, 100];

    const brushState = useAutomatonStore((s) => s.brushState);
    const setBrushState = useAutomatonStore((s) => s.setBrushState);

    //<button onClick={() => simulation.flash()}>FLASH</button>

    return <div className="panel-horizontal">
        <fieldset>
            <legend>DRAW</legend>
            <div className="control-row">
                <div className="control-column">
                    <span>CLEAR</span>
                    <BinarySwitch 
                        onChange={(val: boolean) => simulation.setClear(val)}
                        toggle={false}
                    />
                    <BinarySwitch 
                        onChange={(val: boolean) => simulation.setFlash(val)}
                        toggle={false}
                    />
                    <span>FLASH</span>
                </div>
                <div className = "control-column">
                    <span>DOT</span>
                    <BinarySwitch 
                        onChange={(val: boolean) => simulation.setDot(val)}
                        toggle={false}
                    />
                </div>
                
                <span>Brush Size:</span>
                <Box sx={{ height: 150 }}>
                    <Slider
                        aria-label="Brush Size"
                        orientation="vertical"
                        getAriaValueText={(n: number) => `${n}`}
                        valueLabelDisplay="auto"
                        defaultValue={DEFAULT_BRUSH_SIZE}
                        max={maxBrushSize}
                        min={minBrushSize}
                        onChange={(_: Event, newValue: number) => setBrushSize(newValue)}
                    />
                </Box>
                <span>{brushSize}</span>
                <span>Brush State:</span>
                <button onClick={() => setBrushState(brushState + 1)}>▲</button>
                <span>{brushState}</span>
                <button onClick={() => setBrushState(brushState - 1)}>▼</button>
            </div>
        </fieldset>
    </div>
};

export default React.memo(DrawPanel);