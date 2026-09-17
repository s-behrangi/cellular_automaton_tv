import React from 'react';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';

interface miscPanelProps{
    simulation: Automaton,
}

const MiscPanel: React.FC<miscPanelProps> = ({
    simulation,
}) => {
    const displayText = useAutomatonStore((s) => s.displayText);
    const cpuRuleControl = useAutomatonStore((s) => s.cpuRuleControl);

    return <div className="panel-horizontal" style={{width: '800px', fontSize: '14px'}}>
        <fieldset>
            <legend>MISCELLANEOUS</legend>
            <p>This is a temporary panel while I get everything together.</p>
            <p>Quick Start: hit the play/pause toggle (&#9199;) and then "FLASH" under the draw panel. Experiment by hitting RND to randomize rule, MUT to mutate existing rule, left/right arrows to change number of states. States go up to 21, but higher states will be slower unless you switch from CPU to GPU. GPU randomization may be poorer. "1" under COLOUR toggles making the base state black, and "N" toggles making state N white.</p>
            <span>You are currently using the <b>{cpuRuleControl ? "CPU" : "GPU"}</b> for rule control.</span>
            <p>Toggle the CRT style between Aperture Grille and Shadow Mask:</p>
            <button onClick={() => simulation.toggleCRTStyle()}>TOGGLE</button>
            <span>{displayText}</span>
            <p>Note that the CRT shader is not meant to be used at less than 4x zoom (two scrolls zoomed in from furthest zoom).</p>
        </fieldset>
    </div>
};

export default React.memo(MiscPanel);