import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useHttp } from '../../hooks/http.hook';
import { useAuth } from "../../hooks/auth.hook";
import { Loader } from '../../components/Loader';
import {
    SearchIcon,
    UsersIcon,
    XIcon,
} from "@heroicons/react/solid";
import { CityAutocomplete } from "../../components/AutoCompleteInput";

export const MainPage = () => {
    const { loading } = useHttp();
    const auth = useAuth();
    const navigate = useNavigate();
    const [departureInput, setDepartureInput] = useState("");
    const [destinationInput, setDestinationInput] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [numberOfSeats, setNumberOfSeats] = useState(1);

    const search = () => {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');

        const searchParams = new URLSearchParams({
            departure: `${departureInput.text_ru},${departureInput.context?.filter((context) => context.id.includes("country"))[0].text_ru}`,
            destination: `${destinationInput.text_ru},${destinationInput.context?.filter((context) => context.id.includes("country"))[0].text_ru}`,
            startDate: formattedStartDate,
            numberOfSeats,
        });
        navigate(`/search?${searchParams}`);
    };

    const resetInput = () => {
        setDepartureInput("");
        setDestinationInput("");
        setStartDate(new Date());
        setNumberOfSeats(1);
    };

    const handleDateChange = (event) => {
        setStartDate(new Date(event.target.value)); // Update the date state
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="relative w-full">
            <img src="https://www.flytap.com/-/media/Flytap/new-tap-pages/other-bookings/bus-transportation-galiza-porto/transportation-between-galiza-porto-og-image-1200x630.jpg"
                alt="background"
                className='bg'
            />
            <div className="bg-[#d7b98e] p-4 rounded-lg shadow-lg w-full">
                {/* Search section */}
                <div className="flex items-center space-x-4">  {/* Changed from flex-col to flex and combined the rows */}
                    <CityAutocomplete label={'Откуда'} setCity={setDepartureInput} />
                    <CityAutocomplete label={'Куда'} setCity={setDestinationInput} />
                    <input
                        type="date"
                        value={startDate.toISOString().substring(0, 10)}
                        onChange={handleDateChange}
                    />
                    <UsersIcon className="h-6 w-6 text-gray-700" />
                    <input
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(e.target.value)}
                        type="number"
                        min={1}
                        className="input-number"
                    />
                    <SearchIcon
                        className="icon-small bg-red-500 text-white"
                        onClick={search}
                        disabled={!departureInput || !destinationInput}
                    />
                    <XIcon
                        className="icon-small bg-red-500 text-white"
                        onClick={resetInput}
                    />
                </div>
               
            </div>
            <div className="flex justify-between w-full">
                <div className="w-1/3 p-4 rounded-lg shadow-lg">
                    <a href="#" className="block text-green-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-600" onClick={() => console.log('Manage My Booking clicked')}>
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <span className="block mt-2 text-center text-gray-900 font-normal">Расписание</span>
                    </a>
                </div>
                <div className="w-1/3 p-4 rounded-lg shadow-lg">
                    {/* Second menu item (similar structure, different link and label as needed) */}
                    <a href="#" className="block text-green-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-600" onClick={() => console.log('Another action clicked')}>
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                            </svg>
                        </div>
                        <span className="block mt-2 text-center text-gray-900 font-normal">Карта</span>
                    </a>
                </div>
                <div className="w-1/3 p-4 rounded-lg shadow-lg">
                    {/* Third menu item */}
                    <a href="#" className="block text-green-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-600" onClick={() => console.log('Third action clicked')}>
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        </div>
                        <span className="block mt-2 text-center text-gray-900 font-normal">Отзывы</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
