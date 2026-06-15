import React from 'react'

function InputBox({label, placeholder, icon, type}) {
  return (
    <div className="w-full flex flex-1 gap-1 flex-col">
      <label
        className="text-base text-zinc-800 font-bold text-start py-2"
        htmlFor={label}
      >
        {label}
      </label>

      <div className="relative w-[100%]">
        {icon}
        <input
          className="w-full items-start pl-10 text-gray-400 focus:outline-none bg-transparent rounded-lg shadow-base px-3 py-2  border-2 border-violet-100"
          type={type ? type:"text"}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default InputBox