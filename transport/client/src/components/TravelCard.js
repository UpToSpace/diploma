import React from 'react';
import { Link } from 'react-router-dom';

const TravelCard = ({ trip }) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div className="md:flex">
                <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Отправление</div>
                    <p className="block mt-1 text-lg leading-tight font-medium text-black">{trip.departure.city}, {trip.departure.country}</p>
                    <p className="mt-2 text-gray-500">{trip.departure.date} в {trip.departure.time}</p>
                    <p className="mt-2 text-gray-500">{trip.departure.place}</p>

                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mt-4">Прибытие</div>
                    <p className="block mt-1 text-lg leading-tight font-medium text-black">{trip.destination.city}, {trip.destination.country}</p>
                    <p className="mt-2 text-gray-500">{trip.destination.date} в {trip.destination.time}</p>
                    <p className="mt-2 text-gray-500">{trip.destination.place}</p>

                    <div className="mt-4">
                        <span className="text-indigo-500 font-semibold">Цена: </span>
                        <span className="font-medium">${trip.price}</span>
                    </div>

                    <div className="mt-4">
                        <Link to={`/trips/${trip._id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelCard;
