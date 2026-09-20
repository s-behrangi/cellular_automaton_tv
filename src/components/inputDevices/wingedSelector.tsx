import React, { type PointerEvent } from 'react';
import { useRef, type CSSProperties } from 'react';
import "./WingedSelector.css";

const DIAL_SIZE = 0.7;

interface wingedSelectorProps{
    options: Array<string>,
    value: number,
    onChange: (n: number) => void,
    size?: number,
    arc?: number,
}

const WingedSelector: React.FC<wingedSelectorProps> = ({
    options,
    value,
    onChange,
    size = 180,
    arc = 90, //this selector is not designed for choices that span more than half a circle
}) => {
    const n = options.length;
    const padding = size * 0.3;
    const arcStep = arc / (n - 1);
    const leftOffset = arc * Math.PI / (180 * 2);
    const box = size + padding * 2;

    const dialRef = useRef<HTMLDivElement>(null);

    const indexFromPoint = (clientX: number): number => {
        const dial = dialRef.current;
        
        if (!dial) return value;
        
        const rect = dial.getBoundingClientRect();
        const dialX = clientX - rect.left;

        return Math.min(n - 1, 
                        Math.max(0, Math.floor(dialX / (rect.width / n))));
    }

    const handleChange = (e: PointerEvent) => {
        const dial = dialRef.current;
        

        if (!dial) return value;

        const rect = dial.getBoundingClientRect();
        const dialY = e.clientY - rect.top;

        if (dialY > 1.5 * box / 2.0) { //ignore anything in the lower portion of the knob
            return value;
        }

        onChange(indexFromPoint(e.clientX));
    }

    const style = {
        "--winged-selector-size": `${size}px`,
        width: box,
        height: box,
    } as CSSProperties;
    
    return (
    <div className="winged-selector" style={style} ref={dialRef} onPointerDown={(e) => handleChange(e)}>
        {options.map((s, i) => {
            const theta = (i * arcStep * Math.PI) / 180 - leftOffset;
            const radius = size / 2.0 + padding * 0.5;
            return (
                <button
                    key={s}
                    type="button"
                    className={`winged-selector-label`}
                    style={{
                        left: box / 2.0 + Math.sin(theta) * radius,
                        top: box / 2.0 - Math.cos(theta) * radius,
                    }}
                    onClick={() => onChange(i)}
                >
                    {s}
                </button>
            )
        })}  
        <div
            
            className="winged-selector-dial"
            style={{
                width: size * DIAL_SIZE,
                height: size * DIAL_SIZE,
                top: padding + size * (1 - DIAL_SIZE) / 2.0,
                left: padding + size * (1 - DIAL_SIZE) / 2.0,
            }}
            
        >
            <div 
                className="winged-selector-rotor"
                style={{ transform: `rotate(${value * arcStep - arc / 2}deg)` }}
            >
                <div className="winged-selector-wing" />
            </div>
        </div>
    </div>
    );
};

export default React.memo(WingedSelector);