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
import { useAudio } from './audio/audioProvider.tsx';
import CompactPanel from './components/compactPanel.tsx';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audio = useAudio();

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

  const [mute, setMute] = useState<boolean>(false);
  const toggleMute = () => setMute((prev) => !prev);
  useEffect(() => {
    audio.setMute(mute);
  }, [mute])

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
    width: 550,
    height: 320,
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
      <div id="mute-button" onClick={toggleMute}>
        {
          mute ? 
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-volume-mute-fill" viewBox="0 0 16 16">
            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
          </svg>
          :
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-volume-up-fill" viewBox="0 0 16 16">
            <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
            <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06"/>
          </svg>
      }
      </div>

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
