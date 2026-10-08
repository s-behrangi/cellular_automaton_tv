import React, { useState, useRef, useEffect } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import PushButton from './inputDevices/pushButton.tsx';
import './rulePanel.css';
import { FRAMERATES, MAX_N, MIN_N } from '../constants.ts';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/material';
import { rankToCombo, binomial } from '../utils/mathUtils.ts';
import NumericalInput from './inputDevices/numericalInput.tsx';
import JackalSlider from './inputDevices/jackalSlider.tsx';
import ColourSwatch from './colourSwatch.tsx';
import gavazn from '../assets/gavazn.svg';
import { MANUAL_ONE, MANUAL_TWO } from './manual.tsx';
import './compactPanel.css';

const EDIT_MODAL_ROWS = 20;
const nValues = Array.from({length: MAX_N - MIN_N + 1}, (_, idx) => idx + 2).map((x) => `${x}`);
const framerateValues = FRAMERATES.map((x) => `${x == 1000 ? "MAX" : x}`);
const brushSizeValues = [1, 2, 3, 4, 5, 10, 15, 20, 50, 100];
const brushStateValues = Array.from({length: MAX_N}, (_, idx) => idx + 1).map((x) => `${x}`);
const hueTicks = Array.from({length: 19}, (_, idx) => idx * (1 / 18.0));
const satLumVarTicks = Array.from({length: 11}, (_, idx) => idx * 0.1);


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

    const framerateIdx = useAutomatonStore((s) => s.framerateIdx);
    const setFramerateIdx = useAutomatonStore((s) => s.setFramerateIdx);

    const isPlaying = useAutomatonStore((s) => s.isPlaying);
    const setIsPlaying = useAutomatonStore((s) => s.setIsPlaying);

    const useCRT = useAutomatonStore((s) => s.useCRT);
    const setUseCRT = useAutomatonStore((s) => s.setUseCRT);

    const ruleDraw = useAutomatonStore((s) => s.ruleDraw);
    const setRuleDraw = useAutomatonStore((s) => s.setRuleDraw);
    
    const fullscreen = useAutomatonStore((s) => s.fullscreen);
    const setFullscreen = useAutomatonStore((s) => s.setFullscreen);
    
    const compactMode = useAutomatonStore((s) => s.compactMode);
    const setCompactMode = useAutomatonStore((s) => s.setCompactMode);

    const primaryColour = useAutomatonStore((s) => s.primaryColour);
    const setPrimaryColour = useAutomatonStore((s) => s.setPrimaryColour);

    const distinguishZeroColour = useAutomatonStore((s) => s.distinguishZeroColour);
    const setDistinguishZeroColour = useAutomatonStore((s) => s.setDistinguishZeroColour);

    const distinguishMaxColour = useAutomatonStore((s) => s.distinguishMaxColour);
    const setDistinguishMaxColour = useAutomatonStore((s) => s.setDistinguishMaxColour);

    const colouringStyleIdx = useAutomatonStore((s) => s.colouringStyleIdx);
    const setColouringStyle = useAutomatonStore((s) => s.setColouringStyle);

    const colouringStyleVariable = useAutomatonStore((s) => s.colouringStyleVariable);
    const setColouringStyleVariable = useAutomatonStore((s) => s.setColouringStyleVariable);

    const setBrushSize = useAutomatonStore((s) => s.setBrushSize);
    const [brushSizeIdx, setBrushSizeIdx] = useState<number>(0);

    useEffect(() => {
        setBrushSize(brushSizeValues[brushSizeIdx]);
    }, [brushSizeIdx])

    const brushState = useAutomatonStore((s) => s.brushState);
    const setBrushState = useAutomatonStore((s) => s.setBrushState);

    const [manualOpen, setManualOpen] = useState<boolean>(false);
    const [manualFirstPage, setManualFirstPage] = useState<boolean>(true);

    const handleManualOpen = () =>{
        setManualOpen(true);
    }

    const handleManualClose = () =>{
        setManualOpen(false);
        setManualFirstPage(true);
    }

    const manualStyle = {
        position: 'absolute',
        top: '50px',
        left: '20%',
        width: 1100,
        height: 720,
        bgcolor: 'background.paper',
        border: 'none',
        borderRadius: '2px',
        boxShadow: 24,
        p: 4,
        outline: 'none',
    };

    const handleStep = () => {
        setIsPlaying(false);
        simulation.stepSim();
    }

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
        } else {
            setEditModalPage(0);
        }
        setEditModalOpen(val);
        setEditButtonDepressed(val);
    }

    const handleEditModalManualPageChange = (e: React.ChangeEvent<HTMLInputElement>, n: number, ruleSpan: number) => {
        const newPage = Math.max(0, Math.min(Number(e.target.value) - 1, n * ruleSpan - 1));
        setEditModalPage(newPage);
    }

    const editModalStyle = {
        position: 'absolute',
        top: '40%',
        left: '70%',
        transform: 'translate(-50%, -50%)',
        width: 530,
        height: 640,
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

    return <div id="compact-panel">
        <Modal
            open={manualOpen}
            onClose={handleManualClose}
            sx={{overflow:"auto"}}
        >
            <Box sx={manualStyle}>
                {manualFirstPage ? MANUAL_ONE : MANUAL_TWO}
                <span 
                    id={`${manualFirstPage ? "to-second-page" : "to-first-page"}`}
                    onClick={() => setManualFirstPage((prev) => !prev)}
                    style={{
                        cursor: "pointer",
                        color: "black",
                        fontSize: "24px",
                        position: "absolute",
                        top: "95%",
                    }}
                >
                    {manualFirstPage ? "→" : "←"}
                </span>
            </Box>
        </Modal>
        <Modal
            open={editModalOpen}
            onClose={() => handleEditModal(false)}
        >
            <Box
                sx={editModalStyle}
            >
                <span id="edit-modal-headers" >
                    {`Index     State  Neighbourhood                     Output`}
                </span>
                {
                    rowRange(editModalPage * EDIT_MODAL_ROWS, ruleSpan, n).map((idx) => (
                        editInputRow(idx, n, ruleSpan)
                    ))
                }
                <span className="edit-modal-page-button" id="edit-modal-page-left" onClick={() => handleChangeModalPage(-1, n, ruleSpan)}>←</span>
                <span className="edit-modal-page-button" id="edit-modal-page-right" onClick={() => handleChangeModalPage(1, n, ruleSpan)}>→</span>
                <form onSubmit={(e) => {e.preventDefault(); setEditModalPage(Math.max(0, Math.min(Number((e.target.elements.namedItem('currentpage')! as HTMLInputElement).value) - 1, Math.floor((n * ruleSpan) / EDIT_MODAL_ROWS))));}}>
                    <input 
                        id="edit-current-page" 
                        name="currentpage"
                        key={editModalPage}
                        defaultValue={editModalPage + 1}
                        pattern="[0-9]*"
                        onBlur={e => handleEditModalManualPageChange(e, n, ruleSpan) }
                        inputMode="numeric"
                    />
                </form>
                <span id="edit-total-page-count">/{Math.floor((n * ruleSpan) / EDIT_MODAL_ROWS) + 1}</span>
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
        <div className="control-row button-row">
            <div className="input-with-label">
                <span>STEP</span>
                <PushButton 
                    onChange={(val: boolean) => val ? handleStep() : null}
                    toggle={false}
                />
            </div>
            <div key={fullscreen ? 111 : 11110} className='input-with-label'>
                <span>FllScrn</span>
                <PushButton 
                    onChange={(val: boolean) => val ? setFullscreen(true) : null}
                    toggle={false}
                    value={fullscreen}
                />
            </div>
            <div key={compactMode ? 1110 : 111100} className='input-with-label'>
                <span>Compact</span>
                <PushButton 
                    onChange={setCompactMode}
                    toggle={true}
                    value={compactMode}
                />
            </div>
            <div className="input-with-label">
                <span>PLAY</span>
                <PushButton 
                    key={isPlaying ? "a" : "b"}
                        onChange={setIsPlaying}
                        value={isPlaying}
                        toggle={true}
                />
            </div>      
        </div>
        <div className="control-row button-row">
            <div className="input-with-label">
                <span>RND</span>
                <PushButton 
                    onChange={(val: boolean) => val && simulation.randomizeRule()}
                    toggle={false}
                />
            </div>
            <div className="input-with-label">
                <span>CPU</span>
                <PushButton 
                    onChange={setCpuRuleControl}
                    toggle={true}
                    value={cpuRuleControl}
                />
            </div>
            <div className="input-with-label">
                <span>MUT</span>
                <PushButton 
                    onChange={(val: boolean) => val && simulation.mutateRule()}
                    toggle={false}
                />
            </div>
        </div>
        <div className="control-row button-row">
            <div className="input-with-label">
                <span>IMPORT</span>
                <PushButton 
                    key={importButtonDepressed ? 1 : 0}
                    onChange={(val: boolean) => val ? handleImport() : null}
                    toggle={false}
                    value={importButtonDepressed}
                />
            </div>
            <div className="input-with-label">
                <span>EDIT</span>
                <PushButton 
                    key={editButtonDepressed ? 3 : 2}
                    onChange={(val: boolean) => handleEditModal(val)}
                    toggle={false}
                    value={editModalOpen}
                />
            </div>
            <div className="input-with-label">
                <span>EXPORT</span>
                <PushButton 
                    onChange={(val: boolean) => val ? exportRule() : null}
                    toggle={false}
                />
            </div>      
        </div>
        <div className="control-row">
            <div className="input-with-label">
                <span>N</span>
                <NumericalInput 
                    values={nValues}
                    idx={n - 2}
                    onChange={(idx: number) => setN(idx + 2)}
                    displayWidth={35}
                />
            </div>
            <div className="input-with-label">
                <span>FRAMERATE</span>
                <NumericalInput 
                    values={framerateValues}
                    idx={framerateIdx}
                    onChange={setFramerateIdx}
                    displayWidth={35}
                />
            </div>            
        </div>
        <div className="control-row button-row">
            <div className="input-with-label">
                <span>CLEAR</span>
                <PushButton 
                    onChange={(val: boolean) => simulation.setClear(val)}
                    toggle={false}
                />
            </div>
            <div className="input-with-label">
                <span>FLASH</span>
                <PushButton 
                    onChange={(val: boolean) => simulation.setFlash(val)}
                    toggle={false}
                />
            </div>
            <div className="input-with-label">
                <span>DOT</span>
                <PushButton 
                    onChange={(val: boolean) => simulation.setDot(val)}
                    toggle={false}
                />
            </div>
        </div>
        <div className="control-row">
            <div className="input-with-label">
                <span>Brush Size</span>
                <NumericalInput 
                    values={brushSizeValues.map((x) => `${x}`)}
                    idx={brushSizeIdx}
                    onChange={setBrushSizeIdx}
                    displayWidth={35}
                />
            </div>
            <div className="input-with-label">
                <span>Brush State</span>
                <NumericalInput 
                    values={brushStateValues}
                    idx={brushState}
                    onChange={setBrushState}
                    displayWidth={35}
                />
            </div>            
        </div>
        <div className="control-row button-row" id="compact-colour-mode-row">
            <div className="input-with-label">
                <span>HUE/LUM</span>
                <PushButton 
                    onChange={(val: boolean) => val ? setColouringStyle(1) : setColouringStyle(0)}
                    toggle={true}
                    value={colouringStyleIdx == 1}
                />
            </div>
            <JackalSlider 
                value={colouringStyleVariable}
                onChange={(x: number) => setColouringStyleVariable(x)}
                max={100}
                min={0}
                ticks={true}
                upTicks={false}
                tickList={satLumVarTicks}
                emphasize={5}
                size={115}
                thumbHeight={24}
                thumbWidth={15}
            />
            <div className="control-row" id="compact-endpoint-buttons">
                <div className="input-with-label">
                    <span>{"[⋅"}</span>
                    <PushButton 
                        onChange={setDistinguishZeroColour}
                        toggle={true}
                        value={distinguishZeroColour}
                    />
                </div>
                <div className="input-with-label">
                    <span>{"⋅]"}</span>
                    <PushButton 
                        onChange={setDistinguishMaxColour}
                        toggle={true}
                        value={distinguishMaxColour}
                    />
                </div>
            </div>
        </div>
        <div className="control-column" id="compact-hsl-column">
            <div className="control-row hsl-with-label">
                <JackalSlider 
                    value={primaryColour.h}
                    onChange={(newValue: number) => setPrimaryColour('h', newValue)}
                    min={0}
                    max={359}
                    ticks={true}
                    downTicks={false}
                    tickList={hueTicks}
                    emphasize={6}
                    size={250}
                    thumbHeight={24}
                    thumbWidth={15}
                />
                <span className="label">H</span>
            </div>
            <div className="control-row hsl-with-label">
                <JackalSlider 
                    value={primaryColour.s}
                    onChange={(newValue: number) => setPrimaryColour('s', newValue)}
                    min={0}
                    max={100}
                    ticks={true}
                    downTicks={false}
                    tickList={satLumVarTicks}
                    emphasize={5}
                    size={250}
                    thumbHeight={24}
                    thumbWidth={15}
                />
                <span className="label">S</span>
            </div>
            <div className="control-row hsl-with-label">
                <JackalSlider 
                    value={primaryColour.l}
                    onChange={(newValue: number) => setPrimaryColour('l', newValue)}
                    min={0}
                    max={100}
                    ticks={true}
                    downTicks={false}
                    tickList={satLumVarTicks}
                    emphasize={5}
                    size={250}
                    thumbHeight={24}
                    thumbWidth={15}
                />
                <span className="label">L</span>
            </div>
        </div>
        <div id="compact-colour-swatch">
            <ColourSwatch 
                dotRes={2}
            />
        </div> 
        <div className="control-row button-row">
            <div className="input-with-label">
                <span>RULE VIS</span>
                <PushButton 
                    onChange={setRuleDraw}
                    value={ruleDraw}
                    toggle={true}
                />
            </div>
            <div className="input-with-label">
                <span>CRT</span>
                <PushButton
                    onChange={setUseCRT}
                    value={useCRT}
                    toggle={true}
                />
            </div>    
        </div>
        <div id="compact-logo-cluster">
                    <img src={gavazn} alt="Gavazn 313" id="gavazn-logo"/>
                    <span id="logo-subtitle">Cellular Automata</span>
                    <span id="help-button" onClick={handleManualOpen}>?</span>
        </div> 
        <span className="compact-section-header" id="rule-header">RULE</span>
        <span className="compact-section-header" id="draw-header">DRAW</span>
        <span className="compact-section-header" id="colour-header">COLOUR</span>
        <hr className="header-line" id="rule-header-line" />
        <hr className="header-line" id="draw-header-line" />
        <hr className="header-line" id="colour-header-line" />
    </div>
};

export default React.memo(RulePanel);