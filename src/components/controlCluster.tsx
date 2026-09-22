import React from 'react';
import { Automaton } from '../automaton.ts';
import PushButton from './inputDevices/pushButton.tsx';
import './controlCluster.css';

interface controlClusterProps{
    simulation: Automaton,
}

const ControlCluster: React.FC<controlClusterProps> = ({
    simulation,
}) => {

    const handlePan = (s: string) => (val: boolean) => {
        val ? simulation.setPanDir(s) : simulation.setPanDir("");
    }

    const handleZoom = (d: number) => (val: boolean) => {
        val ? simulation.changeZoom(d) : null;
    }
    
    return <div className="control-cluster-wrapper"> 
                <div className="control-cluster">
                        <div className="up-button">
                            <PushButton 
                                label={"▲"}
                                onChange={handlePan("up")}
                                toggle={false}
                            />
                        </div>
                    <div className="control-row">
                        <div className="left-button">
                            <PushButton 
                                label={"◀"}
                                onChange={handlePan("left")}
                                toggle={false}
                            />
                        </div>
                        <div className="control-column zoom-button">
                            <div className="zoom-in-button">
                                <PushButton 
                                    label={"+"}
                                    onChange={handleZoom(1)}
                                    toggle={false}
                                />
                            </div>
                            <div className="zoom-out-button">
                                <PushButton 
                                    label={"-"}
                                    onChange={handleZoom(-1)}
                                    toggle={false}
                                />
                            </div>
                        </div>
                        <div className="right-button">
                            <PushButton 
                                label={"▶"}
                                onChange={handlePan("right")}
                                toggle={false}
                            />
                        </div>
                    </div>
                    <div className="control-row">
                        <div className="down-button">
                            <PushButton 
                                label={"▼"}
                                onChange={handlePan("down")}
                                toggle={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
};

export default React.memo(ControlCluster);