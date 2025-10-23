import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'

function Training(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  const { profile, layer_index } = location.state as {
    profile: Profile
    layer_index: number
  }

  const currentLayer = profile.layers[layer_index]

  const [difficulty, setDifficulty] = useState<number>(3) // 1..10
  const [, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [typingText, setTypingText] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [showHowTo, setShowHowTo] = useState<boolean>(false)

  useEffect((): void => {
    const locState = location.state as { highScore?: number } | undefined
    if (locState?.highScore !== undefined) {
      setScore(locState.highScore)
      setHighScore(locState.highScore)
    }
  }, [location.state])

  const startGame = (): void => {
    navigate('/training/game', {
      state: {
        profile,
        layer_index,
        difficulty,
        highScore
      }
    })
  }

  const goHome = (): void => {
    navigate('/mappings')
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center p-8">
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" onClick={(): void => goHome()}>
          Home
        </Button>
      </div>

      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Profile: {profile?.profile_name}</h2>
          <div className="text-gray-500">Layer: {currentLayer.layer_name}</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">High Score</div>
          <div className="text-2xl font-bold text-cyan-600">{highScore}</div>
        </div>
      </header>

      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
        {/* Difficulty slider */}
        <div className="flex flex-col gap-2">
          <label htmlFor="difficulty" className="text-sm font-medium text-gray-600">
            Difficulty: <span className="font-semibold">{difficulty}</span>
          </label>
          <input
            id="difficulty"
            type="range"
            min={1}
            max={10}
            value={difficulty}
            onChange={(e): void => setDifficulty(Number(e.target.value))}
            className="w-full"
            aria-label="Training difficulty"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Easy</span>
            <span>Hard</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mt-2">
          <Button
            size="lg"
            variant="default"
            className="bg-cyan-600 text-white px-6"
            onClick={startGame}
          >
            Start Game
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-sm px-4"
            onClick={(): void => setShowHowTo(true)}
          >
            How To Play
          </Button>
        </div>

        <div className="w-full">
          <div className="text-center text-gray-600 mb-2">Try out your Profile.</div>
          <textarea
            id="typing"
            ref={textareaRef}
            value={typingText}
            onChange={(e): void => setTypingText(e.target.value)}
            placeholder="Type here to practice..."
            className="w-full min-h-[240px] p-3 border rounded resize-vertical focus:outline-cyan-500 bg-white text-black"
          />
        </div>
      </div>

      {showHowTo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How to play"
          className="fixed inset-0 z-60 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/40" onClick={(): void => setShowHowTo(false)} />
          <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <h3 className="text-lg font-semibold text-center">How to play</h3>
            </div>

            <div className="text-sm text-gray-700 space-y-3">
              <p>
                When you press Start Game, a countdown will begin. After the countdown, you will be
                shown a random Bind from your Layer. The Bind will fall from the top of the screen
                towards the bottom. You will want to hit the Trigger associated with the Bind before
                it falls off the game screen.
              </p>
              <p>
                Points accumulate as you play for longer. If you hit the wrong trigger or the Bind
                falls to the bottom of the screen before you hit its Trigger, you will lose points.
                The higher the difficulty, the faster your points will accumulate and the faster the
                Binds will fall from the top of the screen.
              </p>
              <p>
                Click Start Game to begin. Press Stop and Return in the top-left to end the run.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Training
