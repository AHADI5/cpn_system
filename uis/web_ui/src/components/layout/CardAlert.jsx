import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export default function CardAlert() {
  return (
    <Card variant="outlined" className="m-6 shrink-0">
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography gutterBottom className="font-semibold">
          Plan about to expire
        </Typography>
        <Typography variant="body2" className="mb-2 text-gray-500">
          Enjoy 10% off when renewing your plan today.
        </Typography>
        <Button variant="contained" size="small" fullWidth>
          Get the discount
        </Button>
      </CardContent>
    </Card>
  );
}
