export default function Loading({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`spinner ${sizeClasses[size]} border-primary-600`}></div>
      {text && <p className="text-sm text-neutral-600">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-strong animate-scale-in">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingButton({ loading, children, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="spinner w-4 h-4 border-2"></div>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
