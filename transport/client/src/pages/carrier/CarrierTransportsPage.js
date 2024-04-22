import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hook';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { predefinedLayouts } from '../../constants/predefinedLayouts';

// Function to find duplicates in the seat layout
const findDuplicates = (seatLayout) => {
    const seen = new Set();
    const duplicates = new Set();
    seatLayout.flat().forEach(seat => {
        if (seat && seen.has(seat)) {
            duplicates.add(seat);
        }
        seen.add(seat);
    });
    return duplicates;
};

// Function to find missing seat numbers
const findMissingSeats = (seatLayout, maxSeats) => {
    const seatNumbers = new Set(seatLayout.flat().filter(seat => seat !== ""));
    const missing = [];
    for (let i = 1; i <= maxSeats; i++) {
        if (!seatNumbers.has(i.toString())) {
            missing.push(i);
        }
    }
    return missing;
};

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

    const [checkedState, setCheckedState] = useState({
        check1: false,
        check2: false,
        check3: false
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

        if (!form.number) {
            isValid = false;
            errors.number = 'Number is required.';
        }

        if (form.yearOfBuild < 1900 || form.yearOfBuild > new Date().getFullYear()) {
            isValid = false;
            errors.yearOfBuild = 'Year of Build must be between 1900 and current year.';
        }

        setErrors(errors);
        return isValid;
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const validateSeatLayout = () => {
        const duplicates = findDuplicates(form.rows.map(row => row.seats));
        const missing = findMissingSeats(form.rows.map(row => row.seats), form.capacity);

        if (duplicates.size > 0) {
            toast.error(`Duplicate seat numbers detected: ${[...duplicates].join(", ")}`);
            return false;
        }

        if (missing.length > 0) {
            toast.error(`Missing seat numbers: ${missing.join(", ")}`);
            return false;
        }

        return true; // No issues, valid seat layout
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm || !validateSeatLayout()) {
            return;
        }

        const payload = {
            ...form,
            seatsLayout: form.rows.map(row => row.seats),
            carrier: auth.userId,
            conditioners: checkedState.check1,
            wifi: checkedState.check2,
            power: checkedState.check3,
        };
        // Perform the API call to add a new transport
        try {
            // Replace this URL with your actual API endpoint
            const response = await request('/api/transports', 'POST', payload);
            toast.success(response.message);
            await getTransports();
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
            capacity: newRows.map(row => row.seats.filter(seat => seat !== '')).filter(row => row.length > 0).flat().length
        });
    };

    const addSeat = (rowIndex) => {
        const newRows = [...form.rows];
        newRows[rowIndex].seats.push('');
        setForm({
            ...form,
            rows: newRows,
            capacity: newRows.map(row => row.seats.filter(seat => seat !== '')).filter(row => row.length > 0).flat().length
        });
    };

    const handleLayoutChange = (e) => {
        const selectedLayout = predefinedLayouts.find(layout => layout.id.toString() === e.target.value);
        setForm({
            ...form,
            rows: selectedLayout ? selectedLayout.layout.map(row => ({ seats: [...row] })) : [],
            capacity: selectedLayout ? selectedLayout.layout.flat().filter(seat => seat !== '').length : ''
        });
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState(prevState => ({
            ...prevState,
            [name]: checked
        }));
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
                        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="yearOfBuild" type="number" placeholder="Year of Build" name="yearOfBuild" value={form.yearOfBuild} onChange={handleChange}
                            min={new Date().getFullYear() - 100} max={new Date().getFullYear()} />
                        {errors.number && <p className="text-red-500 text-xs italic">{errors.number}</p>}
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

                <div className="w-full px-3 mb-6">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="layout">
                        Seat Layout
                    </label>
                    <select
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="layout"
                        name="layout"
                        onChange={handleLayoutChange}
                    >
                        <option value="">Select a predefined layout</option>
                        {predefinedLayouts.map((layout) => (
                            <option key={layout.id} value={layout.id}>
                                {layout.name}
                            </option>
                        ))}
                    </select>
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

                <div className="flex flex-col items-start justify-center p-4">
                    <label className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="check1"
                            checked={checkedState.check1}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Кондиционер</span>
                    </label>
                    <label className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="check2"
                            checked={checkedState.check2}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Wi-Fi</span>
                    </label>
                    <label className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="check3"
                            checked={checkedState.check3}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>220v</span>
                    </label>
                </div>

                <div className="flex items-center justify-center mt-5">
                    <button className="shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="submit">
                        Add Transport
                    </button>
                </div>
            </form>

            {transports.length !== 0 && <div className="overflow-x-auto relative shadow-md sm:rounded-lg my-5">
                <table className="w-full text-sm text-left text-gray-500 bg-green-200">
                    <thead className="text-xs text-gray-700 uppercase bg-green-500">
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
                            <tr key={transport.id} className="text-gray-950 border-b transition duration-300 ease-in-out rounded-lg bg-green-200 hover:bg-green-300 cursor-pointer">
                                <td className="py-4 px-6">
                                    {transport.number}
                                </td>
                                <td scope="row" className="py-4 px-6">
                                    {transport.brand}
                                </td>
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
            </div>}
        </>
    );
}