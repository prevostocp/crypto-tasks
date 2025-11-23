import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import type { Task, User } from '../types/index';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import { Circle, TrendingUp, Zap } from 'lucide-react';

interface LayoutProps {
  user: User;
  onlogout: () => void;
  children?: React.ReactNode;
}

interface CardStaticsProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const Layout = ({ user, onlogout, children }:LayoutProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async ():Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if(!token) throw Error("No auth token found");

            const {data} = await axios.get("http://localhost:4000/api/tasks/gp", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const arr = Array.isArray(data) ? data :
                        Array.isArray(data?.tasks) ? data.tasks :
                        Array.isArray(data?.data) ? data.data : [];

            setTasks(arr);
        } catch (err: any) {
            console.log(err);            
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Could not load tasks.");
            }
            if (err.response?.status === 401) {
                onlogout();
            }
        } finally {
            setLoading(false);
        }
        
    }, [onlogout]);

    useEffect(() => {fetchTasks()}, [fetchTasks]);

    const stats = useMemo(() => {
        const completedTasks = tasks.filter((t:Task) => 
            t.completed === true ||
            t.completed === 1 ||
            (typeof t.completed === 'string' && t.completed.toLowerCase() === "yes")
        ).length;

        const totalCount = tasks.length;
        const pendingCount = totalCount - completedTasks;
        const completionPercentage = totalCount ? Math.round((completedTasks / totalCount) * 100) : 0;

        return {
            totalCount,
            completedTasks,
            pendingCount,
            completionPercentage
        }

    }, [tasks]);

    // STATISTIC CARDS
    const StatsCard = ({title, value, icon}:CardStaticsProps) => (
        <div className=' p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all
                         duration-300 hover:border-purple-100 group '>
            <div className=' flex items-center gap-2' >
                <div className=' p-1.5 rounded-lg bg-linear-to-br from-fuchsia-500/10 to-purple-500/10 group-hover:from- 
                 group-hover:to-purple-500/20 '>
                    {icon}|
                </div>
                <div className=' min-w-0'>
                    <p className=' text-lg sm:text-xl font-bold bg-linear-to-r from-fuchsia-500 to-purple-600 bg-clip-text 
                                   text-transparent' >
                        {value}
                    </p>
                    <p className=' text-xs text-gray-500 font-medium '>
                        {title}
                    </p>
                </div>
            </div>
        </div>
    )

    // LOADING
    if(loading) return (
        <div className=' min-h-screen bg-gray-50 flex items-center justify-center'>
            <div className= ' animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 ' />
        </div>
    )

    // ERROR
    if(error) return (
        <div className=' min-h-screen bg-gray-50 p-6 flex items-center justify-center '>
            <div className=' bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md '>
                <p className=' font-medium mb-2'>Error Loading Tasks</p>
                <p className=' text-sm'>{error}</p>
                <button onClick={fetchTasks} className=' mt-4 py-2 px-4 bg-red-100 text-red-700 rounded-lg 
                                                        text-sm font-medium hover:bg-red-200 transition-colors' >
                    Try Again
                </button>
            </div>
        </div>
    )

    return (
        <div className=' min-h-screen bg-gray-50'>
            <Navbar user={user} onLogout={onlogout} />
            <Sidebar user={user} tasks={tasks} />

            <div className=' ml-0 xl:ml-64 lg:ml-64 md:ml-16 pt-16 p-3 sm:p-4 md:p-4 transition-all duration-300 '>
                <div className=' grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
                    <div className=' xl:col-span-2 space-y-3 sm:space-y-4'>
                        <Outlet context={{tasks, refreshTasks: fetchTasks}} />
                    </div>

                    <div className=' xl:col-span-1 space-y-4 sm:space-y-6' >
                        <div className=' bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100' >
                            <h3 className=' text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2 '>
                                <TrendingUp className=' w-4 h-4 sm:w-5 sm:h-5 text-purple-500 '  />
                                Tasks Statictis
                            </h3>

                            <div className=' grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 '>
                                <StatsCard title='Total Tasks' value={stats.totalCount.toString()} icon={<Circle className=' w-3.5 
                                    h-3.5 sm:w-4 sm:h-4 text-purple-500' />} />

                                <StatsCard title='Completed' value={stats.completedTasks.toString()} icon={<Circle className=' w-3.5 
                                    h-3.5 sm:w-4 sm:h-4 text-green-500' />} />

                                <StatsCard title='Pending' value={stats.pendingCount.toString()} icon={<Circle className=' w-3.5 
                                    h-3.5 sm:w-4 sm:h-4 text-fuchsia-500' />} />

                                <StatsCard title='Completion Rate' value={`${stats.completionPercentage} %`} icon={<Zap className=' w-3.5 
                                    h-3.5 sm:w-4 sm:h-4 text-purple-500' />} />                                
                            </div>

                            <hr className=' my-3 sm:my-4 border-purple-100 ' />

                            <div className=' space-y-2 sm:space-y-3'>
                                <div className=' flex items-center justify-between text-gray-700'>
                                    <span>
                                        
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>


            {children}
        </div>
    )
}

export default Layout