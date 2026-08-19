import { Telegraf } from 'telegraf';
import * as fs from 'fs';

export interface TelegramOrderNotification {
  orderId: string;
  crypto: string;
  network: string;
  amount: number;
  usdtEquivalent: string;
  cryptoValue: string;
  fee: string;
  total: string;
  receivingMethod: string;
  binanceUid?: string;
  walletAddress?: string;
  paymentMethod: string;
  customerEmail: string;
  time: string;
  paymentProofPath?: string;
}

export async function sendOrderNotification(orderData: TelegramOrderNotification): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !adminChatId) {
    console.error('Telegram bot token or admin chat ID not configured');
    return false;
  }

  try {
    const bot = new Telegraf(botToken);

    // Format the message
    let message = `🆕 NEW CRYPTO ORDER\n\n`;
    message += `**Order ID:** ${orderData.orderId}\n`;
    message += `**Crypto:** ${orderData.crypto}\n`;
    message += `**Network:** ${orderData.network}\n`;
    message += `**Amount:** ${orderData.amount} ${orderData.crypto}\n`;
    message += `**USDT Equivalent:** ${orderData.usdtEquivalent} USDT\n`;
    message += `**Crypto Value:** ${orderData.cryptoValue} ETB\n`;
    message += `**Fee:** ${orderData.fee} ETB\n`;
    message += `**TOTAL:** ${orderData.total} ETB\n`;
    message += `**Receiving Method:** ${orderData.receivingMethod}\n`;
    
    if (orderData.receivingMethod === 'Binance' && orderData.binanceUid) {
      message += `**Binance UID:** ${orderData.binanceUid}\n`;
    } else if (orderData.receivingMethod === 'Wallet Address' && orderData.walletAddress) {
      message += `**Receiving Address:** \`${orderData.walletAddress}\`\n`;
    }
    
    message += `**Payment Method:** ${orderData.paymentMethod}\n`;
    message += `**Customer Email:** ${orderData.customerEmail}\n`;
    message += `**Time:** ${orderData.time}\n`;

    // Send the message
    if (orderData.paymentProofPath && fs.existsSync(orderData.paymentProofPath)) {
      // Send with photo/document
      await bot.telegram.sendPhoto(adminChatId, 
        { source: fs.createReadStream(orderData.paymentProofPath) },
        { caption: message, parse_mode: 'Markdown' }
      );
    } else {
      // Send text only
      await bot.telegram.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}