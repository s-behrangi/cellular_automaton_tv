import React, { useState, useRef, useEffect } from 'react';
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
import { rankToCombo, binomial } from '../utils/mathUtils.ts';

const EDIT_MODAL_ROWS = 20;

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

    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [editButtonDepressed, setEditButtonDepressed] = useState<boolean>(false);
    const [editModalPage, setEditModalPage] = useState<number>(0);
    const ruleArrayRef = useRef<Uint8Array | null>(null);
    const [ruleSpan, setRuleSpan] = useState<number>(9);

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

    useEffect(() => {
        setRuleSpan(binomial(n + 7, 8));
    }, [n])

    const handleEdit = (i: number, entry: number) => {
        simulation.setRuleEntry(i, entry - 1)
    }

    const handleChangeModalPage = (diff: number, n: number, ruleSpan: number) => {
        setEditModalPage((prev) => Math.max(
            0,
            Math.min(
                prev + diff,
                Math.floor((n * ruleSpan) / EDIT_MODAL_ROWS)
            )
        ))
    }

    const rowRange = (i: number, ruleSpan: number, n: number) => {
        const ruleLength = ruleSpan * n;
        const arr = [];
        for (let idx = i; idx < Math.min(ruleLength, i + EDIT_MODAL_ROWS); idx++) {
            arr.push(idx);
        }
        return arr;
    }

    const editInputRow = (i: number, n: number, ruleSpan: number) => {
        const state = Math.floor(i / ruleSpan);
        const idx = i % ruleSpan;
        const neighbourhood = `[${rankToCombo(idx, n, 8).map((x) => x + 1).join(", ")}]`;

        return (
            <div className="edit-input-row" key={i}>
                <span className="edit-input-idx">
                    {i + 1}
                </span>
                <span className="edit-input-state">
                    {state + 1}
                </span>
                <span className="edit-input-neighbourhood">
                    {neighbourhood}
                </span>
                <input 
                    className="edit-input-input" 
                    defaultValue={ruleArrayRef.current ? ruleArrayRef.current[i] + 1 : 1} 
                    onChange={e => handleEdit(i, Number(e.target.value))} 
                    pattern="[0-9]*"
                    onBlur={e => e.target.value = `${Math.max(1, Math.min(n, Number(e.target.value)))}`}
                    inputMode="numeric"
                />
            </div>
        )
    }

    const handleEditModal = (val: boolean) => {
        if (val) {
            simulation.synchronizeRuleArray();
            ruleArrayRef.current = simulation.getRule();
            console.log(ruleArrayRef.current[3]);
        }
        setEditModalOpen(val);
        setEditButtonDepressed(val);
    }

    const editModalStyle = {
        position: 'absolute',
        top: '40%',
        left: '70%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        bgcolor: 'var(--machine-colour)',
        borderRadius: '2px',
        border: 'none',
        boxShadow: 24,
        p: 4,
        outline: 'none',
    };

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
        bgcolor: 'var(--machine-colour)',
        border: 'none',
        boxShadow: 24,
        p: 4,
    };

    return <div className="panel-horizontal rule-panel plateau">
        <Modal
            open={editModalOpen}
            onClose={() => handleEditModal(false)}
        >
            <Box
                sx={editModalStyle}
            >
                <span id="edit-modal-headers" >
                    {`Index  State   Neighbourhood                      Output`}
                </span>
                {
                    rowRange(editModalPage * EDIT_MODAL_ROWS, ruleSpan, n).map((idx) => (
                        editInputRow(idx, n, ruleSpan)
                    ))
                }
                <span className="edit-modal-page-button" id="edit-modal-page-left" onClick={() => handleChangeModalPage(-1, n, ruleSpan)}>←</span>
                <span className="edit-modal-page-button" id="edit-modal-page-right" onClick={() => handleChangeModalPage(1, n, ruleSpan)}>→</span>
            </Box>
        </Modal>


        <Modal
            open={importModalOpen}
            onClose={handleCloseImportModal}
        >
            <Box sx={importModalStyle}>
                <span style={{marginRight: '10px'}}>Provide encoded rule:</span>
                <input value={importString} 
                        onChange={e => setImportString(e.target.value)} />
                <button style={{fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: 'var(--machine-text)', marginLeft: '10px'}} onClick={handleCloseImportModal}>→</button>
            </Box>
        </Modal>
        
            <span className="panel-name" id="rule-panel-name">RULE</span>
            <div id="rule-lighting" />
            <div className="control-column" id="rule-panel-contents">
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
                        <span>EDIT</span>
                        <PushButton 
                            key={editButtonDepressed ? 1 : 0}
                            label={""}
                            onChange={(val: boolean) => handleEditModal(val)}
                            toggle={false}
                            value={editModalOpen}
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
                <div className="input-with-label" id="n-knob" key={n}>
                    <Knob 
                        options={dialOptions}
                        defaultValue={n - 2}
                        onChange={handleDialChange}
                    />
                    <span className="bottom-label" id="n-label">N</span>
                </div>
                <div className="input-with-label">
                    <Knob 
                        options={framerateOptions}
                        defaultValue={framerateIdx}
                        onChange={setFramerateIdx}
                        emphasize={2}
                        size={80}
                    />
                    <span className="bottom-label" id="framerate-label">FRAMERATE</span>
                </div>
            </div>
    </div>
};

export default React.memo(RulePanel);