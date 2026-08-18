'use client';

import React from 'react';
import { History, Shield, Clock } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatDate } from '@/lib/utils';

export default function AdminActivityPage() {
  const { activityLogs } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Admin Audit Activity Logs</h1>
        <p className="text-xs text-slate-500">Traceable audit record of store administration actions for accountability.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-gold-400 font-bold flex items-center justify-center shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{log.description}</span>
                  <span className="text-[10px] text-slate-400">By {log.admin_name || 'Admin'} • Entity: {log.entity_type}</span>
                </div>
              </div>
              <span className="text-slate-400 text-[10px] font-mono shrink-0">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
