const testimonials = [
  {
    quote: "NutriPlan has completely transformed how I plan meals. I save time and eat healthier!",
    author: "Sarah Johnson",
    role: "Busy Parent",
  },
  {
    quote:
      "As someone with dietary restrictions, this app has been a lifesaver for finding delicious recipes I can actually eat.",
    author: "Michael Chen",
    role: "Fitness Enthusiast",
  },
  {
    quote: "The grocery list feature alone has saved me countless hours and reduced our food waste significantly.",
    author: "Emily Rodriguez",
    role: "Home Cook",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-lg mb-4 text-gray-800">"{testimonial.quote}"</p>
              <p className="font-semibold text-emerald-500">{testimonial.author}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
