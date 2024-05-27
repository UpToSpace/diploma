import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { useHttp } from '../../hooks/http.hook';
import toast from 'react-hot-toast';
import { Loader } from '../../components/Loader';
import { AutoCompleteInput } from '../../components/AutoCompleteInput';
import { convertDate, convertTime } from '../../components/functions';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const CarrierRoutesPage = () => {
    const { request, loading } = useHttp();
    const auth = useAuth()
    const [transports, setTransports] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [editingRouteId, setEditingRouteId] = useState(null);
    const timeZone = 'Europe/Tallinn'

    const [form, setForm] = useState({
        transport: '',
        departure: {
            latitude: 0,
            longitude: 0,
            city: '',
            country: '',
            place: '',
            date: '',
            time: '',
        },
        destination: {
            latitude: 0,
            longitude: 0,
            city: '',
            country: '',
            place: '',
            date: '',
            time: '',
        },
        price: '',
    });

    const getTransportsAndRoutes = useCallback(async () => {
        if (!auth.userId) {
            return;
        }
        try {
            const response = await request('/api/transports/users/' + auth.userId, 'GET');
            setTransports(response.transports);
            //console.log(response.transports);
            //console.log(response.routes);   
            setRoutes(response.routes);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request, auth.userId]);

    useEffect(() => {
        getTransportsAndRoutes();
    }, [getTransportsAndRoutes]);

    useEffect(() => {
        setForm(prevForm => ({
            ...prevForm,
            transport: transports[0]?._id || ''
        }));
    }, [transports]);

    const handleChange = (e) => {
        const name = e.target.name; // e.g., "departure.date"
        const value = e.target.value;

        // Split the name by "." to support nested state updates
        const nameParts = name.split(".");

        // Support nested properties: e.g., "departure.date" becomes { departure: { date: value } }
        if (nameParts.length > 1) {
            setForm(prevForm => ({
                ...prevForm,
                [nameParts[0]]: {
                    ...prevForm[nameParts[0]],
                    [nameParts[1]]: value,
                },
            }));
        } else {
            setForm(prevForm => ({
                ...prevForm,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(form);
        console.log(auth);
        if (!form.transport || !form.departure || !form.destination || !form.price) {
            return toast.error('All fields are required');
        }
        if (!form.departure.city || !form.destination.city) {
            return toast.error('Выберите город из выпадающего списка');
        }
        if (form.departure.city === form.destination.city) {
            return toast.error('Departure and destination cities must be different');
        }
        if (new Date(`${form.departure.date}T${form.departure.time}`) < new Date()) {
            return toast.error('Departure date and time must be in the future');
        }
        if (new Date(`${form.destination.date}T${form.destination.time}`) < new Date(`${form.departure.date}T${form.departure.time}`)) {
            return toast.error('Destination date and time must be after departure date and time');
        }
        const checkIfTransportAvailable = await request(`/api/transports/check`, 'POST', {
            transport: form.transport,
            departureDate: fromZonedTime(`${form.departure.date}T${form.departure.time}`, timeZone).toISOString(),
            destinationDate: fromZonedTime(`${form.destination.date}T${form.destination.time}`, timeZone).toISOString(),
        });
        if (checkIfTransportAvailable.message === 'Transport is not available') {
            return toast.error('Transport is not available during the specified dates');
        }
        try {
            const pointsToRequest = `${form.departure.longitude},${form.departure.latitude};${form.destination.longitude},${form.destination.latitude}`;
            const data = await request(`https://api.mapbox.com/directions/v5/mapbox/driving/${pointsToRequest}?` +
                `steps=true&geometries=geojson&access_token=${process.env.REACT_APP_MAP_TOKEN}&overview=full&annotations=distance,duration`)
            console.log(data);
            if (data.code === 'NoRoute') {
                throw new Error('No route found');
            }
            if (data.routes[0].distance > 10000 * 1000) {
                throw new Error('Route exceeds maximum distance limitation');
            }
            const travelDurationSeconds = data.routes[0].duration; // duration in seconds
            const departureDateTime = new Date(`${form.departure.date}T${form.departure.time}`);
            const expectedArrivalDateTime = new Date(departureDateTime.getTime() + travelDurationSeconds * 1000);
            const userDestinationDateTime = new Date(`${form.destination.date}T${form.destination.time}`);

            if (userDestinationDateTime < expectedArrivalDateTime) {
                throw new Error(`Минимальная дата и время прибытия: ${convertDate(expectedArrivalDateTime)} ${convertTime(expectedArrivalDateTime)}`);
            }

            if (editingRouteId) {
                await updateRoute(editingRouteId);
            } else {
                const response = await request('/api/routes', 'POST', form);
                toast('Route added successfully!');
            }
            getTransportsAndRoutes(); // Refresh the list of routes
            setForm({
                transport: transports[0]?._id || '',
                departure: {
                    latitude: 0,
                    longitude: 0,
                    city: '',
                    country: '',
                    place: '',
                    date: '',
                    time: '',
                },
                destination: {
                    latitude: 0,
                    longitude: 0,
                    city: '',
                    country: '',
                    place: '',
                    date: '',
                    time: '',
                },
                price: '',
            });
        } catch (error) {
            console.error("Failed to add/edit route", error);
            if (error.message === 'Route exceeds maximum distance limitation') {
                toast.error('Route exceeds maximum distance limitation of 10000 km');
            }
            if (error.message === 'No route found') {
                toast.error('No route found');
            }
            toast.error(error.message);
        }
    };

    const updateRoute = async (id) => {
        try {
            await request(`/api/routes/${id}`, 'PUT', form);
            toast.success('Route updated successfully!');
            setEditingRouteId(null); // Exit editing mode
            getTransportsAndRoutes(); // Refresh the list of routes
            setForm({
                transport: transports[0]?._id || '',
                departure: {
                    latitude: 0,
                    longitude: 0,
                    city: '',
                    country: '',
                    place: '',
                    date: '',
                    time: '',
                },
                destination: {
                    latitude: 0,
                    longitude: 0,
                    city: '',
                    country: '',
                    place: '',
                    date: '',
                    time: '',
                },
                price: '',
            });
        } catch (error) {
            console.error("Failed to update route", error);
        }
    };

    const deleteRoute = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await request(`/api/routes/${id}`, 'DELETE');
                toast.success('Route deleted successfully!');
                getTransportsAndRoutes(); // Refresh the list of routes
            } catch (error) {
                console.error("Failed to delete route", error);
            }
        }
    };

    const editRoute = (id) => {
        const routeToEdit = routes.find(route => route._id === id);
        console.log(routeToEdit)
        setEditingRouteId(id);
        const date = new Date(routeToEdit.departure.date);
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        const localDepartureDateTime = localDate.toISOString().replace('Z', '');

        const date2 = new Date(routeToEdit.destination.date);
        const offset2 = date2.getTimezoneOffset() * 60000;
        const localDate2 = new Date(date2.getTime() - offset2);
        const localDestinationDateTime = localDate2.toISOString().replace('Z', '');
        console.log(routeToEdit.departure.date)
        console.log(localDepartureDateTime)
        routeToEdit.departure.time = localDepartureDateTime.split('T')[1].slice(0, 5);
        routeToEdit.departure.date = localDepartureDateTime.split('T')[0];
        routeToEdit.destination.time = localDestinationDateTime.split('T')[1].slice(0, 5);
        routeToEdit.destination.date = localDestinationDateTime.split('T')[0];

        setForm({
            transport: routeToEdit.transport._id,
            departure: routeToEdit.departure,
            destination: routeToEdit.destination,
            price: routeToEdit.price.toString(),
        });
        window.scrollTo(0, 0); // Optional: Scroll to the form
    };

    const handleCancelEditButtonClick = () => {
        setEditingRouteId(null);
        setForm({
            transport: transports[0]?._id || '',
            departure: {
                latitude: 0,
                longitude: 0,
                city: '',
                country: '',
                place: '',
                date: '',
                time: '',
            },
            destination: {
                latitude: 0,
                longitude: 0,
                city: '',
                country: '',
                place: '',
                date: '',
                time: '',
            },
            price: '',
        });
    };

    if (loading) {
        return <Loader />;
    }

    if (!transports.length) {
        return (
            <h2 className='section'>Добавьте сначала транспорт</h2>
        );
    }

    return (
        <div className='container'>
            <div class="mt-6 sm:mx-auto w-full sm:max-w-sm">
                <h2 className="selection mb-6">Добавление рейсов</h2>
                <form className="space-y-2" onSubmit={handleSubmit}>

                    <label htmlFor="transport">Выберите транспорт</label>
                    <select
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 cursor-pointer"
                        id="transport"
                        name="transport"
                        onChange={handleChange}
                        value={form.transport}
                    >
                        {transports.map((transport) => (
                            <option key={transport._id} value={transport._id}>{transport.model} - {transport.number}</option>
                        ))}
                    </select>

                    <label>
                        Место оправления
                        <AutoCompleteInput
                            handleManualInputChange={handleChange}
                            setPlace={setForm}
                            name="departure"
                            place={form.departure}
                        />
                    </label>

                    <label>
                        Место прибытия
                        <AutoCompleteInput
                            handleManualInputChange={handleChange}
                            setPlace={setForm}
                            name="destination"
                            place={form.destination}
                        />
                    </label>


                    <label htmlFor="departureDate">
                        Дата отправления
                        <input type="date" id="departureDate" name="departure.date" required onChange={handleChange} value={form.departure.date} />
                    </label>

                    <label htmlFor="departureTime">
                        Время отправления
                        <input type="time" id="departureTime" name="departure.time" required onChange={handleChange} value={form.departure.time} />
                    </label>

                    <label htmlFor="destinationDate">
                        Дата прибытия
                        <input type="date" id="destinationDate" name="destination.date" required onChange={handleChange} value={form.destination.date} />
                    </label>

                    <label htmlFor="destinationTime">
                        Время прибытия
                        <input type="time" id="destinationTime" name="destination.time" required onChange={handleChange} value={form.destination.time} />
                    </label>

                    <label htmlFor="price">
                        Цена поездки
                        <input type="number" id="price" name="price" required onChange={handleChange} value={form.price} min="0" step="0.01" />
                    </label>


                    {editingRouteId ?
                        <>
                            <button
                                type="submit"
                                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >Сохранить
                            </button>
                            <button
                                onClick={handleCancelEditButtonClick}
                                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                            >Отмена
                            </button>
                        </>
                        :
                        <button
                            type="submit"
                            className="primary"
                        >Добавить рейс
                        </button>
                    }

                </form>
            </div>
            {routes.length !== 0 && <div className="overflow-x-auto relative shadow-md sm:rounded-lg my-5">
                    <div className="overflow-hidden rounded-lg">
                        <table className="min-w-full text-left text-sm font-light text-surface">
                            <thead className="border-b border-neutral-200 font-light bg-primary text-white rounded-t-lg">
                                <tr>
                                    <th scope="col" className="px-6 py-4 rounded-tl-lg">Номер</th>
                                    <th scope="col" className="px-6 py-4">Номер транспорта</th>
                                    <th scope="col" className="px-6 py-4">Отправление</th>
                                    <th scope="col" className="px-6 py-4">Прибытие</th>
                                    <th scope="col" className="px-6 py-4">Цена</th>
                                <th scope="col" className="px-6 py-4"></th>
                                    <th scope="col" className="px-6 py-4 rounded-tr-lg"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map((route, index) => (
                                    <tr key={route._id} className="bg-white">
                                        <td className="border px-4 py-2">{index + 1}</td>
                                        <td className="border px-4 py-2">{route.transport.number}</td>
                                        <td className="border px-4 py-2">{`${convertDate(route.departure.date)} ${convertTime(route.departure.date)} - ${route.departure.city}`}</td>
                                        <td className="border px-4 py-2">{`${convertDate(route.destination.date)} ${convertTime(route.destination.date)} - ${route.destination.city}`}</td>
                                        <td className="border px-4 py-2">{route.price} BYN</td>
                                        <td className="border px-4 py-2">
                                            <button
                                                className="primary"
                                                onClick={() => editRoute(route._id)}>
                                                Редактировать
                                            </button>
                                        </td>
                                        <td className="border px-4 py-2">
                                            <button
                                                className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                onClick={() => deleteRoute(route._id)}>
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div >
                </div >
            }
        </div >
    );
}