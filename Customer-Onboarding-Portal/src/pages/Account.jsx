import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import { accountAPI, customerAPI } from '../api'

export default function Account() {
  const [accounts, setAccounts] = useState([])
  const [eligibleCustomers, setEligibleCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [accountType, setAccountType] = useState('Savings')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [accountsRes, eligibleRes] = await Promise.all([
        accountAPI.getAllAccounts(),
        accountAPI.getEligibleCustomers()
      ])

      setAccounts(accountsRes.data || [])
      setEligibleCustomers(eligibleRes.data || [])
    } catch (error) {
      setError('Failed to load account data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAccount = (customer) => {
    if (!customer.kycApproved && customer.kycStatus !== 'Approved') {
      setError('KYC not completed. Please complete KYC first.')
      return
    }
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const handleCreateAccount = async () => {
    try {
      setLoading(true)
      await accountAPI.createAccount(selectedCustomer.customerId, accountType)
      setSuccess('Account opened successfully!')
      setDialogOpen(false)
      setAccountType('Savings')
      setTimeout(() => {
        loadData()
        setSuccess('')
      }, 1500)
    } catch (error) {
      setError('Failed to create account: ' + error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const isKycApproved = (customer) => {
    return customer.kycStatus === 'Approved' || customer.kycApproved
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        🏧 Account Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: '#4caf50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                Eligible Customers
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {eligibleCustomers.filter(c => isKycApproved(c) && !c.accountExists).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: '#2196f3' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                Accounts Opened
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {accounts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: '#ff9800' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                KYC Pending
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {eligibleCustomers.filter(c => !isKycApproved(c)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Eligible Customers Section */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        💼 Customers Eligible for Account
      </Typography>

      {loading && eligibleCustomers.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Customer ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Mobile</strong></TableCell>
                <TableCell><strong>KYC Status</strong></TableCell>
                <TableCell><strong>Has Account</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eligibleCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                eligibleCustomers.map((customer) => (
                  <TableRow key={customer.customerId} hover>
                    <TableCell sx={{ fontSize: '0.9rem' }}>{customer.customerId}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.kycStatus}
                        color={isKycApproved(customer) ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.accountExists ? 'Yes' : 'No'}
                        color={customer.accountExists ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenAccount(customer)}
                        disabled={
                          loading ||
                          customer.accountExists ||
                          !isKycApproved(customer)
                        }
                        title={
                          !isKycApproved(customer)
                            ? 'KYC not completed'
                            : customer.accountExists
                            ? 'Account already exists'
                            : ''
                        }
                      >
                        Open Account
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Accounts Table */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        📋 Opened Accounts
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Account Number</strong></TableCell>
              <TableCell><strong>Customer ID</strong></TableCell>
              <TableCell><strong>Account Type</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Created On</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No accounts opened yet
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {account.accountNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.9rem' }}>{account.customerId}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" size="small" />
                  </TableCell>
                  <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Account Creation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Open New Account</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedCustomer && (
            <Box>
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Customer:</strong> {selectedCustomer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {selectedCustomer.customerId}
                </Typography>
                <Typography variant="body2">
                  <strong>Mobile:</strong> {selectedCustomer.mobile}
                </Typography>
              </Box>
              <TextField
                fullWidth
                select
                label="Account Type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                SelectProps={{
                  native: true
                }}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
