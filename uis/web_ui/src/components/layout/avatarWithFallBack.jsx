// src/components/AvatarWithFallback.jsx
import { Avatar } from '@mui/material';

function stringToColor(string = '') {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

export default function AvatarWithFallback({ name, src, ...props }) {
  const label = initials(name).toUpperCase();
  return (
    <Avatar src={src} alt={name} sx={{ bgcolor: stringToColor(name), color: '#fff' }} {...props}>
      {label || '?'}
    </Avatar>
  );
}