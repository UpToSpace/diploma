import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { convertDate, convertTime } from '../../components/functions';

export const CarrierMainPage = () => {
    const { id } = useParams();
    const { request, loading } = useHttp();
    const navigate = useNavigate();
    const userId = useContext(AuthContext).userId;
    const [tripsData, setTripsData] = useState([]);
    const [routes, setRoutes] = useState([]);

    const getData = useCallback(async () => {
        try {
            const data = await request(`/api/routes/user/${userId}`, 'GET');
            console.log(data);
            setTripsData(data);
            setRoutes(data.routes);
        } catch (e) {
            console.error(e);
        }
    }, [request, id]);

    useEffect(() => {
        getData();
    }, [getData]);

    if (loading) {
        return <Loader />;
    }
    return (
        <div className='container'>
            <h1>Carrier Main Page</h1>
            {routes?.length !== 0 && <div class="flex flex-col">
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
                                    {routes?.map((route, index) => (
                                        <tr
                                            class="border-b border-neutral-200 transition duration-300 ease-in-out rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
                                            onClick={(() => navigate(`/trips/${route._id}`))}
                                        >
                                            <td class="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                                            {<td class="whitespace-nowrap px-6 py-4 font-medium">{`${convertDate(route.departure.date)} ${convertTime(route.departure.date)}`}</td>}
                                            {<td class="whitespace-nowrap px-6 py-4 font-medium">{`${convertDate(route.destination.date)} ${convertTime(route.destination.date)}`}</td>}
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
    );
}