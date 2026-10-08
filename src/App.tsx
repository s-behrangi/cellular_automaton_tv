import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useAutomaton } from './hooks/useAutomaton.ts';
import RulePanel from './components/rulePanel.tsx';
import DrawPanel from './components/drawPanel.tsx';
import PlaybackPanel from './components/playbackPanel.tsx';
import ColourPanel from './components/colourPanel.tsx';
import PresetPanel from './components/presetPanel.tsx';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/material';
import { FIRST_TIME_TEXT } from './components/manual.tsx';
import { useAutomatonStore } from './automatonStore.ts';
import { FULLSCREEN_INSTRUCTIONS } from './constants.ts';
import CompactPanel from './components/compactPanel.tsx';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullscreenInstructionsRef = useRef<ReturnType<typeof setTimeout> | null>(null); 

  const [firstTimeModalOpen, setFirstTimeModalOpen] = useState<boolean>(false);

  const [fullScreenInstructionsClass, setFullScreenInstructionsClass] = useState<string>("hidden-fullscreen-instructions");
  const [canvasFullscreen, setCanvasFullscreen] = useState<string>("");

  const automaton = useAutomaton(canvasRef);

  const togglePlaying = useAutomatonStore((s) => s.toggleIsPlaying);
  const toggleCRT = useAutomatonStore((s) => s.toggleUseCRT);

  const setFullscreen = useAutomatonStore((s) => s.setFullscreen);
  const toggleFullscreen = useAutomatonStore((s) => s.toggleFullscreen);

  const compactMode = useAutomatonStore((s) => s.compactMode);

  useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.fullscreen,
            (fullscreen) => {
                document.body.style.overflowX = fullscreen ? "hidden" : "scroll";
                if (fullscreen) {
                  setFullScreenInstructionsClass("visible-fullscreen-instructions");
                  fullscreenInstructionsRef.current = setTimeout(() => {
                    setFullScreenInstructionsClass("fading-fullscreen-instructions");
                  }, 7000);
                  setCanvasFullscreen("fullscreen-canvas");
                } else {
                  if (fullscreenInstructionsRef.current) {
                    clearTimeout(fullscreenInstructionsRef.current);
                  }
                  setFullScreenInstructionsClass("hidden-fullscreen-instructions");
                  setCanvasFullscreen("");
                }
            }
        );

        return unsubscribe;
    }, []);
  
    useEffect(() => {
      automaton.simulation.updateCanvasSize();
    }, [canvasFullscreen])


  const firstTimeModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 300,
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '2px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
  };

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');

    if (!hasVisited) {
      setFirstTimeModalOpen(true);

      localStorage.setItem('hasVisitedBefore', 'true');
    }

    if (canvasRef.current) {
      automaton.newAutomaton();

      const handleWindowKeydown = (e: KeyboardEvent) => {
        switch (e.key) {
          case " ":
            togglePlaying();
            break;
          case "Escape":
            setFullscreen(false);
            break;
          case "r":
            automaton.simulation.randomizeRule();
            break;
          case "m":
            automaton.simulation.mutateRule();
            break;
          case "f":
            toggleFullscreen();
            break;
          case "c":
            toggleCRT();
            break;
          case "x":
            automaton.simulation.flash();
            break;
        }
      }

      const handleResize = () => automaton.simulation.updateCanvasSize();

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleWindowKeydown);

      return () => {
        window.removeEventListener('keydown', handleWindowKeydown);
        window.removeEventListener('resize', handleResize);
      }
    }
  }, []);

  return (
    <>
      <span id="fullscreen-instructions" className={fullScreenInstructionsClass}>
        {FULLSCREEN_INSTRUCTIONS}
      </span>

       <Modal
          open={firstTimeModalOpen}
          onClose={() => setFirstTimeModalOpen(false)}
          sx={{overflow:"auto"}}
      >
          <Box sx={firstTimeModalStyle}>
              {FIRST_TIME_TEXT}
          </Box>
      </Modal>

      <div className={`machine-recede ${compactMode ? "compact" : ""}`}>
        <div className={`machine ${compactMode ? "compact" : ""}`}>
          <div className={`${compactMode ? "compact" : ""}`} id="machine-lighting" />
          <div className={`machine-face ${compactMode ? "compact" : ""}`}>
            <div id="screen-housing" className={`${compactMode ? "compact" : ""}`} >
              <div id="screen-inset">
                <canvas ref = {canvasRef} id={canvasFullscreen}/>
              </div>
              {
                compactMode ?
                <CompactPanel 
                  simulation={automaton.simulation}
                  importRule={automaton.importRule}
                  exportRule={automaton.exportRule}
                />
                :
                <></>
              }
            </div>
            
            {
              compactMode ?
              <>
              </>
              :
              <>
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
                  <ColourPanel
                  />
                  <PresetPanel
                    setPreset={automaton.setPreset}
                  />
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default App
