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

    if (loading) {
        return <Loader />;
    }

    if (!transports.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg font-semibold text-gray-800">You don't have any transports yet. Please add some</p>
            </div>
        );
    }

    return (
        <>
            <form className="max-w-xl mx-auto my-10 p-5" onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="transport" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Select Transport</label>
                    <select id="transport" name="transport" onChange={handleChange} value={form.transport} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        {transports.map((transport) => (
                            <option key={transport._id} value={transport._id}>{transport.model} - {transport.number}</option>
                        ))}
                    </select>
                </div>
                {/* Input fields for departure, destination, departureTime, arrivalTime, and price */}
                {/* Example for one input field */}
                <div className="mb-6">
                    <AutoCompleteInput
                        handleManualInputChange={handleChange}
                        setPlace={setForm} // This is correctly passed and now will work as intended
                        name="departure"
                        place={form.departure}
                    />
                    {/* <label htmlFor="departure" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Departure</label>
                <input type="text" id="departure" name="departure" required onChange={handleChange} value={form.departure}  /> */}
                </div>
                {/* Destination Input Field */}
                <div className="mb-6">
                    <AutoCompleteInput
                        handleManualInputChange={handleChange}
                        setPlace={setForm} // This is correctly passed and now will work as intended
                        name="destination"
                        place={form.destination}
                    />
                    {/* <label htmlFor="destination" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Destination</label>
                <input type="text" id="destination" name="destination" required onChange={handleChange} value={form.destination} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Destination location" /> */}
                </div>

                {/* Departure Time Input Field */}
                <div className="mb-6">
                    <label htmlFor="departureDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Departure Date</label>
                    <input type="date" id="departureDate" name="departure.date" required onChange={handleChange} value={form.departure.date} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>

                <div className="mb-6">
                    <label htmlFor="departureTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Departure Time</label>
                    <input type="time" id="departureTime" name="departure.time" required onChange={handleChange} value={form.departure.time} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>

                {/* Arrival Time Input Field */}
                <div className="mb-6">
                    <label htmlFor="destinationDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Destination Date</label>
                    <input type="date" id="destinationDate" name="destination.date" required onChange={handleChange} value={form.destination.date} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>
                <div className="mb-6">
                    <label htmlFor="destinationTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Destination Time</label>
                    <input type="time" id="destinationTime" name="destination.time" required onChange={handleChange} value={form.destination.time} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>

                {/* Price Input Field */}
                <div className="mb-6">
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Price</label>
                    <input type="number" id="price" name="price" required onChange={handleChange} value={form.price} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Price" />
                </div>

                {editingRouteId ?
                    <>
                        <button
                            type="submit"
                            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        >Save changes
                        </button>
                        <button
                            onClick={() => setEditingRouteId(null)}
                            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                        >Cancel
                        </button>
                    </>
                    :
                    <button
                        type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >Add Route
                    </button>
                }
            </form>
            {/* <MiniMap
                longitude={form.departure.longitude}
                latitude={form.departure.latitude}
                updateCoordinates={(latitude, longitude) => {
                    setForm(prevForm => ({
                        ...prevForm,
                        departure: {
                            latitude,
                            longitude,
                        }
                    }));
                }}
            />
            <MiniMap
                longitude={form.destination.longitude}
                latitude={form.destination.latitude}
                updateCoordinates={(latitude, longitude) => {
                    setForm(prevForm => ({
                        ...prevForm,
                        destination: {
                            latitude,
                            longitude,
                        }
                    }));
                }}
            /> */}

            {routes.length !== 0 && <table className="table-auto w-full mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2">Transport</th>
                        <th className="px-4 py-2">Departure City</th>
                        <th className="px-4 py-2">Destination City</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {routes.map((route, index) => (
                        <tr key={route._id} className="bg-white">
                            <td className="border px-4 py-2">{route.transport.model}</td>
                            <td className="border px-4 py-2">{route.departure.city}</td>
                            <td className="border px-4 py-2">{route.destination.city}</td>
                            <td className="border px-4 py-2">{route.price}</td>
                            <td className="border px-4 py-2">
                                <button
                                    className="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => editRoute(route._id)}>
                                    Edit
                                </button>
                            </td>
                            <td className="border px-4 py-2">
                                <button
                                    className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => deleteRoute(route._id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>}
        </>
    );
}