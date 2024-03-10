import { toast } from 'react-hot-toast';
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';

export const AdminPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [users, setUsers] = useState(null);

    const getUsers = useCallback(async () => {
        const data = await request('/api/user/all', 'GET', null);
        setUsers(data);
    }, [auth.token, request])

    useEffect(() => {
        getUsers();
    }, [])

    if (loading) {
        return <Loader />
    }

    const removeUserHandler = async (user) => {
        if (window.confirm('Вы упэўнены, што хочаце выдалiць карыстальнiка ' + user.email + '?')) {
            try {
                const data = await request('/api/user/' + user._id, 'DELETE', null);
                toast(data.message);
                await getUsers();
            } catch (e) {
                toast(e.message);
            }
        }
    }

    return (
        <div className="container">
            <h1>Адмiн, дзень добры!</h1>
            {users && <table>
                <thead>
                    <tr>
                        <th>Пошта</th>
                        <th>Роль</th>
                        <th>Актыўнасць</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user, index) => {
                        return <tr key={index}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.isActivated ? "Актыўны" : "Не актыўны"}</td>
                            <td><button className="btn waves-effect waves-light" onClick={() => removeUserHandler(user)}>Выдалiць</button></td>
                        </tr>
                    })}
                </tbody>
            </table>}
        </div>
    )
}