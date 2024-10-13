import React from 'react';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // Here you would typically use a service to send an email
  // For this example, we'll just log the data and return a success message
  console.log('Sending email with:', { name, email, message });

  // TODO: Implement actual email sending logic here
  // You might want to use a service like SendGrid, Mailgun, or AWS SES

  return json({ success: true, message: 'Your message has been sent successfully!' });
};

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Contact Us</h2>
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full p-2 border rounded text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full p-2 border rounded text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              id="message"
              name="message"
              required
              className="w-full p-2 border rounded text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700"
              rows={4}
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </Form>
        {actionData?.success && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            {actionData.message}
          </div>
        )}
      </div>
    </div>
  );
}
