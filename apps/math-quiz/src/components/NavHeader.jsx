import { motion } from "framer-motion";
import { useSound } from "../hooks/useSound";

export default function NavHeader({ title, onBack, backLabel = "🏠 Home" }) {
  const { playTap } = useSound();
  return (
    <div
      className="flex items-center shrink-0"
      style={{
        height: 54,
        background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingLeft: "max(12px, env(safe-area-inset-left))",
        paddingRight: "max(12px, env(safe-area-inset-right))",
      }}
    >
      {onBack ? (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            playTap();
            onBack();
          }}
          className="flex items-center font-bold text-sm text-white rounded-xl px-3 py-1.5 shrink-0"
          style={{
            background: "rgba(255,255,255,0.14)",
            minWidth: 88,
            minHeight: 36,
          }}
        >
          {backLabel}
        </motion.button>
      ) : (
        <div style={{ minWidth: 88 }} />
      )}
      <div className="flex-1 text-center">
        <span className="text-white font-extrabold text-base sm:text-lg tracking-wide">
          {title}
        </span>
      </div>
      <div style={{ minWidth: 88 }} />
    </div>
  );
}
