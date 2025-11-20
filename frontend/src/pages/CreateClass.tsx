import { useState } from 'react'
import Button from '../components/Button'
import Textbox from '../components/Textbox'
import { createClass } from '../util/api'

export default function CreateClass() {
  const [name, setName] = useState('')

  const attemptCreateClass = async () => {
    try {
      if (!name) {
        alert('Please enter a class name.');
        return;
      }
      const response = await createClass(name);
      
      if (!response.ok) {
        throw new Error('Failed to create class');
      }

      alert('Class created successfully!');//stay on page - as per Ruth.
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class.');
    }
  };

  return (
    <div className="p-16 w-3/5">
      <h1 className="text-3xl font-bold mb-5 text-gray-900 dark:text-gray-100">Create Class</h1>

      <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Class Name</h2>
      <Textbox onInput={setName} placeholder="Enter class name" />

      <div className="mt-4">
        <Button onClick={() => {
          // Send API req
          attemptCreateClass()
        }}>
          Submit
        </Button>
      </div>
    </div>
  )
}

