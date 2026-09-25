import React from 'react';
import "./lightSwitch.css";
import { useState, useEffect } from 'react';

interface lightSwitchProps{
    onChange?: (val: boolean) => void,
    value?: boolean,
    toggle?: boolean,
}

const LightSwitch: React.FC<lightSwitchProps> = ({
    onChange = (_: boolean) => null,
    value = false,
    toggle = false,
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
    <div className={`light-switch-wrapper${active ? ' active' : ""}`}
        onPointerDown={() => handleDown()}
        onPointerUp={() => handleUp()}
    >
        <div className="light-switch-housing" />
        <div className="light-switch-base" />
        <div className="light-switch-rise" />
        <div className="light-switch-tip" />
        <div className="light-switch-tip-shadow" />
        <div className="light-switch-rise-shadow" />
        <div className="light-switch-base-shadow" />
    </div>
    );
};

export default React.memo(LightSwitch);