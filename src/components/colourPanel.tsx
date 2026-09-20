import React from 'react';
import { useAutomatonStore } from '../automatonStore.ts';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { DEFAULT_COLOUR, DEFAULT_COLOURING_STYLE_VARIABLE } from '../constants.ts';
import WingedSelector from './inputDevices/wingedSelector.tsx';
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
                <div className="control-row">
                    <Box sx={{ height: 30, width: '100%' }}>
                    <Slider
                        aria-label="Radial Spread"
                        getAriaValueText={(n: number) => `Radial Spread: ${n}`}
                        valueLabelDisplay="auto"
                        defaultValue={DEFAULT_COLOURING_STYLE_VARIABLE}
                        max={100}
                        min={0}
                        onChange={(_: Event, newValue: number) => setColouringStyleVariable(newValue)}
                    />
                </Box>
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
                <div className="control-row">
                    <span>H</span>
                    <span>S</span>
                    <span>L</span>
                </div>
                <div className="control-row">
                <Box sx={{ height: 150 }}>
                    <Slider
                        aria-label="Hue"
                        orientation="vertical"
                        getAriaValueText={(n: number) => `Hue: ${n}`}
                        valueLabelDisplay="auto"
                        defaultValue={DEFAULT_COLOUR.h}
                        max={360}
                        min={0}
                        onChange={(_: Event, newValue: number) => setPrimaryColour('h', newValue)}
                    />
                </Box>
                <Box sx={{ height: 150 }}>
                    <Slider
                        aria-label="Saturation"
                        orientation="vertical"
                        getAriaValueText={(n: number) => `Saturation: ${n}`}
                        valueLabelDisplay="auto"
                        defaultValue={DEFAULT_COLOUR.s}
                        max={100}
                        min={0}
                        onChange={(_: Event, newValue: number) => setPrimaryColour('s', newValue)}
                    />
                </Box>
                <Box sx={{ height: 150 }}>
                    <Slider
                        aria-label="Luminance"
                        orientation="vertical"
                        getAriaValueText={(n: number) => `Luminance: ${n}`}
                        valueLabelDisplay="auto"
                        defaultValue={DEFAULT_COLOUR.l}
                        max={100}
                        min={0}
                        onChange={(_: Event, newValue: number) => setPrimaryColour('l', newValue)}
                    />
                </Box>
                </div>
                <div className="control-row">
                    <span>{primaryColour.h}</span>
                    <span>{primaryColour.s}</span>
                    <span>{primaryColour.l}</span>
                </div>
            </div>
        </fieldset>
    </div>
};

export default React.memo(ColourPanel);