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
  Grid,
  Tabs,
  Tab
} from '@mui/material'
import { productAPI, accountAPI } from '../api'

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function Product() {
  const [products, setProducts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [productType, setProductType] = useState('Loan')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, accountsRes] = await Promise.all([
        productAPI.getAllProducts(),
        productAPI.getAccounts()
      ])

      setProducts(productsRes.data || [])
      setAccounts(accountsRes.data || [])
    } catch (error) {
      setError('Failed to load product data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyProduct = (account) => {
    if (!account) {
      setError('Please select an account')
      return
    }
    setSelectedAccount(account)
    setProductType('Loan')
    setDialogOpen(true)
  }

  const handleCreateProduct = async () => {
    try {
      setLoading(true)
      await productAPI.createProduct(selectedAccount.accountNumber, productType)
      setSuccess(`${productType} application submitted successfully!`)
      setDialogOpen(false)
      setProductType('Loan')
      setTimeout(() => {
        loadData()
        setSuccess('')
      }, 1500)
    } catch (error) {
      setError('Failed to apply for product: ' + error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const getProductColor = (type) => {
    switch (type) {
      case 'Loan':
        return '#ff9800'
      case 'Credit Card':
        return '#2196f3'
      case 'Insurance':
        return '#4caf50'
      default:
        return '#9c27b0'
    }
  }

  const countProducts = (type) => products.filter(p => p.productType === type).length

  const getProductsByType = (type) => products.filter(p => p.productType === type)

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        🎁 Product Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#ff9800' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                Loans
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {countProducts('Loan')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#2196f3' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                Credit Cards
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {countProducts('Credit Card')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#4caf50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                Insurance
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {countProducts('Insurance')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#9c27b0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ color: 'white' }}>
                Total Products
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply for Product Section */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        ✍️ Apply for Products
      </Typography>

      {loading && accounts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Account Number</strong></TableCell>
                <TableCell><strong>Customer ID</strong></TableCell>
                <TableCell><strong>Account Type</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No accounts available. Please open an account first.
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
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleApplyProduct(account)}
                        disabled={loading}
                      >
                        Apply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Products Display Section */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        📊 Submitted Applications
      </Typography>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Loans (${countProducts('Loan')})`} />
          <Tab label={`Credit Cards (${countProducts('Credit Card')})`} />
          <Tab label={`Insurance (${countProducts('Insurance')})`} />
        </Tabs>
      </Paper>

      {/* Loans Tab */}
      <TabPanel value={tabValue} index={0}>
        <ProductTable products={getProductsByType('Loan')} />
      </TabPanel>

      {/* Credit Cards Tab */}
      <TabPanel value={tabValue} index={1}>
        <ProductTable products={getProductsByType('Credit Card')} />
      </TabPanel>

      {/* Insurance Tab */}
      <TabPanel value={tabValue} index={2}>
        <ProductTable products={getProductsByType('Insurance')} />
      </TabPanel>

      {/* Product Application Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAccount && (
            <Box>
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Account Number:</strong> {selectedAccount.accountNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Customer ID:</strong> {selectedAccount.customerId}
                </Typography>
                <Typography variant="body2">
                  <strong>Account Type:</strong> {selectedAccount.accountType}
                </Typography>
              </Box>
              <TextField
                fullWidth
                select
                label="Product Type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                SelectProps={{
                  native: true
                }}
              >
                <option value="Loan">Loan</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Insurance">Insurance</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProduct}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Applying...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function ProductTable({ products }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell><strong>Account Number</strong></TableCell>
            <TableCell><strong>Product Type</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Applied On</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                No applications yet
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {product.accountNumber}
                </TableCell>
                <TableCell>
                  <Chip label={product.productType} color="primary" size="small" />
                </TableCell>
                <TableCell>
                  <Chip label="Active" color="success" size="small" />
                </TableCell>
                <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
