import { AddTaskForm } from "./AddTaskForm"

export default function AddOrderPage() {
  return (
    <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6 pl-4">
          <h1 className="text-2xl font-bold text-gray-900">Lavendrie Order</h1>
          <p className="text-sm text-gray-500 mt-1">Lengkapi detail order Laundry-Delivery</p>
        </div>
      <AddTaskForm />
    </div>
  )
}