import React from 'react';
import './pushButton.css';
import { useState, useEffect } from 'react';

interface pushButtonProps {
    label?: string,
    onChange?: (val: boolean) => void,
    toggle?: boolean,
}

const PushButton: React.FC<pushButtonProps> = ({
    label = "label",
    onChange = (_val: boolean) => (null),
    toggle = true,
}) => {
    const [active, setActive] = useState<boolean>(false);
    
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
    <div className="push-button-wrapper">
        <button 
            className={`push-button${active ? ' active' : ""}`}
            onPointerDown={() => handleDown()}
            onPointerUp={() => handleUp()}
        >
            <span>{label}</span>
        </button>
    </div>
    );
};

export default React.memo(PushButton);