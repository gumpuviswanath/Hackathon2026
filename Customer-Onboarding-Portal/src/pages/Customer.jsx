import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Alert,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { customerAPI } from '../api'

export default function Customer() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sameAsResidential, setSameAsResidential] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dateOfBirth: '',
    address: '',
    mailingAddress: '',
    governmentId: ''
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const response = await customerAPI.getAllCustomers()
      setCustomers(response.data || [])
    } catch (error) {
      setError('Failed to load customers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.governmentId) {
      setError('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...formData,
        mailingAddress: sameAsResidential ? formData.address : formData.mailingAddress
      }
      await customerAPI.createCustomer(payload)
      setSuccess('Customer registered successfully!')
      setFormData({
        name: '',
        mobile: '',
        dateOfBirth: '',
        address: '',
        mailingAddress: '',
        governmentId: ''
      })
      setSameAsResidential(false)
      setOpenDialog(false)
      setTimeout(() => {
        loadCustomers()
        setSuccess('')
      }, 1000)
    } catch (error) {
      setError('Failed to create customer: ' + error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success'
      case 'Rejected':
        return 'error'
      case 'Pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status) => {
    if (status.includes('Approved')) return 'success'
    if (status.includes('Rejected')) return 'error'
    return 'warning'
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        👥 Customer Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        + Register New Customer
      </Button>

      {/* Registration Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Customer</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number *"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="9876543210"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Residential Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State, ZIP, Country"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sameAsResidential}
                    onChange={(e) => setSameAsResidential(e.target.checked)}
                  />
                }
                label="Mailing address same as residential address"
              />
            </Grid>
            {!sameAsResidential && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mailing Address"
                  name="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State, ZIP, Country"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Government ID *"
                name="governmentId"
                value={formData.governmentId}
                onChange={handleInputChange}
                placeholder="AADHAR123456"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customers Table */}
      {loading && !customers.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Customer ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Mobile</strong></TableCell>
                <TableCell><strong>KYC Status</strong></TableCell>
                <TableCell><strong>Overall Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No customers registered yet
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell sx={{ fontSize: '0.9rem' }}>{customer.customerId}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.kycStatus}
                        color={getKycStatusColor(customer.kycStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status}
                        color={getStatusColor(customer.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
