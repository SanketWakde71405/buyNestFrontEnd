import React from 'react'

function CouponCard({iconBackground, icon, title, subTitle, desc}) {
  return (
    <div className="flex flex-row bg-white w-[30%] rounded-lg shadow-lg z-10 gap-2 justify-start items-start px-5 py-3">
      <div
        className={`w-15 h-15 flex justify-center items-center rounded-lg p-2 ${iconBackground}`}
      >
        {icon}
      </div>

      <div className="flex flex-col justify-start items-start">
        <span className="text-gray-500 text-sm">{title}</span>
        <span className="text-zinc-800 font-bold text-base">{subTitle}</span>
        <span className="text-gray-500 text-sm">{desc}</span>
      </div>
    </div>
  );
}

export default CouponCard