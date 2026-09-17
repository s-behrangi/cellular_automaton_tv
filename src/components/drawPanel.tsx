import React from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { DEFAULT_BRUSH_SIZE } from '../constants.ts';

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

    return <div className="panel-horizontal">
        <fieldset>
            <legend>DRAW</legend>
            <div className="control-column">
                <button onClick={() => simulation.clear()}>CLEAR</button>
                <button onClick={() => simulation.flash()}>FLASH</button>
                <button onClick={() => simulation.circle()}>DOT</button>
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