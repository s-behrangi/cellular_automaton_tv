import React from 'react';
import './pushButton.css';
import { useAudio } from '../../audio/audioProvider';
import { useState, useEffect } from 'react';

const SOUND_DOWN = 'button.down';
const SOUND_UP = 'button.up';

interface pushButtonProps {
    label?: string,
    onChange?: (val: boolean) => void,
    toggle?: boolean,
    value?: boolean,
}

const PushButton: React.FC<pushButtonProps> = ({
    label = "",
    onChange = (_val: boolean) => (null),
    toggle = true,
    value = false,
}) => {
    const [active, setActive] = useState<boolean>(value);
    const [pressState, setPressState] = useState<string>("");

    const audio = useAudio();
    
    useEffect(() => {
            onChange(active);
        }, [active])
    
        const handleDown = () => {
            setPressState("active");
            audio.play(SOUND_DOWN);
            if (!toggle) {
                setActive(true);
            } else {
                setActive((state) => !state);
            }
        }
    
        const handleUp = () => {
            audio.play(SOUND_UP);
            if (!toggle) {
                setActive(false);
                setPressState("");
            } else {
                setPressState(active ? "down" : "");
            }
        }

    return (
    <div className="push-button-wrapper">
        <button 
            className={`push-button ${pressState}`}
            onPointerDown={() => handleDown()}
            onPointerUp={() => handleUp()}
        >
            <span>{label}</span>
        </button>
    </div>
    );
};

export default React.memo(PushButton);