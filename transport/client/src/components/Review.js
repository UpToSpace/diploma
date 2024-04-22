import { convertDate } from './functions';
import { useHttp } from '../hooks/http.hook';
import toast from 'react-hot-toast';
import { useState } from 'react';

export const Review = ({ review, userRole, getReviews, editButtonEnable }) => {
    const { request, loading } = useHttp();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(review.text);

    const deleteButtonHandler = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }
        try {
            const response = await request(`/api/reviews/${reviewId}`, 'DELETE');
            toast.success(response.message);
            await getReviews();
        } catch (e) {
            console.log(e);
        }
    };

    const editButtonHandler = async (reviewId) => {
        if (isEditing) {
            try {
                const response = await request(`/api/reviews/${reviewId}`, 'PUT', { text: editText });
                toast.success(response.message);
                await getReviews();
            } catch (e) {
                toast.error('Failed to update the review.');
                console.log(e);
            }
        }
        setIsEditing(!isEditing);
    };

    const changeHandler = (event) => {
        setEditText(event.target.value);
    };

    return (
        <article>
            <div className="flex items-center justify-between mb-4">
                {/* <img className="w-10 h-10 me-4 rounded-full" src="/docs/images/people/profile-picture-5.jpg" alt="" /> */}
                <div className="font-medium text-gray-500">
                    <p>{review.user.email} <time dateTime="2014-08-16 19:00" className="block text-sm text-gray-500 dark:text-gray-400">Joined on {convertDate(review.user.dateOfRegistration)}</time></p>
                </div>
                {userRole === 'admin' && (
                    <button
                        className="ms-auto text-sm font-medium text-red-600 hover:underline"
                        onClick={() => deleteButtonHandler(review._id)}>Delete</button>
                )}
                {
                    editButtonEnable && (
                        <div>
                            <button
                                className="ms-auto text-sm font-medium text-green-600 hover:underline"
                                onClick={() => editButtonHandler(review._id)}>
                                {isEditing ?
                                    'Save'
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                }
                            </button>
                            <button
                                className="ms-auto text-sm font-medium text-red-600 hover:underline"
                                onClick={() => deleteButtonHandler(review._id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    )
                }
                {/* <button className="ms-auto text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">Report abuse</button> */}
            </div>
            <div className="flex items-center mb-1 space-x-1 rtl:space-x-reverse">
                {Array(review.rating).fill(
                    <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                )}
                {Array(5 - review.rating).fill(
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                )}
                <h3 className="ms-2 text-sm font-semibold text-gray-900 dark:text-white">Thinking to buy another one!</h3>
            </div>
            <footer className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                <p>Reviewed {convertDate(review.date)}</p>
            </footer>
            {isEditing ? <textarea value={editText} onChange={changeHandler} className="w-full p-2 border rounded-md min-h-11 max-h-48" rows="4" /> : <p className="mb-2 text-gray-500 dark:text-gray-400">{review.text}</p>}
        </article>
    );
};