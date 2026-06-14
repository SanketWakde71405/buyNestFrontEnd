import React from 'react'

function Card({
  icon,
  iconBackground,
  cardName,
  cardDesc
}) {
  return (
    <div className="bg-white shadow-xl z-5 rounded-xl gap-2 p-4 m-2 flex flex-1 flex-col justify-center items-center">
      <div className={`rounded-full p-4 ${iconBackground}`}>{icon}</div>
      <div className="flex flex-1 flex-col gap-2 justify-start items-start px-2 py-1 mt-2">
        <span className="font-semibold text-lg">{cardName}</span>
        <span
          className="text-base text-start">
          {cardDesc}
        </span>
      </div>
    </div>
  );
}

export default Card