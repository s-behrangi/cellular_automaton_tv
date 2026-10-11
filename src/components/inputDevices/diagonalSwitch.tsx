import React from 'react';
import './diagonalSwitch.css';
import { useAudio } from '../../audio/audioProvider';
import { useState, useEffect } from 'react';

const SOUND_DOWN = 'diag.down';
const SOUND_UP = 'diag.up';

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
    const [active, setActive] = useState<boolean>(defaultValue);

    const audio = useAudio();
    
    useEffect(() => {
        onChange(active);
    }, [active])

    const handleDown = () => {
        if (!toggle) {
            audio.play(SOUND_DOWN);
            setActive(true);
        } else {
            setActive((state) => {audio.play(state ? SOUND_UP : SOUND_DOWN); return !state});
        }
    }

    const handleUp = () => {
        if (!toggle) {
            setActive(false);
            audio.play(SOUND_UP);
        }
    }

    return (
    <div className={`diagonal-switch${active ? "-flipped" : ""}`} onPointerDown={handleDown} onPointerUp={handleUp} >
        { active ?
        <div className="diagonal-switch-base-flipped">
            <div className="diagonal-switch-grip-flipped"/>
        </div> 
        : 
        <div className="diagonal-switch-base">
            <div className="diagonal-switch-grip"/>
        </div>}
        
    </div>
    );
};

export default React.memo(DiagonalSwitch);