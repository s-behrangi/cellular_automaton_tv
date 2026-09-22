import React from 'react';
import './diagonalSwitch.css';
import { useState, useEffect } from 'react';

interface diagonalSwitchProps {
    onChange?: (val: boolean) => void,
    defaultValue?: boolean,
    toggle?: boolean,
}

const DiagonalSwitch: React.FC<diagonalSwitchProps> = ({
    onChange = (_val: boolean) => (null),
    defaultValue = false,
    toggle = true,
}) => {
    const value = defaultValue;
    const [active, setActive] = useState<boolean>(defaultValue);
    
    useEffect(() => {
        onChange(active);
    }, [active])

    const handleDown = () => {
        if (!toggle) {
            setActive(true);
        } else {
            setActive((state) => !state);
        }
    }

    const handleUp = () => {
        if (!toggle) {
            setActive(false);
        }
    }

    return (
    <div className={`diagonal-switch${active ? "-flipped" : ""}`} onPointerDown={handleDown} onPointerUp={handleUp} >
        { active ?
        <div className="diagonal-switch-base-flipped">
            <div className="diagonal-switch-grip-flipped"/>
            <div className="diagonal-switch-flipped-lighting"/>
        </div> 
        : 
        <div className="diagonal-switch-base">
            <div className="diagonal-switch-grip"/>
        </div>}
        

        
        
    </div>
    );
};

export default React.memo(DiagonalSwitch);