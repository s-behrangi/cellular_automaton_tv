import React from 'react';
import { useAutomatonStore } from '../automatonStore.ts';
import WingedSelector from './inputDevices/wingedSelector.tsx';
import JackalSlider from './inputDevices/jackalSlider.tsx';
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

    const colours = useAutomatonStore((s) => s.colours);

    const handleDistinguishChange = (i: number) => {
        setDistinguishMaxColour((i & 2) >> 1 === 1);
        setDistinguishZeroColour((i & 1) === 1);
    }

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
                    />
                </div>
                <div className="control-row">
                    {
                        colours.map((colour, idx) => (
                            <div
                              className="colour-swatch-bar"
                              key={idx}
                              style={{
                                height: `20px`,
                                width: `${100 / colours.length}%`,
                                backgroundColor: `hsl(${colour[0]}, ${colour[1]}%, ${colour[2]}%)`
                              }}
                            >

                            </div>
                    ))}
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
                            />
                            <span>H</span>
                        </div>
                        <div className="control-row">
                            <JackalSlider 
                                value={primaryColour.s}
                                onChange={(newValue: number) => setPrimaryColour('s', newValue)}
                                min={0}
                                max={100}
                            />
                            <span>S</span>
                        </div>
                        <div className="control-row">
                            <JackalSlider 
                                value={primaryColour.l}
                                onChange={(newValue: number) => setPrimaryColour('l', newValue)}
                                min={0}
                                max={100}
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