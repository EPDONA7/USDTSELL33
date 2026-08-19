'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CRYPTO_CONFIG, calculateOrderTotal, validateMinimumOrder, validateNetworkCombo, generateOrderNumber } from '@/lib/config';

export default function BuyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [receivingMethod, setReceivingMethod] = useState('');
  const [binanceUid, setBinanceUid] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCalculation, setOrderCalculation] = useState<any>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
    setSelectedNetwork('');
    setAmount('');
    setReceivingMethod(''); // Reset receiving method
    setError('');
    setStep(2);
  };

  const handleNetworkSelect = (network: string) => {
    if (!validateNetworkCombo(selectedCrypto, network)) {
      setError('Invalid network combination');
      return;
    }
    setSelectedNetwork(network);
    setReceivingMethod(''); // Reset receiving method when network changes
    setError('');
    setStep(3); // Go to receiving method selection next
  };

  const handleReceivingMethod = (method: string) => {
    setReceivingMethod(method);
    setError('');
    setStep(4); // Go to amount entry after receiving method
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError('');
    
    if (value && !isNaN(parseFloat(value))) {
      try {
        const calculation = calculateOrderTotal(selectedCrypto, value, receivingMethod);
        setOrderCalculation(calculation);
      } catch (err) {
        setOrderCalculation(null);
      }
    } else {
      setOrderCalculation(null);
    }
  };

  const handlePaymentMethod = (method: string) => {
    setPaymentMethod(method);
    setPaymentConfirmed(false); // Reset payment confirmation when payment method changes
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('Please upload a JPG, JPEG, PNG, or PDF file');
        return;
      }

      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }

      setPaymentProof(file);
      setError('');
    }
  };

  const validateStep = () => {
    if (step === 3) {
      // Step 3 is now receiving method selection
      if (!receivingMethod) {
        setError('Please select a receiving method');
        return false;
      }
      setStep(4);
      return true;
    }

    if (step === 4) {
      // Step 4 is now amount entry
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        return false;
      }

      if (!validateMinimumOrder(selectedCrypto, amount, receivingMethod)) {
        const minimum = receivingMethod === 'Wallet Address' ? 10 : 5;
        setError(`Minimum order is ${minimum} USDT equivalent`);
        return false;
      }

      if (!orderCalculation) {
        setError('Unable to calculate order. Please try again.');
        return false;
      }

      setStep(5);
      return true;
    }

    if (step === 5) {
      // Step 5 is now payment method and receiving info
      if (!paymentMethod) {
        setError('Please select a payment method');
        return false;
      }

      if (!paymentConfirmed) {
        setError('Please confirm that you have made the payment');
        return false;
      }

      if (receivingMethod === 'Binance' && !binanceUid.trim()) {
        setError('Please enter your Binance UID');
        return false;
      }

      if (receivingMethod === 'Wallet Address' && !walletAddress.trim()) {
        setError('Please enter your wallet address');
        return false;
      }

      if (receivingMethod === 'Wallet Address') {
        // Basic wallet address validation
        const addressLength = walletAddress.trim().length;
        if (addressLength < 20 || addressLength > 100) {
          setError('Invalid wallet address format');
          return false;
        }
      }

      setStep(6);
      return true;
    }

    if (step === 6) {
      // Step 6 is payment proof and email
      if (!paymentProof) {
        setError('Please upload payment proof');
        return false;
      }

      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }

      handleSubmit();
      return true;
    }

    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('crypto', selectedCrypto);
      formData.append('network', selectedNetwork);
      formData.append('amount', amount);
      formData.append('receivingMethod', receivingMethod);
      formData.append('paymentMethod', paymentMethod);
      formData.append('customerEmail', customerEmail);

      if (receivingMethod === 'Binance') {
        formData.append('binanceUid', binanceUid);
      } else {
        formData.append('walletAddress', walletAddress);
      }

      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      setStep(7); // Move to success step
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const getNetworksForCrypto = (crypto: string) => {
    return CRYPTO_CONFIG.SUPPORTED_CRYPTOS[crypto as keyof typeof CRYPTO_CONFIG.SUPPORTED_CRYPTOS]?.networks || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Ethiopian Crypto
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 7 && <div className={`w-full h-1 mx-2 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Crypto</span>
            <span>Network</span>
            <span>Receive</span>
            <span>Amount</span>
            <span>Payment</span>
            <span>Upload</span>
            <span>Done</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Select Cryptocurrency */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Select Cryptocurrency</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(CRYPTO_CONFIG.SUPPORTED_CRYPTOS).map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => handleCryptoSelect(crypto)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="text-3xl mb-2">
                    {crypto === 'USDT' && '₮'}
                    {crypto === 'LTC' && 'Ł'}
                    {crypto === 'TRX' && '◈'}
                  </div>
                  <h3 className="text-xl font-semibold">{crypto}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {CRYPTO_CONFIG.SUPPORTED_CRYPTOS[crypto as keyof typeof CRYPTO_CONFIG.SUPPORTED_CRYPTOS]?.name}
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    1 {crypto} = {CRYPTO_CONFIG.SUPPORTED_CRYPTOS[crypto as keyof typeof CRYPTO_CONFIG.SUPPORTED_CRYPTOS]?.rate} ETB
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Network */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">Select Network</h2>
            <p className="text-gray-600 mb-6">Selected: {selectedCrypto}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getNetworksForCrypto(selectedCrypto).map((network) => (
                <button
                  key={network}
                  onClick={() => handleNetworkSelect(network)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="text-xl font-semibold">{network}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedCrypto} {network} Network
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={goBack}
              className="mt-6 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Select Receiving Method */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">How would you like to receive your crypto?</h2>
            <p className="text-gray-600 mb-6">
              Selected: {selectedCrypto} - {selectedNetwork}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleReceivingMethod('Binance')}
                className={`p-6 border-2 rounded-xl transition-all text-left ${
                  receivingMethod === 'Binance' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="text-3xl mb-2">🏦</div>
                <h3 className="text-xl font-semibold">Binance</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Receive directly to your Binance account using your Binance ID/UID
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Minimum: 5 USDT equivalent
                </p>
              </button>

              <button
                onClick={() => handleReceivingMethod('Wallet Address')}
                className={`p-6 border-2 rounded-xl transition-all text-left ${
                  receivingMethod === 'Wallet Address' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="text-3xl mb-2">👛</div>
                <h3 className="text-xl font-semibold">Wallet Address</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Receive to your personal wallet address
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Minimum: 10 USDT equivalent
                </p>
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={goBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={validateStep}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Enter Amount */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">Enter Amount</h2>
            <p className="text-gray-600 mb-6">
              {selectedCrypto} - {selectedNetwork} - {receivingMethod}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount in {selectedCrypto}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={`Enter amount in ${selectedCrypto}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.00000001"
                min="0"
              />
            </div>

            {orderCalculation && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Crypto Amount:</span>
                    <span className="font-semibold text-gray-800">{orderCalculation.cryptoAmount} {selectedCrypto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">USDT Equivalent:</span>
                    <span className="font-semibold text-gray-800">{orderCalculation.usdtEquivalent} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Exchange Rate:</span>
                    <span className="text-gray-800">1 {selectedCrypto} = {orderCalculation.exchangeRate} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Crypto Value:</span>
                    <span className="font-semibold text-gray-800">{orderCalculation.baseEtbAmount} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Fee:</span>
                    <span className="font-semibold text-gray-800">{orderCalculation.fee} ETB</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-gray-800">Total to Pay:</span>
                    <span className="font-bold text-lg text-blue-600">{orderCalculation.totalEtbAmount} ETB</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={goBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={validateStep}
                disabled={!orderCalculation}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && orderCalculation && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Complete Your Order</h2>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4 text-gray-800">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Cryptocurrency:</span>
                  <span className="font-semibold text-gray-800">{selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Network:</span>
                  <span className="font-semibold text-gray-800">{selectedNetwork}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Amount:</span>
                  <span className="font-semibold text-gray-800">{orderCalculation.cryptoAmount} {selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Receiving Method:</span>
                  <span className="font-semibold text-gray-800">{receivingMethod}</span>
                </div>
                {receivingMethod === 'Binance' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Binance UID:</span>
                    <span className="font-semibold text-gray-800">{binanceUid}</span>
                  </div>
                )}
                {receivingMethod === 'Wallet Address' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Wallet Address:</span>
                    <span className="font-semibold text-gray-800 text-xs">{walletAddress.slice(0, 20)}...{walletAddress.slice(-10)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">Crypto Value:</span>
                  <span className="font-semibold text-gray-800">{orderCalculation.baseEtbAmount} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Fee:</span>
                  <span className="font-semibold text-gray-800">{orderCalculation.fee} ETB</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-gray-800">Total to Pay:</span>
                  <span className="font-bold text-lg text-blue-600">{orderCalculation.totalEtbAmount} ETB</span>
                </div>
              </div>
            </div>

            {/* Receiving Information */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Receiving Information</h3>
              {receivingMethod === 'Binance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Binance ID / UID
                  </label>
                  <input
                    type="text"
                    value={binanceUid}
                    onChange={(e) => setBinanceUid(e.target.value)}
                    placeholder="Enter your Binance UID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your Binance UID can be found in your Binance profile settings
                  </p>
                </div>
              )}

              {receivingMethod === 'Wallet Address' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedCrypto} {selectedNetwork} Receiving Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={`Enter your ${selectedCrypto} ${selectedNetwork} receiving address`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-2">
                    <p className="font-semibold">⚠️ Important:</p>
                    <p className="text-sm">
                      Make sure your receiving address matches the selected network ({selectedNetwork}). 
                      Sending cryptocurrency to an incompatible network may result in permanent loss.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePaymentMethod('CBE')}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    paymentMethod === 'CBE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <h3 className="text-xl font-semibold">Commercial Bank of Ethiopia</h3>
                  <p className="text-gray-600 text-sm mt-2">Account Name: FIKER MARIAM HAILU</p>
                  <p className="text-gray-600 text-sm">Account Number: 1000524101967</p>
                </button>

                <button
                  onClick={() => handlePaymentMethod('TELEBIRR')}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    paymentMethod === 'TELEBIRR' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <h3 className="text-xl font-semibold">Telebirr</h3>
                  <p className="text-gray-600 text-sm mt-2">Account Name: FIKER MARIAM HALIU</p>
                  <p className="text-gray-600 text-sm">Phone Number: 0910794006</p>
                </button>
              </div>
            </div>

            {paymentMethod && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                <p className="font-semibold">⚠️ Important:</p>
                <p className="text-sm mb-2">
                  Please send exactly <strong>{orderCalculation.totalEtbAmount} ETB</strong> to:
                </p>
                {paymentMethod === 'CBE' && (
                  <div className="mt-2 text-sm">
                    <p><strong>Bank:</strong> Commercial Bank of Ethiopia (CBE)</p>
                    <p><strong>Account Name:</strong> FIKER MARIAM HAILU</p>
                    <p><strong>Account Number:</strong> 1000524101967</p>
                  </div>
                )}
                {paymentMethod === 'TELEBIRR' && (
                  <div className="mt-2 text-sm">
                    <p><strong>Service:</strong> Telebirr</p>
                    <p><strong>Account Name:</strong> FIKER MARIAM HALIU</p>
                    <p><strong>Phone Number:</strong> 0910794006</p>
                  </div>
                )}
                <div className="mt-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-semibold">
                      I have sent the payment
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={goBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={validateStep}
                disabled={!paymentConfirmed}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Payment Proof and Email */}
        {step === 6 && orderCalculation && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Final Step: Upload Payment Proof</h2>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4 text-gray-800">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Cryptocurrency:</span>
                  <span className="font-semibold text-gray-800">{selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Network:</span>
                  <span className="font-semibold text-gray-800">{selectedNetwork}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Amount:</span>
                  <span className="font-semibold text-gray-800">{orderCalculation.cryptoAmount} {selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Receiving Method:</span>
                  <span className="font-semibold text-gray-800">{receivingMethod}</span>
                </div>
                {receivingMethod === 'Binance' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Binance UID:</span>
                    <span className="font-semibold text-gray-800">{binanceUid}</span>
                  </div>
                )}
                {receivingMethod === 'Wallet Address' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Wallet Address:</span>
                    <span className="font-semibold text-gray-800 text-xs">{walletAddress.slice(0, 20)}...{walletAddress.slice(-10)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">Payment Method:</span>
                  <span className="font-semibold text-gray-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total to Pay:</span>
                  <span className="font-semibold text-lg text-blue-600">{orderCalculation.totalEtbAmount} ETB</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Your Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You will receive an email when your order is completed
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Proof Upload */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Upload Payment Screenshot</h3>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: JPG, JPEG, PNG, PDF (max 5MB)
              </p>
              {paymentProof && (
                <div className="mt-2 text-green-600">
                  ✓ File selected: {paymentProof.name}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={goBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={validateStep}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Success Confirmation */}
        {step === 7 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Submitted Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your order is being processed. It will normally be completed within 5–30 minutes. You will receive an email once your order has been completed.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}