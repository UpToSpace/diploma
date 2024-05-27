import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

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
        <div className='container'>
            <div class="mt-6 sm:mx-auto w-full sm:max-w-sm">
                <h2 className="selection mb-6">Добавление транспорта</h2>
                <form className="space-y-2" onSubmit={handleSubmit}>
                    <label htmlFor="number">
                        Номер
                    </label>
                    <input id="number" type="text" name="number" value={form.number} onChange={handleChange} maxLength={7} />

                    <label htmlFor="brand">
                        Бренд
                    </label>
                    <input id="brand" type="text" name="brand" value={form.brand} onChange={handleChange} maxLength={10} />

                    <label htmlFor="model">
                        Модель
                    </label>
                    <input id="model" type="text" name="model" value={form.model} onChange={handleChange} maxLength={10}/>

                    <label htmlFor="yearOfBuild">
                        Год производства
                    </label>
                    <input id="yearOfBuild" type="number" name="yearOfBuild" value={form.yearOfBuild} onChange={handleChange}
                        min={new Date().getFullYear() - 100} max={new Date().getFullYear()} maxLength={4} />

                    <label htmlFor="capacity">
                        Вместимость
                    </label>
                    <input
                        id="capacity"
                        type="number"
                        name="capacity"
                        value={form.capacity}
                        readOnly={true}
                        onChange={handleChange} />

                    <select
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 cursor-pointer"
                        id="layout"
                        name="layout"
                        onChange={handleLayoutChange}
                    >
                        <option value="">Выберите сохраненную схему мест</option>
                        {predefinedLayouts.map((layout) => (
                            <option key={layout.id} value={layout.id}>
                                {layout.name}
                            </option>
                        ))}
                    </select>

                        <label>
                            Схема мест
                        </label>
                        {form.rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex items-center mb-2">
                                {row.seats.map((seat, seatIndex) => (
                                    <input
                                        key={seatIndex}
                                        type="text"
                                        value={seat}
                                        onChange={(e) => handleSeatChange(rowIndex, seatIndex, e.target.value)}
                                        className="seat"
                                        maxLength={2}
                                        max={99}
                                        min={1}
                                    />
                                ))}
                                <button type="button" onClick={() => addSeat(rowIndex)} className="bg-green-500 hover:bg-green-400 text-sm text-white font-thin py-2 px-4 rounded">
                                    Добавить место
                                </button>
                                <button type="button" onClick={() => removeRow(rowIndex)} className="bg-red-500 hover:bg-red-400 text-sm text-white font-thin py-2 px-4 rounded ml-2">
                                    Удалить ряд
                                </button>
                            </div>
                        ))}
                    <button type="button" onClick={addRow} className="bg-green-500 hover:bg-green-400 text-sm text-white font-thin py-2 px-4 rounded">
                            Добавить ряд
                        </button>

                    <div className="flex flex-col items-start justify-center p-4 space-y-2">
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
                        <button className="primary" type="submit">
                            Добавить
                        </button>
                    </div>
                </form>
            </div>

            {transports.length !== 0 && <div className="overflow-x-auto relative shadow-md sm:rounded-lg my-5">
                <div className="overflow-hidden rounded-lg">
                    <table className="min-w-full text-left text-sm font-light text-surface">
                        <thead className="border-b border-neutral-200 font-light bg-primary text-white rounded-t-lg">
                            <tr>
                                <th scope="col" className="px-6 py-4 rounded-tl-lg">Номер</th>
                                <th scope="col" className="px-6 py-4">Номер</th>
                                <th scope="col" className="px-6 py-4">Вместимость</th>
                                <th scope="col" className="px-6 py-4">Бренд</th>
                                <th scope="col" className="px-6 py-4">Модель</th>
                                <th scope="col" className="px-6 py-4 rounded-tr-lg">Год изготовления</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transports.map((transport, index) => (
                                <tr
                                    key={transport._id}
                                    className="border-b border-neutral-200 transition duration-300 ease-in-out bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-lg"
                                    onClick={() => navigate(`/transports/${transport._id}`)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{transport.number}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{transport.capacity}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{transport.brand}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{transport.model}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{transport.yearOfBuild}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>}
        </div>
    );
}