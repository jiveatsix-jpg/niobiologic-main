/// <reference types="vite/client" />

declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    repeat?: number;
  }

  export interface GIFAddFrameOptions {
    delay?: number;
    copy?: boolean;
  }

  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(image: CanvasImageSource | ImageData | HTMLCanvasElement, options?: GIFAddFrameOptions): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    render(): void;
    abort(): void;
  }
}
