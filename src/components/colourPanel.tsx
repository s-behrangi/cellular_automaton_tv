import React from 'react';
import { useAutomatonStore } from '../automatonStore.ts';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { DEFAULT_COLOUR } from '../constants.ts';

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

    const colouringStyle = useAutomatonStore((s) => s.colouringStyle);
    const setColouringStyle = useAutomatonStore((s) => s.setColouringStyle);

    const radialSpreadDegrees = useAutomatonStore((s) => s.radialSpreadDegrees);
    const setRadialSpreadDegrees = useAutomatonStore((s) => s.setSetRadialSpreadDegrees);

    const colours = useAutomatonStore((s) => s.colours);

    const handleColouringStyle = () => {
        if (colouringStyle == "radialSpread") {
            setColouringStyle("sameHue");
        } else {
            setColouringStyle("radialSpread");
        }
    }


    
    return <div className="panel-horizontal">
        <fieldset>
            <legend>COLOUR</legend>
            <div className="control-column">
                <div className="control-row">
                    <button
                      aria-pressed = {distinguishZeroColour}
                      onClick={() => setDistinguishZeroColour(!distinguishZeroColour)}
                    >1</button>
                    <button
                      aria-pressed = {colouringStyle=="radialSpread"}
                      onClick={handleColouringStyle}
                    >STYLE</button>
                    <button
                      aria-pressed = {distinguishMaxColour}
                      onClick={() => setDistinguishMaxColour(!distinguishMaxColour)}
                    >N</button>
                </div>
                <div className="control-row">
                    <Box sx={{ height: 30, width: '100%' }}>
                    <Slider
                        aria-label="Radial Spread"
                        getAriaValueText={(n: number) => `Radial Spread: ${n}`}
                        valueLabelDisplay="auto"
                        defaultValue={DEFAULT_COLOUR.s}
                        max={359}
                        min={0}
                        onChange={(_: Event, newValue: number) => setRadialSpreadDegrees(newValue)}
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