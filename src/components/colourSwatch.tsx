import React from 'react';
import { useAutomatonStore } from '../automatonStore.ts';
import './colourSwatch.css';

const DOTS_HIGH = 6;
const PSEUDOPIXEL_SIZE = 5;
const HOUSING_INSET = 5;

interface colourSwatchProps{
    vertical?: boolean,
    dotRes?: number,
}

const ColourSwatch: React.FC<colourSwatchProps> = ({
    vertical = false,
    dotRes = 3,
}) => {
    const colours = useAutomatonStore((s) => s.colours);

    const dotsWide = 21 * dotRes;

    const rectCoords = Array.from({length: dotsWide}, (_, idx) => 
        [idx * (PSEUDOPIXEL_SIZE), 0, Math.floor((idx / dotsWide) * colours.length)]
    );

    return ( 
    <div className="colour-swatch-housing"
        style={{
                width: `${(vertical ? DOTS_HIGH : dotsWide) * PSEUDOPIXEL_SIZE + 17}px`,
                height: `${(vertical ? dotsWide : DOTS_HIGH) * PSEUDOPIXEL_SIZE + 17}px`
            }}
    >
        {
                rectCoords.map((coords, idx) => (
                    <div className="colour-swatch-rect" 
                        key={idx}
                        style={{
                            width:`${(vertical ? DOTS_HIGH : 1) * PSEUDOPIXEL_SIZE}px`,
                            height:`${(vertical ? 1 : DOTS_HIGH) * PSEUDOPIXEL_SIZE}px`,
                            left:`${(vertical ? coords[1] : coords[0]) + HOUSING_INSET}px`,
                            bottom:`${(vertical ? coords[0] : coords[1]) + HOUSING_INSET + 3}px`,
                            backgroundColor: `hsl(${colours[coords[2]][0]}, ${colours[coords[2]][1]}%, ${colours[coords[2]][2]}%)`
                        }}
                    />
                ))
        }
        <div className="colour-swatch"
            style={{
                width: `${(vertical ? DOTS_HIGH : dotsWide) * PSEUDOPIXEL_SIZE + 1}px`,
                height: `${(vertical ? dotsWide : DOTS_HIGH) * PSEUDOPIXEL_SIZE + 1}px`
            }}
        >
            
        </div>
    </div>
    );
};

export default React.memo(ColourSwatch);