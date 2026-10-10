import React from 'react';
import "./lightSwitch.css";
import { useAudio } from '../../audio/audioProvider';
import { useState, useEffect } from 'react';

const SOUND_ON = "lightswitch.flipdown";
const SOUND_OFF = "lightswitch.flipup";

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
    const audio = useAudio();

    useEffect(() => {
        onChange(active);
    }, [active])

    const handleDown = () => {
        if (!toggle) {
            setActive(true);
            audio.play(SOUND_ON)
        } else {
            setActive((state) => {audio.play(state ? SOUND_OFF : SOUND_ON); return !state});
        }
    }

    const handleUp = () => {
        if (!toggle) {
            setActive(false);
            audio.play(SOUND_OFF);
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