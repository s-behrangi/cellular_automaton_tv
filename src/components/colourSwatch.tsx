import React from 'react';
import { useAutomatonStore } from '../automatonStore.ts';
import './colourSwatch.css';

const DOTS_WIDE = Math.floor(21 * 3.5);
const DOTS_HIGH = 6;
const PSEUDOPIXEL_SIZE = 5;
const DOT_OFFSET = 1;

interface colourSwatchProps{
}

const ColourSwatch: React.FC<colourSwatchProps> = ({

}) => {
    const colours = useAutomatonStore((s) => s.colours);

    const dotCoords = Array.from({length: DOTS_WIDE * DOTS_HIGH}, (_, idx) => 
        [(idx % DOTS_WIDE) * PSEUDOPIXEL_SIZE + DOT_OFFSET, Math.floor(idx / DOTS_WIDE) * PSEUDOPIXEL_SIZE + DOT_OFFSET, Math.floor((idx % DOTS_WIDE) / (DOTS_WIDE / colours.length))]
    );

    return <div className="colour-swatch-housing"
        style={{
                width: `${DOTS_WIDE * PSEUDOPIXEL_SIZE + 15}px`,
                height: `${DOTS_HIGH * PSEUDOPIXEL_SIZE + 15}px`
            }}
    >
        <div className="colour-swatch"
            style={{
                width: `${DOTS_WIDE * PSEUDOPIXEL_SIZE + 1}px`,
                height: `${DOTS_HIGH * PSEUDOPIXEL_SIZE + 1}px`
            }}
        >
                {
                    dotCoords.map((coords, idx) => (
                        <div className="colour-swatch-dot"
                            key={idx}
                            style={{
                                width:`${PSEUDOPIXEL_SIZE - DOT_OFFSET}px`,
                                height:`${PSEUDOPIXEL_SIZE - DOT_OFFSET}px`,
                                left:`${coords[0]}px`,
                                bottom:`${coords[1]}px`,
                                backgroundColor: `hsl(${colours[coords[2]][0]}, ${colours[coords[2]][1]}%, ${colours[coords[2]][2]}%)`
                            }}
                        />
                    ))
                }
            </div>
        </div>
};

export default React.memo(ColourSwatch);