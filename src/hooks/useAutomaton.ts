import { useEffect, useRef, useMemo, type RefObject } from 'react';
import { shaders } from '../shaders/shaders.ts';
import { Automaton } from '../automaton.ts';
import { useAutomatonStore } from '../automatonStore.ts';

export function useAutomaton(cRef: RefObject<HTMLCanvasElement | null>) {
    const canvasRef = cRef;
    const autoRef = useRef<Automaton | null>(null);
    const setN = useAutomatonStore((s) => s.setN);
    const setDisplayText = useAutomatonStore((s) => s.setDisplayText);
    const setBrushState = useAutomatonStore((s) => s.setBrushState);    
    const setColours = useAutomatonStore((s) => s.setColours);

    const simulation = useMemo<Automaton>(() => {
        return new Proxy({} as Automaton, {
            get(_target, prop) {
                const instance = autoRef.current;
                if (!instance) return () => undefined;
                const value = instance[prop as keyof Automaton];
                return typeof value === 'function' ? value.bind(instance) : value;
            }
        })
    }, []);

    const importRule = (rule: string) => {
        autoRef.current?.importRule(rule);
        setN(autoRef.current?.states!);
    }

    const exportRule = () => {
        const stringifiedRule = autoRef.current?.exportRule()!;
        if (stringifiedRule.length < 50) {
            setDisplayText(stringifiedRule);
        } else {
            setDisplayText("COPIED TO CLIPBOARD");
        }
        navigator.clipboard.writeText(stringifiedRule);
    }

    const newAutomaton = () => {
        autoRef.current = new Automaton(
        canvasRef.current!, 
        shaders,
      );
    }

    /* ZUSTAND SUBSCRIPTIONS */

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.n,
            (n) => {
                autoRef.current!.setN(n);
                setBrushState(n - 1);
                setColours(autoRef.current!.getColours());
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.isPlaying,
            (isPlaying) => {console.log("here"); autoRef.current!.setPlay(isPlaying);}
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.brushSize,
            (brushSize) => autoRef.current!.setBrushSize(brushSize),
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.primaryColour,
            (primaryColour) => {
                autoRef.current!.setPrimaryColour(primaryColour);
                setColours(autoRef.current!.getColours());
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.distinguishZeroColour,
            (distinguishZeroColour) => {
                autoRef.current!.setDistinguishZeroColour(distinguishZeroColour);
                setColours(autoRef.current!.getColours());
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.distinguishMaxColour,
            (distinguishMaxColour) => {
                autoRef.current!.setDistinguishMaxColour(distinguishMaxColour);
                setColours(autoRef.current!.getColours());
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.colouringStyle,
            (colouringStyle) => {
                autoRef.current!.setColouringStyle(colouringStyle);
                setColours(autoRef.current!.getColours());
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.useCRT,
            (useCRT) => autoRef.current!.setUseCRT(useCRT),
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.brushState,
            (brushState) => autoRef.current!.setBrushState(brushState),
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.colouringStyleVariable,
            (colouringStyleVariable) => {
                autoRef.current!.setColouringStyleVariable(colouringStyleVariable);
                setColours(autoRef.current!.getColours());
            },
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.cpuRuleControl,
            (cpuRuleControl) => autoRef.current!.setCPU(cpuRuleControl),
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = useAutomatonStore.subscribe(
            (s) => s.framerateIdx,
            (framerateIdx) => autoRef.current!.setFramerateIdx(framerateIdx),
        );

        return unsubscribe;
    }, []);

    /* END SUBSCRIPTIONS */

    return {
        newAutomaton,
        simulation,
        importRule,
        exportRule,
    };
}