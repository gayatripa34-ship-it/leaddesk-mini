'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Lead {
  _id: string;
  name: string;
  email: string;
  budget: string;
  message: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Protect route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchLeads = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      const result = await res.json();
      if (result.success) {
        setLeads(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status]);

  if (status === 'loading') {
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>Checking authentication...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchLeads(val);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const result = await res.json();
      if (result.success) {
        setLeads((prev) =>
          prev.map((lead) => (lead._id === id ? { ...lead, status: newStatus as any } : lead))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'Contacted':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Closed':
        return { bg: '#d1fae5', text: '#065f46' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Header */}
      <header style={{ padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
          LeadDesk <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>| Admin Dashboard</span>
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '14px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>← Back to Site</a>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', width: '100%', flexGrow: 1 }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>Leads Management</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                Total Leads: <strong>{leads.length}</strong>
              </p>
            </div>

            <input
              type="text"
              placeholder="Search leads by name, email, or message..."
              value={search}
              onChange={handleSearchChange}
              style={{ padding: '10px 16px', width: '320px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading leads...</div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No leads found. Go submit one from the public landing page!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Lead Info</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Budget</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Message</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Status Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const statusStyle = getStatusColor(lead.status);
                    return (
                      <tr key={lead._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{lead.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{lead.email}</div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: '500', color: '#374151' }}>{lead.budget}</td>
                        <td style={{ padding: '16px', color: '#4b5563', maxWidth: '280px' }}>{lead.message}</td>
                        <td style={{ padding: '16px' }}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: '600',
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Footer Credit */}
      <footer style={{ padding: '20px', textAlign: 'center', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', fontSize: '14px', color: '#6b7280' }}>
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#4b5563', textDecoration: 'underline' }}
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>

    </div>
  );
}