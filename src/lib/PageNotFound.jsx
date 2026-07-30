import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#050811] text-white">
            <div className="max-w-md w-full p-8 bg-[#0B1C30] border border-slate-800 rounded-2xl shadow-2xl">
                <div className="text-center space-y-6">
                    {/* 404 Error Code */}
                    <div className="space-y-2">
                        <h1 className="text-7xl font-mono font-bold text-slate-300 tracking-wider">404</h1>
                        <div className="h-0.5 w-16 bg-cyan-500/50 mx-auto"></div>
                    </div>
                    
                    {/* Main Message */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">
                            Page Not Found
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            The page <span className="font-mono text-cyan-400 font-bold">"{pageName}"</span> could not be found in this application.
                        </p>
                    </div>
                    
                    {/* Admin Note */}
                    {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-[#071322] rounded-xl border border-slate-700">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-950/80 border border-orange-700/50 flex items-center justify-center mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-semibold text-slate-200">Admin Note</p>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        This could mean that the page has not been routed yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="pt-4">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-white bg-[#071322] border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 shadow-md"
                        >
                            <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}