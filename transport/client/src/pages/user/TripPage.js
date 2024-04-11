import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { Map } from '../../components/MapComponents';
import PaymentForm from '../../components/PaymentForm';

export const TripPage = () => {
    const { id } = useParams();
    const { loading, request } = useHttp();
    const [trip, setTrip] = useState(null);
    const [seats, setSeats] = useState([]);
    const navigate = useNavigate();

    const getTrip = useCallback(async () => {
        try {
            const data = await request(`/api/routes/${id}`);
            setTrip(data);
        } catch (e) {
            navigate('/404');
        }
    }, [id, request, navigate]);

    useEffect(() => {
        getTrip();
    }, [getTrip]);

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
                    <div key={seatIndex} className="w-8 h-8 bg-blue-200 text-center leading-8 rounded" onClick={() => bookSeat(seat)}>
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
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Seat Layout
                            </h3>
                            <div className="mt-4">
                                {renderSeatLayout()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-4 sm:px-6">
                    <p className="text-gray-500">Выбрано мест: {seats.join(', ')}</p>
                    <p className="text-gray-500">Итого: ${parseFloat((seats.length * trip.price).toFixed(2))}</p>
                </div>

            </div>
            <PaymentForm amount={parseFloat((seats.length * trip.price).toFixed(2))} />
            {/* <Map points={[{ latitude: trip.departure.latitude, longitude: trip.departure.longitude }, { latitude: trip.destination.latitude, longitude: trip.destination.longitude }]} /> */}
        </>
    );
}