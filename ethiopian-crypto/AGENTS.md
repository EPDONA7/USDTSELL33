# Ethiopian Crypto Platform - Agent Instructions

## Project Overview
This is a simplified cryptocurrency purchasing platform for Ethiopian users. The application allows customers to buy USDT, LTC, and TRX using Ethiopian Birr (ETB) through CBE or Telebirr payment methods. Orders are sent via Telegram for manual processing - no database or admin panel required.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Calculations**: Decimal.js for precise arithmetic (no floating-point bugs)
- **Notifications**: Telegram Bot API
- **File Upload**: Built-in Next.js file handling

## Key Features
- Multi-cryptocurrency support (USDT, LTC, TRX)
- Network-specific support (TRC20, BEP20, Litecoin)
- Dual receiving methods (Binance, Wallet Address)
- Payment method integration (CBE, Telebirr)
- Real-time exchange rate calculations with decimal precision
- Tiered fee structure
- Telegram notifications for order processing
- Mobile-responsive design
- No database - simple file-based operation

## Important Business Logic

### Exchange Rates (Fixed)
- USDT: 1 USDT = 195 ETB
- LTC: 1 LTC = 8,863.6363 ETB (derived from 0.022 LTC = 195 ETB)
- TRX: 1 TRX = 65.4362 ETB (derived from 2.98 TRX = 195 ETB)

### Fee Structure
- **Binance**: Min 5 USDT equivalent, 292 ETB fee (5-50 USDT), 390 ETB fee (>50 USDT)
- **Wallet**: Min 10 USDT equivalent, 292 ETB fee (10-50 USDT), 390 ETB fee (>50 USDT)

### Network Restrictions (STRICTLY ENFORCED)
- USDT: TRC20, BEP20 only
- LTC: Litecoin Network only
- TRX: TRC20 only

### No Database/Authentication
- No user accounts or login required
- No admin dashboard
- No database operations
- Orders sent directly to Telegram
- Manual processing by admin

## Development Commands

### Application
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm start               # Start production server
```

## Configuration Files

### Environment Variables (.env)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for notifications
- `TELEGRAM_ADMIN_CHAT_ID`: Admin chat ID for notifications

### Centralized Configuration (src/lib/config.ts)
All exchange rates, fees, and business logic are centralized in this file. Uses Decimal.js for precise arithmetic to avoid floating-point bugs.

## Security Considerations

### Critical Security Points
1. **Server-side validation**: All API routes validate input data
2. **Network restrictions**: Backend enforces allowed crypto/network combinations
3. **File upload validation**: Type, size, and MIME validation for payment proofs
4. **Environment variables**: All secrets in environment variables
5. **No database**: No sensitive customer data stored

### What to Avoid
- NEVER expose Telegram bot token to frontend
- NEVER trust frontend data without server validation
- NEVER commit real credentials to repository
- NEVER add database functionality (not needed)

## Project Structure

### Key Directories
- `src/app/`: Next.js App Router pages and API routes
- `src/lib/`: Shared utilities and configuration
- `public/uploads/`: User-uploaded payment proofs

### Important Files
- `src/lib/config.ts`: Centralized business logic and configuration with Decimal.js
- `src/lib/telegram.ts`: Telegram bot integration
- `src/app/api/orders/route.ts`: Order submission API
- `src/app/buy/page.tsx`: Customer buying flow
- `src/app/order/[orderNumber]/page.tsx`: Order confirmation page

## Common Tasks

### Adding New Cryptocurrency
1. Update `src/lib/config.ts` with crypto details using Decimal.js
2. Add network restrictions to `ALLOWED_NETWORKS`
3. Test validation logic

### Updating Exchange Rates
1. Modify rates in `src/lib/config.ts` using Decimal.js
2. Test calculation logic thoroughly

### Modifying Fee Structure
1. Update `FEES` object in `src/lib/config.ts` using Decimal.js
2. Update `MINIMUMS` if needed
3. Test fee calculation logic

## Testing Priorities

1. **Crypto Calculations**: Verify all exchange rate and fee calculations with Decimal.js
2. **Network Restrictions**: Test invalid combinations are rejected
3. **Minimum Orders**: Verify minimum order enforcement
4. **File Uploads**: Test file validation and upload functionality
5. **Order Flow**: Test complete customer order flow
6. **Telegram Notifications**: Verify notifications are sent correctly
7. **Mobile Responsiveness**: Test on various screen sizes
8. **Floating-Point Precision**: Ensure exact input preservation (5 USDT stays 5 USDT)

## Calculation Precision

### Decimal.js Usage
- All calculations use Decimal.js for precise arithmetic
- Original user input is preserved for display
- No floating-point arithmetic errors
- USDT equivalent calculations use Decimal.js for minimum/fee threshold accuracy

### Example
- User enters: "5" → Display: "5 USDT" (exact)
- User enters: "10" → Display: "10 USDT" (exact)
- Calculations preserve precision through entire flow

## Customer Information

### Only Email Required
- No name, phone, or other personal information
- Email used for order completion notification
- Manual email sent by admin after processing

## Order Processing Flow

1. **Customer Submission**: Order form → Payment screenshot → Telegram
2. **Telegram Notification**: Complete order details with screenshot sent to admin
3. **Manual Processing**: Admin verifies payment and sends crypto
4. **Customer Notification**: Admin manually emails customer when complete

## Troubleshooting

### Telegram Issues
- Verify bot token and chat ID
- Check bot has necessary permissions
- Ensure bot is not blocked

### File Upload Issues
- Ensure upload directory exists
- Check file validation logic
- Verify disk permissions

### Calculation Issues
- Ensure Decimal.js is used throughout
- Check that original input is preserved
- Verify minimum/fee threshold calculations

## Code Style Guidelines

- Follow existing code patterns
- Use TypeScript for type safety
- Implement proper error handling
- Use Decimal.js for all financial calculations
- Keep components focused and reusable
- Use Tailwind CSS for styling
- Follow Next.js App Router conventions

## Performance Considerations

- Optimize file upload handling
- Use Next.js Image component for images
- Optimize bundle size
- Minimal dependencies for fast deployment

## Deployment Notes

1. Set Telegram environment variables in production
2. Ensure upload directory is writable
3. Configure Telegram bot for production
4. No database setup required
5. No authentication setup required

## Future Enhancements

Potential improvements for the platform:
- Email notifications for customers (manual)
- Rate history tracking
- Multi-language support
- Additional payment methods
- Simple order tracking system