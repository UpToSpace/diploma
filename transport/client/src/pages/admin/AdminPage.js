import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { SearchIcon } from '@heroicons/react/solid';
import { convertDate } from '../../components/functions';

export const AdminPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const searchButtonHandler = async () => {
        console.log(search)
        // if (search.length < 3) {
        //     toast.error('Введите минимум 3 буквы почты');
        //     return;
        // }
        try {
            const data = await request('/api/user/all?email=' + search);
            setUsers(data);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const removeUserHandler = async (user) => {
        if (window.confirm(`Вы уверены, что хотите удалить ${user.email}?`)) {
            try {
                const data = await request(`/api/user/${user._id}`, 'DELETE');
                toast.success(data.message);
                searchButtonHandler();
            } catch (e) {
                toast.error(e.message);
            }
        }
    }

    return (
        <div className="container">
            <h2 className="section">Управление перевозчиками</h2>
            <div className="max-w-xl mx-auto p-4 rounded-lg bg-white text-primary shadow-lg w-full grid grid-cols-2 gap-2">
                <div>
                    <label>
                        Электронная почта
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                console.log(e.target.value);  // Log directly the value from the event
                            }}
                        />
                    </label>
                </div>
                <div className='flex'>
                    <button className="primary bg-primary text-white text-lg rounded-lg p-2 inline-flex items-center justify-center" onClick={searchButtonHandler}>
                        <SearchIcon
                            className="icon-small text-white rounded-lg mx-1 h-5 w-5"
                        />
                        Найти перевозчиков
                    </button>
                </div>
            </div>
            {users.length === 0 ? <p className='m-auto'>Введите запрос и нажмите поиск</p> 
                : (
                    <div className="overflow-x-auto relative shadow-md sm:rounded-lg my-5">
                        <div className="overflow-hidden rounded-lg">
                            <table className="min-w-full text-left text-sm font-light text-surface">
                                <thead className="border-b border-neutral-200 font-light bg-primary text-white rounded-t-lg">
                                    <tr >
                                        <th className="px-6 py-4">Почта</th>
                                        <th className="px-6 py-4">Роль</th>
                                        <th className="px-6 py-4">Активность</th>
                                        <th className="px-6 py-4">Имя</th>
                                        <th className="px-6 py-4">Дата рождения</th>
                                        <th className="px-6 py-4">Дата регистрации</th>
                                        <th className="px-6 py-4"></th>
                                        <th className="px-6 py-4 rounded-tr-lg"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={index} className="bg-white">
                                            <td className="border px-4 py-2">{user.email}</td>
                                            <td className="border px-4 py-2">{user.role}</td>
                                            <td className="border px-4 py-2">{user.isActivated ? "Активен" : "Не активен"}</td>
                                            <td className="border px-4 py-2">{user.fullName}</td>
                                            <td className="border px-4 py-2">{convertDate(user.dateOfBirth)}</td>
                                            <td className="border px-4 py-2">{convertDate(user.dateOfRegistration)}</td>
                                            <td className="border px-4 py-2">
                                                <a href={`/admin/carrier/${user._id}`} className="primary">
                                                    Перейти
                                                </a>
                                            </td>
                                            <td className="border px-4 py-2">
                                                <button className="btn bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
                                                    onClick={() => removeUserHandler(user)}>
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div >
                    </div >
                )}
        </div>
    );
};
