import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { convertDate } from '../../components/functions';

export const AdminMainPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [carriers, setCarriers] = useState([]);

    const fetchCarriers = useCallback(async () => {
        try {
            const data = await request('/api/user/admin/carriers');
            setCarriers(data);
        } catch (e) {
            toast(e.message);
        }
    }, [auth.token, request]);

    useEffect(() => {
        fetchCarriers();
    }, [fetchCarriers]);

    return (
        carriers.length !== 0 ? carriers.map(carrier => (
        <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h1 class="text-xl font-semibold text-gray-800">User Information</h1>
            <div class="mt-4">
                <div class="grid grid-cols-1 gap-4">
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">ID:</span>
                        <span class="text-gray-600">{carrier._id}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Email:</span>
                        <span class="text-blue-600">{carrier.email}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Role:</span>
                        <span class="text-green-500">{carrier.role}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Activated:</span>
                        {carrier.activatedAsCarrier ? <span class="text-green-950">true</span> : <span class="text-red-950">false</span>}
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Full Name:</span>
                        <span class="text-gray-600">{carrier.fullName}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Date of Birth:</span>
                        <span class="text-gray-600">{convertDate(carrier.dateOfBirth)}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Registration Date:</span>
                            <span class="text-gray-600">{convertDate(carrier.dateOfRegistration)}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-medium">Carrier Activation:</span>
                        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => window.confirm('Вы точно хотите активировать перевозчика?') && toast.promise(request(`/api/user/admin/carriers/${carrier._id}/activate`, 'PUT'), {
                            loading: 'Activating...',
                            success: 'Carrier activated',
                            error: 'Error activating carrier'
                        })
                        .then(() => fetchCarriers())}>Activate</button>
                    </div>
                </div>
            </div>
        </div>)) : (
            <p class="text-center mt-10">Все перевозчики активированы</p>
        )
    )
}