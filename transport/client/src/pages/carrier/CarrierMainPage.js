import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useNavigate } from 'react-router-dom';
import { convertDate, convertTime } from '../../components/functions';

export const CarrierMainPage = () => {
    const { request, loading } = useHttp();
    const navigate = useNavigate();
    const { userId } = useContext(AuthContext);
    const [routes, setRoutes] = useState([]);

    const getData = useCallback(async () => {
        try {
            const data = await request(`/api/routes/user/${userId}`, 'GET');
            console.log(data);
            setRoutes(data);
        } catch (e) {
            console.error(e);
        }
    }, [request, userId]);

    useEffect(() => {
        getData();
    }, [getData]);

    if (loading) {
        return <Loader />;
    }

    if (!routes || routes.length === 0) {
        return (
            <div className='container'>
                <h1>Нет данных</h1>
            </div>
        );
    }

    return (
        <div className='container'>
            <h2 className='section'>Ваши ближайшие рейсы</h2>
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-lg">
                            <table className="min-w-full text-left text-sm font-light text-surface">
                                <thead className="border-b border-neutral-200 font-light bg-primary text-white rounded-t-lg">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 rounded-tl-lg">Рейс</th>
                                        <th scope="col" className="px-6 py-4">Отправление</th>
                                        <th scope="col" className="px-6 py-4">Прибытие</th>
                                        <th scope="col" className="px-6 py-4 rounded-tr-lg">Номер Транспорта</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.map((route, index) => (
                                        <tr
                                            key={route._id}
                                            className="border-b border-neutral-200 transition duration-300 ease-in-out bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg"
                                            onClick={() => navigate(`/trips/${route._id}`)}
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                                                {`${convertDate(route.departure.date)} ${convertTime(route.departure.date)} - ${route.departure.city}`}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                                                {`${convertDate(route.destination.date)} ${convertTime(route.destination.date)} - ${route.destination.city}`}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                                                {`${route.transport.number} ${route.transport.brand}-${route.transport.model}`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
