import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const THUMB_WIDTH = '20px';
const THUMB_HEIGHT = '39px';
const BASE_WIDTH = '30px';
const BASE_LENGTH = '80%';
const RAIL_WIDTH = '8px';
const RAIL_LENGTH = '100%';

interface jackalSliderProps {
    value: number,
    onChange: (x: number) => void,
    min: number,
    max: number,
    vertical?: boolean,
}

const JackalSlider: React.FC<jackalSliderProps> = ({
    value,
    onChange,
    min,
    max,
    vertical = false,
}) => {
    const [width, height] = [vertical ? BASE_WIDTH : BASE_LENGTH, vertical ? BASE_LENGTH : BASE_WIDTH];
    const [railWidth, railHeight] = [vertical ? RAIL_WIDTH : RAIL_LENGTH, vertical ? RAIL_LENGTH : RAIL_WIDTH];

    const thumbBackgroundImage = `repeating-linear-gradient(${vertical ? "to top" : "to right"},` +
                            'var(--jackal-slider-thumb-shadow) 0px,' + 
                            'var(--jackal-slider-thumb-dark) 1px 3px,' +
                            'var(--jackal-slider-thumb-highlight) 4px,' +
                            'var(--jackal-slider-thumb-light) 5px 7px,' +
                            'var(--jackal-slider-thumb-shadow) 8px)';

    const thumbBoxShadow = 'inset 1px -1px 1px 0px #080808,' +
                            'inset -1px 1px 1px 0px #535151,' + 
                            '-1px 1px 2px 1px #141414';

    
    return (
    <div className="slider"
                style={{height: height, 
                width: width,
            }} 
            >
        <Box 
            
            >
                <Slider
                    orientation={vertical ? 'vertical' : 'horizontal'}
                    valueLabelDisplay="off"
                    onChange={(_: Event, newValue: number) => onChange(newValue)}
                    value={value}
                    max={max}
                    min={min}
                    sx={{
                        '& .MuiSlider-thumb': {
                            width: vertical ? THUMB_WIDTH : THUMB_HEIGHT,
                            height: vertical ? THUMB_HEIGHT : THUMB_WIDTH,

                            borderRadius: '1px',
                            backgroundColor: 'transparent',
                            backgroundImage: `${thumbBackgroundImage}`,
                            
                            boxShadow: `${thumbBoxShadow}`,

                            '&:hover': {
                                boxShadow: `${thumbBoxShadow}`,
                            },
                            '&.Mui-active': {
                                boxShadow: `${thumbBoxShadow}`,   
                            }
                        },
                        '& .MuiSlider-rail': {
                            color: 'var(--jackal-slider-rail)',
                            opacity: '0.9',
                            boxShadow: 'inset 1px -1px 3px 0px #ffffff1c',
                            height: railHeight,
                            width: railWidth,
                        },
                        '& .MuiSlider-track': {
                            opacity: 0,
                        },
                        
                    }}
                />
        </Box>
    </div>
    );
};

export default React.memo(JackalSlider);