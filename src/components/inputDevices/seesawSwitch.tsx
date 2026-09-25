import React from 'react';
import "./seesawSwitch.css";
import { useState, useEffect } from 'react';

interface seesawSwitchProps{
    onChange?: (val: boolean) => void,
    value?: boolean,
    toggle?: boolean,
    onOffMarks?: boolean,
}

const SeesawSwitch: React.FC<seesawSwitchProps> = ({
    onChange = (_: boolean) => null,
    value = false,
    toggle = true,
    onOffMarks = true,
}) => {
    const [active, setActive] = useState<boolean>(value);
        
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
    <div className={`seesaw-switch-wrapper${active ? ' active' : ""}`}
        onPointerDown={() => handleDown()}
        onPointerUp={() => handleUp()}
    >
        <div className="seesaw-switch-housing" />
        <div className="seesaw-switch-rise" />
        <div className="seesaw-switch-fall" />
        <div className="seesaw-switch-outline" />
        <div className="seesaw-switch-rise-shadow" />
        <div className="seesaw-switch-fall-shadow" />
        {onOffMarks && <div className="seesaw-switch-circle" />}
        {onOffMarks && <div className="seesaw-switch-line" />}
    </div>
    );
};

export default React.memo(SeesawSwitch);