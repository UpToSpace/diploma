import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const AuthPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        email: '', password: ''
    });

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const checkFields = (email, password) => {
        if (email === '' || password === '') {
            toast('Запоўнiце пустыя палi');
            return false;
        }
        if (RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email) === false) {
            toast('Некарэктны email');
            return false;
        }
        if (password.length < 6) {
            toast('Пароль павiнен быць ня менш за 6 сiмвалаў');
            return false;
        }
        return true;
    }

    const registerHandler = async () => {
        try {
            const { email, password } = form;
            if (checkFields(email, password)) {
                const data = await request('/api/auth/register', 'POST', { ...form });
                toast(data.toast);
            }
        } catch (e) {
            toast(e.toast);
        }
    }

    const loginHandler = async () => {
        try {
            const { email, password } = form;
            if (checkFields(email, password)) {
                const data = await request('/api/auth/login', 'POST', { ...form });
                if (data.token && data.user) {
                    auth.login(data.token, data.user);
                    auth.userRole = data.user.role;
                    auth.userId = data.user.id;
                    navigate('/');
                } else {
                    toast(data.message);
                }
            }
        } catch (e) {
            toast(e.message);
        }
    }

    const resetHandler = async (e) => {
        e.preventDefault();
        if (form.email === '') {
            toast('Запоўнiце поле пошты');
            return;
        }
        try {
            const data = await request('/api/auth/reset', 'POST', { email: form.email });
            toast(data.toast);
        } catch (e) {
            toast(e.toast);
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-around bg-gray-100 py-12">
            <div className="mb-12 w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-4xl text-center text-indigo-600 font-bold mb-6">Login</h1>
                <form className="space-y-4">
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        name="email"
                        onChange={changeHandler}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="password"
                        placeholder="password"
                        name="password"
                        value={form.password}
                        onChange={changeHandler}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        disabled={loading}
                        onClick={loginHandler}
                        className={`w-full px-4 py-2 text-white bg-indigo-600 rounded-md ${loading ? 'bg-indigo-400' : 'hover:bg-indigo-700'} focus:outline-none disabled:opacity-50`}
                    >
                        Login
                    </button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link className="underline text-indigo-600 hover:text-indigo-800" to={'/register'}>Register now</Link>
                    </div>
                    <div className="text-center py-2 text-gray-500">
                        Forgot your password? <button onClick={resetHandler} className="underline text-indigo-600 hover:text-indigo-800">Reset password</button>
                    </div>
                </form>
            </div>
        </div>
    )
};