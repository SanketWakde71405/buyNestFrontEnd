import React from 'react'

function UserCards({iconBackground, icon, title, subTitle, desc}) {
  return (
    <div className="flex flex-row bg-white dark:bg-slate-950 dark:border dark:border-slate-800 w-[30%] rounded-lg shadow-lg z-10 gap-2 justify-start items-start px-5 py-4">
      <div
        className={`w-15 h-15 flex justify-center items-center rounded-full p-2 ${iconBackground}`}
      >
        {icon}
      </div>

      <div className="flex flex-col justify-start items-start">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{title}</span>
        <span className="text-zinc-800 dark:text-gray-200 font-bold text-base">{subTitle}</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{desc}</span>
      </div>
    </div>
  );
}

export default UserCards