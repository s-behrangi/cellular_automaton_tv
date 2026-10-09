export const MANUAL_ONE = (
    <div id="manual" style={{columnCount: 2, columnGap: "40px", columnFill: "auto", height: "100%"}}>
        <h1>User Manual</h1>

        <p>This device ("the Gavazn") allows you to run and experiment with various cellular automata while customizing visualization options.</p>

        <h2>Quick Start</h2>

        <p>You can get the visualization running in just two steps:</p>
        <ol>
            <li>Hit <code>FLASH</code> in the <code>DRAW</code> controls.</li>
            <li>Flip the &#9199; switch to the upper-right of the main screen.</li>
        </ol>
        <p>This will populate the simulation with random noise, which will then evolve according to the rules of Conway's Game of Life. From there, you can...</p>
        <ul>
            <li>...select a different <code>PRESET</code> from the bottom-right corner.</li>
            <li>...draw on the canvas with your mouse or the <code>DOT</code> switch.</li>
            <li>...randomize the active rule with the <code>RND</code> switch.</li>
            <li>...turn the <code>N</code> knob to change the number of states.</li>
        </ul>

        <h2>Mathematical Specifications</h2>
        <p>The Gavazn runs a customizable cellular automaton. The automaton can have <code>2-21</code> states, which are 1-indexed within the UI. Therefore, state <code>1</code> corresponds to what is conventionally referred to as the <i>dead</i> state, and setting the brush to this state is equivalent to a conventional "erase" function. The geometry of the simulation is a <code>1024x1024</code> square with toroidal wrapping: the left and right edges connect, as do the top and bottom. </p>

        <h2>Complete Features</h2>
        <p>The Gavazn is divided into five (5) sections. From left-to-right, they are: the screen with its housing, the rule panel, the draw panel, the colour panel, and a preset selector.</p>
        
        <h3>Screen & Housing</h3>
        <ul>
            <li>
                <b>Screen:</b>
                <ul className="sublist">
                    <li>Where all the action happens. You may adjust the zoom level of the screen with your mouse wheel, draw on it with left-click, and pan around with shift + left-click.</li>
                </ul>
            </li>
            <li>
                <b><code>FULLSCREEN</code>:</b>
                <ul className="sublist">
                    <li>Switch to fullscreen mode; press <code>ESCAPE</code> to return to the main view.</li>
                </ul>
            </li>
            <li>
                <b>Playback Column:</b>
                <ul>
                    <li>
                        <b>Screenshot (<code>PNG</code>):</b>
                        <ul className="sublist">
                            <li>Capture a screenshot of the screen in <code>PNG</code> format.</li>
                        </ul>
                    </li>
                    <li>
                        <b>Record (&#128308;)</b>:
                        <ul className="sublist">
                            <li>Record a video of the screen as a <code>webm</code>. This button toggles, so you decide when the recording stops—though it will stop automatically at thirty seconds.</li>
                        </ul>
                    </li>
                    <br/>
                    <li>
                        <b>Step (&#8658;)</b>:
                        <ul className="sublist">
                            <li>Step the simulation forward one frame.</li>
                        </ul>
                    </li>
                    <li>
                        <b>Toggle Playback (&#9199;)</b>:
                        <ul className="sublist">
                            <li>Toggle the playback of the simulation.</li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li>
                <b>Control Cluster:</b>
                <ul className="sublist">
                    <li>
                        Buttons to pan and zoom in/out.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>RULE VIS</code>:</b>
                <ul className="sublist">
                    <li>
                        Show a visualization of the active rule instead of the simulation. You may draw on the rule texture just as on the simulation. Changes are applied automatically.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>CRT</code>:</b>
                <ul className="sublist">
                    <li>
                        Toggle a CRT shader designed to make the screen look like an old CRT display.
                    </li>
                    <li className="small-note">
                        <i>When the shader is on, the simulation is restricted to at least 4x zoom.</i>
                    </li>
                </ul>
            </li>
            
        </ul>

        <h3>Rule Panel</h3>
        <ul>
            <li>
                <b><code>RND</code>:</b>
                <ul>
                    <li>
                        Randomize the active rule.
                    </li>
                    <li className="small-note">
                        <i>The Gavazn does not store history. Once a rule is changed, it cannot be retrieved unless it was already exported (see below).</i>
                    </li>
                </ul>
            </li>
            <li>
                <b><code>GPU/CPU</code>:</b>
                <ul>
                    <li>
                        Toggle rule control between the GPU and the CPU.
                    </li>
                    <li className="small-note">
                        <i>The GPU handles randomization/mutation instantly, while the CPU slows down as <code>N</code> increases. For larger <code>N</code>, this can cause a perceptible lag when randomizing/mutating. However, the quality of random number generation is better guaranteed on the CPU. It is also possible that due to hardware constraints, your GPU may not be able to process larger <code>N</code>. Using GPU control is recommended, so long as it works well for you.</i>
                    </li>
                </ul>
            </li>
            <li>
                <b><code>MUT</code>:</b>
                <ul>
                    <li>
                        Mutate the active rule, changing ~5% of its entries.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>IMPORT/EXPORT</code>:</b>
                <ul>
                    <li>
                        You can export any rule into plaintext. The rule will be encoded and compressed before being copied to your clipboard. Exported rules can be imported; formatting must be exactly preserved.
                    </li>
                    <li>
                        <b>WARNING:</b> exporting rules for <code>N &gt; 12</code> or so may cause noticable lag. For <code>N &gt; 16</code>, export make take up to a minute and the rule may be multiple megabytes in size.
                    </li>
                </ul>
                <b><code>EDIT</code>:</b>
                <ul>
                    <li>
                        Manually edit the entries of any rule. Changes are applied automaticaly.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>N</code>:</b>
                <ul>
                    <li>
                        Change the number of states in the automaton. A new rule will be randomly generated for the corresponding <code>N</code>.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>FRAMERATE</code>:</b>
                <ul>
                    <li>
                        Control how many times the simulation steps in one second. <code>MAX</code> will run the simulation as fast as your machine and browser allow, up to 1000fps.
                    </li>
                </ul>
            </li>
        </ul>
    </div>
)

export const MANUAL_TWO = (
    <div id="manual" style={{columnCount: 2, columnGap: "40px", columnFill: "auto", height: "100%"}}>
        <h3>Draw Panel</h3>
        <ul>
            <li>
                <b><code>CLEAR</code>:</b>
                <ul>
                    <li>
                        Set the state of the entire simulation to <code>1</code>.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>FLASH</code>:</b>
                <ul>
                    <li>
                        Fill the simulation with random noise.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>DOT</code>:</b>
                <ul>
                    <li>
                        Clear the simulation except for a circular dot at its center.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>BRUSH SIZE</code>:</b>
                <ul>
                    <li>
                        Select the size of your brush (1-100).
                    </li>
                </ul>
            </li>
            <li>
                <b><code>BRUSH STATE</code>:</b>
                <ul>
                    <li>
                        Select the state of your brush; clamps to the current number of states.
                    </li>
                </ul>
            </li>
        </ul>
        
        <h3>Colour Panel</h3>
        <ul>
            <li>
                <b><code>MODE</code>:</b>
                <ul>
                    Set the algorithm used to assign colours to states. The slider immediately below controls the specific behaviour of each algorithm.
                    <ul>
                    <li>
                        <b><code>HUE</code>:</b>
                        <ul>
                            <li>Colours are selected out of a slice of the colour-wheel, evenly spaced across hues, with higher states given colours closer to the primary colour. The variable slider controls the size of the slice, i.e. the range of hues chosen from.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <b><code>LUM</code>:</b>
                        <ul>
                            <li>The highest state is assigned the primary colour; the remaining states, in descending order, approach a colour with the same hue and saturation as the primary colour, but the luminosity specified by the variable slider.</li>
                        </ul>
                    </li>
                    <li>
                        <b><code>BIN</code>:</b>
                        <ul>
                            <li>Treats the variable slider as a threshold, setting all states less than or equal to the threshold to black, and all those greater than it to the primary colour.</li>
                        </ul>
                    </li>
                    </ul>
                </ul>
            </li>
            <li>
                <b><code>ENDPOINTS</code>:</b>
                <ul>
                    <li>
                        Select whether state <code>1</code> is set to black and state <code>N</code> is set to white.
                    </li>
                </ul>
            </li>
            <li>
                <b><code>HSL</code>:</b>
                <ul>
                    <li>
                        Select the primary colour, assigned either to <code>N</code> or, if <code>N</code> is set to a white endpoint, <code>N - 1</code>.
                    </li>
                </ul>
            </li>
        </ul>

        <h3>Preset Selector</h3>

        <p>
            Select from multiple preset rules that produce interesting behaviour. The number in square brackets indicates the number of states for the rule. After selection, try either flashing the screen or drawing on it to see how the simulation evolves.
        </p>

        <ul>
            <li>
                <b>Life [2]:</b>
                <ul className="sublist">
                    <li>Conway's Game Of Life.</li>
                </ul>
            </li>
            <li>
                <b>Life Without Death [2]:</b>
                <ul className="sublist">
                    <li>Small groups of live cells tend to grow to fill the simulation.</li>
                </ul>
            </li>
            <li>
                <b>Day and Night [2]:</b>
                <ul className="sublist">
                    <li>Sufficiently large regions of live and dead cells will be stable while undulating.</li>
                </ul>
            </li>
            <li>
                <b>Satellites [3]:</b>
                <ul className="sublist">
                    <li>Flashing will produce replicators that look like small satellites.</li>
                </ul>
            </li>
            <li>
                <b>Circuitboard [3]:</b>
                <ul className="sublist">
                    <li>Noise will resolve into stable vertical and horizontal lines.</li>
                </ul>
            </li>
            <li>
                <b>Printers [4]:</b>
                <ul className="sublist">
                    <li>Small clusters of cells can produce a range of gliders that leave patterns in their wake.</li>
                </ul>
            </li>
            <li>
                <b>Diagonals [5]:</b>
                <ul className="sublist">
                    <li>Produces sharp diagonal replicators that cross-hatch.</li>
                </ul>
            </li>
            <li>
                <b>Highways [5]:</b>
                <ul className="sublist">
                    <li>Like Circuitboards above, but with replicators shaped a little like vehicles.</li>
                </ul>
            </li>
            <li>
                <b>Solar Panels [6]:</b>
                <ul className="sublist">
                    <li>Growing diamond replicators.</li>
                </ul>
            </li>
        </ul>
    </div>
);

export const FIRST_TIME_TEXT = (
    <div id="manual">
        
        <h1>Quick Start</h1>

        <p>This is a cellular automaton visualizer. You can get it running in just two steps:</p>
        <ol>
            <li>Hit <code>FLASH</code> in the <code>DRAW</code> controls.</li>
            <li>Flip the &#9199; switch to the upper-right of the main screen.</li>
        </ol>
        <p>This will populate the simulation with random noise, which will then evolve according to the rules of Conway's Game of Life. From there, you can...</p>
        <ul>
            <li>...select a different <code>PRESET</code> from the bottom-right corner.</li>
            <li>...draw on the canvas with your mouse or the <code>DOT</code> switch.</li>
            <li>...randomize the active rule with the <code>RND</code> switch.</li>
            <li>...turn the <code>N</code> knob to change the number of states.</li>
        </ul>

        <p>This window will only appear once. The Quick Start instructions, as well as more detailed information, can be found by clicking on the circled ? near the center of the app, above the logo in non-compact mode. Click anywhere outside this window to dismiss.</p>

        <p><b>PHOTOSENSITIVITY WARNING —</b> Experimenting with this app can very quickly produce intense strobing. The speed of the strobe is capped by the <code>FRAMERATE</code>. Therefore, it can be mitigated by setting <code>FRAMERATE</code> to 1 prior to changing the active rule/N, and manually verifying that there is no strobing before increasing <code>FRAMERATE</code>. Even this method is likely to yield 1Hz strobe effects.</p>
    </div>
)