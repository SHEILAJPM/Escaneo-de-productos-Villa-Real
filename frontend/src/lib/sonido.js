let ctx

// Pitido de caja registradora: agudo y corto si leyo bien, grave y doble si fallo.
export function pitido(ok = true) {
  try {
    ctx ??= new AudioContext()
    const tonos = ok ? [[1800, 0, 0.09]] : [[220, 0, 0.15], [180, 0.18, 0.2]]
    for (const [freq, inicio, dur] of tonos) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = ok ? 'square' : 'sawtooth'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.08, ctx.currentTime + inicio)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + inicio)
      osc.stop(ctx.currentTime + inicio + dur)
    }
  } catch {
    /* sin audio disponible */
  }
}
