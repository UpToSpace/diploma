import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { CityAutocomplete } from '../../components/AutoCompleteInput';
import { SearchIcon, XIcon } from "@heroicons/react/solid";

export const TimetablePage = () => {
    const { id } = useParams();
    const { request, loading } = useHttp();
    const userId = useContext(AuthContext).userId;
    const [departureInput, setDepartureInput] = useState("");
    const [routes, setRoutes] = useState([]);

    const search = async (e) => {
        console.log(departureInput);
        const data = await request(`/api/routes/city/${departureInput.text.split(',')[0]}`, 'GET');
        setRoutes(data);
        console.log(data);
    }

    const resetInput = () => {
        setDepartureInput("");
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="flex items-center space-x-4 justify-center">
                <CityAutocomplete label={'Откуда'} setCity={setDepartureInput} />
                <SearchIcon
                    className="icon-small bg-red-500 text-white"
                    onClick={search}
                    disabled={!(departureInput?.id)}
                />
                <XIcon
                    className="icon-small bg-red-500 text-white"
                    onClick={resetInput}
                />
            </div>
            <div class="flex flex-col">
                <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div class="overflow-hidden">
                            <table
                                class="min-w-full text-left text-sm font-light text-surface rounded-lg bg-green-200">
                                <thead
                                    class="border-b border-neutral-200 font-medium rounded-lg bg-green-500">
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
                                            class="border-b border-neutral-200 transition duration-300 ease-in-out rounded-lg bg-green-200 hover:bg-green-300 cursor-pointer">
                                            <td class="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                                            {route.departure.city === departureInput.text.split(',')[0] ? <td class="whitespace-nowrap px-6 py-4 font-medium">{route.departure.time}</td> : <td class="whitespace-nowrap px-6 py-4 font-medium">-</td>}
                                            {route.destination.city === departureInput.text.split(',')[0] ? <td class="whitespace-nowrap px-6 py-4 font-medium">{route.destination.time}</td> : <td class="whitespace-nowrap px-6 py-4 font-medium">-</td>}
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
            </div>
        </>
    )
}