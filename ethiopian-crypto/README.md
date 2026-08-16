# Ethiopian Crypto Purchasing Platform

A simple cryptocurrency purchasing website for Ethiopian users. Customers can buy USDT, LTC, and TRX using Ethiopian Birr (ETB) through CBE or Telebirr payment methods. Orders are sent via Telegram for manual processing.

## Features

- **Supported Cryptocurrencies**: USDT (TRC20/BEP20), LTC (Litecoin Network), TRX (TRC20)
- **Payment Methods**: Commercial Bank of Ethiopia (CBE) and Telebirr
- **Receiving Options**: Binance account or personal wallet address
- **Real-time Calculations**: Automatic exchange rate and fee calculations with decimal precision
- **Telegram Notifications**: Instant order notifications with payment screenshots
- **Mobile Responsive**: Fully responsive design for all devices
- **No Database**: Simple file-based order submission to Telegram

## Exchange Rates

- **USDT**: 1 USDT = 195 ETB
- **LTC**: 1 LTC = 8,863.6363 ETB (0.022 LTC = 195 ETB)
- **TRX**: 1 TRX = 65.4362 ETB (2.98 TRX = 195 ETB)

## Fee Structure

### Binance Orders
- **Minimum**: 5 USDT equivalent
- **5-50 USDT equivalent**: 292 ETB fee
- **Above 50 USDT equivalent**: 390 ETB fee

### Wallet Address Orders
- **Minimum**: 10 USDT equivalent
- **10-50 USDT equivalent**: 292 ETB fee
- **Above 50 USDT equivalent**: 390 ETB fee

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Calculations**: Decimal.js for precise arithmetic
- **Notifications**: Telegram Bot API
- **File Upload**: Built-in Next.js file handling

## Prerequisites

- Node.js 18+ 
- Telegram Bot Token and Chat ID
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ethiopian-crypto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_ADMIN_CHAT_ID=your_telegram_admin_chat_id_here
   ```

## Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ethiopian-crypto/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── orders/           # Order submission API
│   │   ├── buy/                  # Customer buying flow
│   │   ├── order/                # Order confirmation page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Homepage
│   └── lib/
│       ├── config.ts             # Centralized configuration
│       └── telegram.ts           # Telegram bot integration
├── public/
│   └── uploads/                  # Uploaded payment proofs
└── .env.example                  # Environment variables template
```

## Usage

### Customer Flow

1. **Homepage**: Customers land on the homepage and click "Buy Crypto"
2. **Select Cryptocurrency**: Choose USDT, LTC, or TRX
3. **Select Network**: Choose the appropriate network for the selected crypto
4. **Enter Amount**: Specify how much crypto to buy
5. **Choose Receiving Method**: 
   - Binance: Enter Binance UID
   - Wallet Address: Enter wallet address (with network validation)
6. **Select Payment Method**: Choose CBE or Telebirr
7. **Enter Email**: Provide email for order completion notification
8. **Upload Payment Proof**: Upload screenshot of payment
9. **Complete Order**: Submit the order and receive confirmation

### Admin Processing

1. **Receive Telegram Notification**: Complete order details with payment screenshot
2. **Verify Payment**: Manually verify the payment screenshot
3. **Process Order**: Send crypto to customer's Binance or wallet address
4. **Email Customer**: Send completion email to customer

## API Endpoints

### Public Endpoints

- `POST /api/orders` - Create a new order and send to Telegram
- `GET /order/[orderNumber]` - View order confirmation page

## Configuration

### Exchange Rates

Edit `src/lib/config.ts` to update exchange rates:

```typescript
SUPPORTED_CRYPTOS: {
  USDT: {
    name: 'USDT',
    networks: ['TRC20', 'BEP20'],
    rate: new Decimal('195'), // Update this rate
  },
  // ... other cryptocurrencies
}
```

### Fee Structure

Edit `src/lib/config.ts` to update fees:

```typescript
FEES: {
  LOWER_FEE: new Decimal('292'),    // Update lower fee
  HIGHER_FEE: new Decimal('390'),   // Update higher fee
  FEE_THRESHOLD: new Decimal('50'), // Update threshold
}
```

### Payment Methods

Edit payment details in `src/lib/config.ts`:

```typescript
PAYMENT_METHODS: {
  CBE: {
    name: 'CBE',
    displayName: 'Commercial Bank of Ethiopia',
    accountName: 'FIKER MARIAM HAILU',
    accountNumber: '1000524101967',
  },
  // ... other payment methods
}
```

## Telegram Bot Setup

1. **Create a Telegram Bot**
   - Message @BotFather on Telegram
   - Create a new bot using `/newbot`
   - Save the bot token

2. **Get Your Chat ID**
   - Message @userinfobot on Telegram
   - Your chat ID will be returned

3. **Configure Environment Variables**
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_ADMIN_CHAT_ID=your_chat_id
   ```

## Security Features

- **Server-side Validation**: All order data validated on the backend
- **Network Restrictions**: Only allowed crypto/network combinations accepted
- **Input Sanitization**: All inputs sanitized and validated
- **Secure File Upload**: File type, size, and MIME validation
- **Environment Variables**: Sensitive data stored in environment variables
- **No Database**: No sensitive customer data stored in database

## Deployment

### Vercel (Recommended)

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables** in Vercel dashboard
4. **Deploy**

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Troubleshooting

### Telegram Notifications Not Working

- Verify TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID
- Check bot has permission to send messages
- Ensure bot is not blocked by the admin

### File Upload Issues

- Ensure `public/uploads/payment-proofs` directory exists
- Check file size and type validation
- Verify disk permissions

### Calculation Issues

- Decimal.js is used for precise arithmetic
- Original user input is preserved for display
- All calculations use Decimal.js for accuracy

## License

This project is proprietary software. All rights reserved.