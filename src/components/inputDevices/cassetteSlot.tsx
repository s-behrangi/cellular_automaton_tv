import React from 'react';
import "./cassetteSlot.css";

interface cassetteSlotProps{
    onClick?: () => void,
}

const CassetteSlot: React.FC<cassetteSlotProps> = ({
    onClick = () => null,
}) => {

    return (
    <div className="cassette-slot-housing gutter" onClick={onClick}>
        <div className="cassette-slot-inset">
            <div className="cassette-slot-slot-top-rail" />
            <div className="cassette-slot-slot-wide" />
            <div className="cassette-slot-slot-shadow-under" />
            <div className="cassette-slot-slot-shadow-cover" />
            <div className="cassette-slot-slot-tall" />
            <div className="cassette-slot-slot-ridge" style={{left: '30px'}}/>
            <div className="cassette-slot-slot-ridge" style={{left: '130px'}}/>
        </div>
        <div className="cassette-slot-inset-shadow" />
    </div>
    );
};

export default React.memo(CassetteSlot);