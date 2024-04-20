import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { Map } from '../../components/MapComponents';
import PaymentForm from '../../components/PaymentForm';
import { calculateTimeDifference } from '../../components/functions';

export const TripPage = () => {
    const { id } = useParams();
    const { loading, request } = useHttp();
    const [trip, setTrip] = useState(null);
    const [seats, setSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const navigate = useNavigate();

    const getTrip = useCallback(async () => {
        try {
            const data = await request(`/api/routes/${id}`);
            setTrip(data);
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

    if (loading || !trip) {
        return <Loader />
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
                                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Отправление</div>
                                    <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                        {trip.departure.city}, {trip.departure.country}
                                    </p>
                                    <p className="mt-2 text-gray-500">{trip.departure.date} в {trip.departure.time}</p>
                                    <p className="mt-2 text-gray-500">{trip.departure.place}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mx-6 my-4 md:my-0"> {/* Ensure consistent margins */}
                            <div className="text-center">
                                <div className="text-lg font-semibold">
                                    {calculateTimeDifference(trip.departure.date, trip.departure.time, trip.destination.date, trip.destination.time)}
                                </div>
                                <div className="border-b border-dashed border-gray-400 my-2"></div>
                                <div className="text-lg font-semibold">{trip.price} BYN</div>
                                <a href="/carrier" className="text-indigo-500">Перевозчик</a>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <div>
                                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mt-4">Прибытие</div>
                                    <p className="block mt-1 text-lg leading-tight font-medium text-black">
                                        {trip.destination.city}, {trip.destination.country}
                                    </p>
                                    <p className="mt-2 text-gray-500">{trip.destination.date} в {trip.destination.time}</p>
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Seat Layout</h3>
                            <div className="mt-4">
                                {renderSeatLayout()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Seats and Total Cost */}
                <div className="bg-white shadow-md rounded-lg p-4 mx-auto max-w-4xl mb-6">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="px-4 py-4 sm:px-6">
                            <p className="text-gray-500">Выбраные места: {seats.sort().join(', ')}</p>
                            <p className="text-gray-500">Итого: ${parseFloat((seats.length * trip.price).toFixed(2))}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white shadow-md rounded-lg p-4 mx-auto">
                    <div className="flex flex-col md:flex-row justify-center">
                        <PaymentForm amount={trip.price} seats={seats} routeId={id} />
                    </div>
                </div>
            </div>
            {/* <Map points={[{ latitude: trip.departure.latitude, longitude: trip.departure.longitude }, { latitude: trip.destination.latitude, longitude: trip.destination.longitude }]} /> */}
        </>
    );
}