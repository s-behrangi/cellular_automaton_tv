import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FRAMERATES, DEFAULT_CRT, DEFAULT_BRUSH_SIZE, DEFAULT_COLOUR, DEFAULT_COLOURING_STYLE, DEFAULT_DISTINGUISH_MAX, DEFAULT_DISTINGUISH_ZERO, DEFAULT_N, MAX_N, MIN_N, DEFAULT_CPU_RULE_CONTROL, DEFAULT_SIM_FRAMERATE_IDX, DEFAULT_RADIAL_SPREAD_DEGREES } from './constants';
import { rgbToHSL } from './utils/mathUtils';

interface AutomatonStore {
    n: number,
    setN: (n: number) => void,

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
    setColouringStyle: (s: string) => void,

    radialSpreadDegrees: number,
    setSetRadialSpreadDegrees: (n: number) => void,

    colours: Array<Array<number>>,
    setColours: (scheme: Array<number>) => void,

    useCRT: boolean,
    setUseCRT: (val: boolean) => void,

    brushState: number,
    setBrushState: (n: number) => void,

    cpuRuleControl: boolean,
    setCpuRuleControl: (val: boolean) => void,

    framerate: number,
    setFramerate: (n: number) => void,
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
    
    colouringStyle: DEFAULT_COLOURING_STYLE,
    setColouringStyle: (s: string) => set({colouringStyle: s}),

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
            return {brushState: n};
        } else {
            return {brushState: s.brushState};
        }
    }),

    cpuRuleControl: DEFAULT_CPU_RULE_CONTROL,
    setCpuRuleControl: (val: boolean) => set({cpuRuleControl: val}),

    framerate: FRAMERATES[DEFAULT_SIM_FRAMERATE_IDX],
    setFramerate: (n: number) => set({framerate: n}),

    radialSpreadDegrees: DEFAULT_RADIAL_SPREAD_DEGREES,
    setSetRadialSpreadDegrees: (n: number) => set({radialSpreadDegrees: n}),
})));