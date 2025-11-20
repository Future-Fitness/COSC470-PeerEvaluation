export default function Profile() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8">
      <div className="flex-shrink-0">
        <img
          src={`https://placehold.co/200x200`}
          alt="profile"
          className="w-48 h-48 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</h2>
          <span className="text-xl font-medium text-gray-900 dark:text-gray-100">Place Holder</span>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</h2>
          <span className="text-xl font-medium text-gray-900 dark:text-gray-100">placeholder@email.com</span>
        </div>
      </div>
    </div>
  )
}