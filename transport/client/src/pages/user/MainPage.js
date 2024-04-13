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
    XIcon,
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
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
        setIsCalendarOpen(false);
    };

    const handleSelect = (date) => {
        setStartDate(date);
        setIsCalendarOpen(false); // Close the calendar after a date is selected
    };

    const toggleCalendar = () => {
        setIsCalendarOpen(!isCalendarOpen);
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
                <input
                    type="text"
                    readOnly
                    value={format(startDate, 'PP', { locale: ru })}
                    onClick={toggleCalendar}
                />
                <UsersIcon className="h-5" />
                <input
                    value={numberOfSeats}
                    onChange={(e) => setNumberOfSeats(e.target.value)}
                    type="number"
                    min={1}
                    className='w-1 h-10 pr-0'
                />
                <SearchIcon
                    className="h-8 bg-red-400 text-white rounded-full p-2 cursor-pointer mx-2"
                    onClick={search}
                    disabled={!departureInput || !destinationInput}
                />
                <XIcon
                    className="h-8 bg-red-400 text-white rounded-full p-2 cursor-pointer mx-2"
                    onClick={resetInput}
                />
            </div>
            {isCalendarOpen && (
                <Calendar
                    date={startDate}
                    onChange={(date) => handleSelect(date)}
                    locale={ru}
                    className='absolute z-10 bg-white border shadow-lg'
                />
            )}
        </div>
    );
};
