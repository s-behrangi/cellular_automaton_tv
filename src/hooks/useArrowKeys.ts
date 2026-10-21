import { useEffect, useState } from 'react';
import { Automaton } from '../automaton.ts';

export function useArrowKeys(simulation: Automaton) {
    const [up, setUp] = useState<boolean>(false);
    const [down, setDown] = useState<boolean>(false);
    const [left, setLeft] = useState<boolean>(false);
    const [right, setRight] = useState<boolean>(false);

    const [instructions, setInstructions] = useState<string[]>([""]);

    const isPressed = (key: string) => {
        switch (key) {
            case "up":
                return up;
            case "down":
                return down;
            case "left":
                return left;
            case "right":
                return right;
            case "":
                return true;
        }
    }

    useEffect(() => {
        setInstructions((prev) => {
            const next = [...prev];
            while (true) {
                const last = next[next.length - 1];
                if (isPressed(last)) {
                    break;
                }
                next.pop();
            }
            return next;
        })
    }, [up, down, left, right]);

    useEffect(() => {
        if (up) {
            setInstructions((prev) => 
                [...prev, "up"]
            )
        }
    }, [up]);

    useEffect(() => {
        if (down) {
            setInstructions((prev) => 
                [...prev, "down"]
            )
        }
    }, [down]);

    useEffect(() => {
        if (left) {
            setInstructions((prev) => 
                [...prev, "left"]
            )
        }
    }, [left]);

    useEffect(() => {
        if (right) {
            setInstructions((prev) => 
                [...prev, "right"]
            )
        }
    }, [right]);

    useEffect(() => {
        simulation.setPanDir(instructions[instructions.length - 1]);
    }, [instructions])

    const instruct = (key: string, down: boolean) => {
        switch (key) {
            case "up":
                setUp(down);
                break;
            case "down":
                setDown(down);
                break;
            case "left":
                setLeft(down);
                break;
            case "right":
                setRight(down);
                break;
        }
    }

    return {
        instruct
    };
}