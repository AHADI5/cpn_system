// src/pages/UsersPage.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  InputBase,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Checkbox,
  TablePagination,
  Tooltip,
  Skeleton,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

import * as adminApi from '../apis/adminApi/admin';
import colors from '../utils/colors';
import CreateUserDialog from '../components/layout/createUserDialog';

function Dot({ color, title }) {
  return (
    <Tooltip title={title}>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color,
        }}
      />
    </Tooltip>
  );
}

function formatDateTime(v) {
  if (!v) return 'Never Connected';
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

const ONLINE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Login' },
  { id: 'role', label: 'Role' },
  { id: 'lastAuthAt', label: 'Latest authentication' },
  { id: 'actif', label: 'Actif', sortable: false },
];

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // selection
  const [selected, setSelected] = useState([]);

  // search
  const [query, setQuery] = useState('');

  // sorting
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // dialog
  const [openCreate, setOpenCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.fetchAllUsers();
      // Map backend -> UI
      const mapped = (data || []).map((u) => {
        const roleNames = Array.isArray(u.roles) ? u.roles.map((r) => r.roleName).filter(Boolean) : [];
        return {
          id: u.userID,
          name: u.userName,
          email: u.userName, // backend doesn't expose email; using userName as login
          role: roleNames.join(', '),
          lastAuthAt: u.lastLogin,
          isEnabled: Boolean(u.isEnabled),
        };
      });
      setRows(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.role || '').toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!orderBy || headCells.find((h) => h.id === orderBy)?.sortable === false) return arr;

    return arr.sort((a, b) => {
      const va = a[orderBy];
      const vb = b[orderBy];

      if (orderBy === 'lastAuthAt') {
        const na = va ? new Date(va).getTime() : -Infinity;
        const nb = vb ? new Date(vb).getTime() : -Infinity;
        return order === 'asc' ? na - nb : nb - na;
      }

      const sa = (va ?? '').toString();
      const sb = (vb ?? '').toString();
      return order === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [filtered, orderBy, order]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    if (headCells.find((h) => h.id === property)?.sortable === false) return;
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      const newSelected = paged.map((n) => n.id);
      setSelected((prev) => Array.from(new Set([...prev, ...newSelected])));
      return;
    }
    // unselect only visible page
    setSelected((prev) => prev.filter((id) => !paged.some((r) => r.id === id)));
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const i = prev.indexOf(id);
      if (i === -1) return [...prev, id];
      return [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Top: New + Title + Settings */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ backgroundColor: colors?.primary, '&:hover': { backgroundColor: colors?.primary } }}
        >
          New
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Users
        </Typography>
        <IconButton size="small" sx={{ ml: 0.5 }}>
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Search bar (Odoo-like) */}
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
        <Paper
          variant="outlined"
          sx={{
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: 'min(860px, 100%)',
            borderRadius: 1.5,
          }}
        >
          <SearchRoundedIcon color="action" />
          <Chip
            size="small"
            icon={<FilterListRoundedIcon />}
            label="Internal Users"
            onDelete={() => {}}
          />
          <InputBase
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: 1, ml: 0.5 }}
          />
          <IconButton size="small">
            <ArrowDropDownRoundedIcon />
          </IconButton>
        </Paper>
      </Stack>

      {/* List */}
      <Paper variant="outlined">
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < paged.length}
                  checked={paged.length > 0 && selected.length >= paged.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all' }}
                />
              </TableCell>
              {headCells.map((h) => (
                <TableCell key={h.id} sortDirection={orderBy === h.id ? order : false}>
                  {h.sortable === false ? (
                    h.label
                  ) : (
                    <TableSortLabel
                      active={orderBy === h.id}
                      direction={orderBy === h.id ? order : 'asc'}
                      onClick={() => handleRequestSort(h.id)}
                    >
                      {h.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={headCells.length + 1} sx={{ py: 4 }}>
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length + 1} sx={{ py: 6 }}>
                  <Typography align="center" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((r) => {
                const selectedRow = isSelected(r.id);
                const last = r.lastAuthAt ? new Date(r.lastAuthAt).getTime() : 0;
                const online = r.isEnabled && last > 0 && Date.now() - last <= ONLINE_WINDOW_MS;

                return (
                  <TableRow
                    key={r.id}
                    hover
                    role="checkbox"
                    aria-checked={selectedRow}
                    selected={selectedRow}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox" onClick={() => toggleRow(r.id)}>
                      <Checkbox checked={selectedRow} />
                    </TableCell>

                    <TableCell onClick={() => toggleRow(r.id)}>
                      <Typography color="primary" sx={{ fontWeight: 500 }}>
                        {r.name}
                      </Typography>
                    </TableCell>

                    <TableCell onClick={() => toggleRow(r.id)} sx={{ color: 'primary.main' }}>
                      {r.email}
                    </TableCell>

                    <TableCell onClick={() => toggleRow(r.id)} sx={{ whiteSpace: 'nowrap' }}>
                      {r.role || '—'}
                    </TableCell>

                    <TableCell onClick={() => toggleRow(r.id)} sx={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(r.lastAuthAt)}
                    </TableCell>

                    <TableCell onClick={() => toggleRow(r.id)}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {r.isEnabled ? <Dot color="#e53935" title="Active (enabled)" /> : null}
                        {online ? <Dot color="#2e7d32" title="Online (recent login)" /> : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Divider />

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <CreateUserDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={load}
      />
    </Box>
  );
}