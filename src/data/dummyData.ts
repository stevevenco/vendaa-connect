export const dummyMeters = [
  {
    id: "1",
    meterNumber: "MTR001234",
    customerName: "Alice Johnson",
    address: "123 Main Street, Lagos, Nigeria",
    email: "alice.johnson@example.com",
    phone: "+234-901-234-5678",
    sgc: "12345678",
    tariffIndex: "T1",
    keyRevisionNumber: "001",
    balance: 1250.75,
    status: "active",
    meterType: "electricity",
    lastReading: "2024-01-15T10:30:00Z",
    consumption: 245.8,
    relayStatus: "connected"
  },
  {
    id: "2",
    meterNumber: "MTR005678",
    customerName: "David Wilson",
    address: "456 Oak Avenue, Abuja, Nigeria",
    email: "david.wilson@example.com",
    phone: "+234-902-345-6789",
    sgc: "23456789",
    tariffIndex: "T2",
    keyRevisionNumber: "002",
    balance: 890.50,
    status: "active",
    meterType: "water",
    lastReading: "2024-01-14T15:45:00Z",
    consumption: 180.2,
    relayStatus: "disconnected"
  },
  // ... more meters
];

export const dummyTransactions = [
  {
    id: "1",
    date: "2024-01-15T09:30:00Z",
    type: "credit_purchase",
    amount: 5000,
    description: "Electricity credit purchase for MTR001234",
    balance: 15240.75,
    meterNumber: "MTR001234",
    token: "12345-67890-11223-44556"
  },
  {
    id: "2", 
    date: "2024-01-14T14:20:00Z",
    type: "wallet_topup",
    amount: 10000,
    description: "Wallet top-up via bank transfer",
    balance: 20240.75,
    reference: "TXN-2024-001-456"
  },
  // ... more transactions
];

export const dummyReports = {
  creditGenerated: [
    { month: "Jan", amount: 125000, count: 48 },
    { month: "Feb", amount: 142000, count: 52 },
    { month: "Mar", amount: 138000, count: 49 },
    { month: "Apr", amount: 156000, count: 58 },
    { month: "May", amount: 171000, count: 63 },
    { month: "Jun", amount: 165000, count: 61 }
  ],
  meterActions: [
    { action: "Disconnect", count: 23, date: "2024-01-15" },
    { action: "Reconnect", count: 18, date: "2024-01-14" },
    { action: "Balance Check", count: 145, date: "2024-01-13" },
    { action: "Consumption Read", count: 89, date: "2024-01-12" }
  ]
};

export const dummyUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@technova.com",
    phone: "+234-901-111-2222",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15T08:30:00Z",
    createdAt: "2023-06-15T10:00:00Z"
  },
  {
    id: "2", 
    name: "Sarah Smith",
    email: "sarah.smith@technova.com",
    phone: "+234-902-333-4444",
    role: "operator",
    status: "active",
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2023-08-20T14:30:00Z"
  }
];

export const dummyWallet = {
  balance: 47580.25,
  currency: "NGN",
  lastTopUp: {
    amount: 10000,
    date: "2024-01-14T14:20:00Z",
    reference: "TXN-2024-001-456"
  },
  pendingTransactions: 2,
  totalSpent: 342890.75,
  totalTopUps: 390471.00
};