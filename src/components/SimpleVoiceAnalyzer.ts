// SimpleVoiceAnalyzer.ts

export interface AnalyzerData {
  pitch: number;
  amplitude: number; // short-term amplitude (0..1)
  buffer: Float32Array;
}

/**
 * Options to control the analyzer:
 *  - lowVolumeThreshold: below this RMS, we apply a gain boost
 *  - boostFactor: how much to multiply the signal if below threshold
 */
export interface VoiceAnalyzerOptions {
  lowVolumeThreshold?: number; // default 0.01
  boostFactor?: number;        // default 2
}

export type AnalyzerCallback = (data: AnalyzerData) => void;

export class SimpleVoiceAnalyzer {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private analyser: AnalyserNode;
  private scriptProcessor: ScriptProcessorNode;
  private isRunning = false;

  constructor(private options: VoiceAnalyzerOptions = {}) {
    this.audioContext = new AudioContext();

    // Create a gain node (used for boosting low-volume signals)
    this.gainNode = this.audioContext.createGain();

    // Create an AnalyserNode for amplitude visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;

    // ScriptProcessorNode for real-time analysis (note: this node is considered legacy)
    this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
  }

  // ---
  // PRIVATE HELPER: Basic autocorrelation for pitch detection
  // ---
  private autoCorrelate(buffer: Float32Array): number {
    const sampleRate = this.audioContext.sampleRate;

    // Compute the root-mean-square (RMS) of the buffer.
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) {
      // Signal too weak – no pitch detected.
      return 0;
    }

    // Compute the autocorrelation of the signal.
    const autocorr = new Float32Array(buffer.length);
    for (let lag = 0; lag < buffer.length; lag++) {
      let sum = 0;
      for (let i = 0; i < buffer.length - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      autocorr[lag] = sum;
    }

    // Find the lag where the autocorrelation first increases and then reaches a maximum.
    let d = 0;
    while (d < autocorr.length - 1 && autocorr[d] > autocorr[d + 1]) {
      d++;
    }
    let maxVal = -Infinity;
    let maxPos = -1;
    for (let i = d; i < autocorr.length; i++) {
      if (autocorr[i] > maxVal) {
        maxVal = autocorr[i];
        maxPos = i;
      }
    }
    if (maxPos <= 0) {
      return 0;
    }
    // Convert lag (in samples) to frequency (Hz)
    return sampleRate / maxPos;
  }

  /**
   * Start analyzing a mic stream.
   * We measure the RMS amplitude, boost the signal if needed,
   * detect pitch using a simple autocorrelation algorithm,
   * and call `callback` with the computed data.
   */
  public async start(stream: MediaStream, callback: AnalyzerCallback) {
    this.isRunning = true;
    // Resume the audio context (in case it was suspended)
    await this.audioContext.resume();

    // Create a source node from the microphone stream.
    const source = this.audioContext.createMediaStreamSource(stream);

    // Connect the nodes: source -> gainNode -> analyser -> scriptProcessor
    source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.scriptProcessor);

    // To avoid audible output, connect to destination only if desired.
    // (For silent processing, you could also disconnect the destination.)
    this.scriptProcessor.connect(this.audioContext.destination);

    // Process audio frames as they become available.
    this.scriptProcessor.onaudioprocess = () => {
      if (!this.isRunning) return;

      // Get the time-domain data from the analyser.
      const buffer = new Float32Array(this.analyser.fftSize);
      this.analyser.getFloatTimeDomainData(buffer);

      // Compute RMS amplitude.
      let sumSq = 0;
      for (let i = 0; i < buffer.length; i++) {
        sumSq += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sumSq / buffer.length);
      const amplitude = Math.min(rms, 1);

      // Adjust gain based on the amplitude.
      const threshold = this.options.lowVolumeThreshold ?? 0.01;
      const boost = this.options.boostFactor ?? 2;
      this.gainNode.gain.value = rms < threshold ? boost : 1;

      // Compute pitch using our simple autocorrelation.
      const pitch = this.autoCorrelate(buffer);

      // Now call the callback with all required properties.
      callback({ amplitude, buffer, pitch });
    };
  }

  /**
   * Stop analyzing and clean up resources.
   */
  public stop() {
    this.isRunning = false;
    this.scriptProcessor.disconnect();
    this.analyser.disconnect();
    this.gainNode.disconnect();
    this.audioContext.close();
  }
}