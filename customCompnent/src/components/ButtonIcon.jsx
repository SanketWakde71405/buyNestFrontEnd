import React from 'react'

function ButtonIcon({icon,text,onClick}) {
  return (
    <button
      onClick={onClick}
      className="flex gap-2 text-white bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg"
    >
      {icon}
      <span className="px-2">{text}</span>
    </button>
  );
}

export default ButtonIcon