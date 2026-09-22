import React, { useState } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';
import BinarySwitch from './inputDevices/binarySwitch.tsx';
import Knob from './inputDevices/knob.tsx';

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

    const setCpuRuleControl = useAutomatonStore((s) => s.setCpuRuleControl);

    const [importString, setImportString] = useState<string>("");

    const handleDialChange = (i: number) => setN(i + 2);
    const dialOptions = ["2", "", "", "", "", "7", "", "", "", "", "12", "", "", "", "", "17", "", "", "", ""];
    
    return <div className="panel-horizontal">
        <fieldset>
            <legend>RULE</legend>
            <div className="control-column">

                    <Knob 
                        options={dialOptions}
                        onChange={handleDialChange}
                    />

                <div className="control-row">
                    <div className="control-column">
                        <span>RND</span>
                        <BinarySwitch 
                            onChange={(val: boolean) => val && simulation.randomizeRule()}
                            toggle={false}
                        />
                        <BinarySwitch 
                            onChange={(val: boolean) => val && simulation.mutateRule()}
                            toggle={false}
                        />
                        <span>MUT</span>
                    </div>
                    <div className="control-column">
                        <span>CPU</span>
                        <BinarySwitch 
                            onChange={(val: boolean) => setCpuRuleControl(!val)}
                            toggle={true}
                        />
                        <span>GPU</span>
                    </div>
                </div>
                <div className="control-row">
                    <button onClick={() => importRule(importString)}>IN</button>
                    <button onClick={() => exportRule()}>OUT</button>
                </div>
                <input value={importString} 
                    onChange={e => setImportString(e.target.value)} />
            </div>
        </fieldset>
    </div>
};

export default React.memo(RulePanel);