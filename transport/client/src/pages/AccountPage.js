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
    const [user, setUser] = useState();
    const [avatar, setAvatar] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const logoutHandler = event => {
        event.preventDefault();
        if (window.confirm("Вы точно хотите выйти?")) {
            auth.logout();
            navigate("/")
        }
    }

    const getUser = useCallback(async () => {
        const data = await request('/api/user', 'GET', null);
        setUser(data);
        //console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getUser();
    }, [getUser])

    if (loading) {
        return <Loader />
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                toast.error('Только файлы форматов JPEG, JPG, PNG и GIF допустимы.');
                return;
            }

            if (file.size > maxSize) {
                toast.error('Размер файла не должен превышать 5MB.');
                return;
            }
            setAvatar(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Пароль должен быть не менее 6 символов');
            return;
        }
        if (newPassword.length > 12) {
            toast.error('Пароль должен быть не более 12 символов');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }
        if (oldPassword === newPassword) {
            toast.errort('Новый пароль не должен совпадать со старым');
            return;
        }
        try {
            await request('/api/user', 'POST', { token: localStorage.getItem('token'), newPassword, oldPassword })
            toast.success('Пароль успешно изменен')
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            toast.error(e.message)
        }
    };

    const handleAvatarSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('avatar', avatar);
        formData.append('userId', user._id);

        try {
            const response = await fetch('/api/user/upload-avatar', {
                method: 'PUT',
                body: formData
            });
            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error('Ошибка загрузки аватарки:', error);
        }
    };

    return (
        user &&
        <div className='container'>
            <h2 className='text-6xl font-thin text-center text-primary mt-4'>Аккаунт</h2>
            <div className='flex justify-center items-center space-x-5'>
                <div>
                    <img src={user.avatarUrl} alt="Аватарка" className='avatar' />
                    <p className="text-gray-700 mt-1">Почта: {user.email}</p>
                    <p className="text-gray-700 mt-1">Имя: {user.fullName}</p>
                    <p className="text-gray-700 mt-1">Роль: {user.role}</p>
                    <p className="text-gray-700 mt-1">Дата рождения: {new Date(user.dateOfBirth).toLocaleDateString()}</p>
                    <p className="text-gray-700 mt-1">Дата регистрации: {new Date(user.dateOfRegistration).toLocaleDateString()}</p>
                </div>
                <div>
                    <a href="/" onClick={logoutHandler} className="flex items-center text-red-600 hover:text-red-800 transition duration-150 ease-in-out">
                        <img width="40" height="40" src="https://img.icons8.com/dotty/80/072446/get-off-bus.png" alt="get-off-bus" />
                        Выйти из аккаунта
                    </a>
                    <form onSubmit={handleAvatarSubmit}>
                        <label for="image_uploads">Выберите файл</label>
                        <input type="file" accept='.png, .jpeg, .gif, .jpg' id="image_uploads" name="image_uploads" onChange={handleFileChange} />
                        <button type="submit">Загрузить аватарку</button>
                    </form>
                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <h3 className="text-xl font-semibold text-gray-800">Изменить пароль</h3>
                        <div>
                            <label htmlFor="oldPassword" className="block text-gray-700">Старый пароль</label>
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
                            <label htmlFor="newPassword" className="block text-gray-700">Новый пароль</label>
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
                            <label htmlFor="confirmPassword" className="block text-gray-700">Подтвердить пароль</label>
                            <input
                                maxLength={12}
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input max-w-72 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                        <button className="primary" type="submit">Изменить пароль</button>
                    </form>
                </div>
            </div>
        </div>
    )
}