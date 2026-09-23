import React from 'react';
import { useAutomatonStore } from '../automatonStore.ts';
import WingedSelector from './inputDevices/wingedSelector.tsx';
import JackalSlider from './inputDevices/jackalSlider.tsx';
import ColourSwatch from './colourSwatch.tsx';
interface colourPanelProps{

}

const ColourPanel: React.FC<colourPanelProps> = ({

}) => {
    const primaryColour = useAutomatonStore((s) => s.primaryColour);
    const setPrimaryColour = useAutomatonStore((s) => s.setPrimaryColour);

    const distinguishZeroColour = useAutomatonStore((s) => s.distinguishZeroColour);
    const setDistinguishZeroColour = useAutomatonStore((s) => s.setDistinguishZeroColour);

    const distinguishMaxColour = useAutomatonStore((s) => s.distinguishMaxColour);
    const setDistinguishMaxColour = useAutomatonStore((s) => s.setDistinguishMaxColour);

    const colouringStyleIdx = useAutomatonStore((s) => s.colouringStyleIdx);
    const setColouringStyle = useAutomatonStore((s) => s.setColouringStyle);

    const colouringStyleVariable = useAutomatonStore((s) => s.colouringStyleVariable);
    const setColouringStyleVariable = useAutomatonStore((s) => s.setColouringStyleVariable);

    const handleDistinguishChange = (i: number) => {
        setDistinguishMaxColour((i & 2) >> 1 === 1);
        setDistinguishZeroColour((i & 1) === 1);
    }

    const hueTicks = Array.from({length: 19}, (_, idx) => idx * (1 / 18.0));

    const satLumVarTicks = Array.from({length: 11}, (_, idx) => idx * 0.1);

    return <div className="panel-horizontal">
        <fieldset>
            <legend>COLOUR</legend>
            <div className="control-column">
                <div className="control-row">
                    <WingedSelector
                        options={["⋅⋅", "|⋅", "⋅|", "||"]}
                        value={
                            (distinguishZeroColour ? 1 : 0) +
                            (distinguishMaxColour ? 2 : 0)
                        }
                        onChange={(i) => handleDistinguishChange(i)}
                        size={100}
                    />
                    <WingedSelector
                        options={["R", "H", "T"]}
                        value={colouringStyleIdx}
                        onChange={(i) => setColouringStyle(i)}
                        size={100}
                    />
                </div>
                <div 
                    className="gutter"
                    style={{height: '40px', width: '100%'}}
                    >
                    <JackalSlider 
                        value={colouringStyleVariable}
                        onChange={(x: number) => setColouringStyleVariable(x)}
                        max={100}
                        min={0}
                        ticks={true}
                        tickList={satLumVarTicks}
                        emphasize={5}
                    />
                </div>
                <div className="control-row">
                    <div className="control-column">
                        <ColourSwatch />
                    </div>
                </div>
                <div 
                    className="gutter"
                    style={{height: '100%', width: '100%'}}
                >
                    <div className="control-column">
                        <div className="control-row">
                            <JackalSlider 
                                value={primaryColour.h}
                                onChange={(newValue: number) => setPrimaryColour('h', newValue)}
                                min={0}
                                max={359}
                                ticks={true}
                                tickList={hueTicks}
                                emphasize={6}
                            />
                            <span>H</span>
                        </div>
                        <div className="control-row">
                            <JackalSlider 
                                value={primaryColour.s}
                                onChange={(newValue: number) => setPrimaryColour('s', newValue)}
                                min={0}
                                max={100}
                                ticks={true}
                                tickList={satLumVarTicks}
                                emphasize={5}
                            />
                            <span>S</span>
                        </div>
                        <div className="control-row">
                            <JackalSlider 
                                value={primaryColour.l}
                                onChange={(newValue: number) => setPrimaryColour('l', newValue)}
                                min={0}
                                max={100}
                                ticks={true}
                                tickList={satLumVarTicks}
                                emphasize={5}
                            />
                            <span>L</span>
                        </div>
                    </div>
                </div>
            </div>
        </fieldset>
    </div>
};

export default React.memo(ColourPanel);