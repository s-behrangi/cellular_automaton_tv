import React, { useState } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import BinarySwitch from './inputDevices/binarySwitch.tsx';
import WingedSelector from './inputDevices/wingedSelector.tsx';
import Knob from './inputDevices/knob.tsx';
import PushButton from './inputDevices/pushButton.tsx';
import './rulePanel.css';
import { FRAMERATES } from '../constants.ts';

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

    return <div className="panel-horizontal rule-panel">
        <fieldset>
            <legend>RULE</legend>
            <div className="control-column">
                <div className="control-row">
                    <span>RND</span><span>MUT</span>
                </div>
                <div className="control-row">
                    <BinarySwitch 
                        onChange={(val: boolean) => val && simulation.randomizeRule()}
                        toggle={false}
                    />
                    <BinarySwitch 
                        onChange={(val: boolean) => val && simulation.mutateRule()}
                        toggle={false}
                    />
                </div>
                <div className="control-row io-and-cpu-knob">
                    <PushButton 
                        label={"IN"}
                        onChange={(val: boolean) => val ? importRule(importString) : null}
                        toggle={false}
                    />
                    <WingedSelector
                        options={["CPU", "GPU"]}
                        value={
                            (cpuRuleControl ? 0 : 1)
                        }
                        onChange={(i) => setCpuRuleControl(i == 0)}
                        size={70}
                    />
                    <PushButton 
                        label={"&#128190;"}
                        onChange={(val: boolean) => val ? exportRule() : null}
                        toggle={false}
                    />
                </div>
                <input value={importString} 
                        onChange={e => setImportString(e.target.value)} />
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