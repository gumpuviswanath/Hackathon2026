import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountBalance as AccountIcon,
  CardGiftcard as ProductIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import Dashboard from './pages/Dashboard'
import Customer from './pages/Customer'
import KYC from './pages/KYC'
import Account from './pages/Account'
import Product from './pages/Product'
import { customerAPI } from './api'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
    const interval = setInterval(loadSummary, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSummary = async () => {
    try {
      const response = await customerAPI.getCustomerSummary()
      setSummary(response.data)
    } catch (error) {
      console.error('Failed to load summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Customer', icon: <PeopleIcon />, path: '/customer' },
    { label: 'KYC', icon: <VerifiedUserIcon />, path: '/kyc' },
    { label: 'Account', icon: <AccountIcon />, path: '/account' },
    { label: 'Product', icon: <ProductIcon />, path: '/product' }
  ]

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* AppBar */}
        <AppBar position="fixed" sx={{ zIndex: 1300 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              {drawerOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <h2 style={{ margin: 0 }}>🏦 Customer Onboarding Portal</h2>
            </Box>
            {summary && (
              <Box sx={{ display: 'flex', gap: 2, color: 'white', fontSize: '0.9rem' }}>
                <Box>
                  <Badge badgeContent={summary.customersRegistered} color="secondary">
                    Customers
                  </Badge>
                </Box>
                <Box>
                  <Badge badgeContent={summary.pendingKyc} color="warning">
                    Pending
                  </Badge>
                </Box>
                <Box>
                  <Badge badgeContent={summary.approved} color="success">
                    Approved
                  </Badge>
                </Box>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: 250,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
              top: 64
            }
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                href={item.path}
                component="a"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 8,
            p: 3
          }}
        >
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/account" element={<Account />} />
              <Route path="/product" element={<Product />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  )
}

export default App
