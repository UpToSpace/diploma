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
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-md mx-auto">
                    <input type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        name="email"
                        onChange={changeHandler} />
                    <input type="password"
                        placeholder="password"
                        name="password"
                        value={form.password}
                        onChange={changeHandler} />
                    <button
                        disabled={loading}
                        onClick={loginHandler}>
                        Login
                    </button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link className="underline text-black" to={'/register'}>Register now</Link>
                    </div>
                    <div className="text-center py-2 text-gray-500">
                        Forgot your password? <button onClick={resetHandler}>Reset password</button>
                    </div>
                </form>
            </div>
        </div>
    )
};