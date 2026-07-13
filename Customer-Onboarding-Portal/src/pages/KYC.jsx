import React, { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
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
  Chip
} from '@mui/material'
import { kycAPI } from '../api'

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} sx={{ width: '100%' }}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const KycTable = ({ customers, onApprove, onReject, loading }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
        <TableRow>
          <TableCell><strong>Customer ID</strong></TableCell>
          <TableCell><strong>Name</strong></TableCell>
          <TableCell><strong>Mobile</strong></TableCell>
          <TableCell><strong>Email</strong></TableCell>
          <TableCell align="center"><strong>Actions</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
              No customers in this category
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => (
            <TableRow key={customer.customerId} hover>
              <TableCell sx={{ fontSize: '0.9rem' }}>{customer.customerId}</TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.mobile}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell align="center">
                {customer.kycStatus === 'Pending' && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      variant="outlined"
                      onClick={() => onApprove(customer.customerId)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => onReject(customer.customerId)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {customer.kycStatus === 'Approved' && (
                  <Chip label="✓ Approved" color="success" />
                )}
                {customer.kycStatus === 'Rejected' && (
                  <Chip label="✗ Rejected" color="error" />
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
)

export default function KYC() {
  const [tabValue, setTabValue] = useState(0)
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [rejected, setRejected] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [decision, setDecision] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        kycAPI.getPendingCustomers(),
        kycAPI.getApprovedCustomers(),
        kycAPI.getRejectedCustomers()
      ])

      setPending(pendingRes.data || [])
      setApproved(approvedRes.data || [])
      setRejected(rejectedRes.data || [])
    } catch (error) {
      setError('Failed to load KYC data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (customerId) => {
    setSelectedCustomer(customerId)
    setDecision('Approved')
    setDialogOpen(true)
  }

  const handleReject = (customerId) => {
    setSelectedCustomer(customerId)
    setDecision('Rejected')
    setDialogOpen(true)
  }

  const handleSubmitDecision = async () => {
    if (!remarks.trim()) {
      setError('Please provide remarks')
      return
    }

    try {
      setLoading(true)
      await kycAPI.submitKycDecision(selectedCustomer, decision, remarks)
      setSuccess(`Customer ${decision.toLowerCase()} successfully!`)
      setDialogOpen(false)
      setRemarks('')
      setTimeout(() => {
        loadData()
        setSuccess('')
      }, 1500)
    } catch (error) {
      setError('Failed to update KYC: ' + error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        ✅ KYC Verification
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Pending (${pending.length})`} />
          <Tab label={`Approved (${approved.length})`} />
          <Tab label={`Rejected (${rejected.length})`} />
        </Tabs>
      </Paper>

      {/* Pending Tab */}
      <TabPanel value={tabValue} index={0}>
        {loading && pending.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <KycTable customers={pending} onApprove={handleApprove} onReject={handleReject} loading={loading} />
        )}
      </TabPanel>

      {/* Approved Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading && approved.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <KycTable customers={approved} onApprove={() => {}} onReject={() => {}} loading={false} />
        )}
      </TabPanel>

      {/* Rejected Tab */}
      <TabPanel value={tabValue} index={2}>
        {loading && rejected.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <KycTable customers={rejected} onApprove={() => {}} onReject={() => {}} loading={false} />
        )}
      </TabPanel>

      {/* Decision Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision === 'Approved' ? '✓ Approve' : '✗ Reject'} KYC
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter your remarks"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitDecision}
            variant="contained"
            color={decision === 'Approved' ? 'success' : 'error'}
            disabled={loading}
          >
            {loading ? 'Processing...' : decision}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
