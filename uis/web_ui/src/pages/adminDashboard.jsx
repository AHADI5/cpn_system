// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Alert,
  IconButton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import colors from '../utils/colors';
import * as adminApi from '../apis/adminApi/admin';

function StatCard({ icon, label, value, sublabel, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (t) => (color ? color : t.palette.primary.light),
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {sublabel ? (
            <Typography variant="caption" color="text.secondary">
              {sublabel}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [summary, setSummary] = useState({
    users: { total: 0, active: 0 },
    templates: { total: 0, drafts: 0 },
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState([]);

  const load = async () => {
    setErr('');
    setLoading(true);
    try {
      const [usersSum, tmplSum, users, tmpls] = await Promise.all([
        adminApi.fetchUsersSummary(),
        adminApi.fetchTemplatesSummary(),
        adminApi.fetchRecentUsers(),
        adminApi.fetchRecentTemplates(),
      ]);
      setSummary({ users: usersSum, templates: tmplSum });
      setRecentUsers(users);
      setRecentTemplates(tmpls);
    } catch (e) {
      setErr(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <IconButton onClick={load} title="Refresh">
          <RefreshRoundedIcon />
        </IconButton>
      </Stack>

      {err ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      ) : null}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Skeleton variant="rounded" height={96} />
          ) : (
            <StatCard
              icon={<PeopleRoundedIcon />}
              label="Users"
              value={summary.users.total}
              sublabel={`${summary.users.active} active`}
              color={colors?.primary}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Skeleton variant="rounded" height={96} />
          ) : (
            <StatCard
              icon={<DescriptionRoundedIcon />}
              label="CPN Templates"
              value={summary.templates.total}
              sublabel={`${summary.templates.drafts} drafts`}
              color="#6a6fd6"
            />
          )}
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
            Quick actions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => nav('/users')}
            sx={{ backgroundColor: colors?.primary, '&:hover': { backgroundColor: colors?.primary } }}
          >
            Create user
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => nav('/cpn-templates')}
          >
            Create CPN template
          </Button>
        </Stack>
      </Paper>

      {/* Recent activity */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recent users
              </Typography>
              <Button
                component={RouterLink}
                to="/users"
                endIcon={<ArrowForwardRoundedIcon />}
                size="small"
              >
                View all
              </Button>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {loading ? (
              <Stack spacing={1}>
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} />
              </Stack>
            ) : (
              <List dense>
                {recentUsers.map((u) => (
                  <ListItem key={u.id} disableGutters>
                    <ListItemText
                      primary={u.name}
                      secondary={`${u.email} • ${u.role}`}
                      primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                    />
                  </ListItem>
                ))}
                {recentUsers.length === 0 && (
                  <Typography color="text.secondary">No users yet.</Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recent CPN templates
              </Typography>
              <Button
                component={RouterLink}
                to="/cpn-templates"
                endIcon={<ArrowForwardRoundedIcon />}
                size="small"
              >
                View all
              </Button>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {loading ? (
              <Stack spacing={1}>
                <Skeleton height={28} />
                <Skeleton height={28} />
                <Skeleton height={28} />
              </Stack>
            ) : (
              <List dense>
                {recentTemplates.map((t) => (
                  <ListItem key={t.id} disableGutters>
                    <ListItemText
                      primary={t.name}
                      secondary={`v${t.version} • Updated ${new Date(t.updatedAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                    />
                  </ListItem>
                ))}
                {recentTemplates.length === 0 && (
                  <Typography color="text.secondary">No templates yet.</Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}