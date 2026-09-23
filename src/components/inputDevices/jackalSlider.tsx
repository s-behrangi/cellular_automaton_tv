import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const THUMB_WIDTH = '20px';
const THUMB_HEIGHT = '39px';
const BASE_WIDTH = 40;
const BASE_LENGTH = 0.8;
const RAIL_WIDTH = 8;
const RAIL_LENGTH = 1.0;
const TICK_WIDTH = 2;
const TICK_HEIGHT = 4;
const TICK_EMPH_DIFF = 4;
const TICK_START_X = 0.04;
interface jackalSliderProps {
    value: number,
    onChange: (x: number) => void,
    min: number,
    max: number,
    vertical?: boolean,
    ticks?: boolean,
    tickList?: Array<number>,
    size?: number,
    emphasize?: number,
}

const JackalSlider: React.FC<jackalSliderProps> = ({
    value,
    onChange,
    min,
    max,
    vertical = false,
    ticks = false,
    tickList = [],
    size = 300,
    emphasize = 5,
}) => {
    const [width, height] = [vertical ? BASE_WIDTH : size * BASE_LENGTH, vertical ? size * BASE_LENGTH : BASE_WIDTH];
    const [railWidth, railHeight] = [vertical ? RAIL_WIDTH : size * BASE_LENGTH * RAIL_LENGTH, vertical ? size * BASE_LENGTH * RAIL_LENGTH : RAIL_WIDTH];
    const [tickWidth, tickHeight] = [vertical? TICK_HEIGHT : TICK_WIDTH, vertical ? TICK_WIDTH : TICK_HEIGHT];
    const thumbBackgroundImage = `repeating-linear-gradient(${vertical ? "to top" : "to right"},` +
                            'var(--jackal-slider-thumb-shadow) 0px,' + 
                            'var(--jackal-slider-thumb-dark) 1px 3px,' +
                            'var(--jackal-slider-thumb-highlight) 4px,' +
                            'var(--jackal-slider-thumb-light) 5px 7px,' +
                            'var(--jackal-slider-thumb-shadow) 8px)';

    const thumbBoxShadow = 'inset 1px -1px 1px 0px #080808,' +
                            'inset -1px 1px 1px 0px #535151,' + 
                            '-2px 2px 2px 1px #080808';

    const upLeftTicks = tickList.map((tick, idx) => {
        const tickOffset = tick * size * BASE_LENGTH * RAIL_LENGTH - TICK_WIDTH;
        const x = (vertical ? 2 + (idx % emphasize != 0 ? TICK_EMPH_DIFF : 0) : 2 + tickOffset);
        const y = (vertical ? tickOffset - 4 : 25);
        return [x, y];
    });

    const downRightTicks = tickList.map((tick) => {
        const tickOffset = tick * size * BASE_LENGTH * RAIL_LENGTH - TICK_WIDTH;
        const x = (vertical ? 22 : 2 + tickOffset);
        const y = (vertical ? tickOffset + TICK_HEIGHT / 2 + 4 : 27);
        return [x, y];
    });
    
    return (
    <div className="slider"
                style={{
                    position: 'relative',
                    height: `${height}px`, 
                    width: `${width}px`,
                    alignItems: 'center',
            }} 
            >
        <Box 
            sx={{
                height: `${height}px`, 
                width: `${width}px`,
            }}
            >
                {ticks &&
                    upLeftTicks.map((coords: number[], idx: number) => (
                        <div 
                            className="tick"
                            key={5*idx}
                            style={{
                                position: 'absolute',
                                width: `${tickWidth + (vertical && (idx % emphasize == 0) ? TICK_EMPH_DIFF : 0)}px`,
                                height: `${tickHeight + (!vertical && (idx % emphasize == 0) ? TICK_EMPH_DIFF : 0)}px`,
                                backgroundColor: 'var(--machine-text)',
                                left: `${coords[0]}px`,
                                bottom: `${coords[1]}px`,
                                zIndex: '1',
                                opacity: '0.7',
                            }}
                        />
                    ))
                }
                <Slider
                    orientation={vertical ? 'vertical' : 'horizontal'}
                    valueLabelDisplay="off"
                    onChange={(_: Event, newValue: number) => onChange(newValue)}
                    value={value}
                    max={max}
                    min={min}
                    sx={{
                        position: 'relative',
                        zIndex: '2',
                        marginTop: '7px',
                        writingMode: `${vertical ? 'vertical-lr' : ""}`,
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
                            height: `${railHeight}px`,
                            width: `${railWidth}px`,
                        },
                        '& .MuiSlider-track': {
                            opacity: 0,
                        },
                        
                    }}
                />
                {ticks &&
                    downRightTicks.map((coords: number[], idx: number) => (
                        <div 
                            className="tick"
                            key={7*idx}
                            style={{
                                position: 'absolute',
                                width: `${tickWidth + (vertical && (idx % emphasize == 0) ? TICK_EMPH_DIFF : 0)}px`,
                                height: `${tickHeight + (!vertical && (idx % emphasize == 0) ? TICK_EMPH_DIFF : 0)}px`,
                                backgroundColor: 'var(--machine-text)',
                                left: `${coords[0]}px`,
                                top: `${coords[1]}px`,
                                zIndex: '1',
                                opacity: '0.7',
                            }}
                        />
                    ))
                }
        </Box>
    </div>
    );
};

export default React.memo(JackalSlider);