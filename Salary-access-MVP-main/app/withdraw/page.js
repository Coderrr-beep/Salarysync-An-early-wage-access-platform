export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white border-b px-10 py-6">
        <h1 className="text-2xl font-bold">Withdraw Salary</h1>
        <p className="text-gray-600">
          Access salary you’ve already earned
        </p>
      </header>

      <section className="max-w-xl mx-auto px-10 py-16 space-y-8">

        {/* AMOUNT CARD */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">
            Withdrawal Amount
          </h2>

          <input
            type="number"
            placeholder="Enter amount (₹)"
            defaultValue="5000"
            className="w-full border rounded px-4 py-3 text-lg"
          />

          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Available to withdraw</span>
              <span className="font-medium">₹5,000</span>
            </div>

            <div className="flex justify-between">
              <span>Flat convenience fee</span>
              <span className="font-medium">₹20</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>You receive</span>
              <span>₹4,980</span>
            </div>
          </div>

          <button className="w-full bg-black text-white py-3 rounded text-lg">
            Confirm Withdrawal (Mock)
          </button>
        </div>

        {/* INFO */}
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
          <h3 className="font-semibold mb-2">
            What happens next?
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>₹4,980 is credited instantly (mock)</li>
            <li>No interest or loan involved</li>
            <li>₹5,000 is auto-adjusted on salary day</li>
          </ul>
        </div>

        {/* SUCCESS MOCK */}
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl text-green-700">
          <p className="font-semibold">
            ✅ ₹4,980 credited successfully (mock)
          </p>
        </div>

      </section>
    </main>
  );
}
