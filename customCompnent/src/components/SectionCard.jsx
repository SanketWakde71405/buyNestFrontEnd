export default function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <Icon size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-zinc-800 dark:text-gray-200">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
