import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DEFAULT_CRT, DEFAULT_BRUSH_SIZE, DEFAULT_COLOUR, DEFAULT_COLOURING_STYLE, DEFAULT_DISTINGUISH_MAX, DEFAULT_DISTINGUISH_ZERO, DEFAULT_N, MAX_N, MIN_N, DEFAULT_CPU_RULE_CONTROL, DEFAULT_SIM_FRAMERATE_IDX, DEFAULT_COLOURING_STYLE_VARIABLE, COLOURING_STYLES } from './constants';
import { rgbToHSL } from './utils/mathUtils';

interface AutomatonStore {
    n: number,
    setN: (n: number) => void,

    isPlaying: boolean,
    setIsPlaying: (val: boolean) => void,

    displayText: string,
    setDisplayText: (text: string) => void,

    brushSize: number,
    setBrushSize: (x: number) => void,

    primaryColour: {h: number, s: number, l: number},
    setPrimaryColour: (key: string, value: number) => void,

    distinguishZeroColour: boolean,
    setDistinguishZeroColour: (val: boolean) => void,

    distinguishMaxColour: boolean,
    setDistinguishMaxColour: (val: boolean) => void,

    colouringStyle: string,
    colouringStyleIdx: number,
    setColouringStyle: (n: number) => void,

    colouringStyleVariable: number,
    setColouringStyleVariable: (n: number) => void,

    colours: Array<Array<number>>,
    setColours: (scheme: Array<number>) => void,

    useCRT: boolean,
    setUseCRT: (val: boolean) => void,

    brushState: number,
    setBrushState: (n: number) => void,

    brushStateKnobState: number,
    setBrushStateKnobState: (n: number) => void,

    brushErase: boolean,
    setBrushErase: (val: boolean) => void,

    cpuRuleControl: boolean,
    setCpuRuleControl: (val: boolean) => void,

    framerateIdx: number,
    setFramerateIdx: (n: number) => void,
}

export const useAutomatonStore = create<AutomatonStore>()(
    subscribeWithSelector((set) => ({
    n: DEFAULT_N,
    setN: (n: number) => set((s) => { 
        if (n >= MIN_N && n <= MAX_N) {
            return {n: n}
        } else {
            return {n: s.n}
        }
    }),

    isPlaying: false,
    setIsPlaying: (val: boolean) => set({isPlaying: val}),

    displayText: "",
    setDisplayText: (text: string) => set({displayText: text}),

    brushSize: DEFAULT_BRUSH_SIZE,
    setBrushSize: (x: number) => set({brushSize: x}),

    primaryColour: DEFAULT_COLOUR,
    setPrimaryColour: (key: string, value: number) => set((s) => ({primaryColour: {...s.primaryColour, [key]: value}})),

    distinguishZeroColour: DEFAULT_DISTINGUISH_ZERO,
    setDistinguishZeroColour: (val: boolean) => set({distinguishZeroColour: val}),
    
    distinguishMaxColour: DEFAULT_DISTINGUISH_MAX,
    setDistinguishMaxColour: (val: boolean) => set({distinguishMaxColour: val}),
    
    colouringStyle: COLOURING_STYLES[DEFAULT_COLOURING_STYLE],
    colouringStyleIdx: DEFAULT_COLOURING_STYLE,
    setColouringStyle: (i: number) => set({colouringStyle: COLOURING_STYLES[i], colouringStyleIdx: i}),

    colours: [[0, 0, 0], [DEFAULT_COLOUR.h, DEFAULT_COLOUR.s, DEFAULT_COLOUR.l]],
    setColours: (scheme: Array<number>) => set((_) => {
            let arr = [];
            for (let i = 0; i < scheme.length / 4; i++) {
                let col = rgbToHSL([scheme[i * 4], scheme[i *4 + 1], scheme[i*4 + 2]]);
                arr.push(col);
            }
            return {colours: arr}
        }),

    useCRT: DEFAULT_CRT,
    setUseCRT: (val: boolean) => set({useCRT: val}),

    brushState: DEFAULT_N - 1,
    setBrushState: (n: number) => set((s) => {
        if (n >= 0 && n <= s.n - 1) {
            return {brushState: n, brushStateKnobState: n, brushErase: n == 0 ? true : false};
        } else {
            return {brushState: s.brushState};
        }
    }),

    brushStateKnobState: DEFAULT_N - 1,
    setBrushStateKnobState: (n: number) => set((s) => ({brushStateKnobState: n, brushErase: false, brushState: Math.min(n, s.n - 1)})),

    brushErase: false,
    setBrushErase: (val: boolean) => set((s) => {
        if (val) {
            return {brushErase: true, brushState: 0}
        } else {
            return {brushErase: false, brushState: Math.min(s.brushStateKnobState, s.n - 1)}
        }
    }),

    cpuRuleControl: DEFAULT_CPU_RULE_CONTROL,
    setCpuRuleControl: (val: boolean) => set({cpuRuleControl: val}),

    framerateIdx: DEFAULT_SIM_FRAMERATE_IDX,
    setFramerateIdx: (n: number) => set({framerateIdx: n}),

    colouringStyleVariable: DEFAULT_COLOURING_STYLE_VARIABLE,
    setColouringStyleVariable: (n: number) => set({colouringStyleVariable: n}),
})));