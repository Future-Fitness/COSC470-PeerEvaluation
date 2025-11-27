import { useState } from 'react'
import Button from '../components/Button'
import Textbox from '../components/Textbox'
import { createClass } from '../util/api'
import { showSuccess, showError } from '../util/toast'

export default function CreateClass() {
  const [name, setName] = useState('')

  const attemptCreateClass = async () => {
    try {
      if (!name) {
        showError('Please enter a class name.');
        return;
      }
      await createClass(name);
      showSuccess('Class created successfullyc!');//stay on page - as per Ruth.
      setName(''); // Clear the input after successful creation
    } catch (error) {
      console.error('Error creating class:', error);
      showError('Error creating class.');
    }
  };

      return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-3xl font-bold mb-5 text-gray-900 dark:text-white">Create Class</h1>
  
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Class Name</h2>
            <Textbox onInput={setName} placeholder="Enter class name" />
  
            <div className="mt-6">
              <Button onClick={() => {
                // Send API req
                attemptCreateClass()
              }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

