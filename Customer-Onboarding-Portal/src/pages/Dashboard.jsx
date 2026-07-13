import React, { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material'
import { customerAPI, accountAPI, productAPI } from '../api'

const StatCard = ({ label, value, color }) => (
  <Card sx={{ height: '100%', backgroundColor: color }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboard = async () => {
    try {
      const [customerRes, accountRes, productRes] = await Promise.all([
        customerAPI.getCustomerSummary(),
        accountAPI.getAllAccounts(),
        productAPI.getAllProducts()
      ])

      const summary = customerRes.data
      const accounts = accountRes.data || []
      const products = productRes.data || []

      setData({
        customersRegistered: summary.customersRegistered || 0,
        pendingKyc: summary.pendingKyc || 0,
        rejected: summary.rejected || 0,
        approved: summary.approved || 0,
        accountsOpened: accounts.length,
        loans: products.filter(p => p.productType === 'Loan').length,
        creditCards: products.filter(p => p.productType === 'Credit Card').length,
        insurance: products.filter(p => p.productType === 'Insurance').length
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data) {
    return <Typography color="error">Failed to load dashboard data</Typography>
  }

  const stats = [
    { label: 'Customers Registered', value: data.customersRegistered, color: '#1976d2' },
    { label: 'Pending KYC', value: data.pendingKyc, color: '#ff9800' },
    { label: 'Rejected', value: data.rejected, color: '#f44336' },
    { label: 'Approved', value: data.approved, color: '#4caf50' },
    { label: 'Accounts Opened', value: data.accountsOpened, color: '#9c27b0' },
    { label: 'Loans', value: data.loans, color: '#00bcd4' },
    { label: 'Credit Cards', value: data.creditCards, color: '#673ab7' },
    { label: 'Insurance', value: data.insurance, color: '#ff5722' }
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        📊 Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard label={stat.label} value={stat.value} color={stat.color} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'white', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📈 System Status
        </Typography>
        <Typography variant="body2" color="textSecondary">
          ✅ All microservices are operational
          <br />
          ✅ Real-time data updates every 5 seconds
          <br />
          ✅ PostgreSQL persistence enabled
          <br />
          📍 Navigate using the sidebar menu to perform operations
        </Typography>
      </Box>
    </Box>
  )
}
