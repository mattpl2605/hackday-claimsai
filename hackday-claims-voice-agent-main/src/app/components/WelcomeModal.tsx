"use-client";

import React from "react";
import Image from "next/image";

interface WelcomeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

function WelcomeModal({ isVisible, onClose }: WelcomeModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col items-center gap-3 w-full">
            <Image
              src="/png-transparent-state-farm-logo-horizontal.png"
              alt="State Farm Logo"
              width={250}
              height={75}
              className="h-16 w-auto"
            />
            <h2 className="text-3xl font-bold text-gray-800">Welcome to ClaimAI!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold absolute top-4 right-4"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">How to Use This Training Tool</h3>
            <p className="text-lg leading-relaxed">
              This interactive training tool helps State Farm claims representatives practice handling different types of customer interactions 
              through voice conversations with AI-powered customer personas.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 text-gray-800">Step-by-Step Instructions:</h4>
            <ol className="list-decimal list-inside space-y-3 text-base">
              <li>
                <span className="font-medium">Select a Customer Type:</span> Choose from Angry, Frustrated, or Naive customer personas from the dropdown menu.
              </li>
              <li>
                <span className="font-medium">Start the Conversation:</span> Click "Speak with Customer" to begin your voice interaction.
              </li>
              <li>
                <span className="font-medium">Handle the Customer:</span> Use your voice to communicate with the customer. Speak naturally and address their concerns professionally.
              </li>
              <li>
                <span className="font-medium">End the Conversation:</span> Click "End Conversation" when you feel you've resolved the customer's issue.
              </li>
              <li>
                <span className="font-medium">Review Your Performance:</span> Click "View Evaluation" to see detailed feedback on your customer service skills.
              </li>
              <li>
                <span className="font-medium">Track Your Progress:</span> Complete all three customer types to finish your training. You need a score of 80 or higher to pass each interaction.
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold mb-2 text-blue-800">Evaluation Criteria:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><span className="font-medium">Problem Resolution (25 points):</span> How effectively you address and resolve the customer's issue</li>
              <li><span className="font-medium">Empathy (25 points):</span> Your ability to understand and acknowledge the customer's feelings</li>
              <li><span className="font-medium">Communication (25 points):</span> How clearly and professionally you communicate</li>
              <li><span className="font-medium">Professionalism (25 points):</span> Your overall professional conduct and approach</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-lg font-semibold mb-2 text-yellow-800">Tips for Success:</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Listen carefully to understand the customer's specific concerns</li>
              <li>Use empathetic language to acknowledge their feelings</li>
              <li>Provide clear, actionable solutions</li>
              <li>Maintain a professional and calm demeanor</li>
              <li>Ask clarifying questions when needed</li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="w-48 px-6 py-3 bg-black text-white rounded-lg font-semibold shadow hover:bg-gray-800 transition text-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal; 