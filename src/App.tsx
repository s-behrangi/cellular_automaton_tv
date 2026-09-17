import { useEffect, useRef, useState } from 'react'
import { useAutomatonStore } from './automatonStore';
import './App.css'
import { useAutomaton } from './hooks/useAutomaton.ts';
import RulePanel from './components/rulePanel.tsx';
import DrawPanel from './components/drawPanel.tsx';
import PlaybackPanel from './components/playbackPanel.tsx';
import ColourPanel from './components/colourPanel.tsx';
import MiscPanel from './components/miscPanel.tsx';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  
  const automaton = useAutomaton(canvasRef);

  useEffect(() => {
    if (canvasRef.current) {
      automaton.newAutomaton();
    }
  }, []);

  return (
    <>
      <div className="machine">
        <canvas ref = {canvasRef} />
        <PlaybackPanel
          simulation={automaton.simulation}
          cRef = {canvasRef}
        />
        <DrawPanel
          simulation={automaton.simulation}
        />
        <RulePanel
          simulation={automaton.simulation}
          importRule={automaton.importRule}
          exportRule={automaton.exportRule}
        />
        <ColourPanel
          simulation={automaton.simulation}
        />
      </div>
      <MiscPanel
        simulation={automaton.simulation}
      />
    </>
  )
}

export default App
