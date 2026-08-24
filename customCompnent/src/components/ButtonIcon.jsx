import React from 'react'

function ButtonIcon({icon,text,onClick}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      {icon}
      <span className="px-2">{text}</span>
    </button>
  );
}

export default ButtonIcon