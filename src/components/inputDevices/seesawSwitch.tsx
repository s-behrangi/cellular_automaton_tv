import React from 'react';
import "./seesawSwitch.css";
import { useState, useEffect } from 'react';
import { useAudio } from '../../audio/audioProvider';

const SOUND_ON = 'seesaw.flipright';
const SOUND_OFF = 'seesaw.flipleft';

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

    const audio = useAudio();

    useEffect(() => {
        onChange(active);
    }, [active])

    const handleDown = () => {
        if (!toggle) {
            setActive(true);
            audio.play(SOUND_ON);
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
    <div className={`seesaw-switch-wrapper${active ? ' active' : ""}`}
        onPointerDown={() => handleDown()}
        onPointerUp={() => handleUp()}
    >
        <div className="seesaw-switch-housing" />
        <div className="seesaw-switch-rise" />
        <div className="seesaw-switch-fall" />
        <div className="seesaw-switch-outline" />
        {onOffMarks && <div className="seesaw-switch-circle" />}
        {onOffMarks && <div className="seesaw-switch-line" />}
    </div>
    );
};

export default React.memo(SeesawSwitch);