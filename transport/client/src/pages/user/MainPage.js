import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from "react-date-range";
import { useHttp } from '../../hooks/http.hook';
import { useAuth } from "../../hooks/auth.hook";
import { Loader } from '../../components/Loader';
import {
    SearchIcon,
    UsersIcon,
} from "@heroicons/react/solid";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { ru } from 'date-fns/locale';
import { AutoCompleteInput, CityAutocomplete } from "../../components/AutoCompleteInput";

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
        
        const searchParams = new URLSearchParams({ // TODO context might be undefined for example hongkong
            departure: `${departureInput.text_ru},${departureInput.context?.filter((context) => context.id.includes("country"))[0].text_ru}`,
            destination: `${destinationInput.text_ru},${destinationInput.context?.filter((context) => context.id.includes("country"))[0].text_ru}`,
            startDate: formattedStartDate,
            numberOfSeats,
        });
        console.log(departureInput)
        console.log(destinationInput)
        navigate(`/search?${searchParams}`);
    };

    const resetInput = () => {
        setDepartureInput("");
        setDestinationInput("");
        setStartDate(new Date());
        setNumberOfSeats(1);
    };

    const handleSelect = (date) => {
        setStartDate(date);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            {/* Search section */}
            <div className="flex items-center">
                <CityAutocomplete setCity={setDepartureInput} />
                <CityAutocomplete setCity={setDestinationInput} />
                <SearchIcon
                    className="hidden md:inline-flex h-8 bg-red-400 text-white rounded-full p-2 cursor-pointer md:mx-2"
                />
            </div>
            <div className="flex flex-col col-span-3 mx-auto">
                <Calendar
                    date={startDate}
                    onChange={handleSelect}
                    locale={ru}
                />
                <div className="flex items-center border-b mb-4">
                    <h2 className="text-2xl flex-grow font-semibold">
                        Number of Seats
                    </h2>
                    <UsersIcon className="h-5" />
                    <input
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(e.target.value)}
                        type="number"
                        min={1}
                        className="w-12 pl-2 text-lg outline-none text-red-400"
                    />
                </div>
                <div className="flex">
                    <button
                        onClick={resetInput}
                        className="flex-grow text-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={search}
                        disabled={!departureInput || !destinationInput}
                        className="flex-grow text-red-400"
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
};
