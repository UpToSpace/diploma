import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { renderSeatLayout } from '../../components/functions';
import toast from 'react-hot-toast';

export const CarrierTransportPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transport, setTransport] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedTransport, setEditedTransport] = useState({});
    const [checkedState, setCheckedState] = useState({
        check1: false,
        check2: false,
        check3: false
    });
    const { request, loading } = useHttp();
    const getTransport = useCallback(async () => {
        const data = await request('/api/transports/' + id, 'GET');
        setTransport(data);
        console.log(data);
    }, [request, id])

    useEffect(() => {
        getTransport();
    }, [getTransport])

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const editButtonHandler = () => {
        setEditedTransport(transport);
        setCheckedState({
            check1: transport.conditioners,
            check2: transport.wifi,
            check3: transport.power
        });
        toggleEditMode();
    };

    const cancelButtonHandler = () => {
        setEditedTransport({});
        toggleEditMode();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTransport({ ...editedTransport, [name]: value });
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const saveChanges = async () => {
        try {
            editedTransport.conditioners = checkedState.check1;
            editedTransport.wifi = checkedState.check2;
            editedTransport.power = checkedState.check3;
            await request('/api/transports/' + id, 'PUT', editedTransport);
            setTransport(editedTransport);
            toggleEditMode();
            toast.success('Changes saved successfully');
        } catch (error) {
            toast.error(error.message);
            console.error('Failed to save changes', error);
        }
    };

    const deleteTransport = async () => {
        if (!window.confirm('Are you sure you want to delete this transport?')) {
            return;
        }
        try {
            await request('/api/transports/' + id, 'DELETE');
            navigate('/transports');
        } catch (error) {
            toast.error(error.message);
            console.error('Failed to delete transport', error);
        }
    };

    if (loading || !transport) {
        return <Loader />
    }

    return (
        <div className="max-w-4xl mx-auto p-5">
            <h2 className="text-2xl font-bold mb-4">Transport Details</h2>
            {editMode ? (
                <div>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Number:
                                <input
                                    type="text"
                                    name="number"
                                    value={editedTransport.number}
                                    onChange={handleInputChange}
                                />
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Details about the transport.
                            </p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Brand
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="text"
                                            name="brand"
                                            value={editedTransport.brand}
                                            onChange={handleInputChange}
                                        />
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Model
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="text"
                                            name="model"
                                            value={editedTransport.model}
                                            onChange={handleInputChange}
                                        />
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Year of Build
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="text"
                                            name="yearOfBuild"
                                            value={editedTransport.yearOfBuild}
                                            onChange={handleInputChange}
                                            max={new Date().getFullYear()}
                                            min={new Date().getFullYear() - 100}
                                        />
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Capacity
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <input
                                            type="text"
                                            name="capacity"
                                            value={editedTransport.capacity}
                                            readOnly={true}
                                        />
                                    </dd>
                                </div>
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Seat Layout
                                    </h3>
                                    <div className="mt-4">
                                        {renderSeatLayout(transport)}
                                    </div>
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

                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Edit
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-3" onClick={saveChanges}>
                                            Save
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={cancelButtonHandler}>
                                            Cancel
                                        </button>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Number: {transport.number}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Details about the transport.
                        </p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Brand
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {transport.brand}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Model
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {transport.model}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Year of Build
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {transport.yearOfBuild}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Capacity
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {transport.capacity}
                                </dd>
                            </div>
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Seat Layout
                                </h3>
                                <div className="mt-4">
                                    {renderSeatLayout(transport)}
                                </div>
                            </div>

                            <div className="flex flex-col items-start justify-center p-4">
                                <label className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="check1"
                                        checked={transport.conditioners}
                                        onChange={handleCheckboxChange}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span>Кондиционер</span>
                                </label>
                                <label className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="check2"
                                        checked={transport.wifi}
                                        onChange={handleCheckboxChange}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span>Wi-Fi</span>
                                </label>
                                <label className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="check3"
                                        checked={transport.power}
                                        onChange={handleCheckboxChange}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span>220v</span>
                                </label>
                            </div>

                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Edit
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3" onClick={editButtonHandler}>
                                        Edit
                                    </button>
                                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={deleteTransport}>
                                        Delete
                                    </button>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
}
