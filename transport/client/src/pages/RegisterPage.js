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
import { convertDate } from '../components/functions';

export const RegisterPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        email: '', password: '', dateOfBirth: new Date(), fullName: '', repeatedPassword: '', isCarrier: false
    });

    const handleChange = (event) => {
        const { name, checked } = event.target;
        setForm(prevState => ({
            ...prevState,
            isCarrier: checked
        }));
    };

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
            toast('Чтобы пользователь мог зарегистрироваться, ему должно быть больше 18 лет и меньше 100 лет');
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
        <div className="mt-4 grow flex items-center justify-around bg-gray-100 py-12">
            <div className="mb-12 w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-4xl text-center text-indigo-600 font-bold mb-6">Регистрация</h1>
                <form className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Почта</label>
                    <input type="email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="почта@email.com"
                        value={form.email}
                        name='email'
                        onChange={changeHandler} />
                    <label className="block text-sm font-medium text-gray-700">Имя</label>
                    <input type="text"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ваш ФИО"
                        name='fullName'
                        value={form.fullName}
                        onChange={changeHandler} />
                    <label className="block text-sm font-medium text-gray-700">Пароль</label>
                    <input type="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="пароль"
                        name='password'
                        value={form.password}
                        onChange={changeHandler} />
                    <label className="block text-sm font-medium text-gray-700">Повторите пароль</label>
                    <input type="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="повторите пароль"
                        name='repeatedPassword'
                        value={form.repeatedPassword}
                        onChange={changeHandler} />
                    <label className="block text-sm font-medium text-gray-700">Дата рождения</label>
                    <input type="text"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none"
                        placeholder="Ваш ФИО"
                        name='dateOfBirth'
                        value={convertDate(form.dateOfBirth)}
                        readOnly={true} />
                    <Calendar
                        date={form.dateOfBirth}
                        onChange={calendarHandler}
                        locale={ru}
                    />
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isCarrier"
                            checked={form.isCarrier}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Я перевозчик</span>
                    </label>
                    <button
                        className={`w-full px-4 py-2 text-white bg-indigo-600 rounded-md ${loading ? 'bg-indigo-400' : 'hover:bg-indigo-700'} focus:outline-none disabled:opacity-50`}
                        disabled={loading}
                        onClick={registerHandler}>
                        Зарегистрироваться
                    </button>
                    <div className="text-center py-2 text-gray-500">
                        Есть аккаунт? <Link className="underline text-black" to={'/'}>Войти</Link>
                    </div>
                </form>
            </div>
        </div>
    )
};