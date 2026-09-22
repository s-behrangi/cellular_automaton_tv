import React from 'react';
import './binarySwitch.css';
import { useState, useEffect } from 'react';

interface binarySwitchProps {
    onChange?: (val: boolean) => void,
    toggle?: boolean,
}

const BinarySwitch: React.FC<binarySwitchProps> = ({
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
    <div className="binary-switch" >
        <div className="binary-switch-housing" 
            onPointerDown={() => handleDown()}
            onPointerUp={() => handleUp()}
        >
            <div className="binary-switch-switch"
                style={{
                    top: `${active ? '24px' : '6px'}`
                }}
            >
            </div>
        </div>
    </div>
    );
};

export default React.memo(BinarySwitch);