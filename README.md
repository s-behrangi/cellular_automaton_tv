# Gavazn: A Cellular Automaton Visualizer

An in-browser app for experimenting with [cellular automata](https://en.wikipedia.org/wiki/Cellular_automaton), with a design inspired by various classic machines like the [Sony Jackal FX-300](https://swling.com/blog/2021/03/the-sony-fx-300-jackal-a-holy-grail-technological-marvel-of-the-late-70s/), a combination CRT television and radio from the 70s.

You can play with it [here](https://s-behrangi.github.io/cellular_automaton_tv/).

## Specifications

The "machine" runs a 1024 x 1024 simulation of a cellular automaton. By default, it will run [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life), but it comes with numerous presets and also allows you to randomize the active rule or edit it yourself. Features include:

* An 800-600 screen that, by default, runs a shader imitating a CRT screen
* Support for n-state automata up to `N = 21`
* Flexible colour customization, making even high-state automata aesthetically pleasing
* The ability to draw on the simulation
* Rule exporting and importing
* Rule visualization, which depicts the active rule as a texture on screen

You may refer to the in-app manual for detailed functionality.

## Credits

This was my first time working with WebGL. In addition to the [WebGL2 Fundamentals](https://webgl2fundamentals.org/) website and [Andrew Adamson's incredibly clear YouTube tutorials](https://youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo), I learnt a lot by example from [Benjamin Mastripolito's visualizer](https://github.com/benpm/cellarium/tree/master), in particular a clean technique for calculating combinadic order within GLSL itself.