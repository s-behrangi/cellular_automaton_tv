export type Sound = 
  | 'lightswitch.flipdown'
  | 'lightswitch.flipup'
  | 'seesawswitch.flip';

export class AudioBus {
    private context: AudioContext | null = null;
    private volume: GainNode | null = null;
    private buffers =  new Map<Sound, Array<AudioBuffer>>();

    async load(sources: Record<string, string>) {
        this.context ??= new AudioContext();
        this.volume ??= this.context.createGain();
        this.volume.connect(this.context.destination);

        await Promise.all(
            (Object.entries(sources) as [string, string][]).map(async ([id, path]) => {
                const snd = id.replace('./samples/', '').replace(/[0-9]*\.\w+$/,'') as Sound;
                console.log(snd, path);
                const file = await fetch(path);
                const buf = await this.context!.decodeAudioData(await file.arrayBuffer());
                if (!this.buffers.get(snd)) {
                    console.log("creating", snd);
                    this.buffers.set(snd, []);
                }
                console.log("adding", path);
                this.buffers.get(snd)?.push(buf);
            })
        );
    }

    randRate(): number {
        return 0.97 + Math.random() * 0.06;
    }

    play(snd: Sound): void {
        if (!this.context || !this.volume) return;
        
        if (this.context.state === "suspended") this.context.resume();

        const choices = this.buffers.get(snd);
        if (!choices) return
        const buffer = choices[Math.floor(Math.random() * choices.length)]

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = this.randRate();
        
        const gain = this.context.createGain();
        gain.gain.value = 1;

        source.connect(gain).connect(this.volume);
        source.start();
    }

    async unlock() {
        if (this.context?.state === 'suspended') await this.context.resume();
    }
}