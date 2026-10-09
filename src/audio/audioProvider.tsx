import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { AudioBus } from './audioBus.ts';

const context = createContext<AudioBus | null>(null);

const samples = import.meta.glob('./samples/*.{wav,mp3,ogg}', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

export function AudioProvider({ children }: { children: React.ReactNode}) {
    const bus = useMemo(() => new AudioBus(), []);
    const unlocked = useRef(false);

    useEffect(() => {
        bus.load(samples);
    }, [bus]);

    useEffect(() => {
        const unlock = () => {
            if (unlocked.current) return;
            unlocked.current = true;
            bus.unlock();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        }
    }, [bus]);

    return <context.Provider value={bus}>{children}</context.Provider>;
}

export function useAudio() {
    const bus = useContext(context);
    if (!bus) throw new Error("useAudio must be used inside <AudioProvider>");
    return bus;
}