import React, { useState } from 'react';
import PushButton from './inputDevices/pushButton.tsx';
import { PRESET_NAMES } from '../constants';

const LINE_HEIGHT = 40;

interface presetPanelProp{
    setPreset: (s: string) => void,
}

const PresetPanel: React.FC<presetPanelProp> = ({
    setPreset
}) => {
    const [selectedPreset, setSelectedPreset] = useState<number>(0);
    const [presetNameOffset, setPresetNameOffset] = useState<number>(0);

    const handleChangePreset = (diff: number) => {
        setSelectedPreset( (prev) => {
            const next = Math.max(0, Math.min(PRESET_NAMES.length - 1, prev + diff));
            setPresetNameOffset((pre) => pre + (prev - next) * LINE_HEIGHT);
            return next;
        });
    }

    const presetText = PRESET_NAMES.map((pair) => pair[0]).join("\n");

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
            <span id="preset-name" style={{'--preset-name-yoffset': `${presetNameOffset}px`}  as React.CSSProperties}>{presetText}</span>
        </div>
        <PushButton
            onChange={(val: boolean) => val ? setPreset(PRESET_NAMES[selectedPreset][1]) : null}
            toggle={false}
            label={"&#9654;"}
        />
    </div>
    );
};

export default React.memo(PresetPanel);