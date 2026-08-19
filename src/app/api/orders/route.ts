import { NextRequest, NextResponse } from 'next/server';
import { CRYPTO_CONFIG, calculateOrderTotal, validateMinimumOrder, validateNetworkCombo, generateOrderNumber } from '@/lib/config';
import { sendOrderNotification } from '@/lib/telegram';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const crypto = formData.get('crypto') as string;
    const network = formData.get('network') as string;
    const amount = formData.get('amount') as string;
    const receivingMethod = formData.get('receivingMethod') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const binanceUid = formData.get('binanceUid') as string;
    const walletAddress = formData.get('walletAddress') as string;
    const paymentProof = formData.get('paymentProof') as File;

    // Validate required fields
    if (!crypto || !network || !amount || !receivingMethod || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate crypto/network combination
    if (!validateNetworkCombo(crypto, network)) {
      return NextResponse.json(
        { error: 'Invalid cryptocurrency and network combination' },
        { status: 400 }
      );
    }

    // Parse and validate amount
    const cryptoAmount = parseFloat(amount);
    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validate minimum order
    if (!validateMinimumOrder(crypto, amount, receivingMethod)) {
      const minimum = receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.BINANCE 
        ? CRYPTO_CONFIG.MINIMUMS.BINANCE 
        : CRYPTO_CONFIG.MINIMUMS.WALLET;
      return NextResponse.json(
        { error: `Minimum order is ${minimum} USDT equivalent` },
        { status: 400 }
      );
    }

    // Validate receiving method
    if (receivingMethod !== CRYPTO_CONFIG.RECEIVING_METHODS.BINANCE && 
        receivingMethod !== CRYPTO_CONFIG.RECEIVING_METHODS.WALLET) {
      return NextResponse.json(
        { error: 'Invalid receiving method' },
        { status: 400 }
      );
    }

    // Validate receiving method specific fields
    if (receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.BINANCE && !binanceUid?.trim()) {
      return NextResponse.json(
        { error: 'Binance UID is required for Binance receiving method' },
        { status: 400 }
      );
    }

    if (receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.WALLET && !walletAddress?.trim()) {
      return NextResponse.json(
        { error: 'Wallet address is required for wallet receiving method' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.WALLET) {
      const addressLength = walletAddress.trim().length;
      if (addressLength < 20 || addressLength > 100) {
        return NextResponse.json(
          { error: 'Invalid wallet address format' },
          { status: 400 }
        );
      }
    }

    // Validate payment method
    if (paymentMethod !== CRYPTO_CONFIG.PAYMENT_METHODS.CBE.name && 
        paymentMethod !== CRYPTO_CONFIG.PAYMENT_METHODS.TELEBIRR.name) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Validate customer information
    if (!customerEmail?.trim() || !customerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate payment proof
    if (!paymentProof) {
      return NextResponse.json(
        { error: 'Payment proof is required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(paymentProof.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, JPEG, PNG, and PDF are allowed' },
        { status: 400 }
      );
    }

    if (paymentProof.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Calculate order details
    const orderCalculation = calculateOrderTotal(crypto, amount, receivingMethod);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename for payment proof
    const timestamp = Date.now();
    const fileExtension = path.extname(paymentProof.name);
    const fileName = `${orderNumber}-${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save payment proof
    const bytes = await paymentProof.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Send Telegram notification
    const time = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const notificationData = {
      orderId: orderNumber,
      crypto: crypto,
      network: network,
      amount: cryptoAmount,
      usdtEquivalent: orderCalculation.usdtEquivalent,
      cryptoValue: orderCalculation.baseEtbAmount,
      fee: orderCalculation.fee,
      total: orderCalculation.totalEtbAmount,
      receivingMethod: receivingMethod,
      binanceUid: receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.BINANCE ? binanceUid : undefined,
      walletAddress: receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.WALLET ? walletAddress : undefined,
      paymentMethod: paymentMethod,
      customerEmail: customerEmail,
      time,
      paymentProofPath: filePath
    };

    await sendOrderNotification(notificationData);

    return NextResponse.json({
      success: true,
      orderNumber: orderNumber,
      message: 'Order submitted successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}