import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';

export const CarrierTransportsPage = () => {
    const { request, loading } = useHttp();
    const auth = useAuth()

    const [form, setForm] = useState({
        carrier: '',
        number: '',
        brand: '',
        model: '',
        yearOfBuild: '',
        capacity: '',
        rows: [{ seats: [] }]
    });

    const [transports, setTransports] = useState([]);

    const getTransports = useCallback(async () => {
        if (!auth.userId) return;
        try {
            const response = await request('/api/transports/users/' + auth.userId, 'GET');
            setTransports(response.transports);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request, auth.userId]);

    useEffect(() => {
        getTransports();
    }, [getTransports]);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let isValid = true;
        let errors = {};

        // console.log(form.rows.map(row => row.seats).filter(row => row.length > 0).flat().length); 
        // console.log(+form.capacity); 
        // Validation for required fields
        // if (!form.rows.map(row => row.seats).filter(row => row.length > 0).flat().length !== +form.capacity) {
        //     isValid = false;
        //     errors.capacity = 'Capacity and seats layout do not match.';
        // }

        if (!form.number) {
            isValid = false;
            errors.number = 'Number is required.';
        }
        // Add more validation rules as needed for each field

        setErrors(errors);
        return isValid;
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        const payload = {
            ...form,
            seatsLayout: form.rows.map(row => row.seats),
            carrier: auth.userId
        };
        // Perform the API call to add a new transport
        try {
            // Replace this URL with your actual API endpoint
            const response = await request('/api/transports', 'POST', payload);
            toast.success(response.message);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleSeatChange = (rowIndex, seatIndex, value) => {
        const newRows = [...form.rows];
        newRows[rowIndex].seats[seatIndex] = value;
        setForm({
            ...form,
            rows: newRows,
            capacity: newRows.map(row => row.seats.filter(seat => seat !== '')).filter(row => row.length > 0).flat().length
        });
    };

    const addRow = () => {
        setForm({
            ...form,
            rows: [...form.rows, { seats: [] }],
        });
    };

    const removeRow = (index) => {
        const newRows = [...form.rows];
        newRows.splice(index, 1);
        setForm({
            ...form,
            rows: newRows,
        });
    };

    const addSeat = (rowIndex) => {
        const newRows = [...form.rows];
        newRows[rowIndex].seats.push('');
        setForm({
            ...form,
            rows: newRows,
        });
    };

    if (loading || !auth.userId) {
        return <Loader />;
    }

    return (
        <>
        <form className="max-w-lg mx-auto my-10 p-5" onSubmit={handleSubmit}>
            <div className="flex flex-wrap -mx-3 mb-6">

                {/* Number */}
                <div className="w-full px-3 mb-6">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="number">
                        Number
                    </label>
                    <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="number" type="text" placeholder="Transport Number" name="number" value={form.number} onChange={handleChange} />
                    {errors.number && <p className="text-red-500 text-xs italic">{errors.number}</p>}
                </div>

                {/* Brand */}
                <div className="w-full px-3 mb-6">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="brand">
                        Brand
                    </label>
                    <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="brand" type="text" placeholder="Brand" name="brand" value={form.brand} onChange={handleChange} />
                </div>

                {/* Model */}
                <div className="w-full px-3 mb-6">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="model">
                        Model
                    </label>
                    <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="model" type="text" placeholder="Model" name="model" value={form.model} onChange={handleChange} />
                </div>

                {/* Year of Build */}
                <div className="w-full px-3 mb-6">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="yearOfBuild">
                        Year of Build
                    </label>
                    <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="yearOfBuild" type="number" placeholder="Year of Build" name="yearOfBuild" value={form.yearOfBuild} onChange={handleChange} />
                </div>

                {/* Capacity */}
                <div className="w-full px-3 mb-6">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="capacity">
                        Capacity
                    </label>
                    <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" 
                    id="capacity" 
                    type="number" 
                    placeholder="Capacity" 
                    name="capacity" 
                    value={form.capacity} 
                    readOnly={true}
                    onChange={handleChange} />
                </div>
            </div>

            <div>
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                    Seats Layout
                </label>
                {form.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center mb-2">
                        {row.seats.map((seat, seatIndex) => (
                            <input
                                key={seatIndex}
                                type="text"
                                placeholder="Seat"
                                value={seat}
                                onChange={(e) => handleSeatChange(rowIndex, seatIndex, e.target.value)}
                                className="appearance-none block w-12 bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white mr-2"
                            />
                        ))}
                        <button type="button" onClick={() => addSeat(rowIndex)} className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded">
                            Add Seat
                        </button>
                        <button type="button" onClick={() => removeRow(rowIndex)} className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded ml-2">
                            Remove Row
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addRow} className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded">
                    Add Row
                </button>
            </div>


            <button className="shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="submit">
                Add Transport
            </button>
        </form>

                <div className="overflow-x-auto relative shadow-md sm:rounded-lg my-5">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="py-3 px-6">
                            Number
                        </th>
                            <th scope="col" className="py-3 px-6">
                                Brand
                            </th>
                        <th scope="col" className="py-3 px-6">
                            Model
                        </th>
                        <th scope="col" className="py-3 px-6">
                            Details
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transports.map((transport) => (
                        <tr key={transport.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="py-4 px-6">
                                {transport.number}
                            </td>
                            <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {transport.brand}
                            </th>
                            <td className="py-4 px-6">
                                {transport.model}
                            </td>
                            <td className="py-4 px-6">
                                <Link to={`/transports/${transport._id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    View Details
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
}