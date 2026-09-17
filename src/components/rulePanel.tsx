import React, { useState } from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';

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

    const decN = () => setN(n - 1);
    const incN = () => setN(n + 1);
    
    return <div className="panel-horizontal">
        <fieldset>
            <legend>RULE</legend>
            <div className="control-column">
                <div className="control-row">
                    <button onClick={() => decN()}>&lt;</button>
                    <span>{n}</span>
                    <button onClick={() => incN()}>&gt;</button>
                </div>
                <div className="control-row">
                    <div className="control-column">
                        <button onClick={() => simulation.randomizeRule()}>RND</button>
                        <button onClick={() => simulation.mutateRule()}>MUT</button>
                    </div>
                    <div className="control-column">
                        <button onClick={() => setCpuRuleControl(!cpuRuleControl)}>CPU</button>
                        <button onClick={() => importRule(importString)}>IN</button>
                        <button onClick={() => exportRule()}>OUT</button>
                    </div>
                </div>
                <input value={importString} 
                    onChange={e => setImportString(e.target.value)} />
            </div>
        </fieldset>
    </div>
};

export default React.memo(RulePanel);