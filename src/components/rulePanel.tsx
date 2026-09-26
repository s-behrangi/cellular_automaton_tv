import React, { useState } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import Knob from './inputDevices/knob.tsx';
import PushButton from './inputDevices/pushButton.tsx';
import './rulePanel.css';
import { FRAMERATES } from '../constants.ts';
import CassetteSlot from './inputDevices/cassetteSlot.tsx';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/material';
import LightSwitch from './inputDevices/lightSwitch.tsx';

interface rulePanelProps{
    simulation: Automaton,
    exportRule: () => void,
    importRule: (s: string) => void,
}

const RulePanel: React.FC<rulePanelProps> = ({
    simulation,
    exportRule,
    importRule,
}) => {
    const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
    const [importButtonDepressed, setImportButtonDepressed] = useState<boolean>(false);

    const n = useAutomatonStore((s) => s.n);
    const setN = useAutomatonStore((s) => s.setN);

    const cpuRuleControl = useAutomatonStore((s) => s.cpuRuleControl);
    const setCpuRuleControl = useAutomatonStore((s) => s.setCpuRuleControl);

    const [importString, setImportString] = useState<string>("");

    const handleDialChange = (i: number) => setN(i + 2);
    const dialOptions = ["2", "", "", "", "", "7", "", "", "", "", "12", "", "", "", "", "17", "", "", "", ""];
    
    const framerateIdx = useAutomatonStore((s) => s.framerateIdx);
    const setFramerateIdx = useAutomatonStore((s) => s.setFramerateIdx);
    const framerateOptions = FRAMERATES.map((x) => String(x));
    framerateOptions[framerateOptions.length - 1] = "MAX";

    const handleImport = () => {
        setImportModalOpen(true);
        setImportButtonDepressed(true);
    }

    const handleCloseImportModal = () => {
        importRule(importString);
        setImportString("");
        setImportModalOpen(false);
        setImportButtonDepressed(false);
    }

    const importModalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return <div className="panel-horizontal rule-panel">
        <Modal
            open={importModalOpen}
            onClose={handleCloseImportModal}
        >
            <Box sx={importModalStyle}>
                <input value={importString} 
                        onChange={e => setImportString(e.target.value)} />
                <button onClick={handleCloseImportModal}>IMPORT</button>
            </Box>
        </Modal>
        <fieldset>
            <legend>RULE</legend>
            <div className="control-column">
                <div className="control-row">
                    <div className="input-with-label">
                        <span>RND</span>
                        <LightSwitch 
                            onChange={(val: boolean) => val && simulation.randomizeRule()}
                            toggle={false}
                        />
                    </div>
                    <div className="input-with-label">
                        <span>GPU</span>
                        <LightSwitch 
                            onChange={setCpuRuleControl}
                            toggle={true}
                            value={cpuRuleControl}
                        />
                        <span className="bottom-label">CPU</span>
                    </div>
                    <div className="input-with-label">
                        <span>MUT</span>
                        <LightSwitch 
                            onChange={(val: boolean) => val && simulation.mutateRule()}
                            toggle={false}
                        />
                    </div>
                </div>
                <div className="control-row io-and-cpu-knob">
                    <div className="input-with-label">
                        <span>IMPORT</span>
                        <PushButton 
                            key={importButtonDepressed ? 1 : 0}
                            label={""}
                            onChange={(val: boolean) => val ? handleImport() : null}
                            toggle={false}
                            value={importButtonDepressed}
                        />
                    </div>
                    <div className="input-with-label">
                        <span>EXPORT</span>
                        <PushButton 
                            label={""}
                            onChange={(val: boolean) => val ? exportRule() : null}
                            toggle={false}
                        />
                    </div>
                </div>
                <CassetteSlot 

                />
                <div className="knob-row">
                    <Knob 
                        options={dialOptions}
                        defaultValue={n - 2}
                        onChange={handleDialChange}
                    />
                </div>
                <div className="knob-row">
                    <Knob 
                        options={framerateOptions}
                        defaultValue={framerateIdx}
                        onChange={setFramerateIdx}
                        emphasize={2}
                        size={80}
                    />
                </div>
            </div>
        </fieldset>
    </div>
};

export default React.memo(RulePanel);