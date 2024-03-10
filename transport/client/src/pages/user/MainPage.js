import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { useAuth } from "../../hooks/auth.hook";
import { roles } from "./../../constants/constants";
import {
    SearchIcon,
    MenuIcon,
    UserCircleIcon,
    UsersIcon,
    GlobeAltIcon,
} from "@heroicons/react/solid"
import { useState } from "react";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Calendar } from "react-date-range";
import { useNavigate } from 'react-router-dom';
import { ru } from 'date-fns/locale';

export const MainPage = () => {
    const { loading } = useHttp();

    const auth = useAuth()
    const user = auth.userRole;
    const navigate = useNavigate();
    const [departureInput, setDepartureInput] = useState("");
    const [destinationInput, setDestinationInput] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    //const [endDate, setEndDate] = useState(new Date());
    const [numberOfSeats, setNumberOfSeats] = useState(1);


    const search = (placeholder) => {

        const searchParams = new URLSearchParams({
            departure: departureInput,
            destination: destinationInput,
            startDate: startDate.toISOString(),
            //endDate: endDate.toISOString(),
            numberOfSeats,
        }).toString();

        navigate(`/search?${searchParams}`);
    };

    const resetInput = () => {
        setDepartureInput("");
        setDestinationInput("");
    };

    const handleSelect = (ranges) => {
        setStartDate(ranges);
        //setEndDate(ranges.selection.endDate);
    };

    if (loading) {
        return <Loader />
    }

    return (
        <div>
            {/* Search section */}
            <div className="flex items-center">
                <input
                    value={departureInput}
                    onChange={(e) => setDepartureInput(e.target.value)}
                    className="flex-grow pl-5 bg-transparent 
          outline-none text-sm text-gray-600 
          placeholder-gray-400"
                    type="text" placeholder={"Start your search"} />
                <input
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    className="flex-grow pl-5 bg-transparent 
          outline-none text-sm text-gray-600 
          placeholder-gray-400"
                    type="text" placeholder={"Start your search"} />
                <SearchIcon
                    className="hidden md:inline-flex h-8 bg-red-400 
          text-white rounded-full p-2 cursor-pointer
          md:mx-2" />
            </div>
            <div className="flex flex-col col-span-3 mx-auto">
                <Calendar
                    date={startDate}
                    onChange={handleSelect}
                    locale={ru}
                />

                <div className="flex items-center border-b mb-4">
                    <h2 className="text-2xl flex-grow font-semibold">
                        Number of Guest
                    </h2>

                    <UsersIcon className="h-5" />
                    <input
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(e.target.value)}
                        type="number"
                        min={1}
                        className="w-12 pl-2 text-lg outline-noen text-red-400" />
                </div>

                <div className="flex ">
                    <button
                        onClick={resetInput}
                        className="flex-grow text-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={search}
                        disabled={!departureInput || !destinationInput}
                        className="flex-grow text-gray-400">Search</button>
                </div>
            </div>
        </div>
    )
}