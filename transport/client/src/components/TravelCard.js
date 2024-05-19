import React from 'react';
import { Link } from 'react-router-dom';
import { calculateTimeDifference, convertDate, convertTime } from './functions';

export const TravelCard = ({ trip, isFavorite, likeButtonHandler }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mx-auto w-7xl my-6 grid grid-cols-4 col-span-4 gap-2">

            <div className="flex">
                <div className="flex justify-between">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-primary font-semibold">Отправление</div>
                        <p className="block mt-1 text-lg leading-tight font-medium text-black">
                            {trip.departure.city}, {trip.departure.country}
                        </p>
                        <p className="mt-2 text-gray-500">{convertDate(trip.departure.date)} в {convertTime(trip.departure.date)}</p>
                        <p className="mt-2 text-gray-500">{trip.departure.place}</p>
                    </div>
                </div>
            </div>

            <div className="mx-6 my-4 md:my-0">
                <div className="text-center">
                    <div className="text-lg font-semibold">
                        {calculateTimeDifference(trip.departure.date, trip.destination.date)}
                    </div> 
                    <div className="border-b border-dashed border-gray-400 my-2"></div>
                    <div className="text-lg font-semibold">{trip.price} BYN</div>
                </div>
            </div>

            <div className="flex">
                <div className="flex justify-between">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-primary font-semibold">Прибытие</div>
                        <p className="block mt-1 text-lg leading-tight font-medium text-black">
                            {trip.destination.city}, {trip.destination.country}
                        </p>
                        <p className="mt-2 text-gray-500">{convertDate(trip.destination.date)} в {convertTime(trip.destination.date)}</p>
                        <p className="mt-2 text-gray-500">{trip.destination.place}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-end items-start md:items-center"> {/* Adjusted alignment */}
                {isFavorite ?
                    <button
                        className="text-pink-500 hover:text-pink-700 focus:outline-none"
                        onClick={likeButtonHandler}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    </button>
                    :
                    <button
                        className="text-pink-500 hover:text-pink-700 focus:outline-none"
                        onClick={likeButtonHandler}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    </button>
                }
                <Link to={`/trips/${trip._id}`} className="text-primary font-semibold hover:text-senary transition-all duration-300 ml-3">Подробнее</Link>
            </div>
        </div>
    );
};
