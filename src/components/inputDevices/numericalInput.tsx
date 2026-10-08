import React from 'react';
import "./lightSwitch.css";
import { useState, useEffect } from 'react';
import PushButton from './pushButton.tsx';
import './numericalInput.css';

const LINE_HEIGHT = 40;

interface numericalInputProps{
    onChange?: (i: number) => void,
    values?: Array<string>,
    idx?: number,
    displayWidth?: number,
    buttonWidth?: number,
}

const NumericalInput: React.FC<numericalInputProps> = ({
    onChange = (_: number) => null,
    values = [""],
    idx = 0,
    displayWidth = 25,
    buttonWidth = 25,
}) => {
    const [pos, setPos] = useState<number>(idx);

    const incPos = () => setPos((pos) => Math.min(values.length - 1, pos + 1));
    const decPos = () => setPos((pos) => Math.max(0, pos - 1));
    
    const labelString =  values.toReversed().join("\n");
    useEffect(() => {
        onChange(pos);
    }, [pos])
    
    return ( 
    <div className="numerical-input"
    >
        <div className="numerical-input-selector-column" style={{'--button-width': `${buttonWidth}px`} as React.CSSProperties}>
            <PushButton
                onChange={(val: boolean) => val ? incPos() : null}
                toggle={false}
                label={"&#9650;"}
            />
            <PushButton
                onChange={(val: boolean) => val ? decPos() : null}
                toggle={false}
                label={"&#9660;"}
            />
        </div>
        <div className="numerical-input-window" style={{'--display-width': `${displayWidth}px`} as React.CSSProperties}>
            <span className="numerical-input-label" style={{'--selected-label-yoffset': `${pos * LINE_HEIGHT - (values.length - 1) * LINE_HEIGHT}px`}  as React.CSSProperties}>{labelString}</span>
        </div>
    </div>
    );
};

export default React.memo(NumericalInput);