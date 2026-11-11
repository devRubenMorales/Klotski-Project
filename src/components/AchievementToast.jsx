/**
 * Componente AchievementToast: Notificación flotante cyber-gamer en la parte superior central
 * que se muestra durante 4 segundos al desbloquear un logro o batir un récord personal.
 *
 * @param {Object} props
 * @param {Object|null} props.toast - Datos del toast { id, type, title, subtitle, badge, icon }
 */
export default function AchievementToast({ toast }) {
  const isVisible = Boolean(toast);
  const isRecord = toast?.type === 'record';

  return (
    <div
      aria-live="polite"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-3 w-full max-w-md flex justify-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      {toast && (
        <div
          className={`w-full rounded-2xl px-4 py-3 backdrop-blur-xl bg-zinc-950/95 border-2 flex items-center gap-3.5 ${
            isRecord
              ? 'border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.55),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              : 'border-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]'
          }`}
        >
          {/* Icono de Trofeo / Rayo con Halo */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
              isRecord
                ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
            }`}
          >
            {toast.icon || (isRecord ? '⚡' : '🏆')}
          </div>

          {/* Textos del Logro / Récord */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-mono font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded ${
                  isRecord
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {toast.badge || (isRecord ? 'SUPERACIÓN PERSONAL' : 'LOGRO DESBLOQUEADO')}
              </span>
            </div>

            <div className="mt-1 text-xs sm:text-sm font-mono font-bold text-white leading-snug truncate">
              {toast.title}
            </div>

            {toast.subtitle && (
              <div
                className={`text-[11px] font-mono font-medium leading-tight mt-0.5 ${
                  isRecord ? 'text-cyan-300' : 'text-amber-200/90'
                }`}
              >
                {toast.subtitle}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

