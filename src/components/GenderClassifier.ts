/**
 * Maps a detected pitch (in Hz) to a simple gender classification.
 * If the pitch is invalid (<= 0 or NaN), returns "Unknown".
 * Otherwise, returns "Male" if pitch is below 180 Hz,
 * or "Female" if pitch is 180 Hz or above.
 */
export function getGenderByPitch(pitch: number): string {
  if (pitch <= 0 || Number.isNaN(pitch)) {
    return 'Unknown';
  }
  return pitch < 180 ? 'Male' : 'Female';
}