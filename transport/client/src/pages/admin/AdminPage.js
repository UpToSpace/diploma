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
    const [activeTab, setActiveTab] = React.useState('profile');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

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
            <h1 className="text-xl font-bold mb-4">Управление пользователями</h1>
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
            {!users ? <p>Введите запрос и нажмите поиск</p> : users.length === 0 ?
                (<p>Пользователей не найдено</p>)
                : (
                    <div>
                        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" role="tablist">
                                <li className="me-2" role="presentation">
                                    <button
                                        className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'profile' ? 'text-gray-800 border-gray-400' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                                        onClick={() => handleTabClick('profile')}
                                        role="tab"
                                        aria-controls="profile"
                                        aria-selected={activeTab === 'profile'}
                                    >
                                        Перевозчики
                                    </button>
                                </li>
                                <li className="me-2" role="presentation">
                                    <button
                                        className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'dashboard' ? 'text-gray-800 border-gray-400' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                                        onClick={() => handleTabClick('dashboard')}
                                        role="tab"
                                        aria-controls="dashboard"
                                        aria-selected={activeTab === 'dashboard'}
                                    >
                                        Пользователи
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div id="default-tab-content">
                            <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === 'profile' ? 'block' : 'hidden'}`} role="tabpanel" aria-labelledby="profile-tab">
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
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(user => user.role === 'carrier').map((user, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="border px-4 py-2">{user.email}</td>
                                                <td className="border px-4 py-2">{user.role}</td>
                                                <td className="border px-4 py-2">{user.isActivated ? "Активен" : "Не активен"}</td>
                                                <td className="border px-4 py-2">{user.fullName}</td>
                                                <td className="border px-4 py-2">{convertDate(user.dateOfBirth)}</td>
                                                <td className="border px-4 py-2">{convertDate(user.dateOfRegistration)}</td>
                                                <td className="border px-4 py-2">
                                                    <a href={`/admin/carrier/${user._id}`} className="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                        Перейти
                                                    </a>
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <button className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                        onClick={() => removeUserHandler(user)}>
                                                        Удалить
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === 'dashboard' ? 'block' : 'hidden'}`} role="tabpanel" aria-labelledby="dashboard-tab">
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
                                        {users.filter(user => user.role === 'user').map((user, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="border px-4 py-2">{user.email}</td>
                                                <td className="border px-4 py-2">{user.role}</td>
                                                <td className="border px-4 py-2">{user.isActivated ? "Активен" : "Не активен"}</td>
                                                <td className="border px-4 py-2">{user.fullName}</td>
                                                <td className="border px-4 py-2">{convertDate(user.dateOfBirth)}</td>
                                                <td className="border px-4 py-2">{convertDate(user.dateOfRegistration)}</td>
                                                <td className="border px-4 py-2">
                                                    <button className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                        onClick={() => removeUserHandler(user)}>
                                                        Удалить
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    // <table className="table-auto w-full mt-4">
                    //     <thead>
                    //         <tr className="bg-gray-200">
                    //             <th className="px-4 py-2">Почта</th>
                    //             <th className="px-4 py-2">Роль</th>
                    //             <th className="px-4 py-2">Активность</th>
                    //             <th className="px-4 py-2">Имя</th>
                    //             <th className="px-4 py-2">Дата рождения</th>
                    //             <th className="px-4 py-2">Дата регистрации</th>
                    //             <th className="px-4 py-2"></th>
                    //         </tr>
                    //     </thead>
                    //     <tbody>
                    //         {users.map((user, index) => (
                    //             <tr key={index} className="bg-white">
                    //                 <td className="border px-4 py-2">{user.email}</td>
                    //                 <td className="border px-4 py-2">{user.role}</td>
                    //                 <td className="border px-4 py-2">{user.isActivated ? "Актыўны" : "Не актыўны"}</td>
                    //                 <td className="border px-4 py-2">{user.fullName}</td>
                    //                 <td className="border px-4 py-2">{convertDate(user.dateOfBirth)}</td>
                    //                 <td className="border px-4 py-2">{convertDate(user.dateOfRegistration)}</td>
                    //                 <td className="border px-4 py-2">
                    //                     <button className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    //                         onClick={() => removeUserHandler(user)}>
                    //                         Выдалiць
                    //                     </button>
                    //                 </td>
                    //             </tr>
                    //         ))}
                    //     </tbody>
                    // </table>
                )}
        </div>
    );
};
