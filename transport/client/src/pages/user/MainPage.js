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
        </div>
    );
};
