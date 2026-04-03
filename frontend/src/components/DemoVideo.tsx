import { useState, useEffect } from 'react'

interface DemoVideoProps {
  onClose: () => void
}

const SCENES = [
  {
    image: '/scene1.png',
    title: '1. Secure Your Assets',
    desc: 'You (the user) securely lock your private keys, passwords, documents, and last wishes inside the highly-protected Digital Legacy Vault. Everything is encrypted *before* it leaves your device.',
  },
  {
    image: '/scene2.png',
    title: '2. Unbreakable Security',
    desc: 'Hackers and malicious actors (like our sneaky thief here) are completely blocked. Thanks to zero-knowledge encryption, not even our servers can see what you stored inside.',
  },
  {
    image: '/scene3.png',
    title: '3. Safe Handover to Nominees',
    desc: 'If you remain inactive for 6 continuous months (Dead Man\'s Switch), your trusted nominees will automatically receive an alert to retrieve their specifically authorized vault categories.',
  },
]

const SCENE_DURATION_MS = 6000

export function DemoVideo({ onClose }: DemoVideoProps) {
  const [currentScene, setCurrentScene] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrameId: number
    const start = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start
      const newProgress = Math.min((elapsed / SCENE_DURATION_MS) * 100, 100)
      setProgress(newProgress)

      if (newProgress < 100) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        if (currentScene < SCENES.length - 1) {
          setCurrentScene(prev => prev + 1)
          setProgress(0)
        } else {
          // done
          setTimeout(onClose, 500)
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [currentScene, onClose])

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#0a0f18] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col h-[70vh] sm:h-[80vh] max-h-[800px]">
        {/* Header - Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Video Screen Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {SCENES.map((scene, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${currentScene === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {/* Image from public/ folder */}
              <img 
                src={scene.image} 
                alt={scene.title}
                className="w-full h-full object-cover sm:object-contain"
              />
              
              {/* Overlay Gradient for Text readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
              
              {/* Subtitles / Explanation */}
              <div className="absolute bottom-6 inset-x-0 px-6 sm:px-12 text-center pointer-events-none">
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-2 drop-shadow-lg">
                  {scene.title}
                </h3>
                <p className="text-sm sm:text-base text-white drop-shadow-md leading-relaxed mx-auto max-w-2xl">
                  {scene.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Timeline */}
        <div className="h-14 bg-[#060b14] border-t border-slate-800 flex items-center px-6 gap-2 shrink-0">
          {SCENES.map((_, idx) => (
            <div key={idx} className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ease-linear ${
                  idx < currentScene 
                    ? 'w-full bg-emerald-500' // completed
                    : idx === currentScene
                      ? 'bg-emerald-400' // active
                      : 'w-0' // pending
                }`}
                style={idx === currentScene ? { width: `${progress}%` } : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
