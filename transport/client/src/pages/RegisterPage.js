import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Calendar } from "react-date-range";
import { ru } from 'date-fns/locale';
import { convertDate } from '../components/functions';

export const RegisterPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { loading, request } = useHttp();
    const [form, setForm] = useState({
        email: '', password: '', dateOfBirth: new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()), fullName: '', repeatedPassword: '', isCarrier: false
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
        <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <img class="logo" src="https://img.icons8.com/dotty/80/000000/get-on-bus.png" alt="get-on-bus" />
                <h2>Регистрация</h2>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-2">
                    <label>Электронная почта</label>
                    <input type="email"
                        value={form.email}
                        name='email'
                        maxLength={30}
                        onChange={changeHandler} />
                    <label>Имя</label>
                    <input type="text"
                        name='fullName'
                        value={form.fullName}
                        maxLength={30}
                        onChange={changeHandler} />
                    <label>Пароль</label>
                    <input type="password"
                        name='password'
                        value={form.password}
                        maxLength={30}
                        onChange={changeHandler} />
                    <label>Повторите пароль</label>
                    <input type="password"
                        name='repeatedPassword'
                        value={form.repeatedPassword}
                        maxLength={30}
                        onChange={changeHandler} />
                    <label>Дата рождения</label>
                    <input type="text"
                        name='dateOfBirth'
                        maxLength={30}
                        value={convertDate(form.dateOfBirth)}
                        readOnly={true} />
                    <Calendar
                        date={form.dateOfBirth}
                        onChange={calendarHandler}
                        locale={ru}
                        className='calendar'
                        maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                        minDate={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate())}
                        color='primary'
                    />
                    <label>
                        <input
                            type="checkbox"
                            name="isCarrier"
                            checked={form.isCarrier}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-primary"
                        />
                        <span>Я перевозчик</span>
                    </label>
                    <button
                        className='primary'
                        disabled={loading}
                        onClick={registerHandler}>
                        Зарегистрироваться
                    </button>
                    <p className='note'>
                        Есть аккаунт? <a href='/'>Войти</a>
                    </p>
                </form>
            </div>
        </div>
    )
};