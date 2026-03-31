import { motion } from 'framer-motion'
import { SUBJECTS, loadHighScore } from '../data/registry'
import NavHeader from '../components/NavHeader'
import { useSound } from '../hooks/useSound'

function Stars({ score }) {
  if (score == null) return null
  const n = score >= 90 ? 3 : score >= 70 ? 2 : 1
  return <span>{'⭐'.repeat(n)}</span>
}

export default function SubjectMenuScreen({ subject, onBack, onSelect }) {
  const { playTap } = useSound()
  const subj = SUBJECTS[subject]
  if (!subj) return null

  return (
    <motion.div
      key="subject"
      initial={{ opacity:0, x:60 }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:-60 }}
      transition={{ duration:0.28 }}
      className="flex flex-col w-full h-full"
      style={{ background:'linear-gradient(135deg,#0f0a2e,#1a0a3e)' }}
    >
      <NavHeader title={`${subj.emoji} ${subj.label}`} onBack={onBack} />

      <div className="text-center py-3 shrink-0">
        <span className="text-white/60 text-base font-semibold">Choose a practice test</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 px-10 pb-8 justify-center min-h-0">
        {subj.tests.map((test, i) => {
          const hs = loadHighScore(subject, test.key)
          const isChallenge = test.emoji === '🏆'
          return (
            <motion.button
              key={test.key}
              initial={{ opacity:0, x:50 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.09, type:'spring', stiffness:260, damping:20 }}
              whileTap={{ scale:0.95 }}
              onClick={() => { playTap(); onSelect(i) }}
              className="flex items-center rounded-2xl px-6 py-4 shadow-xl border border-white/10"
              style={{
                background: isChallenge
                  ? 'linear-gradient(135deg,#78350f,#a16207)'
                  : subj.bg,
                minHeight: 82,
              }}
            >
              <span className="text-4xl mr-4">{test.emoji}</span>
              <div className="flex flex-col flex-1 text-left">
                <span className="text-white font-extrabold text-xl">{test.label}</span>
                {hs
                  ? <span className="text-white/70 text-sm font-semibold mt-0.5">
                      Best: {hs.score}/100 &nbsp;<Stars score={hs.score} />
                    </span>
                  : <span className="text-white/40 text-sm">Not played yet</span>
                }
              </div>
              <span className="text-white/40 text-2xl">›</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
