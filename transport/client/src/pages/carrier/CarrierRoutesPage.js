import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { useHttp } from '../../hooks/http.hook';
import toast from 'react-hot-toast';
import { Loader } from '../../components/Loader';
import { AutoCompleteInput } from '../../components/AutoCompleteInput';
import { MiniMap } from '../../components/MapComponents';
import { ConfirmDialog } from 'primereact/confirmdialog'; // For <ConfirmDialog /> component
import { confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method


export const CarrierRoutesPage = () => {
    const { request, loading } = useHttp();
    const auth = useAuth()
    const [transports, setTransports] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [editingRouteId, setEditingRouteId] = useState(null);

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
        try {
            const pointsToRequest = `${form.departure.longitude},${form.departure.latitude};${form.destination.longitude},${form.destination.latitude}`;
            const data = await request(`https://api.mapbox.com/directions/v5/mapbox/driving/${pointsToRequest}?` +
                `steps=true&geometries=geojson&access_token=${process.env.REACT_APP_MAP_TOKEN}&overview=full&annotations=distance,duration`)

            if (data.code === 'NoRoute') {
                throw new Error('No route found');
            }
            if (editingRouteId) {
                await updateRoute(editingRouteId);
            } else {
                const response = await request('/api/routes', 'POST', form);
                toast('Route added successfully!');
            }
            // Reset the form or handle navigation as needed
        } catch (error) {
            console.error("Failed to add/edit route", error);
            if (error.message === 'Route exceeds maximum distance limitation') {
                toast.error('Route exceeds maximum distance limitation of 10000 km');
            }
            if (error.message === 'No route found') {
                toast.error('No route found');
            }
        }
    };

    const updateRoute = async (id) => {
        try {
            await request(`/api/routes/${id}`, 'PUT', form);
            toast('Route updated successfully!');
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
        if (confirmDialog('Are you sure you want to delete this route?')) {
            try {
                await request(`/api/routes/${id}`, 'DELETE');
                toast('Route deleted successfully!');
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

    return (
        <>
            <ConfirmDialog />
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

            {routes.length && <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th>Transport</th>
                        <th>Departure City</th>
                        <th>Destination City</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {routes.map(route => (
                        <tr key={route._id}>
                            <td>{route.transport.model}</td>
                            <td>{route.departure.city}</td>
                            <td>{route.destination.city}</td>
                            <td>{route.price}</td>
                            <td>
                                <button onClick={() => editRoute(route._id)}>Edit</button>
                                <button onClick={() => deleteRoute(route._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>}
        </>
    );
}