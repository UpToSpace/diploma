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
import toast from 'react-hot-toast';
import mainImage from "../../styles/images/city.jpg"

export const MainPage = () => {
    const { loading } = useHttp();
    const auth = useAuth();
    const navigate = useNavigate();
    const [departureInput, setDepartureInput] = useState("");
    const [destinationInput, setDestinationInput] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [checkedState, setCheckedState] = useState({
        check1: false,
        check2: false,
        check3: false
    });

    const search = () => {
        if (!departureInput || !destinationInput) {
            return toast.error('Пожалуйста, выберите место отправления и назначения');
        }
        if (departureInput.text_ru === destinationInput.text_ru) {
            return toast.error('Место отправления и назначения не могут совпадать');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
            return toast.error('Дата отправления не может быть раньше текущей даты');
        }
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const searchParams = new URLSearchParams({
            departure: `${departureInput.text_ru},${departureInput.context?.filter((context) => context.id.includes("country"))[0].text_ru}`,
            destination: `${destinationInput.text_ru},${destinationInput.context?.filter((context) => context.id.includes("country"))[0].text_ru}`,
            startDate: formattedStartDate,
            numberOfSeats,
            conditioners: checkedState.check1,
            wifi: checkedState.check2,
            power: checkedState.check3,
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

    // Handler to manage changes for each checkbox
    const handleChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="relative w-full">
            <div className="relative w-full overflow-hidden" style={{ height: "675px" }}>
                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${mainImage})` }} />

                {/* Bluish Overlay */}
                <div className="absolute inset-0 bg-primary opacity-50 z-10"></div>

                {/* Content */}
                <div className="relative z-20 p-4 text-white flex flex-col items-center justify-center h-full">
                    <h2 className='main mb-2'>Откройте для себя новое</h2>
                    <h3 className='main mb-4'>Быстрые и комфортные поездки по приятной цене!</h3>

                    <div className="p-4 rounded-lg bg-white text-primary shadow-lg w-full max-w-7xl grid grid-cols-5 gap-2">
                        <CityAutocomplete
                            label={'Откуда'}
                            setValue={setDepartureInput}
                            placeholder={'Откуда'}
                        />

                        <CityAutocomplete
                            label={'Куда'}
                            setValue={setDestinationInput}
                            placeholder={'Куда'} />

                        <div className='flex flex-col relative'>
                            <label className="block text-sm font-medium text-gray-700">Дата отправления</label>
                            <input
                                type="date"
                                value={startDate.toISOString().substring(0, 10)}
                                onChange={handleDateChange}
                                className="mt-1 p-2 w-full border rounded-md"
                            />
                        </div>

                        <div className='flex'>
                            <div className='flex flex-col relative items-center'>
                                <UsersIcon className="h-6 w-6 text-primary" />
                                <input
                                    value={numberOfSeats}
                                    onChange={(e) => setNumberOfSeats(e.target.value)}
                                    type="number"
                                    min={1}
                                    max={10}
                                />
                            </div>
                            <div className="flex flex-col items-start justify-center">
                                <label className="inline-flex items-center space-x-2 mb-1">
                                    <input
                                        type="checkbox"
                                        name="check1"
                                        checked={checkedState.check1}
                                        onChange={handleChange}
                                        className="form-checkbox h-5 w-5"
                                    />
                                    <span>Кондиционер</span>
                                </label>
                                <label className="inline-flex items-center space-x-2 mb-1">
                                    <input
                                        type="checkbox"
                                        name="check2"
                                        checked={checkedState.check2}
                                        onChange={handleChange}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span>Wi-Fi</span>
                                </label>
                                <label className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="check3"
                                        checked={checkedState.check3}
                                        onChange={handleChange}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span>220v</span>
                                </label>
                            </div>
                        </div>

                        <div className='flex'>
                            <button className="primary bg-primary text-white text-lg rounded-lg p-2 inline-flex items-center justify-center" onClick={search} disabled={!departureInput || !destinationInput}>
                                <SearchIcon
                                    className="icon-small text-white rounded-lg mx-1 h-5 w-5"
                                    onClick={search}
                                    disabled={!departureInput || !destinationInput}
                                />
                                Найти рейсы
                            </button>
                        </div>

                    </div>
                </div>
            </div>




            <div className="flex justify-between w-full">
                <div className="w-1/3 p-4 rounded-lg shadow-lg">
                    <a href="/timetable" className="block text-green-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-600" onClick={() => console.log('Manage My Booking clicked')}>
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
                    <a href="/map" className="block text-green-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-600" onClick={() => console.log('Another action clicked')}>
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
                    <a href="/favorites" className="block text-green-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-600" onClick={() => console.log('Third action clicked')}>
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        </div>
                        <span className="block mt-2 text-center text-gray-900 font-normal">Избранное</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
