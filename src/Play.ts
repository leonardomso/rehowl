import { useEffect, useRef, useState } from 'react'
import useForceUpdate from './useForceUpdate'

type SoundInfo = {
  playing: () => boolean
  duration: () => number
  seek: () => number
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

  const forceUpdate = useForceUpdate()
  const [playId, setPlayId] = useState<null | number>(null)

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

    // We have to set up the play even handler before playing in order to catch the starting event.
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

    // Play the sound and get its ID.
    const startPlaying = !pause && !stop

    currentPlayId = howl.play(sprite)

    if (!startPlaying) {
      howl.pause(currentPlayId)
    }

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
    setPlayId(currentPlayId)

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
    if (!howl || !playId) return
    if (stop) {
      howl.stop(playId)
      forceUpdate()
      return
    }
    if (howl.playing(playId) && pause) {
      howl.pause(playId)
      forceUpdate()
    } else if (!howl.playing(playId) && !pause) {
      howl.play(playId)
      forceUpdate()
    }
  }, [howl, playId, pause, stop])

  useEffect(() => {
    if (!howl || !playId) return
    if (mute === undefined) return
    howl.mute(mute, playId)
  }, [howl, playId, mute])

  useEffect(() => {
    if (!howl || !playId) return
    if (volume === undefined) return
    if (howl.volume() !== volume) {
      howl.volume(volume)
    }
  }, [howl, playId, volume])

  useEffect(() => {
    if (!howl || !playId) return
    if (!fade) return
    howl.fade(...fade)
  }, [howl, playId, JSON.stringify(fade)])

  useEffect(() => {
    if (!howl || !playId) return
    if (rate === undefined) return
    const targetRate = rate || 1
    if (howl.rate(playId) !== targetRate) {
      howl.rate(targetRate, playId)
    }
  }, [howl, playId, rate])

  useEffect(() => {
    if (!howl || !playId) return
    if (loop === undefined) return
    if (howl.loop(playId) !== loop) {
      howl.loop(loop, playId)
    }
  }, [howl, playId, loop])

  if (!children || !playId || !howl) return null
  return children({
    duration: () => howl.duration(playId),
    playing: () => howl.playing(playId),
    seek: () => {
      const position = howl.seek(playId)
      if (typeof position !== 'number') {
        return 0
      }
      return position
    }
  })
}