import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

export const AccountPage = () => {
    const { loading, request } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [userEmail, setUserEmail] = useState();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const logoutHandler = event => {
        event.preventDefault();
        if (window.confirm("Вы сапраўды хочаце выйсці?")) {
            auth.logout();
            navigate("/")
        }
    }

    const getUser = useCallback(async () => {
        const data = await request('/api/user', 'GET', null);
        setUserEmail(data);
        //console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getUser();
    }, [getUser])

    if (loading) {
        return <Loader />
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast('Пароль павiнен быць ня менш за 6 сiмвалаў');
            return;
        }
        if (newPassword.length > 12) {
            toast('Пароль павiнен быць ня больш за 12 сiмвалаў');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast('Паролi не супадаюць');
            return;
        }
        if (oldPassword === newPassword) {
            toast('Стары i новы паролi супадаюць');
            return;
        }
        try {
            await request('/api/user', 'POST', { token: localStorage.getItem('token'), newPassword, oldPassword })
            toast('Пароль зменены')
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            toast(e.message)
        }
    };

    return (
        <div className='container mx-auto mt-10 p-5 shadow-lg rounded-lg bg-white'>
            {userEmail && (
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">Акаунт</h1>
                    <a href="/" onClick={logoutHandler} className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out">Выйсцi з акаунта</a>
                    <p className="text-gray-700 mt-1 mb-5">Пошта: {userEmail}</p>
                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <h3 className="text-xl font-semibold text-gray-800">Змянiць пароль</h3>
                        <div>
                            <label htmlFor="oldPassword" className="block text-gray-700">Стары пароль</label>
                            <input
                                maxLength={12}
                                type="password"
                                id="oldPassword"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="form-input max-w-72 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-gray-700">Новы пароль</label>
                            <input
                                maxLength={12}
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="form-input max-w-72 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-gray-700">Падцвердзiць пароль</label>
                            <input
                                maxLength={12}
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input max-w-72 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                        <button className="btn-large bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Змянiць пароль</button>
                    </form>
                </div>
            )}
        </div>
    )
}