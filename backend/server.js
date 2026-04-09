const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = "287283482328-8hqofa57gl2fl40sqd8dbpoeip9v1h3s.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const DATA_DIR = path.join(__dirname, 'data');
const INSTANCES_FILE = path.join(DATA_DIR, 'instances.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(INSTANCES_FILE)) fs.writeFileSync(INSTANCES_FILE, '[]');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');

const getDB = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const saveDB = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

app.use(cors());
app.use(express.json());

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload.email.endsWith('@smcindiaonline.com') && !payload.email.endsWith('@smcindiaonline.org')) return res.status(403).json({ error: 'Domain restricted' });

    let users = getDB(USERS_FILE);
    let userEntry = users.find(u => u.email === payload.email);
    if (!userEntry) {
      userEntry = { email: payload.email, name: payload.name, picture: payload.picture, role: users.length === 0 ? 'admin' : 'user', lastLogin: new Date().toISOString() };
      users.push(userEntry);
    } else {
      userEntry.lastLogin = new Date().toISOString();
    }
    saveDB(USERS_FILE, users);
    req.user = userEntry;
    next();
  } catch (error) { res.status(401).json({ error: 'Invalid token' }); }
}

const verifyAdmin = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
};

app.get('/api/profile', verifyToken, (req, res) => res.json(req.user));
app.get('/api/admin/instances', verifyToken, verifyAdmin, (req, res) => res.json(getDB(INSTANCES_FILE)));
app.post('/api/admin/instances', verifyToken, verifyAdmin, (req, res) => {
  const instances = getDB(INSTANCES_FILE);
  const data = { ...req.body, id: req.body.id || Date.now().toString() };
  const idx = instances.findIndex(i => i.id === data.id);
  if (idx > -1) instances[idx] = data; else instances.push(data);
  saveDB(INSTANCES_FILE, instances);
  res.json(data);
});
app.delete('/api/admin/instances/:id', verifyToken, verifyAdmin, (req, res) => {
  const instances = getDB(INSTANCES_FILE).filter(i => i.id !== req.params.id);
  saveDB(INSTANCES_FILE, instances);
  res.json({ success: true });
});
app.get('/api/admin/users', verifyToken, verifyAdmin, (req, res) => res.json(getDB(USERS_FILE)));
app.post('/api/admin/users/role', verifyToken, verifyAdmin, (req, res) => {
  const { email, role } = req.body;
  const users = getDB(USERS_FILE);
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx].role = role;
  saveDB(USERS_FILE, users);
  res.json(users[idx]);
});

app.get('/api/search', verifyToken, async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: 'Query is required' });

  const instances = getDB(INSTANCES_FILE);
  const results = [];
  const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?$/.test(ip);
  const searchIp = ip.split(':')[0];

  const DEFAULTS = {
    LINUX: "SMC-Linux-Server-Dashboard-IP-L",
    WINDOWS: "bfcx1crbomjgga",
    SQL: "bfcx1crbomjgga",
    SSL: "ssl-expiry-dashboard12",
    LOGS: "sadlil-loki-apps-dashboars",
    DS_ID: "aec838t10o16od"
  };

  const searchPromises = instances.map(async (inst) => {
    const instResults = [];
    try {
      const baseUrl = inst.browserUrl.replace(/\/+$/, '');
      const uids = { 
        linux: inst.linuxUid || DEFAULTS.LINUX, 
        windows: inst.windowsUid || DEFAULTS.WINDOWS, 
        sql: inst.sqlUid || DEFAULTS.SQL,
        ssl: inst.sslUid || DEFAULTS.SSL, 
        logs: inst.logsUid || DEFAULTS.LOGS 
      };
      const dsId = inst.prometheusDataId || DEFAULTS.DS_ID;

      if (isIp) {
        if (inst.prometheusUrl) {
          const promRes = await axios.get(`${inst.prometheusUrl}/api/v1/query?query=up{instance=~"${searchIp}(:.*)?"}`, { timeout: 3000 });
          
          const FORCE_WINDOWS_IPS = ['10.0.60.12', '10.0.60.179', '10.0.60.3', '10.0.60.4', '10.0.60.48', '10.0.60.5', '10.0.60.64', '10.0.60.65', '10.0.60.7', '10.0.60.8', '10.0.60.9', '10.0.66.140', '172.16.0.103', '172.16.0.104', '172.16.0.105', '172.16.0.106', '172.16.0.108', '172.16.0.109', '172.16.0.116', '172.16.0.118', '172.16.0.119', '172.16.0.122', '172.16.0.130', '172.16.0.139', '172.16.0.148', '172.16.0.160', '172.16.0.164', '172.16.0.165', '172.16.0.166', '172.16.0.168', '172.16.0.169', '172.16.0.170', '172.16.0.172', '172.16.0.177', '172.16.0.179', '172.16.0.180', '172.16.0.181', '172.16.0.182', '172.16.0.183', '172.16.0.185', '172.16.0.186', '172.16.0.187', '172.16.0.188', '172.16.0.189', '172.16.0.196', '172.16.0.204', '172.16.0.209', '172.16.0.210', '172.16.0.211', '172.16.0.215', '172.16.0.216', '172.16.0.217', '172.16.0.244', '172.16.0.245', '172.16.0.246', '172.16.0.247', '172.16.0.251', '172.16.0.42', '172.16.0.47', '172.16.0.48', '172.16.0.50', '172.16.0.52', '172.16.0.60', '172.16.0.64', '172.16.0.65', '172.16.0.70', '172.16.0.79', '172.16.0.87', '172.16.0.94', '172.16.0.95', '172.16.1.147', '172.16.1.161', '172.16.1.162', '172.16.1.174', '172.16.1.23', '172.16.1.237', '172.16.1.24', '172.16.1.31', '172.16.1.32', '172.16.1.6', '172.16.1.69', '172.16.1.98', '172.16.14.15', '172.16.14.150', '172.16.14.189', '172.16.14.231', '172.16.2.1', '172.16.2.170', '172.16.2.171', '172.16.2.191', '172.16.2.192', '172.16.2.98', '172.16.3.101', '172.16.3.102', '172.16.3.161', '172.16.3.170', '172.16.6.42', '172.16.8.147', '172.16.8.148', '192.168.1.100', '192.168.1.155', '192.168.1.158', '192.168.1.160', '192.168.1.161', '192.168.1.174', '192.168.1.181', '192.168.1.182', '192.168.1.183', '192.168.1.190', '192.168.1.200', '192.168.1.202', '192.168.1.204', '192.168.1.21', '192.168.1.225', '192.168.1.24', '192.168.1.30', '192.168.1.31', '192.168.1.35', '192.168.1.36', '192.168.1.37', '192.168.1.40', '192.168.1.42', '192.168.1.52', '192.168.1.54', '192.168.1.59', '192.168.1.67', '192.168.1.69', '192.168.1.74', '192.168.1.85', '192.168.1.96', '192.168.15.128', '192.168.15.51', '192.168.176.103', '192.168.176.104', '192.168.176.105', '192.168.176.106', '192.168.176.107', '192.168.176.108', '192.168.176.109', '192.168.176.110', '192.168.176.111', '192.168.176.113', '192.168.176.117', '192.168.176.118', '192.168.176.119', '192.168.176.126', '192.168.176.127', '192.168.176.128', '192.168.176.137', '192.168.176.140', '192.168.176.145', '192.168.176.149', '192.168.176.152', '192.168.176.222', '192.168.176.223', '192.168.176.224', '192.168.176.225', '192.168.176.226', '192.168.176.227', '192.168.176.228', '192.168.176.229', '192.168.176.230', '192.168.176.231', '192.168.176.232', '192.168.176.233', '192.168.176.234', '192.168.176.235', '192.168.176.236', '192.168.176.237', '192.168.176.238', '192.168.176.239', '192.168.176.240', '192.168.176.241', '192.168.176.242', '192.168.176.243', '192.168.176.244', '192.168.176.245', '192.168.176.73', '192.168.20.96', '192.168.22.113'];
          const FORCE_LINUX_IPS = ['10.215.33.196', '172.16.0.120', '172.16.0.121', '172.16.0.200', '172.16.0.213', '172.16.0.232', '172.16.0.233', '172.16.0.234', '172.16.0.235', '172.16.0.236', '172.16.0.38', '172.16.0.40', '172.16.1.104', '172.16.1.105', '172.16.1.115', '172.16.1.122', '172.16.1.133', '172.16.1.134', '172.16.1.135', '172.16.1.136', '172.16.1.137', '172.16.1.138', '172.16.1.139', '172.16.1.140', '172.16.1.141', '172.16.1.144', '172.16.1.148', '172.16.1.204', '172.16.1.205', '172.16.1.206', '172.16.1.207', '172.16.1.247', '172.16.1.60', '172.16.1.61', '172.16.1.62', '172.16.1.63', '172.16.1.66', '172.16.1.67', '172.16.1.68', '172.16.1.72', '172.16.10.11', '172.16.13.14', '172.16.2.10', '172.16.2.11', '172.16.2.12', '172.16.2.13', '172.16.2.201', '172.16.2.211', '172.16.2.212', '172.16.2.25', '172.16.2.3', '172.16.2.4', '172.16.2.61', '172.16.2.7', '172.16.2.8', '172.16.2.9', '172.16.6.41', '192.168.1.111', '192.168.1.112', '192.168.1.117', '192.168.1.118', '192.168.1.125', '192.168.1.141', '192.168.1.171', '192.168.1.22', '192.168.1.23', '192.168.1.41', '192.168.1.53', '192.168.1.68', '192.168.15.112', '192.168.15.123', '192.168.15.124', '192.168.15.125', '192.168.15.126', '192.168.15.127', '192.168.15.41', '192.168.15.42', '192.168.15.43', '192.168.15.50', '192.168.15.52', '192.168.15.53', '192.168.15.54', '192.168.176.114', '192.168.176.139', '192.168.176.71', '192.168.176.72'];

          if (promRes.data.data.result.length > 0) {
            // Found in this instance's Prometheus, add logs for THIS instance
            instResults.push({ id: `logs-${inst.id}`, title: `Logs (${searchIp}) - ${inst.name}`, url: `${baseUrl}/d/${uids.logs}/logs-app-2?var-instance=${searchIp}&var-ip=${searchIp}`, type: "Logs", tags: ["logs", inst.name] });

            let winDetected = false;
            for (const m of promRes.data.data.result) {
              const { job, instance } = m.metric;
              const lowerJob = job.toLowerCase();
              if (lowerJob === 'service') continue;

              const cIp = instance.split(':')[0];
              const isWin = (FORCE_WINDOWS_IPS.includes(cIp) || instance.endsWith(':9182') || lowerJob.includes('win') || lowerJob.includes('system') || lowerJob.includes('domain') || lowerJob.includes('controler') || lowerJob.includes('controller') || lowerJob.includes('server') || lowerJob.includes('database') || lowerJob.includes('db') || lowerJob.includes('mail') || lowerJob.includes('talisma') || lowerJob.includes('ventura') || lowerJob.includes('sql') || lowerJob.includes('exchange') || lowerJob.includes('ad-') || lowerJob.includes('backup') || lowerJob.includes('bkp')) && !FORCE_LINUX_IPS.includes(cIp);
              if (isWin) winDetected = true;

              const uid = isWin ? uids.windows : uids.linux;
              let dUrl = `${baseUrl}/d/${uid}?var-instance=${instance}&var-ip=${cIp}&var-node=${instance}&var-host=${cIp}&var-hostname=${isWin ? '$__all' : cIp}&var-job=${encodeURIComponent(job)}&var-DS_PROMETHEUS=${dsId}`;
              if (!isWin) dUrl += `&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B`;
              instResults.push({ id: `${inst.id}-${instance}`, title: `${job} (${instance}) - ${inst.name}`, url: dUrl, type: isWin ? "Windows" : "Linux", tags: [job, inst.name], foundInProm: true });
            }

            if (winDetected && uids.sql) {
              try {
                const dbRes = await axios.get(`${inst.prometheusUrl}/api/v1/query?query=windows_exporter_build_info{instance=~"${searchIp}(:.*)?"}`, { timeout: 2000 });
                if (dbRes.data.data.result.length > 0) {
                  const metric = dbRes.data.data.result[0].metric;
                  const dbName = metric.database;
                  const fullInstance = metric.instance || searchIp;
                  
                  if (dbName) {
                    instResults.push({ 
                      id: `sql-${inst.id}`, 
                      title: `SQL Monitoring (${searchIp}) - ${inst.name}`, 
                      url: `${baseUrl}/d/${uids.sql}/sql-server-monitoring?var-instance=${fullInstance}&var-ip=${searchIp}&var-DS_PROMETHEUS=${dsId}&var-database=${dbName}`, 
                      type: "SQL", 
                      tags: ["sql", inst.name] 
                    });
                  }
                }
              } catch (e) {
                console.error(`SQL Check Error for ${searchIp}:`, e.message);
              }
            }
          }
        }
      } else if (ip.includes('.') && inst.prometheusUrl) {
        const sslRes = await axios.get(`${inst.prometheusUrl}/api/v1/query?query={__name__=~"probe_ssl_earliest_cert_expiry|ssl_cert_expiry_days",instance=~".*${ip}.*"} or {__name__=~"probe_ssl_earliest_cert_expiry|ssl_cert_expiry_days",domain=~".*${ip}.*"} or {__name__=~"probe_ssl_earliest_cert_expiry|ssl_cert_expiry_days",exported_instance=~".*${ip}.*"}`, { timeout: 3000 });
        for (const m of sslRes.data.data.result) {
          const h = (m.metric.domain || m.metric.exported_instance || m.metric.instance).replace(/^https?:\/\//, '').split(/[:\/]/)[0];
          if (h === 'localhost') continue;
          instResults.push({ id: `ssl-${inst.id}-${h}`, title: `SSL: ${h} - ${inst.name}`, url: `${baseUrl}/d/${uids.ssl}/?var-domain=${h}&var-DS_PROMETHEUS=${dsId}`, type: "SSL", tags: ["ssl", inst.name] });
        }
      }

      if (instResults.length === 0) {
        const gSearch = await axios.get(`${inst.url}/api/search?query=${ip}&type=dash-db`, { headers: { Authorization: `Bearer ${inst.apiKey}` }, timeout: 3000 });
        gSearch.data.forEach(r => {
          let fUrl = `${baseUrl}${r.url.startsWith('/') ? '' : '/'}${r.url}`;
          if (isIp) fUrl += `${fUrl.includes('?') ? '&' : '?'}var-instance=${ip}&var-ip=${searchIp}&var-node=${ip}&var-host=${searchIp}&var-hostname=${ip}&var-DS_PROMETHEUS=${dsId}`;
          instResults.push({ ...r, id: `g-${inst.id}-${r.id}`, title: `${r.title} - ${inst.name}`, url: fUrl, tags: [...(r.tags || []), inst.name] });
        });
      }
    } catch (e) { console.error(`Error ${inst.name}:`, e.message); }
    return instResults;
  });

  const all = await Promise.all(searchPromises);
  const unique = Array.from(new Map(all.flat().map(item => [item.url, item])).values());
  res.json(unique);
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));