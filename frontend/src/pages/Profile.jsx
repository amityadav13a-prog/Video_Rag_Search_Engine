import React from 'react';
import Layout from '../components/Layout';

export default function Profile() {
  return (
    <Layout title="Profile">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md">
        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold mb-4">U</div>
        <p className="font-semibold text-lg">User</p>
        <p className="text-white/40 text-sm">user@example.com</p>
      </div>
    </Layout>
  );
}