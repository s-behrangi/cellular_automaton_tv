import React, { useState } from 'react';
import PushButton from './inputDevices/pushButton.tsx';
import { PRESETS } from '../constants';

const LINE_HEIGHT = 40;

interface presetPanelProp{
    setPreset: (s: number) => void,
}

const PresetPanel: React.FC<presetPanelProp> = ({
    setPreset
}) => {
    const [selectedPreset, setSelectedPreset] = useState<number>(0);

    const handleChangePreset = (diff: number) => {
        setSelectedPreset( (prev) => {
            const next = Math.max(0, Math.min(PRESETS.length - 1, prev + diff));
            return next;
        });
    }

    const presetText = PRESETS.map((pair) => pair[0]).join("\n");

    return (
    <div id="preset-panel">
        <span className="panel-name" id="preset-panel-name">PRESETS</span>
        <div id="preset-selector-column">
            <PushButton
                onChange={(val: boolean) => val ? handleChangePreset(1) : null}
                toggle={false}
                label={"&#9650;"}
            />
            <PushButton
                onChange={(val: boolean) => val ? handleChangePreset(-1) : null}
                toggle={false}
                label={"&#9660;"}
            />
        </div>
        <div id="preset-window">
            <span id="preset-name" style={{'--preset-name-yoffset': `${- selectedPreset * LINE_HEIGHT}px`}  as React.CSSProperties}>{presetText}</span>
        </div>
        <PushButton
            onChange={(val: boolean) => val ? setPreset(selectedPreset) : null}
            toggle={false}
            label={"&#9654;"}
        />
    </div>
    );
};

export default React.memo(PresetPanel);