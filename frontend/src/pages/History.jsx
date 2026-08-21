import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getHistory } from '../api';
import { Upload, Search } from 'lucide-react';

export default function History() {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    getHistory().then((res) => setActivity(res.data.recent_activity));
  }, []);

  return (
    <Layout title="History">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {activity.map((a, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.type === 'upload' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/20 text-green-400'}`}>
                {a.type === 'upload' ? <Upload size={16} /> : <Search size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-white/40">{a.subtitle}</p>
              </div>
            </div>
            <p className="text-xs text-white/30">{new Date(a.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}