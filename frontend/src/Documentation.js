import React from 'react';

const ArchitectureDiagram = () => (
  <div className="text-center my-4 p-3 bg-white rounded shadow-sm border">
    <h6 className="text-muted mb-3">System Architecture Overview</h6>
    <svg viewBox="0 0 800 300" className="img-fluid" style={{ maxHeight: '300px' }}>
      {/* Definitions for gradients/arrows */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
        </marker>
        <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f8f9fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e9ecef', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* User */}
      <circle cx="50" cy="150" r="30" fill="#004a99" />
      <text x="50" y="200" textAnchor="middle" fontSize="12" fontWeight="bold">User</text>
      
      {/* Frontend */}
      <rect x="150" y="100" width="120" height="100" rx="10" fill="url(#boxGrad)" stroke="#004a99" strokeWidth="2" />
      <text x="210" y="145" textAnchor="middle" fontSize="14" fontWeight="bold">Frontend</text>
      <text x="210" y="165" textAnchor="middle" fontSize="10" fill="#666">React / Nginx</text>

      {/* Backend */}
      <rect x="350" y="100" width="120" height="100" rx="10" fill="url(#boxGrad)" stroke="#ee3124" strokeWidth="2" />
      <text x="410" y="145" textAnchor="middle" fontSize="14" fontWeight="bold">Backend</text>
      <text x="410" y="165" textAnchor="middle" fontSize="10" fill="#666">Node.js / Express</text>

      {/* Grafana Instances */}
      <rect x="580" y="50" width="150" height="80" rx="8" fill="#f8f9fa" stroke="#888" strokeDasharray="5,5" />
      <text x="655" y="85" textAnchor="middle" fontSize="12" fontWeight="bold">Grafana Instances</text>
      <text x="655" y="105" textAnchor="middle" fontSize="10" fill="#666">SMC, Stoxkart, etc.</text>

      {/* Prometheus */}
      <rect x="580" y="170" width="150" height="80" rx="8" fill="#f8f9fa" stroke="#888" strokeDasharray="5,5" />
      <text x="655" y="205" textAnchor="middle" fontSize="12" fontWeight="bold">Prometheus Servers</text>
      <text x="655" y="225" textAnchor="middle" fontSize="10" fill="#666">Metric Sources</text>

      {/* Connections */}
      <line x1="80" y1="150" x2="140" y2="150" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <line x1="270" y1="150" x2="340" y2="150" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M 470 140 L 530 140 L 530 90 L 570 90" fill="none" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M 470 160 L 530 160 L 530 210 L 570 210" fill="none" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)" />
    </svg>
  </div>
);

const FlowDiagram = () => (
  <div className="text-center my-4 p-3 bg-white rounded shadow-sm border">
    <h6 className="text-muted mb-3">Search Logic Flow</h6>
    <svg viewBox="0 0 800 200" className="img-fluid" style={{ maxHeight: '200px' }}>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#004a99" />
        </marker>
      </defs>

      {/* Steps */}
      <rect x="20" y="60" width="130" height="60" rx="30" fill="#004a99" />
      <text x="85" y="95" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">Input IP</text>

      <rect x="200" y="60" width="130" height="60" rx="5" fill="#f8f9fa" stroke="#004a99" />
      <text x="265" y="95" textAnchor="middle" fontSize="11" fontWeight="bold">Check Prometheus</text>

      <rect x="380" y="60" width="130" height="60" rx="5" fill="#f8f9fa" stroke="#004a99" />
      <text x="445" y="90" textAnchor="middle" fontSize="11" fontWeight="bold">Classify OS</text>
      <text x="445" y="105" textAnchor="middle" fontSize="9" fill="#666">Win vs Linux</text>

      <rect x="560" y="60" width="130" height="60" rx="5" fill="#f8f9fa" stroke="#004a99" />
      <text x="625" y="95" textAnchor="middle" fontSize="11" fontWeight="bold">Build Deep Links</text>

      <rect x="730" y="60" width="50" height="60" rx="5" fill="#ee3124" />
      <text x="755" y="95" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">View</text>

      {/* Arrows */}
      <line x1="150" y1="90" x2="190" y2="90" stroke="#004a99" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="330" y1="90" x2="370" y2="90" stroke="#004a99" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="510" y1="90" x2="550" y2="90" stroke="#004a99" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="690" y1="90" x2="720" y2="90" stroke="#004a99" strokeWidth="2" markerEnd="url(#arrow)" />
    </svg>
  </div>
);

const Documentation = () => {
  return (
    <div className="row justify-content-center">
      <div className="col-md-11">
        <div className="card shadow border-0 card-header-accent">
          <div className="card-body p-5">
            <h2 className="fw-bold text-primary mb-4 border-bottom pb-2">High Level Design (HLD) - Global Dashboard Explorer</h2>
            
            <section className="mb-5">
              <h4 className="text-secondary fw-bold mb-3">1. System Overview</h4>
              <p>
                The <strong>Global Dashboard Explorer</strong> is a unified monitoring gateway designed to bridge multiple independent Grafana instances. 
                It allows users to quickly locate the correct monitoring dashboard for any server using its IP address as the primary search key.
              </p>
            </section>

            <section className="mb-5">
              <h4 className="text-secondary fw-bold mb-3">2. Architecture</h4>
              <p>The application follows a standard client-server model, optimized for low-latency search across distributed monitoring environments.</p>
              
              <ArchitectureDiagram />

              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="card bg-light border-0 h-100 p-3 shadow-sm">
                    <h5 className="fw-bold text-primary">Frontend (React)</h5>
                    <ul className="small mb-0">
                      <li><strong>SPA:</strong> Built with React 18 and Bootstrap 5.</li>
                      <li><strong>Sidebar Layout:</strong> Optimized for easy navigation between search and settings.</li>
                      <li><strong>Auth:</strong> Google OAuth 2.0 integration for domain-restricted access.</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light border-0 h-100 p-3 shadow-sm">
                    <h5 className="fw-bold text-primary">Backend (Node.js)</h5>
                    <ul className="small mb-0">
                      <li><strong>Express API:</strong> Handles authentication and multi-source search orchestration.</li>
                      <li><strong>JSON DB:</strong> Lightweight file-based storage for persistence.</li>
                      <li><strong>Security:</strong> Enforces RBAC and validates Google ID Tokens.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-5">
              <h4 className="text-secondary fw-bold mb-3">3. Data Flow & Logic</h4>
              <p>The core intelligence of the app lies in its ability to classify servers and generate context-aware links.</p>
              
              <FlowDiagram />

              <div className="card border-0 bg-white shadow-sm p-4 mt-3">
                <h6 className="fw-bold text-primary">Search Execution Path:</h6>
                <ol className="small mb-0">
                  <li className="mb-2"><strong>Parallel Dispatch:</strong> The backend initiates parallel queries to all configured Grafana sources to ensure high performance.</li>
                  <li className="mb-2"><strong>Prometheus Discovery:</strong> For each source, the backend first queries its Prometheus instance using the <code>up</code> metric to confirm host availability.</li>
                  <li className="mb-2"><strong>Classification:</strong> 
                    <ul>
                      <li><strong>OS Detection:</strong> Uses job names, ports (9182 for Windows), and extensive internal whitelists/blacklists.</li>
                      <li><strong>Specialized Monitors:</strong> Automatically detects MSSQL, SSL Certs, or Loki Log availability.</li>
                    </ul>
                  </li>
                  <li className="mb-2"><strong>Fallback:</strong> If Prometheus results are empty, it falls back to a title-based keyword search via Grafana's native API.</li>
                  <li><strong>Deep Linking:</strong> Constructs URLs with pre-filled variables like <code>var-ip</code>, <code>var-instance</code>, and <code>var-DS_PROMETHEUS</code>.</li>
                </ol>
              </div>
            </section>

            <section className="mb-5">
              <h4 className="text-secondary fw-bold mb-3">4. Authentication & Security</h4>
              <div className="row">
                <div className="col-md-4">
                  <div className="p-3 border rounded bg-white text-center shadow-sm">
                    <div className="h1 text-primary">🔒</div>
                    <h6 className="fw-bold">Domain Lock</h6>
                    <small className="text-muted">Restricted to @smcindiaonline domains.</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 border rounded bg-white text-center shadow-sm">
                    <div className="h1 text-primary">👤</div>
                    <h6 className="fw-bold">RBAC</h6>
                    <small className="text-muted">User and Admin role management.</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 border rounded bg-white text-center shadow-sm">
                    <div className="h1 text-primary">🔑</div>
                    <h6 className="fw-bold">Token Auth</h6>
                    <small className="text-muted">Google ID Token validation per request.</small>
                  </div>
                </div>
              </div>
            </section>

            <div className="text-center mt-5 pt-3 border-top">
              <small className="text-muted">Grafana Search App v1.0.0 — Documentation & HLD &copy; 2026</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
