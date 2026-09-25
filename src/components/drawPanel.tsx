import React from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import LightSwitch from './inputDevices/lightSwitch.tsx';
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
                <div className="control-column switches-and-brush-size">
                    <div className="control-row">
                        <div className="input-with-label">
                            <span>CLEAR</span>
                            <LightSwitch 
                                onChange={(val: boolean) => simulation.setClear(val)}
                                toggle={false}
                            />
                        </div>
                        <div className="input-with-label">
                            <span>FLASH</span>
                            <LightSwitch 
                                onChange={(val: boolean) => simulation.setFlash(val)}
                                toggle={false}
                            />
                        </div>
                        <div className="input-with-label">
                            <span>DOT</span>
                            <LightSwitch 
                                onChange={(val: boolean) => simulation.setDot(val)}
                                toggle={false}
                            />
                        </div>
                    </div>
                    <div className="input-with-label brush-size-wrapper">
                        <span>Brush Size</span>
                        <div>
                            <JackalSlider 
                                value={brushSize}
                                onChange={(n: number) => setBrushSize(n)}
                                min={1}
                                max={50}
                                vertical={false}
                                ticks={true}
                                tickList={brushSizeTicks}
                                emphasize={5}
                                size={200}
                            />
                        </div>
                    </div>
                </div>
                <div className="input-with-label">
                    <span>BRUSH STATE</span>
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
            </div>
        </fieldset>
    </div>
};

export default React.memo(DrawPanel);