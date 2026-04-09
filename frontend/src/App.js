import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin, googleLogout } from '@react-oauth/google';

function App() {
  const [ip, setIp] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('sources'); // 'sources' or 'users'
  
  // Settings Data
  const [instances, setInstances] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [editingInstance, setEditingInstance] = useState(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.error);
        handleLogout();
      } else {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (showSettings && user?.role === 'admin') {
      if (activeTab === 'sources') fetchInstances();
      if (activeTab === 'users') fetchAllUsers();
    }
  }, [showSettings, activeTab, user]);

  const fetchInstances = async () => {
    try {
      const response = await axios.get('/api/admin/instances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstances(response.data);
    } catch (err) { setError('Failed to fetch instances'); }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data);
    } catch (err) { setError('Failed to fetch users'); }
  };

  const handleSaveInstance = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (editingInstance) data.id = editingInstance.id;
    try {
      await axios.post('/api/admin/instances', data, { headers: { Authorization: `Bearer ${token}` } });
      setEditingInstance(null);
      e.target.reset();
      fetchInstances();
    } catch (err) { alert('Save failed'); }
  };

  const handleUpdateRole = async (email, role) => {
    try {
      await axios.post('/api/admin/users/role', { email, role }, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllUsers();
    } catch (err) { alert('Role update failed'); }
  };

  const handleLoginSuccess = (res) => {
    localStorage.setItem('token', res.credential);
    setToken(res.credential);
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setResults([]);
    setShowSettings(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ip) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await axios.get(`/api/search?ip=${ip}`, { headers: { Authorization: `Bearer ${token}` } });
      setResults(res.data);
      if (res.data.length === 0) setError('No dashboards found.');
    } catch (err) { setError('Search failed.'); }
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column bg-light">
        <style>{` .card { border-top: 4px solid #ee3124; } .text-primary { color: #004a99 !important; } `}</style>
        <div className="container mt-5">
          <div className="text-center mb-5"><img src="/smc-new-logo.png" alt="Logo" style={{ height: '80px' }} /></div>
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card shadow-lg border-0 p-5">
                <h2 className="text-center mb-4 fw-bold text-primary">Global Dashboard Explorer</h2>
                <p className="text-center text-muted mb-4">Access restricted to @smcindiaonline.com. Sign in with Google to continue.</p>
                <div className="d-flex justify-content-center"><GoogleLogin onSuccess={handleLoginSuccess} onError={() => setError('Login Failed')} /></div>
                {error && <div className="alert alert-danger mt-4 text-center">{error}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 pb-5 bg-light">
      <style>{` .card-header-accent { border-top: 4px solid #ee3124; } .text-primary { color: #004a99 !important; } .nav-pills .nav-link.active { background-color: #004a99; } .badge-smc { background-color: #ee3124; } .btn-primary { background-color: #004a99; border-color: #004a99; } `}</style>
      <div className="container pt-4">
        <div className="d-flex justify-content-between align-items-center mb-5 bg-white p-3 rounded shadow-sm">
          <img src="/smc-new-logo.png" alt="Logo" onClick={() => setShowSettings(false)} style={{cursor: 'pointer', height: '45px'}} />
          <div className="d-flex align-items-center">
            {user.role === 'admin' && (
              <button className={`btn ${showSettings ? 'btn-primary' : 'btn-outline-primary'} me-3 btn-sm`} onClick={() => setShowSettings(!showSettings)}>
                {showSettings ? 'Back to Search' : 'Infrastructure Settings'}
              </button>
            )}
            <div className="d-flex align-items-center me-3 text-end d-none d-sm-flex">
               <div className="me-2"><div className="fw-bold">{user.name}</div><small className="text-muted">{user.role.toUpperCase()}</small></div>
               <img src={user.picture} alt="User" className="rounded-circle border" style={{width: '40px'}} />
            </div>
            <button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {showSettings ? (
          <div className="row justify-content-center">
            <div className="col-md-11">
              <div className="card shadow border-0 card-header-accent">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-primary m-0">Infrastructure Settings</h4>
                    <ul className="nav nav-pills nav-sm">
                      <li className="nav-item"><button className={`nav-link ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>Sources</button></li>
                      <li className="nav-item"><button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button></li>
                    </ul>
                  </div>

                  {activeTab === 'sources' ? (
                    <>
                      <form onSubmit={handleSaveInstance} className="row g-3 mb-4 bg-light p-3 rounded border">
                        <div className="col-md-2">
                          <label className="form-label small fw-bold">Name</label>
                          <input name="name" className="form-control form-control-sm" placeholder="SMC Primary" defaultValue={editingInstance?.name} required />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Internal URL</label>
                          <input name="url" className="form-control form-control-sm" placeholder="http://grafana:3000" defaultValue={editingInstance?.url} required />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-bold">API Key</label>
                          <input name="apiKey" className="form-control form-control-sm" type="password" placeholder="Token" defaultValue={editingInstance?.apiKey} required />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Public URL</label>
                          <input name="browserUrl" className="form-control form-control-sm" placeholder="https://grafana.com" defaultValue={editingInstance?.browserUrl} required />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-bold">Prometheus</label>
                          <input name="prometheusUrl" className="form-control form-control-sm" placeholder="http://10.x.x.x:9090" defaultValue={editingInstance?.prometheusUrl} />
                        </div>
                        
                        <div className="col-12 mt-3 fw-bold small text-muted">Dashboard UIDs (Leave blank to use SMC defaults)</div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Linux Dashboard UID</label>
                          <input name="linuxUid" className="form-control form-control-sm" placeholder="Linux Dashboard UID" defaultValue={editingInstance?.linuxUid} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Windows Dashboard UID</label>
                          <input name="windowsUid" className="form-control form-control-sm" placeholder="Windows Dashboard UID" defaultValue={editingInstance?.windowsUid} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">MSSQL Dashboard UID</label>
                          <input name="sqlUid" className="form-control form-control-sm" placeholder="MSSQL Dashboard UID" defaultValue={editingInstance?.sqlUid} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">SSL Dashboard UID</label>
                          <input name="sslUid" className="form-control form-control-sm" placeholder="SSL Dashboard UID" defaultValue={editingInstance?.sslUid} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Logs Dashboard UID</label>
                          <input name="logsUid" className="form-control form-control-sm" placeholder="Logs Dashboard UID" defaultValue={editingInstance?.logsUid} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Prometheus Data Source ID</label>
                          <input name="prometheusDataId" className="form-control form-control-sm" placeholder="e.g. aec838t10o16od" defaultValue={editingInstance?.prometheusDataId} />
                        </div>
                        
                        <div className="col-12 mt-3"><button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">{editingInstance ? 'Update Source' : 'Add Source'}</button></div>
                      </form>
                      <table className="table table-hover table-sm">
                        <thead className="table-light"><tr><th>Name</th><th>Internal URL</th><th>Prometheus</th><th>Actions</th></tr></thead>
                        <tbody>{instances.map(i => (
                          <tr key={i.id}><td>{i.name}</td><td><small>{i.url}</small></td><td>{i.prometheusUrl ? 'Active' : '-'}</td>
                          <td><button className="btn btn-link btn-sm" onClick={() => setEditingInstance(i)}>Edit</button></td></tr>
                        ))}</tbody>
                      </table>
                    </>
                  ) : (
                    <table className="table table-hover table-sm">
                      <thead className="table-light"><tr><th>User</th><th>Email</th><th>Role</th><th>Last Login</th></tr></thead>
                      <tbody>{allUsers.map(u => (
                        <tr key={u.email}>
                          <td><img src={u.picture} className="rounded-circle me-2" style={{width: '24px'}} /> {u.name}</td>
                          <td><small>{u.email}</small></td>
                          <td>
                            <select className="form-select form-select-sm d-inline-block w-auto" value={u.role} onChange={(e) => handleUpdateRole(u.email, e.target.value)}>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td><small className="text-muted">{new Date(u.lastLogin).toLocaleString()}</small></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow border-0 card-header-accent">
                <div className="card-body p-5 text-center">
                  <h3 className="fw-bold text-primary mb-4">Global Dashboard Explorer</h3>
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="input-group input-group-lg shadow-sm">
                      <input type="text" className="form-control border-end-0" placeholder="Enter IP Address (e.g., 10.x.x.x)" value={ip} onChange={(e) => setIp(e.target.value)} />
                      <button className="btn btn-primary px-5 fw-bold" type="submit" disabled={loading}>{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Search'}</button>
                    </div>
                  </form>
                  {error && <div className="alert alert-warning border-0 shadow-sm">{error}</div>}
                  <div className="list-group mt-4 text-start">
                    {results.map((dash) => (
                      <a key={dash.id} href={dash.url} target="_blank" rel="noopener noreferrer" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 mb-3 rounded border-0 shadow-sm">
                        <div><h6 className="mb-1 fw-bold">{dash.title}</h6><small className="text-muted">{dash.type} | {dash.tags.join(', ')}</small></div>
                        <span className="badge badge-smc rounded-pill px-3 py-2">View</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;