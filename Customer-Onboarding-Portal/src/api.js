import axios from 'axios'

const API_CUSTOMER = 'http://localhost:3000'
const API_KYC = 'http://localhost:3001'
const API_ACCOUNT = 'http://localhost:3002'
const API_PRODUCT = 'http://localhost:3003'

// Customer Service
export const customerAPI = {
  createCustomer: (data) =>
    axios.post(`${API_CUSTOMER}/customer`, data),
  getAllCustomers: () =>
    axios.get(`${API_CUSTOMER}/customer/all`),
  getApprovedCustomers: () =>
    axios.get(`${API_CUSTOMER}/customer/approved`),
  getCustomerSummary: () =>
    axios.get(`${API_CUSTOMER}/customer/summary`),
  updateCustomerStatus: (customerId, status) =>
    axios.put(`${API_CUSTOMER}/customer/${customerId}/status`, {
      customerId,
      kycStatus: status
    })
}

// KYC Service
export const kycAPI = {
  getPendingCustomers: () =>
    axios.get(`${API_KYC}/kyc/pending`),
  getApprovedCustomers: () =>
    axios.get(`${API_KYC}/kyc/approved`),
  getRejectedCustomers: () =>
    axios.get(`${API_KYC}/kyc/rejected`),
  getAllKycDetails: () =>
    axios.get(`${API_KYC}/kyc/all`),
  submitKycDecision: (customerId, decision, details) =>
    axios.post(`${API_KYC}/kyc`, {
      customerId,
      decision,
      ...details
    })
}

// Account Service
export const accountAPI = {
  getAllAccounts: () =>
    axios.get(`${API_ACCOUNT}/account/all`),
  getEligibleCustomers: () =>
    axios.get(`${API_ACCOUNT}/account/eligible-customers`),
  createAccount: (customerId, details) =>
    axios.post(`${API_ACCOUNT}/account`, {
      customerId,
      ...details
    }),
  deleteAccount: (accountNumber) =>
    axios.delete(`${API_ACCOUNT}/account/${accountNumber}`)
}

// Product Service
export const productAPI = {
  getAllProducts: () =>
    axios.get(`${API_PRODUCT}/product/all`),
  getAccounts: () =>
    axios.get(`${API_PRODUCT}/product/accounts`),
  createProduct: (accountNumber, productType) =>
    axios.post(`${API_PRODUCT}/product`, {
      accountNumber,
      productType
    })
}
