import React from 'react'

function ButtonIcon({icon,text,onClick}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
    >
      {icon}
      <span className="px-2">{text}</span>
    </button>
  );
}

export default ButtonIcon