import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { SearchIcon } from '@heroicons/react/solid';
import { convertDate } from '../../components/functions';

export const AdminPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [users, setUsers] = useState(null);
    const [search, setSearch] = useState("");

    const searchButtonHandler = async () => {
        console.log(search)
        if (search.length < 3) {
            toast.error('Введите минимум 3 буквы почты');
            return;
        }
        try {
            const data = await request('/api/user/all?email='+ search);
            setUsers(data);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const removeUserHandler = async (user) => {
        if (window.confirm(`Вы упэўнены, што хочаце выдалiць карыстальнiка ${user.email}?`)) {
            try {
                const data = await request(`/api/user/${user._id}`, 'DELETE', null, {
                    Authorization: `Bearer ${auth.token}`
                });
                toast.success(data.message);
                searchButtonHandler();
            } catch (e) {
                toast.error(e.message);
            }
        }
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-xl font-bold mb-4">Адмiн, дзень добры!</h1>
            <div className='flex items-center justify-between max-w-72'>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Search by email..."
                value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        console.log(e.target.value);  // Log directly the value from the event
                    }}
            />
            <SearchIcon
                className="icon-small bg-red-500 text-white"
                onClick={searchButtonHandler}
                // disabled={!search}
            />
            </div>
            {!users ? <p>Введите минимум 3 буквы почты и нажмите поиск</p> : users.length === 0 ?
            (<p>Карыстальнiкаў не знойдзена</p>)
             : (
                <table className="table-auto w-full mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Почта</th>
                            <th className="px-4 py-2">Роль</th>
                            <th className="px-4 py-2">Активность</th>
                            <th className="px-4 py-2">Имя</th>
                            <th className="px-4 py-2">Дата рождения</th>
                            <th className="px-4 py-2">Дата регистрации</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index} className="bg-white">
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{user.role}</td>
                                <td className="border px-4 py-2">{user.isActivated ? "Актыўны" : "Не актыўны"}</td>
                                <td className="border px-4 py-2">{user.fullName}</td>
                                <td className="border px-4 py-2">{convertDate(user.dateOfBirth)}</td>
                                <td className="border px-4 py-2">{convertDate(user.dateOfRegistration)}</td>
                                <td className="border px-4 py-2">
                                    <button className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => removeUserHandler(user)}>
                                        Выдалiць
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
