import React, { useState, type PointerEvent } from 'react';
import { useEffect, useRef, type CSSProperties } from 'react';
import "./knob.css";

const DIAL_SIZE = 1.0;

interface knobProps{
    options?: Array<string>,
    onChange?: (n: number) => void,
    defaultValue?: number,
    size?: number,
    emphasize?: number,
}

const Knob: React.FC<knobProps> = ({
    options = [],
    onChange = (_: number) => (null),
    defaultValue = 0,
    size = 90,
    emphasize = 5,
}) => {
    const n = options.length;
    const padding = size * 0.3;
    const arcStep = 360 / n;
    const emphArcStep = arcStep * emphasize;
    const box = size + padding * 2;

    const knobRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<number>(defaultValue);
    const [knobAngle, setKnobAngle] = useState<number>(defaultValue * arcStep);

    useEffect(() => {
        onChange(value);
    }, [value]);

    const onLeft = (clientX: number): boolean => {
        const dial = knobRef.current;
        
        if (!dial) return false;
        
        const rect = dial.getBoundingClientRect();
        const dialX = clientX - rect.left;

        return dialX < rect.width / 2;
    }

    const handleChange = (e: PointerEvent) => {
        const left = onLeft(e.clientX);
        setKnobAngle((angle) => (angle + (left ? - arcStep : arcStep)));
        setValue((value) => (value + (left ? -1 : 1) + options.length) % options.length)
    }

    const style = {
        "--knob-size": `${size}px`,
        width: box,
        height: box,
    } as CSSProperties;

    const tickStyle = {
        "--arc-step": `${arcStep}deg`,
        inset: '20px',
    } as CSSProperties;

    const emphTickStyle = {
        "--arc-step": `${emphArcStep}deg`,
        inset: '15px',
    } as CSSProperties;
    
    return (
        <div>
            <div className="knob" style={style} ref={knobRef} onPointerDown={(e) => handleChange(e)}>
                {options.map((s, i) => {
                    const theta = (i * arcStep * Math.PI) / 180;
                    const radius = size / 2.0 + padding * 0.9;
                    return (
                        <button
                            key={i}
                            type="button"
                            className={`knob-label`}
                            style={{
                                left: box / 2.0 + Math.sin(theta) * radius,
                                top: box / 2.0 - Math.cos(theta) * radius,
                                opacity: 1,
                            }}
                        >
                            {s}
                        </button>
                    )
                })} 

                <div className="knob-ticks"
                    style={tickStyle}
                >
                    <div className="knob-ticks-cover" />    
                </div> 

                <div className="knob-ticks"
                    style={emphTickStyle}
                >
                    <div className="knob-ticks-cover" />
                </div>

                <div
                    className="knob-knob"
                    style={{
                        width: size * DIAL_SIZE - 26,
                        height: size * DIAL_SIZE - 26,
                        top: padding + size * (1 - DIAL_SIZE) / 2.0,
                        left: padding + size * (1 - DIAL_SIZE) / 2.0,
                    }}
                    
                >
                    <div 
                        className="knob-rotor"
                        style={{ transform: `rotate(${knobAngle}deg)` }}
                    >
                        <div className="knob-nib" />
                    </div>
                </div>
            </div>
    </div>
    );
};

export default React.memo(Knob);