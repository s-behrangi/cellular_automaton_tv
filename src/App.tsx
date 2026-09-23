import { useEffect, useRef } from 'react'
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
        <div className="control-column">
          <PlaybackPanel
            simulation={automaton.simulation}
            cRef = {canvasRef}
          />
        </div>
        
        
        <RulePanel
          simulation={automaton.simulation}
          importRule={automaton.importRule}
          exportRule={automaton.exportRule}
        />
        <div className="control-column">
          <DrawPanel
            simulation={automaton.simulation}
          />
          <ColourPanel
          />
        </div>
        
      </div>
      <div className="control-row">
      <MiscPanel
        simulation={automaton.simulation}
      />
      </div>
    </>
  )
}

export default App
