import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Ethiopian Crypto</h1>
            <Link
              href="/buy"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Buy Crypto
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Buy Crypto in Ethiopia
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Buy USDT, LTC and TRX using Ethiopian Birr through a simple and secure process.
          </p>
          <Link
            href="/buy"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
          >
            Buy Crypto
          </Link>
        </div>

        {/* Supported Assets */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">₮</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">USDT</h3>
            <p className="text-gray-600 mb-2">Tether</p>
            <div className="text-sm text-gray-500">
              <p>TRC20</p>
              <p>BEP20</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-gray-600">Ł</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">LTC</h3>
            <p className="text-gray-600 mb-2">Litecoin</p>
            <div className="text-sm text-gray-500">
              <p>Litecoin Network</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-red-600">◈</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">TRX</h3>
            <p className="text-gray-600 mb-2">TRON</p>
            <div className="text-sm text-gray-500">
              <p>TRC20</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Choose Crypto</h3>
              <p className="text-sm text-gray-600">Select USDT, LTC or TRX</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Choose Network</h3>
              <p className="text-sm text-gray-600">Select the supported network</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Enter Amount</h3>
              <p className="text-sm text-gray-600">Enter how much crypto you want to buy</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Make Payment</h3>
              <p className="text-sm text-gray-600">Pay using CBE or Telebirr and upload proof</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                5
              </div>
              <h3 className="font-semibold mb-2">Receive Crypto</h3>
              <p className="text-sm text-gray-600">Order processed in 5-30 minutes</p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-20 bg-white rounded-xl p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-2">Secure</h3>
              <p className="text-sm text-gray-600">Your transactions are protected with industry-standard security</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Fast</h3>
              <p className="text-sm text-gray-600">Orders processed within 5-30 minutes</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🇪🇹</div>
              <h3 className="font-semibold mb-2">Local</h3>
              <p className="text-sm text-gray-600">Designed specifically for Ethiopian users</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">© 2026 Ethiopian Crypto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}