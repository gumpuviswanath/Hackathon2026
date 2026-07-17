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
  const [branch, setBranch] = useState('')
  const [productCode, setProductCode] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [minimumBalance, setMinimumBalance] = useState('')
  const [cardType, setCardType] = useState('RuPay')
  const [error, setError] = useState('')
  const [createdAccount, setCreatedAccount] = useState(null)
  const [accountToDelete, setAccountToDelete] = useState(null)

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
    resetAccountForm()
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const resetAccountForm = () => {
    setAccountType('Savings')
    setBranch('')
    setProductCode('')
    setCurrency('INR')
    setMinimumBalance('')
    setCardType('RuPay')
  }

  const handleCreateAccount = async () => {
    try {
      setLoading(true)
      const response = await accountAPI.createAccount(selectedCustomer.customerId, {
        accountType,
        branch,
        productCode,
        currency,
        minimumBalance: minimumBalance === '' ? null : Number(minimumBalance),
        cardType
      })
      setDialogOpen(false)
      resetAccountForm()
      setCreatedAccount(response.data)
      loadData()
    } catch (error) {
      setError('Failed to create account: ' + error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const isKycApproved = (customer) => {
    return customer.kycStatus === 'Approved' || customer.kycApproved
  }

  const handleDeleteAccount = (account) => {
    setAccountToDelete(account)
  }

  const confirmDeleteAccount = async () => {
    try {
      setLoading(true)
      await accountAPI.deleteAccount(accountToDelete.accountNumber)
      setAccountToDelete(null)
      loadData()
    } catch (error) {
      setError('Failed to delete account: ' + error.response?.data?.message || error.message)
      setAccountToDelete(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        🏧 Account Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

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
              <TableCell><strong>Branch</strong></TableCell>
              <TableCell><strong>Currency</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Opening Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
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
                  <TableCell>{account.branch || '—'}</TableCell>
                  <TableCell>{account.currency || '—'}</TableCell>
                  <TableCell>
                    <Chip label={account.status} color="success" size="small" />
                  </TableCell>
                  <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteAccount(account)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </TableCell>
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
                sx={{ mb: 2 }}
              >
                <option value="Savings">Savings Account</option>
                <option value="Current">Current Account / Checking Account</option>
                <option value="Fixed Deposit">Fixed Deposit Account / Time Deposit</option>
              </TextField>
              <TextField
                fullWidth
                label="Branch of Account Opening"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="MG Road Branch"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Product Name/Code"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Classic Savings / SB-CLASSIC"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="Currency of Account"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                SelectProps={{
                  native: true
                }}
                sx={{ mb: 2 }}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Minimum Balance Requirement"
                value={minimumBalance}
                onChange={(e) => setMinimumBalance(e.target.value)}
                placeholder="1000"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="Debit Card Type"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                SelectProps={{
                  native: true
                }}
              >
                <option value="RuPay">RuPay</option>
                <option value="Visa">Visa</option>
                <option value="MasterCard">MasterCard</option>
                <option value="Amex">Amex</option>
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

      {/* Account Created Confirmation */}
      <Dialog open={!!createdAccount} onClose={() => setCreatedAccount(null)} maxWidth="sm" fullWidth>
        <DialogTitle>✅ Account Opened Successfully</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {createdAccount && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Account Number:</strong> {createdAccount.accountNumber}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Account Status:</strong> {createdAccount.status}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Account Opening Date:</strong> {new Date(createdAccount.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Account Type:</strong> {createdAccount.accountType}
              </Typography>
              <Typography variant="body1">
                <strong>Branch:</strong> {createdAccount.branch || '—'} &nbsp;|&nbsp;
                <strong> Currency:</strong> {createdAccount.currency || '—'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatedAccount(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation */}
      <Dialog open={!!accountToDelete} onClose={() => setAccountToDelete(null)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Delete Account</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {accountToDelete && (
            <Typography>
              This will permanently delete account <strong>{accountToDelete.accountNumber}</strong>{' '}
              (Customer ID: {accountToDelete.customerId}) and all products associated with it (loans,
              credit cards, investments, insurance, etc.). This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountToDelete(null)}>Cancel</Button>
          <Button onClick={confirmDeleteAccount} variant="contained" color="error" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
