import React from 'react';
import { useState } from 'react';
import { calculateTimeDifference, checkIfTicketOver, convertDate, convertTime } from './functions';
import { useHttp } from '../hooks/http.hook';
import { Feedback } from './Feedback';

export const TicketCard = ({ ticket, returnTicketButtonHandler, leaveReviewButtonDisabled, getTickets, getUserReviews }) => {
    const [showFeedback, setShowFeedback] = useState(false);
    return (
        <section className="w-full flex-grow bg-zinc-200 flex flex-col items-center justify-center p-4">
            <div className="flex w-full max-w-3xl text-zinc-50 h-64">
                <div className="w-1/5 h-full bg-zinc-900 flex items-center justify-center px-6 rounded-l-3xl">
                    <div className="flex flex-col text-center">
                        <span className="text-xs text-white">ONTEN</span>
                        {checkIfTicketOver(ticket.route.destination.date) ? (
                            leaveReviewButtonDisabled ? (
                                <div className="flex items-center px-3 rounded-full border border-septenary hover:bg-septenary h-8 mt-2 transition-all duration-300">
                                    <button disabled={true} className="text-xs text-zinc-50">Спасибо!</button>
                                </div>
                                ) : (
                                    <div className="flex items-center px-3 rounded-full border border-octonary hover:bg-octonary h-8 mt-2 cursor-pointer transition-all duration-300">
                                        <button onClick={() => setShowFeedback(!showFeedback)} className="text-xs text-zinc-50">Оставить отзыв</button>
                                    </div>
                            )
                        ) : (
                                <div className="flex items-center px-3 rounded-full border border-septenary hover:bg-septenary h-8 mt-2 cursor-pointer transition-all duration-300">
                                <button onClick={() => returnTicketButtonHandler(ticket._id)} className="text-xs text-zinc-50">Вернуть билет</button>
                            </div>
                        )}
                        <a href={`/trips/carrier/${ticket.route.transport.carrier}`} className="text-sm font-thin text-green-800 cursor-pointer mt-2 hover:text-green-600 transition-all duration-300">
                            Перевозчик
                        </a>
                    </div>
                </div>
                <div className="relative h-full flex flex-col items-center border-dashed justify-between border-2 bg-zinc-900 border-zinc-50">
                    <div className="absolute rounded-full w-8 h-8 bg-zinc-200 -top-5"></div>
                    <div className="absolute rounded-full w-8 h-8 bg-zinc-200 -bottom-5"></div>
                </div>
                <div className="h-full py-8 px-10 bg-zinc-900 flex-grow rounded-r-3xl flex flex-col">
                    <div className="flex w-full justify-between items-center">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold">{ticket.route.departure.city}</span>
                            <span className="text-zinc-500 text-sm">{ticket.route.departure.country}</span>
                        </div>
                        <div className="flex flex-col flex-grow items-center px-10">
                            <span>
                                <img width="30" height="30" src="https://img.icons8.com/dotty/80/ffffff/bus2.png" alt="bus2" />
                            </span>
                            <div className="w-full flex items-center">
                                <div className="w-3 h-3 rounded-full border-2 border-zinc-900"></div>
                                <div className="flex-grow border-t-2 border-zinc-400 border-dotted h-px"></div>
                                <div className="w-3 h-3 rounded-full border-2 border-zinc-900"></div>
                            </div>
                            <div className="flex items-center px-3 rounded-full h-8 mt-2 border border-white">
                                <span className="text-sm text-white">{calculateTimeDifference(ticket.route.departure.date, ticket.route.destination.date)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold">{ticket.route.destination.city}</span>
                            <span className="text-zinc-500 text-sm">{ticket.route.destination.country}</span>
                        </div>
                    </div>
                    <div className="flex w-full mt-auto justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400">Отправление</span>
                            <span className="font-mono">{convertTime(ticket.route.departure.date)}</span>
                            <span className="font-mono">{convertDate(ticket.route.departure.date)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400">Прибытие</span>
                            <span className="font-mono">{convertTime(ticket.route.destination.date)}</span>
                            <span className="font-mono">{convertDate(ticket.route.destination.date)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400">Транспорт</span>
                            <span className="font-mono">{`${ticket.route.transport.brand} ${ticket.route.transport.model}`}</span>
                            <span className="font-mono">{ticket.route.transport.number}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400">Место/Цена</span>
                            <span className="font-mono">{ticket.seat}</span>
                            <span className="font-mono">{ticket.route.price} BYN</span>
                        </div>
                    </div>
                </div>
            </div>

            {showFeedback && <Feedback setShowFeedback={setShowFeedback} route={ticket.route} getTickets={getTickets}
                getUserReviews={getUserReviews} />}
        </section>
    )
}