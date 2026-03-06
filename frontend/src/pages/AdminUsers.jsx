import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { SkeletonTable } from '../components/Skeleton';
import * as adminApi from '../api/admin';

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id of user being edited
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (e) { setMsg('Failed to load users'); }
    setLoading(false);
  };

  const startEdit = (u) => {
    setEditing(u.id);
    setForm({ fullName: u.fullName, email: u.email, role: u.role, password: '' });
    setShowPassword(false);
  };

  const saveEdit = async (id) => {
    try {
      const dto = { ...form };
      if (!dto.password) delete dto.password;
      await adminApi.updateUser(id, dto);
      setMsg('User updated');
      setEditing(null);
      loadUsers();
    } catch (e) { setMsg(e.response?.data?.message || 'Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminApi.deleteUser(id);
      setMsg('User deleted');
      loadUsers();
    } catch (e) { setMsg('Delete failed'); }
  };

  return (
    <AppLayout activePage="admin">
      <div style={s.topRow}>
        <div>
          <h1 style={s.title}>User Management</h1>
          <p style={s.sub}>{users.length} registered users</p>
        </div>
        <button style={s.backBtn} onClick={() => navigate('/admin')}>← Back</button>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : (
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>ID</th>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Active</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={s.row}>
                {editing === u.id ? (
                  <>
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}>
                      <input style={s.input} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    </td>
                    <td style={s.td}>
                      <input style={s.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </td>
                    <td style={s.td}>
                      <select style={s.select} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={s.td}>{u.isActive ? '✅' : '❌'}</td>
                    <td style={s.td}>
                      <div style={{ ...s.editPwRow, position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        <input style={{ ...s.input, width: 120, paddingRight: 32 }} placeholder="New password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>{showPassword ? '🙈' : '👁️'}</button>
                      </div>
                      <div style={s.actionRow}>
                        <button style={s.saveBtn} onClick={() => saveEdit(u.id)}>Save</button>
                        <button style={s.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}>{u.fullName}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}><span style={u.role === 'admin' ? s.adminBadge : s.userBadge}>{u.role}</span></td>
                    <td style={s.td}>{u.isActive ? '✅' : '❌'}</td>
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        <button style={s.editBtn} onClick={() => startEdit(u)}>Edit</button>
                        <button style={s.delBtn} onClick={() => handleDelete(u.id)}>Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </AppLayout>
  );
}

const s = {
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  title: { fontSize: '1.6rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  sub: { color: '#6b6b70', fontSize: 13, marginTop: 4 },
  backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  msg: { background: '#1e1e20', border: '1px solid #c4a052', color: '#c4a052', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', color: '#6b6b70', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  td: { padding: '12px 14px', fontSize: 13, color: '#c8c8cc', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
  row: { transition: 'background 0.15s' },
  input: { background: '#0e0e10', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8eb', padding: '6px 10px', borderRadius: 6, fontSize: 13, width: '100%' },
  select: { background: '#0e0e10', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8eb', padding: '6px 10px', borderRadius: 6, fontSize: 13 },
  actionRow: { display: 'flex', gap: 6, marginTop: 4 },
  editPwRow: { marginBottom: 6 },
  editBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  delBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  saveBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  adminBadge: { background: '#c4a052', color: '#0a0a0b', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 },
  userBadge: { background: '#23232a', color: '#6b6b70', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
};
