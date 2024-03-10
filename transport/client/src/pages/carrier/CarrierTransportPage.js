import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import { Loader } from '../../components/Loader';

export const CarrierTransportPage = () => {
    const { id } = useParams();
    const [transport, setTransport] = useState(null);
    const { request, loading } = useHttp();
    const getTransport = useCallback(async () => {
        const data = await request('/api/transports/' + id, 'GET');
        setTransport(data);
        console.log(data);
    }, [request, id])

    useEffect(() => {
        getTransport();
    }, [getTransport])



    const renderSeatLayout = () => {
        //console.log(transport.seatsLayout)
        return transport.seatsLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-2 my-2">
                {row.map((seat, seatIndex) => (
                    <div key={seatIndex} className="w-8 h-8 bg-blue-200 text-center leading-8 rounded">
                        {seat}
                    </div>
                ))}
            </div>
        ));
    };

    if (loading) {
        return <Loader />
    }

    return (
        <div className="max-w-4xl mx-auto p-5">
            <h2 className="text-2xl font-bold mb-4">Transport Details</h2>
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
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
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
                                {renderSeatLayout()}
                            </div>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
