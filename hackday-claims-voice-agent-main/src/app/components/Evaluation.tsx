"use-client";

import React, { useState, useEffect } from "react";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useProgress } from "@/app/contexts/ProgressContext";

interface EvaluationProps {
  isVisible: boolean;
  onClose: () => void;
  customerType: string;
  onRetry: () => void;
  onNextAgent: () => void;
}

interface EvaluationResult {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  specificExamples: string[];
  recommendations: string[];
  overallAssessment: string;
  problemResolutionScore: number;
  empathyScore: number;
  communicationScore: number;
  professionalismScore: number;
}

function Evaluation({ isVisible, onClose, customerType, onRetry, onNextAgent }: EvaluationProps) {
  const { transcriptItems } = useTranscript();
  const { progress, updateProgress } = useProgress();
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && transcriptItems.length > 0) {
      generateEvaluation();
    }
  }, [isVisible, transcriptItems]);

  const getAgentKey = (customerType: string) => {
    switch (customerType) {
      case 'Auto Claim': return 'customerAutoAgent';
      case 'Confused Elderly': return 'customerConfusedElderlyAgent';
      case 'Customer Service': return 'customerCustomerServiceAgent';
      case 'Home Water Damage': return 'customerHomeWaterAgent';
      case 'House Fire': return 'customerHouseFireAgent';
      case 'Windshield Damage': return 'customerWindshieldDamageAgent';
      default: return 'customerAutoAgent'; // Fallback
    }
  };

  const getNextAgent = (currentAgent: string) => {
    const agents = [
      'customerAutoAgent',
      'customerConfusedElderlyAgent',
      'customerCustomerServiceAgent',
      'customerHomeWaterAgent',
      'customerHouseFireAgent',
      'customerWindshieldDamageAgent'
    ];
    const currentIndex = agents.indexOf(currentAgent);
    return agents[(currentIndex + 1) % agents.length];
  };

  const analyzeConversation = (transcript: any[], customerType: string) => {
    const claimsRepMessages = transcript
      .filter(item => item.type === "MESSAGE" && item.role === "user") // 'user' is the claims rep
      .map(item => item.title);

    const customerMessages = transcript
      .filter(item => item.type === "MESSAGE" && item.role === "assistant")
      .map(item => item.title);

    // Start with a lenient base score of 80/100
    let problemResolutionScore = 20;
    let empathyScore = 20;
    let communicationScore = 20;
    let professionalismScore = 20;
    
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    const specificExamples: string[] = [];
    const recommendations: string[] = [];

    const fullRepTranscript = claimsRepMessages.join(' ').toLowerCase();

    // --- Rudeness Check (Major Penalty) ---
    const rudeWords = ['shut up', 'whatever', 'idiot', 'stupid', 'useless', 'can\'t you understand', 'are you deaf', 'hurry up', 'just do it'];
    let isRude = false;
    for (const word of rudeWords) {
      if (fullRepTranscript.includes(word)) {
        isRude = true;
        const rudeMessage = claimsRepMessages.find(msg => msg.toLowerCase().includes(word));
        if (rudeMessage) {
          specificExamples.push(`"${rudeMessage}" - This phrase is unprofessional and dismissive.`);
        }
        break;
      }
    }

    if (isRude) {
      professionalismScore = 5; // Drastic penalty
      empathyScore = 5;         // Drastic penalty
      areasForImprovement.push("Maintained an unprofessional and rude tone with the customer.");
      recommendations.push("Focus on maintaining a professional demeanor, even with difficult customers. Avoid dismissive or insulting language.");
    } else {
      // --- Bonus Points for Positive Actions ---
      const empathyKeywords = ['i understand', 'i see', 'i can imagine', 'i apologize', 'you\'re right', 'i know this is frustrating'];
      if (empathyKeywords.some(keyword => fullRepTranscript.includes(keyword))) {
        empathyScore = Math.min(25, empathyScore + 5);
        strengths.push("Showed empathy and acknowledged the customer's feelings effectively.");
      } else {
        areasForImprovement.push("Could have used more explicit empathy statements to build rapport.");
        recommendations.push("Try using phrases like 'I understand' or 'I can see why you'd feel that way.'");
      }

      const resolutionKeywords = ['let me check', 'i can help with that', 'what i can do is', 'we can resolve this', 'let\'s fix this'];
      if (resolutionKeywords.some(keyword => fullRepTranscript.includes(keyword))) {
        problemResolutionScore = Math.min(25, problemResolutionScore + 5);
        strengths.push("Took ownership and actively worked towards a solution.");
      } else {
        areasForImprovement.push("Could be more proactive in offering a path to resolution.");
        recommendations.push("Lead the conversation with phrases like 'Here's what I can do for you.'");
      }

      const communicationKeywords = ['to clarify', 'just to confirm', 'let me explain', 'in other words'];
      if (communicationKeywords.some(keyword => fullRepTranscript.includes(keyword))) {
        communicationScore = Math.min(25, communicationScore + 5);
        strengths.push("Used clear language to explain the situation and confirm details.");
      }
      
      const professionalKeywords = ['thank you for your patience', 'i appreciate you', 'certainly', 'absolutely'];
      if (professionalKeywords.some(keyword => fullRepTranscript.includes(keyword))) {
        professionalismScore = Math.min(25, professionalismScore + 5);
        strengths.push("Maintained a positive and professional tone throughout the call.");
      }
    }
    
    if (strengths.length === 0 && !isRude) {
        strengths.push("Handled the call with a neutral and standard approach.");
    }
    if (areasForImprovement.length === 0 && !isRude) {
        areasForImprovement.push("No major areas for improvement noted in this interaction.");
    }

    const overallScore = Math.round(
      (problemResolutionScore + empathyScore + communicationScore + professionalismScore)
    );

    const overallAssessment = isRude
      ? "The interaction was unprofessional. The primary area for improvement is to avoid rude and dismissive language and focus on maintaining a professional demeanor, regardless of the situation."
      : overallScore >= 80
      ? `Excellent work! You handled the ${customerType.toLowerCase()} customer with great skill, scoring ${overallScore}/100. You showed strong professionalism and worked effectively towards a resolution.`
      : `A good effort, but there are areas for improvement. You scored ${overallScore}/100. Review the recommendations to see how you can improve your approach for this customer type.`;
    
    return {
      overallScore,
      strengths,
      areasForImprovement,
      specificExamples,
      recommendations,
      overallAssessment,
      problemResolutionScore,
      empathyScore,
      communicationScore,
      professionalismScore,
    };
  };

  const generateEvaluation = async () => {
    setIsLoading(true);
    
    try {
      // Analyze the actual conversation
      const evaluationResult = analyzeConversation(transcriptItems, customerType);
      
      // Only update progress if we have a real evaluation
      if (evaluationResult && evaluationResult.overallScore > 0) {
        const agentKey = getAgentKey(customerType);
        updateProgress(agentKey, evaluationResult.overallScore);
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEvaluation(evaluationResult);
    } catch (error) {
      console.error('Error generating evaluation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const isPassed = evaluation?.overallScore ? evaluation.overallScore >= 80 : false;
  const agentKey = getAgentKey(customerType);
  const agentProgress = progress[agentKey as keyof typeof progress];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Conversation Evaluation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your conversation with the {customerType.toLowerCase()} customer...</p>
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            {/* Pass/Fail Status */}
            <div className={`p-4 rounded-lg ${isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                {isPassed ? (
                  <div className="w-6 h-6 rounded-full bg-green-600"></div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-600"></div>
                )}
                <div>
                  <h3 className={`text-lg font-semibold ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
                    {isPassed ? 'PASSED!' : 'NEEDS IMPROVEMENT'}
                  </h3>
                  <p className={`text-sm ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
                    {isPassed 
                      ? `Congratulations! You've successfully handled the ${customerType.toLowerCase()} customer.`
                      : `You need a score of 80 or higher to pass. Keep practicing!`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                  {evaluation.overallScore}/100
                </div>
                <div className={`text-lg font-medium ${getScoreColor(evaluation.overallScore)}`}>
                  {getScoreLabel(evaluation.overallScore)}
                </div>
              </div>
              {agentProgress.attempts > 1 && (
                <p className="text-sm text-gray-600 mt-2">
                  Best score: {agentProgress.bestScore}/100 (Attempt {agentProgress.attempts})
                </p>
              )}
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-semibold text-blue-800">Problem Resolution</h4>
                <div className={`text-lg font-bold ${getScoreColor(evaluation.problemResolutionScore)}`}>
                  {evaluation.problemResolutionScore}/25
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-semibold text-green-800">Empathy</h4>
                <div className={`text-lg font-bold ${getScoreColor(evaluation.empathyScore)}`}>
                  {evaluation.empathyScore}/25
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <h4 className="font-semibold text-purple-800">Communication</h4>
                <div className={`text-lg font-bold ${getScoreColor(evaluation.communicationScore)}`}>
                  {evaluation.communicationScore}/25
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <h4 className="font-semibold text-orange-800">Professionalism</h4>
                <div className={`text-lg font-bold ${getScoreColor(evaluation.professionalismScore)}`}>
                  {evaluation.professionalismScore}/25
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">Strengths</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-700">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {evaluation.areasForImprovement.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>

            {/* Specific Examples */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Specific Examples</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {evaluation.specificExamples.map((example, index) => (
                  <li key={index}>
                    {example}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-700">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {evaluation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Overall Assessment */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Overall Assessment</h3>
              <p className="text-gray-700">{evaluation.overallAssessment}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Close
              </button>
              {!isPassed && (
                <button
                  onClick={onRetry}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Try Again
                </button>
              )}
              {isPassed && (
                <button
                  onClick={onNextAgent}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Next Customer Type
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Print Report
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No evaluation available
          </div>
        )}
      </div>
    </div>
  );
}

export default Evaluation; 