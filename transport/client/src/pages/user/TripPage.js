import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { Map } from '../../components/MapComponents';
import PaymentForm from '../../components/PaymentForm';
import { AuthContext } from '../../context/AuthContext';
import { calculateTimeDifference, convertDate, convertTime } from '../../components/functions';

export const TripPage = () => {
    const { id } = useParams();
    const { loading, request } = useHttp();
    const [trip, setTrip] = useState(null);
    const [seats, setSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const navigate = useNavigate();
    const isCarrier = (useContext(AuthContext).userRole === 'carrier');

    const getTrip = useCallback(async () => {
        try {
            const data = await request(`/api/routes/${id}`);
            setTrip(data);
            console.log(data);
        } catch (e) {
            navigate('/404');
        }
    }, [id, request, navigate]);

    const getBookedSeats = useCallback(async () => {
        try {
            const data = await request(`/api/routes/${id}/seats`);
            setBookedSeats(data);
        } catch (e) {
            console.log(e);
        }
    }, [id, request, navigate]);

    useEffect(() => {
        getTrip();
        getBookedSeats();
    }, [getTrip, getBookedSeats]);

    const bookSeat = async (seat) => {
        if (isCarrier) {
            return;
        }
        if (seats.includes(seat)) {
            setSeats(seats.filter(s => s !== seat));
        } else {
            setSeats([...seats, seat]);
        }
        console.log(seats);
    }

    const renderSeatLayout = () => {
        //console.log(transport.seatsLayout)
        return trip.transport.seatsLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-2 my-2">
                {row.map((seat, seatIndex) => (
                    seat === '' ?
                        <div key={seatIndex} className="w-8 h-8 bg-gray-200 rounded"></div> :
                        bookedSeats.includes(seat) ?
                            <div key={seatIndex} className="w-8 h-8 bg-red-200 text-center leading-8 rounded">{seat}</div> :
                            seats.includes(seat) ?
                                <div key={seatIndex} className="w-8 h-8 bg-green-200 border-2 border-green-400 text-center leading-8 rounded cursor-pointer" onClick={() => bookSeat(seat)}>
                                    {seat}
                                </div> :
                                <div key={seatIndex} className="w-8 h-8 bg-blue-200 text-center leading-8 rounded cursor-pointer" onClick={() => bookSeat(seat)}>
                                    {seat}
                                </div>
                ))}
            </div>
        ));
    };

    if (loading) {
        return <Loader />
    }

    if (!trip) {
        return <h2 className='mt-4'>Маршрут не найден</h2>
    }

    return (
        <>
            <div>
                {/* Trip Departure and Arrival Details */}
                <div className="bg-white shadow-md rounded-lg p-4 mx-auto max-w-4xl mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center"> {/* Added items-center */}
                        <div className="flex-1">
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
                        <div className="mx-6 my-4 md:my-0"> {/* Ensure consistent margins */}
                            <div className="text-center">
                                <div className="text-lg font-semibold">
                                    {calculateTimeDifference(trip.departure.date, trip.destination.date)}
                                </div>
                                <div className="border-b border-dashed border-gray-400 my-2"></div>
                                <div className="text-lg font-semibold">{trip.price} BYN</div>
                                {isCarrier ? 
                                    <a href={'transports/' + trip.transport._id} className="text-indigo-500">Транспорт</a>
                                    :
                                    <a href={'carrier/' + trip.transport.carrier} className="text-indigo-500">Перевозчик</a>
                                }
                                <div className="flex flex-col md:flex-row justify-center items-center h-full">
                                    {trip.transport.conditioners && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                    </svg>}
                                    {trip.transport.wifi && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                                    </svg>}
                                    {trip.transport.power && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                    </svg>}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
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
                    </div>
                </div>


                {/* Seat Layout */}
                <div className="bg-white shadow-md rounded-lg p-4 mx-auto max-w-4xl mb-6">
                    <div className="flex flex-col md:flex-row justify-center items-center h-full"> {/* Updated classes here */}
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Места</h3>
                            <div className="mt-4">
                                {renderSeatLayout()}
                            </div>
                        </div>
                    </div>
                </div>

                {!isCarrier &&
                    <>
                        <div className="bg-white shadow-md rounded-lg p-4 mx-auto max-w-4xl mb-6">
                            <div className="flex flex-col md:flex-row justify-between">
                                <div className="px-4 py-4 sm:px-6">
                                    <p className="text-gray-500">Выбраные места: {seats.sort().join(', ')}</p>
                                    <p className="text-gray-500">Итого: {parseFloat((seats.length * trip.price).toFixed(2))} BYN</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-4 mx-auto">
                            <div className="flex flex-col md:flex-row justify-center">
                                <PaymentForm amount={trip.price} seats={seats} routeId={id} />
                            </div>
                        </div>
                    </>
                }
            </div>
        </>
    );
}