import { useCallback } from 'react'

let audioCtx = null

function ctx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function tone(freq, type, startOffset, duration, gain = 0.07) {
  try {
    const c = ctx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g); g.connect(c.destination)
    osc.frequency.value = freq; osc.type = type
    const t = c.currentTime + startOffset
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t); osc.stop(t + duration + 0.05)
  } catch {}
}

export function useSound() {
  const playTap      = useCallback(() => { tone(880, 'sine',     0,    0.05, 0.04) }, [])
  const playCorrect  = useCallback(() => { tone(523, 'sine',     0,    0.12); tone(659,'sine',0.1,0.15) }, [])
  const playWrong    = useCallback(() => { tone(200, 'triangle', 0,    0.18, 0.06) }, [])
  const playFanfare  = useCallback(() => {
    tone(523,'sine',0,   0.1)
    tone(659,'sine',0.1, 0.1)
    tone(784,'sine',0.2, 0.1)
    tone(1047,'sine',0.32,0.25,0.09)
  }, [])
  return { playTap, playCorrect, playWrong, playFanfare }
}
