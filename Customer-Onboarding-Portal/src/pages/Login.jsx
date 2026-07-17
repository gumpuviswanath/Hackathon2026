import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'beyond123'
export const AUTH_KEY = 'beyondBankingAuth'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true')
      navigate('/', { replace: true })
    } else {
      setError('Incorrect username or password.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0d2b4e',
        px: 2
      }}
    >
      <Paper elevation={6} sx={{ width: 380, maxWidth: '100%', p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              bgcolor: '#1976d2',
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🏦 Beyond Banking
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Staff Portal Sign In
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button fullWidth variant="contained" size="large" type="submit">
            Sign In
          </Button>
        </Box>

        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          Demo credentials: admin / beyond123
        </Typography>
      </Paper>
    </Box>
  )
}
