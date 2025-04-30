export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to Your Dashboard</h1>
        <div className="bg-emerald-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your First Meal Plan</h2>
          <p className="text-gray-700">
            We've created a personalized meal plan based on your preferences. Explore your meals below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((day) => (
            <div key={day} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-2">Day {day}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="p-2 bg-emerald-50 rounded">Breakfast: Avocado Toast</li>
                <li className="p-2 bg-emerald-50 rounded">Lunch: Quinoa Salad</li>
                <li className="p-2 bg-emerald-50 rounded">Dinner: Grilled Salmon</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
