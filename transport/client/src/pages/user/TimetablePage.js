import { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { CityAutocomplete } from '../../components/AutoCompleteInput';
import { SearchIcon, XIcon } from "@heroicons/react/solid";
import { convertDate, convertTime } from '../../components/functions';

export const TimetablePage = () => {
    const { id } = useParams();
    const { request, loading } = useHttp();
    const userId = useContext(AuthContext).userId;
    const [departureInput, setDepartureInput] = useState(localStorage.getItem('userCity') ?? '');
    const [searchCity, setSearchCity] = useState(localStorage.getItem('userCity') ?? '');
    const [routes, setRoutes] = useState([]);
    const navigate = useNavigate();

    const search = async (e) => {
        console.log(departureInput);
        let searchCityQuery;
        if (localStorage.getItem('userCity') && !departureInput.text) {
            searchCityQuery = localStorage.getItem('userCity');
        } else {
            searchCityQuery = departureInput.text?.split(',')[0];
        }
        const data = await request(`/api/routes/city/${searchCityQuery}`, 'GET');
        setSearchCity(searchCityQuery);
        setRoutes(data);
        console.log(data);
    }

    useEffect(() => {
        search();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className='container'>
            <div className="relative z-20 max-w-2xl mx-auto p-4 rounded-lg bg-white text-primary shadow-lg w-full grid grid-cols-2 gap-2">
                <CityAutocomplete 
                label={'Откуда'} 
                setValue={setDepartureInput} 
                placeholder={'Откуда'} 
                value={departureInput?.place_name ?? searchCity} 
                />
                <div className='flex'>
                    <button className="primary bg-primary text-white text-lg rounded-lg p-2 inline-flex items-center justify-center" onClick={search}>
                        <SearchIcon
                            className="icon-small text-white rounded-lg mx-1 h-5 w-5"
                        />
                        Найти рейсы
                    </button>
                </div>
            </div>
            {routes.length !== 0 && <div class="flex flex-col">
                <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div class="overflow-hidden">
                            <table
                                class="min-w-full text-left text-sm font-light text-surface rounded-lg">
                                <thead
                                    class="border-b border-neutral-200 font-light rounded-lg bg-primary text-white">
                                    <tr>
                                        <th scope="col" class="px-6 py-4">Поездка</th>
                                        <th scope="col" class="px-6 py-4">Прибытие</th>
                                        <th scope="col" class="px-6 py-4">Отправление</th>
                                        <th scope="col" class="px-6 py-4">Транспорт</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.map((route, index) => (
                                        <tr
                                            class="border-b border-neutral-200 transition duration-300 ease-in-out rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
                                            onClick={(() => navigate(`/trips/${route._id}`))}
                                            >
                                            <td class="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                                            {route.departure.city === searchCity ? <td class="whitespace-nowrap px-6 py-4 font-medium">{`${convertDate(route.departure.date)} ${convertTime(route.departure.date)}`}</td> : <td class="whitespace-nowrap px-6 py-4 font-medium">-</td>}
                                            {route.destination.city === searchCity ? <td class="whitespace-nowrap px-6 py-4 font-medium">{`${convertDate(route.destination.date)} ${convertTime(route.destination.date)}`}</td> : <td class="whitespace-nowrap px-6 py-4 font-medium">-</td>}
                                            <td class="whitespace-nowrap px-6 py-4 font-medium">{`${route.transport.number} ${route.transport.brand}-${route.transport.model}`}</td>
                                        </tr>))}
                                    {/* <tr
                                        class="border-b border-neutral-200 transition duration-300 ease-in-out rounded-lg bg-green-200 hover:bg-green-300">
                                        <td class="whitespace-nowrap px-6 py-4 font-medium">1</td>
                                        <td class="whitespace-nowrap px-6 py-4">Mark</td>
                                        <td class="whitespace-nowrap px-6 py-4">Otto</td>
                                        <td class="whitespace-nowrap px-6 py-4">@mdo</td>
                                    </tr> */}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}