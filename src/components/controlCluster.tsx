import React from 'react';
import { Automaton } from '../automaton.ts';

interface controlClusterProps{
    simulation: Automaton,
}

const ControlCluster: React.FC<controlClusterProps> = ({
    simulation,
}) => {
    
    return <div className="control-cluster">
        <div className="control-row">
            <button 
                onPointerDown={() => simulation.setPanDir("up")}
                onPointerUp={() => simulation.setPanDir("")}
            >
                ▲
            </button>
        </div>
        <div className="control-row">
            <button 
                onPointerDown={() => simulation.setPanDir("left")}
                onPointerUp={() => simulation.setPanDir("")}
            >
                ◀
            </button>
            <div className="control-column">
                <button onClick={() => simulation.changeZoom(1)}>+</button>
                <button onClick={() => simulation.changeZoom(-1)}>-</button>
            </div>
            <button 
                onPointerDown={() => simulation.setPanDir("right")}
                onPointerUp={() => simulation.setPanDir("")}
            >
                ▶
            </button>
        </div>
        <div className="control-row">
            <button 
                onPointerDown={() => simulation.setPanDir("down")}
                onPointerUp={() => simulation.setPanDir("")}
            >
                ▼
            </button>
        </div>
    </div>
};

export default React.memo(ControlCluster);