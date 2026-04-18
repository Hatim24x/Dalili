import React, { useState, useEffect } from 'react';
import { shopService } from '@/src/services/shopService';
import { Shop } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { Trash2, Store, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'hatim14995@gmail.com';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      if (currentUser) navigate('/');
      return;
    }

    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const data = await shopService.getShops();
        setShops(data);
      } catch (error) {
        toast.error('Failed to fetch shops');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [isAdmin, currentUser, navigate]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      await shopService.deleteShop(id);
      setShops(prev => prev.filter(s => s.id !== id));
      setConfirmId(null);
      toast.success('Shop deleted successfully');
    } catch (e) {
      toast.error('Could not delete shop');
    }
  };

  if (!isAdmin) return <div className="p-10 text-center">Access Denied</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 md:p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Admin Panel</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage platform content and shops</p>
        </div>
        <div className="text-xs font-medium bg-neutral-100 self-start md:self-center px-3 py-1.5 rounded-full text-neutral-600">
          {currentUser?.email}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border border-neutral-50">
          <div className="p-2 bg-primary-50 rounded-xl">
            <Store className="text-primary-600 h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Shops</div>
            <div className="text-lg font-bold">{shops.length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border border-neutral-50">
          <div className="p-2 bg-green-50 rounded-xl">
            <Users className="text-green-600 h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Users</div>
            <div className="text-lg font-bold">--</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-50">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <h2 className="font-bold text-sm md:text-base">Manage Shops</h2>
          <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-neutral-100 font-bold text-neutral-400">
            {shops.length} TOTAL
          </span>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50/50 text-[10px] font-bold uppercase text-neutral-400">
              <tr>
                <th className="px-6 py-3">Shop</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {shops.map(shop => (
                <tr key={shop.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={shop.images[0]} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt="" />
                      <div className="font-bold text-sm text-neutral-800">{shop.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500 font-medium">{shop.category}</td>
                  <td className="px-6 py-4 text-right">
                    {confirmId === shop.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(shop.id)}
                          className="bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-red-700 active:scale-95 transition-all"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setConfirmId(null)}
                          className="bg-neutral-100 text-neutral-600 text-[10px] px-3 py-1.5 rounded-lg font-bold hover:bg-neutral-200 active:scale-95 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmId(shop.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-neutral-100">
          {shops.map(shop => (
            <div key={shop.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={shop.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                  <div>
                    <div className="font-bold text-neutral-800">{shop.name}</div>
                    <div className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md inline-block mt-1">
                      {shop.category}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {confirmId === shop.id ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleDelete(shop.id)}
                        className="bg-red-600 text-white text-[10px] px-4 py-2 rounded-xl font-bold shadow-sm"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setConfirmId(null)}
                        className="bg-neutral-100 text-neutral-600 text-[10px] px-4 py-2 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmId(shop.id)}
                      className="p-3 text-red-500 bg-red-50 rounded-2xl active:scale-90 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {shops.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-neutral-50 rounded-full mb-3">
              <Store className="h-8 w-8 text-neutral-300" />
            </div>
            <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No shops found</div>
          </div>
        )}
      </div>
    </div>
  );
}
