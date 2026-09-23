import React from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import BinarySwitch from './inputDevices/binarySwitch.tsx';
import Knob from './inputDevices/knob.tsx';
import PushButton from './inputDevices/pushButton.tsx';
import JackalSlider from './inputDevices/jackalSlider.tsx';
import './drawPanel.css'; 

interface drawPanelProps{
    simulation: Automaton,
}

const DrawPanel: React.FC<drawPanelProps> = ({
    simulation,
}) => {
    const brushSize = useAutomatonStore((s) => s.brushSize);
    const setBrushSize = useAutomatonStore((s) => s.setBrushSize);

    const brushStateKnobState = useAutomatonStore((s) => s.brushStateKnobState);
    const setBrushStateKnobState = useAutomatonStore((s) => s.setBrushStateKnobState);

    const knobOptions = ["2", "", "", "", "", "7", "", "", "", "", "12", "", "", "", "", "17", "", "", "", ""];
    
    const brushErase = useAutomatonStore((s) => s.brushErase);
    const setBrushErase = useAutomatonStore((s) => s.setBrushErase);

    const brushSizeTicks = Array.from({length: 11}, (_, idx) => idx * 0.1);

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
                <div>
                    <JackalSlider 
                        value={brushSize}
                        onChange={(n: number) => setBrushSize(n)}
                        min={1}
                        max={50}
                        vertical={true}
                        ticks={true}
                        tickList={brushSizeTicks}
                        emphasize={5}
                        size={170}
                    />
                </div>
                <div className="brush-state-knob">
                    <Knob 
                        key={brushStateKnobState}
                        options={knobOptions}
                        defaultValue={Math.max(0, brushStateKnobState - 1)}
                        onChange={(n: number) => setBrushStateKnobState(n + 1)}
                        emphasize={5}
                        size={80}
                    />
                    <PushButton 
                        key={brushErase ? -1 : -2}
                        label={"1"}
                        toggle={true}
                        value={brushErase}
                        onChange={setBrushErase}
                    />
                </div>
            </div>
        </fieldset>
    </div>
};

export default React.memo(DrawPanel);