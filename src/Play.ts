import { useEffect, useRef, useState, useCallback } from 'react'

type SoundInfo = {
  playing: () => boolean
  duration: () => number
  seek: () => number
  volume: () => number
}

type Props = {
  howl: null | Howl
  sprite?: string
  children?: (props: SoundInfo) => JSX.Element
  pause?: boolean
  volume?: number
  mute?: boolean
  stop?: boolean
  seek?: number
  rate?: number // 0.5 to 4.0
  loop?: boolean
  fade?: [number, number, number]
  onPlay?: () => void
  onPlayError?: (message: string) => void
  onEnd?: () => void
  onPause?: () => void
  onStop?: () => void
  onMute?: () => void
  onVolume?: () => void
  onSeek?: () => void
  onFade?: () => void
  onRate?: () => void
}

export default function Play(props: Props) {
  const { howl, pause, sprite, mute, volume, fade, stop, rate, loop, children } = props

  const [playId, setPlayId] = useState<null | number>(null)
  const [playing, setPlaying] = useState(true)
  const [stopped, setStopped] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  // We use refs for the callbacks so that they can be dynamic.
  const onPlay = useRef<null | Function>(null)
  const onPlayError = useRef<null | Function>(null)
  const onEnd = useRef<null | Function>(null)
  const onPause = useRef<null | Function>(null)
  const onStop = useRef<null | Function>(null)
  const onMute = useRef<null | Function>(null)
  const onVolume = useRef<null | Function>(null)
  const onSeek = useRef<null | Function>(null)
  const onFade = useRef<null | Function>(null)
  const onRate = useRef<null | Function>(null)

  useEffect(() => {
    onPlay.current = props.onPlay || null
  }, [props.onPlay])
  useEffect(() => {
    onPlayError.current = props.onPlayError || null
  }, [props.onPlayError])
  useEffect(() => {
    onEnd.current = props.onEnd || null
  }, [props.onEnd])
  useEffect(() => {
    onPause.current = props.onPause || null
  }, [props.onPause])
  useEffect(() => {
    onStop.current = props.onStop || null
  }, [props.onStop])
  useEffect(() => {
    onMute.current = props.onMute || null
  }, [props.onMute])
  useEffect(() => {
    onVolume.current = props.onVolume || null
  }, [props.onVolume])
  useEffect(() => {
    onSeek.current = props.onSeek || null
  }, [props.onSeek])
  useEffect(() => {
    onFade.current = props.onFade || null
  }, [props.onFade])
  useEffect(() => {
    onRate.current = props.onRate || null
  }, [props.onRate])

  useEffect(() => {
    if (!howl) return
    let currentPlayId: undefined | number

    // Play the sound and get its ID.
    const startPlaying = !pause && !stop

    currentPlayId = howl.play(sprite)
    setPlayId(currentPlayId)

    if (!startPlaying) {
      howl.pause(currentPlayId)
      setPlaying(false)
    }

    howl.once('play', id => {
      // Update children on initial play.
      if (id !== currentPlayId) return
      setUnlocked(true)
    })
    howl.on('play', id => {
      if (id !== currentPlayId) return
      if (onPlay.current) {
        onPlay.current()
      }
    })
    howl.on('playerror', id => {
      if (id !== currentPlayId) return
      if (onPlayError.current) {
        onPlayError.current()
      }
    })
    howl.on('pause', id => {
      if (id !== currentPlayId) return
      if (onPause.current) {
        onPause.current()
      }
    })

    howl.on('end', id => {
      if (id !== currentPlayId) return
      if (onEnd.current) {
        onEnd.current()
      }
    })

    howl.on('stop', id => {
      if (id !== currentPlayId) return
      if (onStop.current) {
        onStop.current()
      }
    })

    howl.on('mute', id => {
      if (id !== currentPlayId) return
      if (onMute.current) {
        onMute.current()
      }
    })
    howl.on('volume', id => {
      if (id !== currentPlayId) return
      if (onVolume.current) {
        onVolume.current()
      }
    })
    howl.on('rate', id => {
      if (id !== currentPlayId) return
      if (onRate.current) {
        onRate.current()
      }
    })
    howl.on('seek', id => {
      if (id !== currentPlayId) return
      if (onSeek.current) {
        onSeek.current()
      }
    })
    howl.on('fade', id => {
      if (id !== currentPlayId) return
      if (onFade.current) {
        onFade.current()
      }
    })

    return () => {
      howl.stop(currentPlayId)

      howl.off('play', undefined, currentPlayId)
      howl.off('playerror', undefined, currentPlayId)
      howl.off('pause', undefined, currentPlayId)
      howl.off('end', undefined, currentPlayId)
      howl.off('stop', undefined, currentPlayId)
      howl.off('mute', undefined, currentPlayId)
      howl.off('volume', undefined, currentPlayId)
      howl.off('rate', undefined, currentPlayId)
      howl.off('seek', undefined, currentPlayId)
      howl.off('fade', undefined, currentPlayId)
      setPlayId(null)
    }
  }, [howl, sprite])

  useEffect(() => {
    /**
     * Use playing in state because queued events (like in the above useEffect)
     * will not apply immediately, so it's possible for us to attempt playing
     * twice when the sound is initialized. This causes some issues with Howler.
     */
    if (!howl || !playId || !unlocked) return
    if (stop) {
      if (!stopped) {
        howl.stop(playId)
        setStopped(true)
        setPlaying(false)
      }
      return
    }
    if (playing && pause) {
      howl.pause(playId)
      setStopped(false)
      setPlaying(false)
    } else if (!playing && !pause) {
      howl.play(playId)
      setStopped(false)
      setPlaying(true)
    }
  },
    [howl, playId, stopped, unlocked, playing, pause, stop]
  )

  useEffect(() => {
    if (!howl || !playId || !unlocked) return
    if (mute === undefined) return
    howl.mute(mute, playId)
  }, [howl, playId, unlocked, mute])

  useEffect(() => {
    if (!howl || !playId || !unlocked) return
    if (volume === undefined) return
    if (howl.volume() !== volume) {
      howl.volume(volume)
    }
  }, [howl, playId, unlocked, volume])

  useEffect(() => {
    if (!howl || !playId || !unlocked) return
    if (!fade) return
    howl.fade(...fade)
  }, [howl, playId, unlocked, JSON.stringify(fade)])

  useEffect(() => {
    if (!howl || !playId || !unlocked) return
    if (rate === undefined) return
    const targetRate = rate || 1
    if (howl.rate(playId) !== targetRate) {
      howl.rate(targetRate, playId)
    }
  }, [howl, playId, unlocked, rate])

  useEffect(() => {
    if (!howl || !playId || !unlocked) return
    if (loop === undefined) return
    if (howl.loop(playId) !== loop) {
      howl.loop(loop, playId)
    }
  }, [howl, playId, unlocked, loop])

  const duration = useCallback(() => {
    if (!howl || !playId) return 0
    return howl.duration(playId)
  }, [howl, playId])
  const getPlaying = useCallback(() => {
    if (!howl || !playId) return playing
    return howl.playing(playId)
  }, [howl, playId])
  const seek = useCallback(() => {
    if (!howl || !playId) return 0
    const position = howl.seek(playId)
    if (typeof position !== 'number') {
      return 0
    }
    return position
  }, [howl, playId])
  const getVolume = useCallback(() => {
    if (!howl || !playId) return 0
    const volume = howl.volume(playId)
    if (typeof volume !== 'number') {
      return 0
    }
    return volume
  }, [howl, playId])

  if (!children || !playId || !howl) return null
  return children({
    duration,
    playing: getPlaying,
    seek,
    volume: getVolume,
  })
}