import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Tabs,
  Tab,
  Typography,

  Card,
  CardContent,
  Button,
  CircularProgress,
  Container,
} from '@mui/material';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, requestRes] = await Promise.all([
          axios.get('http://localhost:5050/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5050/api/requests', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const {
          totalUsers,
          totalListings,
          monthlyCount,
          dailyCount,
        } = statsRes.data;

        setStats({
          totalUsers,
          totalListings,
          monthlyCount,
          dailyCount,
        });

        setRequests(requestRes.data);
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        alert('Erreur de chargement des statistiques ou des demandes');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleApprove = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5050/api/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(prev =>
        prev.map(req =>
          req._id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (err) {
      alert("Erreur lors de l'approbation");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return <Typography align="center">Aucune statistique trouvée.</Typography>;

  return (
    <Container maxWidth="xl" sx={{ paddingY: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 4 }}
      >
        <Tab label="Statistiques" />
        <Tab label="Demandes" />
      </Tabs>

      {/* Statistiques */}
      {activeTab === 0 && (
        <Box display="flex" flexWrap="wrap" gap={2}>
          <StatCard label="Utilisateurs" value={stats.totalUsers} />
          <StatCard label="Annonces" value={stats.totalListings} />
          <StatCard label="Mensuelles" value={stats.monthlyCount} />
          <StatCard label="Journalières" value={stats.dailyCount} />
        </Box>
      )}

      {/* Demandes */}
      {activeTab === 1 && (
        <Box display="flex" flexWrap="wrap" gap={2}>
          {requests.length === 0 ? (
            <Typography>Aucune demande trouvée.</Typography>
          ) : (
            requests.map((req) => (
              <Card key={req._id} sx={{ width: '100%', maxWidth: 350 }}>
                <CardContent>
                  <Typography variant="h6">{req.userId?.name || '—'}</Typography>
                  <Typography variant="body2">{req.userId?.email}</Typography>
                  <Typography variant="body2">Statut: {req.status}</Typography>
                  {req.status === 'pending' ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleApprove(req._id)}
                    >
                      Approuver
                    </Button>
                  ) : (
                    <Typography sx={{ mt: 1 }} color="success.main">
                      ✅ Approuvé
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Container>
  );
}

function StatCard({ label, value }) {
  return (
    <Card sx={{ flex: '1 1 250px', textAlign: 'center', py: 2 }}>
      <CardContent>
        <Typography variant="h6">{label}</Typography>
        <Typography variant="h4" fontWeight="bold" color="primary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default Dashboard;
