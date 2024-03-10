import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { useHttp } from '../../hooks/http.hook';
import toast from 'react-hot-toast';
import { Loader } from '../../components/Loader';

export const CarrierRoutesPage = () => {
    const { request, loading } = useHttp();
    const auth = useAuth()
    const [transports, setTransports] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [form, setForm] = useState({
        transport: '',
        departure: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
    });

    const getTransportsAndRoutes = useCallback(async () => {
        try {
            const response = await request('/api/transports/users/' + auth.userId, 'GET');
            setTransports(response);
            const routesResponse = await request('/api/routes', 'GET', { transports: response.map(transport => transport._id) });
            setRoutes(routesResponse);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request, auth.userId]);

    useEffect(() => {
        getTransportsAndRoutes();
    }, [getTransportsAndRoutes]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/routes', { // Adjust the URL to your API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error('Failed to create a new route');
            }

            alert('Route added successfully!');
            // Reset the form or handle navigation as needed
        } catch (error) {
            console.error("Failed to add route", error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <form className="max-w-xl mx-auto my-10 p-5" onSubmit={handleSubmit}>
            <div className="mb-6">
                <label htmlFor="transport" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Select Transport</label>
                <select id="transport" name="transport" onChange={handleChange} value={form.transport} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    {transports.map((transport) => (
                        <option key={transport.id} value={transport.id}>{transport.model} - {transport.number}</option>
                    ))}
                </select>
            </div>
            {/* Input fields for departure, destination, departureTime, arrivalTime, and price */}
            {/* Example for one input field */}
            <div className="mb-6">
                <label htmlFor="departure" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Departure</label>
                <input type="text" id="departure" name="departure" required onChange={handleChange} value={form.departure} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Departure location" />
            </div>
            {/* Destination Input Field */}
            <div className="mb-6">
                <label htmlFor="destination" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Destination</label>
                <input type="text" id="destination" name="destination" required onChange={handleChange} value={form.destination} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Destination location" />
            </div>

            {/* Departure Time Input Field */}
            <div className="mb-6">
                <label htmlFor="departureTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Departure Time</label>
                <input type="time" id="departureTime" name="departureTime" required onChange={handleChange} value={form.departureTime} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
            </div>

            {/* Arrival Time Input Field */}
            <div className="mb-6">
                <label htmlFor="arrivalTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Arrival Time</label>
                <input type="time" id="arrivalTime" name="arrivalTime" required onChange={handleChange} value={form.arrivalTime} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
            </div>

            {/* Price Input Field */}
            <div className="mb-6">
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Price</label>
                <input type="number" id="price" name="price" required onChange={handleChange} value={form.price} min="0" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Price" />
            </div>

            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Route</button>
        </form>
    );
}