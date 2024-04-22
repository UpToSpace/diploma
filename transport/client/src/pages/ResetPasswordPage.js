import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ResetPasswordPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate()
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        password: '', confirmPassword: ''
    });

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const checkFields = (confirmPassword, password) => {
        if (confirmPassword === '' || password === '') {
            toast('Запоўнiце пустыя палi');
            return false;
        }
        if (password.length < 6) {
            toast('Пароль павiнен быць ня менш за 6 сiмвалаў');
            return false;
        }
        if (password !== confirmPassword) {
            toast('Паролi не супадаюць')
            return false;
        }
        return true;
    }

    const changePasswordHandler = async () => {
        if (checkFields(form.confirmPassword, form.password)) {
            try {
                const data = await request('/api/auth/reset/' + searchParams.get('resetLink'), 'POST', { password: form.password });
                toast(data.message);
                navigate('/login');
            } catch (e) {
                toast(e.message);
            }
        }
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <span className="block text-gray-700 text-xl font-bold mb-2">Змена пароля</span>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                                Увядзіце пароль
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                maxLength={12}
                                value={form.password}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                onChange={changeHandler}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                Паутарыце пароль
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                maxLength={12}
                                value={form.confirmPassword}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                onChange={changeHandler}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
                            disabled={loading}
                            onClick={changePasswordHandler}>
                            Змянiць
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
};