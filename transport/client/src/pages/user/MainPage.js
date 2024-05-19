import React, { useEffect, useState } from "react";
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
import mapImage from "../../styles/images/map.jpg"

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
    const [popularDestinations, setPopularDestinations] = useState([]);

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

    useEffect(() => {
        if (auth.userLocation) {
            setPopularDestinations([])
        }
    }, [auth.userLocation]);

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

                    <div className="max-w-7xl mx-auto p-4 rounded-lg bg-white text-primary shadow-lg w-full grid grid-cols-5 gap-2">
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

            <div className="container w-full justify-start py-6">
                <h2 className='section'>Ближайшие отправления</h2>

                <div className="flex justify-center w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full p-4">
                        <div className="p-4 rounded-lg shadow-lg">
                            <div className="relative bg-white rounded-lg overflow-hidden">
                                <img className="w-full h-64 object-cover object-center" src="https://images.unsplash.com/photo-1623276884890-3d1c4f1b0b6e" alt="content" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <h2 className="text-2xl font-bold text-white">Москва</h2>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg shadow-lg">
                            <div className="relative bg-white rounded-lg overflow-hidden">
                                <img className="w-full h-64 object-cover object-center" src="https://images.unsplash.com/photo-1623276884890-3d1c4f1b0b6e" alt="content" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <h2 className="text-2xl font-bold text-white">Санкт-Петербург</h2>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg shadow-lg">
                            <div className="relative bg-white rounded-lg overflow-hidden">
                                <img className="w-full h-64 object-cover object-center" src="https://images.unsplash.com/photo-1623276884890-3d1c4f1b0b6e" alt="content" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <h2 className="text-2xl font-bold text-white">Казань</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container w-full justify-start py-6">
                <h2 className='section'>Популярные направления</h2>
                <div className="flex flex-wrap justify-center">

                    <div className="w-1/3 p-4 rounded-lg shadow-lg">
                        <div className="relative bg-white rounded-lg overflow-hidden">
                            <img className="w-full h-64 object-cover object-center" src="https://images.unsplash.com/photo-1623276884890-3d1c4f1b0b6e" alt="content" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <h2 className="text-2xl font-bold text-white">Москва</h2>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/3 p-4 rounded-lg shadow-lg">
                        <div className="relative bg-white rounded-lg overflow-hidden">
                            <img className="w-full h-64 object-cover object-center" src="https://images.unsplash.com/photo-1623276884890-3d1c4f1b0b6e" alt="content" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <h2 className="text-2xl font-bold text-white">Санкт-Петербург</h2>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/3 p-4 rounded-lg shadow-lg">
                        <div className="relative bg-white rounded-lg overflow-hidden">
                            <img className="w-full h-64 object-cover object-center" src="https://images.unsplash.com/photo-1623276884890-3d1c4f1b0b6e" alt="content" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <h2 className="text-2xl font-bold text-white">Казань</h2>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="container w-full justify-start py-6">
                <h2 className='section'>Карта маршрутов</h2>
                <div className="flex">
                    <img className="h-64 object-cover object-center rounded" src={mapImage} alt="content" />
                    <div className='p-10 items-end'>
                        <p className='text-lg py-3'>
                            Откройте карту, выберите ваше местоположение и пункт назначения, и наша система мгновенно предложит вам лучшие варианты маршрутов и доступные билеты. Легко сравнивайте различные рейсы по времени отправления, стоимости и продолжительности путешествия, чтобы выбрать оптимальный для вас вариант.
                        </p>
                        <button className='primary max-w-60 text-white h-10'>
                            <a href="/map">Воспользоваться картой</a>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
