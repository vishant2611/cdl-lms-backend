const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const files = {

'app/dashboard/admin/departments/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';

const CDL_DEPARTMENTS = [
  'Process Innovation',
  'Revenue Protection',
  'Procurement',
  'Logistics',
  'CSI',
  'Quality',
  'Packaging',
  'Revenue Generation',
  'Accounts',
  'Production',
  'Human Resources Management',
  'GCC',
];

const DEPT_ICONS: Record<string, string> = {
  'Process Innovation': '⚡',
  'Revenue Protection': '🛡️',
  'Procurement': '📦',
  'Logistics': '🚛',
  'CSI': '🔬',
  'Quality': '✅',
  'Packaging': '📫',
  'Revenue Generation': '📈',
  'Accounts': '💰',
  'Production': '🏭',
  'Human Resources Management': '👥',
  'GCC': '🌍',
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const fetchDepts = () => {
    api.get('/departments').then(r => setDepartments(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleCreate = async (name: string) => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/departments', { name: name.trim() });
      fetchDepts();
      setNewName('');
    } catch (e: any) {
      if (e.response?.status === 409 || e.response?.data?.message?.includes('Unique')) {
        alert(name + ' already exists!');
      }
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Delete department "' + name + '"? This cannot be undone.')) return;
    await api.delete('/departments/' + id);
    fetchDepts();
  };

  const seedAll = async () => {
    setSeeding(true);
    setSeedMsg('Creating departments...');
    let created = 0;
    let skipped = 0;
    for (const name of CDL_DEPARTMENTS) {
      try {
        await api.post('/departments', { name });
        created++;
        setSeedMsg('Created ' + created + ' departments...');
      } catch {
        skipped++;
      }
      await new Promise(r => setTimeout(r, 150));
    }
    setSeedMsg('Done! Created ' + created + ', skipped ' + skipped + ' (already existed)');
    fetchDepts();
    setSeeding(false);
    setTimeout(() => setSeedMsg(''), 4000);
  };

  const existingNames = departments.map(d => d.name);
  const missingDepts = CDL_DEPARTMENTS.filter(d => !existingNames.includes(d));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🏢 Departments</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>{departments.length} departments configured</p>
        </div>
        {missingDepts.length > 0 && (
          <button onClick={seedAll} disabled={seeding}
            style={{ padding: '11px 20px', borderRadius: '10px', background: seeding ? '#9CA3AF' : 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: seeding ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {seeding ? '⏳ Creating...' : '🚀 Create All CDL Departments (' + missingDepts.length + ' missing)'}
          </button>
        )}
      </div>

      {seedMsg && (
        <div style={{ background: '#F4F7E8', border: '1px solid #AEBF66', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#6C9604', fontWeight: '600', fontSize: '14px' }}>
          ✅ {seedMsg}
        </div>
      )}

      {/* Add Custom Department */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>➕ Add Custom Department</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Department name..."
            onKeyDown={e => e.key === 'Enter' && handleCreate(newName)}
            style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', fontFamily: 'Montserrat, sans-serif' }} />
          <button onClick={() => handleCreate(newName)} disabled={!newName.trim() || creating}
            style={{ padding: '10px 20px', borderRadius: '8px', background: !newName.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !newName.trim() ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !newName.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
            {creating ? 'Adding...' : 'Add Department'}
          </button>
        </div>
      </div>

      {/* CDL Standard Departments */}
      {missingDepts.length > 0 && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#B45309', marginBottom: '12px' }}>⚠️ Missing CDL Departments ({missingDepts.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missingDepts.map(name => (
              <button key={name} onClick={() => handleCreate(name)}
                style={{ padding: '7px 14px', borderRadius: '8px', background: 'white', border: '1px solid #FDE68A', color: '#B45309', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{DEPT_ICONS[name] || '🏢'}</span>
                <span>{name}</span>
                <span style={{ color: '#6C9604', fontWeight: '800' }}>+ Add</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {departments.map((d: any) => (
          <div key={d.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '18px 20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', display: 'flex', alignItems: 'center', gap: '14px', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(16,49,43,0.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              {DEPT_ICONS[d.name] || '🏢'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '3px' }}>{d.name}</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{d._count?.users || 0} employees</p>
            </div>
            <button onClick={() => handleDelete(d.id, d.name)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '16px', padding: '4px', opacity: 0.5, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'}>
              🗑
            </button>
          </div>
        ))}
        {departments.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#9CA3AF', background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '36px', marginBottom: '10px' }}>🏢</p>
            <p style={{ fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>No departments yet</p>
            <p style={{ fontSize: '13px' }}>Click "Create All CDL Departments" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
`,

};

let created = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(base, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
  console.log('Created: ' + filePath);
  created++;
}
console.log('Done! Created ' + created + ' files.');