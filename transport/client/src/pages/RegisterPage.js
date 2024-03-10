import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Calendar } from "react-date-range";
import { da, ru } from 'date-fns/locale';

export const RegisterPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        email: '', password: '', dateOfBirth: new Date(), fullName: ''
    });

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const calendarHandler = (date) => {
        setForm({ ...form, dateOfBirth: date });
    }

    const checkFields = (email, password, fullName, dateOfBirth) => {
        if (email === '' || password === '' || fullName === '') {
            toast('Запоўнiце пустыя палi');
            return false;
        }
        if (RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email) === false) {
            toast('Некарэктны email');
            return false;
        }
        if (fullName.length < 5) {
            toast('Некарэктны full name');
            return false;
        }
        if (dateOfBirth.getFullYear() < new Date().getFullYear() - 100 || dateOfBirth.getFullYear() > new Date().getFullYear() - 18) {
            toast('Некарэктная дата нараджэння');
            return false;
        }
        if (password.length < 6) {
            toast('Пароль павiнен быць ня менш за 6 сiмвалаў');
            return false;
        }
        return true;
    }

    const registerHandler = async (e) => {
        e.preventDefault();
        try {
            const { email, password, fullName, dateOfBirth } = form;
            if (checkFields(email, password, fullName, dateOfBirth)) {
                const data = await request('/api/auth/register', 'POST', { ...form });
                toast(data.message);
                navigate('/');
            }
        } catch (e) {
            toast(e.message);
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Register</h1>
                <form className="max-w-md mx-auto">
                    <input type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        name='email'
                        onChange={changeHandler} />
                    <input type="text"
                        placeholder="your full name"
                        name='fullName'
                        value={form.fullName}
                        onChange={changeHandler} />
                    <input type="password"
                        placeholder="password"
                        name='password'
                        value={form.password}
                        onChange={changeHandler} />
                    <Calendar
                        date={form.dateOfBirth}
                        onChange={calendarHandler}
                        locale={ru}
                    />
                    <button
                        disabled={loading}
                        onClick={registerHandler}>
                        Register
                    </button>
                    <div className="text-center py-2 text-gray-500">
                        Already have an account? <Link className="underline text-black" to={'/'}>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    )
};