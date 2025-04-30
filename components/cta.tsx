import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="py-20 bg-emerald-50">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Simplify Your Meal Planning?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
          Join thousands of people already using NutriPlan to eat healthier, save time, and reduce food waste.
        </p>
        <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg">
          Start Your Free 14-Day Trial
        </Button>
        <p className="mt-4 text-sm text-gray-500">No credit card required</p>
      </div>
    </section>
  )
}
