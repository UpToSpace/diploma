import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../hooks/http.hook';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import google from '../styles/images/google.svg';
import linkedin from '../styles/images/linkedin.svg';

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
            toast('Заполните пустые поля');
            return false;
        }
        if (RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email) === false) {
            toast('Некорректный email');
            return false;
        }
        if (password.length < 6) {
            toast('Пароль должен быть не менее 6 символов');
            return false;
        }
        return true;
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
        <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <img class="logo" src="https://img.icons8.com/dotty/80/000000/get-on-bus.png" alt="get-on-bus" />
                <h2>Вход в аккаунт</h2>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form class="space-y-6" action="#" method="POST">
                    <div>
                        <label for="email">Электронная почта</label>
                        <div class="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autocomplete="email"
                                required
                                value={form.email}
                                onChange={changeHandler}
                                maxLength={30}
                            />
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between">
                            <label for="password">Пароль</label>
                            <div class="text-sm">
                                <a onClick={resetHandler}>Забыли пароль?</a>
                            </div>
                        </div>
                        <div class="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                required
                                maxLength={30}
                                value={form.password}
                                onChange={changeHandler} />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            class="primary"
                            disabled={loading}
                            onClick={loginHandler}
                        >Войти</button>
                    </div>
                </form>

                <div class="mt-6 grid grid-cols-2 gap-3">
                    <div>
                        <button class="secondary">
                            <img src={google} alt="Google" class="mr-3 h-4" />
                            Google
                        </button>
                    </div>
                    <div>
                        <button class="secondary">
                            <img src={linkedin} alt="GitHub" class="mr-3 h-4" />
                            LinkedIn
                        </button>
                    </div>
                </div>

                <p class="note">
                    Не зарегистрированы?
                    <a href="/register"> Регистрация</a>
                </p>
            </div>
        </div>

    )
};