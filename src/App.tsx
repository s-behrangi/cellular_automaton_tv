import { useEffect, useRef } from 'react'
import './App.css'
import { useAutomaton } from './hooks/useAutomaton.ts';
import RulePanel from './components/rulePanel.tsx';
import DrawPanel from './components/drawPanel.tsx';
import PlaybackPanel from './components/playbackPanel.tsx';
import ColourPanel from './components/colourPanel.tsx';
import PresetPanel from './components/presetPanel.tsx';

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
        <div className="machine-face">
          <div id="screen-housing">
            <div id="screen-inset">
              <canvas ref = {canvasRef} />
            </div>
          </div>
          
          
          <PlaybackPanel
            simulation={automaton.simulation}
            cRef = {canvasRef}
          />
        
          
          <RulePanel
            simulation={automaton.simulation}
            importRule={automaton.importRule}
            exportRule={automaton.exportRule}
          />
          <div className="control-column" id="rightside-panels">
            <DrawPanel
              simulation={automaton.simulation}
            />
            <PresetPanel
              setPreset={automaton.setPreset}
            />
            <ColourPanel
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
