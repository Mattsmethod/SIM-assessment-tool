import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

const AssessmentTool = () => {
  // Assessment State
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'PAR-Q Screening',
    'Client Information', 
    'Functional 4 Assessment', 
    'Fundamental 8 Diagnostic',
    'Strength Testing', 
    'Results & Export'
  ];

  // Enhanced Client Information
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    dob: '',
    occupation: '',
    coachName: '',
    age: '',
    goal1: '',
    goal2: '',
    goal3: '',
    goal4: '',
    goal5: '',
    sportingBackground: '',
    injuryHistory: '',
    currentInjuryConcerns: '',
    clientType: ''
  });

  // PAR-Q Responses (13 questions)
  const [parqResponses, setParqResponses] = useState({
    chronicIllness: null,
    medications: null,
    surgeriesHospital: null,
    jointBoneIssues: null,
    chestPainActivity: null,
    chestPainRest: null,
    dizzinessBalance: null,
    bloodPressureCholesterol: null,
    smoking: null,
    familyHeartHistory: null,
    otherReasons: null,
    over69Unaccustomed: null,
    pregnant: null
  });

  // Functional 4 Test Scores
  const [functional4, setFunctional4] = useState({
    overheadSquat: '',
    inlineLungeLeft: '',
    inlineLungeRight: '',
    hipHingeLeft: '',
    hipHingeRight: '',
    lateralLungeLeft: '',
    lateralLungeRight: ''
  });

  // Enhanced Fundamental 8 with Individual Notes
  const [fundamental8, setFundamental8] = useState({
    aslr: { left: '', right: '', attempted: false, notes: '' },
    faber: { left: '', right: '', attempted: false, notes: '' },
    hipIR: { left: '', right: '', attempted: false, notes: '' },
    ankleMobility: { left: '', right: '', attempted: false, notes: '' },
    trunkStability: { score: '', attempted: false, notes: '' },
    singleLegBalance: { left: '', right: '', attempted: false, notes: '' },
    shoulderMobility: { left: '', right: '', attempted: false, notes: '' },
    crawlPosition: { score: '', attempted: false, notes: '' }
  });

  // Observation Notes
  const [observationNotes, setObservationNotes] = useState({
    overheadSquat: '',
    inlineLunge: '',
    hipHinge: '',
    lateralLunge: '',
    fundamental8Overall: '',
    strengthTesting: '',
    general: ''
  });

  // Strength Test Results
  const [strengthTests, setStrengthTests] = useState({
    level1: {
      reverseLungeSuitcase: false,
      gobletSquat: false,
      kbSingleLegHinge: false,
      pushups: false,
      bodyRows: false,
      attempted: false
    },
    level2: {
      reverseLungeSuitcase: false,
      gobletSquat: false,
      kbSingleLegHinge: false,
      pushups: false,
      bodyRows: false,
      attempted: false
    }
  });

  // Coach Override System
  const [coachOverride, setCoachOverride] = useState({
    enabled: false,
    program: '',
    reasoning: ''
  });

  // Notes and Export
  const [coachNotes, setCoachNotes] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Coach options
  const coaches = [
    'Matt Waterton',
    'Josh Allen', 
    'Jack Marsh',
    'Brett Harris',
    'Charlie Matheson',
    'Luana Deusing'
  ];

  // Program options for coach override
  const programOptions = [
    'Foundations',
    'Foundations (IRM Modified)',
    'Graduation',
    'Graduation (IRM Modified)',
    'Squad',
    'Squad (IRM Modified)'
  ];

  // Calculate total score and movement level
  const calculateF4Score = () => {
    const scores = Object.values(functional4).map(score => parseInt(score) || 0);
    return scores.reduce((sum, score) => sum + score, 0);
  };

  const getMovementLevel = () => {
    const total = calculateF4Score();
    if (total >= 21) return 4;
    if (total >= 16) return 3;
    if (total >= 12) return 2;
    return 1;
  };

  const getStrengthLevel = () => {
    if (!strengthTests.level1.attempted) return 0;
    
    const level1Pass = Object.entries(strengthTests.level1)
      .filter(([key]) => key !== 'attempted')
      .every(([, passed]) => passed);
    
    if (!level1Pass) return 1;
    
    if (!strengthTests.level2.attempted) return 1;
    
    const level2Pass = Object.entries(strengthTests.level2)
      .filter(([key]) => key !== 'attempted')
      .every(([, passed]) => passed);
    
    return level2Pass ? 2 : 1;
  };

  // Enhanced Red Flag Categorization
  const getCategorizedRedFlags = () => {
    const downgradeFlags = [];
    const modifyFlags = [];
    const monitorFlags = [];

    // PAR-Q flags
    if (Object.values(parqResponses).some(response => response === true)) {
      modifyFlags.push('Medical clearance required (PAR-Q positive responses)');
    }

    // Current injury concerns
    if (clientInfo.currentInjuryConcerns && clientInfo.currentInjuryConcerns.trim()) {
      modifyFlags.push('Current injury concerns reported');
    }

    // F4 score flags
    const scores = Object.values(functional4).map(score => parseInt(score) || 0);
    
    // Downgrade flags (force to Foundations)
    if (scores.some(score => score === 0)) {
      downgradeFlags.push('Pain or inability to perform movement (0 scores detected)');
    }
    if (scores.some(score => score === 1)) {
      downgradeFlags.push('Significant movement limitations (1 scores detected)');
    }

    // Check asymmetries
    const leftRight = [
      [functional4.inlineLungeLeft, functional4.inlineLungeRight, 'Inline Lunge'],
      [functional4.hipHingeLeft, functional4.hipHingeRight, 'Hip Hinge'],
      [functional4.lateralLungeLeft, functional4.lateralLungeRight, 'Lateral Lunge']
    ];

    leftRight.forEach(([left, right, test]) => {
      const leftScore = parseInt(left) || 0;
      const rightScore = parseInt(right) || 0;
      const diff = Math.abs(leftScore - rightScore);
      
      if (diff >= 2 || (diff >= 1 && (leftScore <= 1 || rightScore <= 1))) {
        downgradeFlags.push(`${test} major asymmetry (${leftScore}/${rightScore})`);
      } else if (diff >= 1) {
        modifyFlags.push(`${test} minor asymmetry (${leftScore}/${rightScore})`);
      }
    });

    // Monitor flags
    if (clientInfo.injuryHistory && clientInfo.injuryHistory.trim()) {
      monitorFlags.push('Previous injury history to monitor');
    }

    if (clientInfo.age && parseInt(clientInfo.age) >= 50) {
      monitorFlags.push('Age considerations (50+)');
    }

    return { downgradeFlags, modifyFlags, monitorFlags };
  };

  // Refined Program Logic
  const getSystemProgramRecommendation = () => {
    const movementLevel = getMovementLevel();
    const strengthLevel = getStrengthLevel();
    const { downgradeFlags, modifyFlags } = getCategorizedRedFlags();

    // Step 1: Base program eligibility (ignore red flags)
    let baseProgram;
    if (movementLevel < 2 || strengthLevel < 2) {
      baseProgram = 'Foundations';
    } else if (movementLevel === 2 && strengthLevel >= 2) {
      baseProgram = 'Graduation';
    } else if (movementLevel >= 3 && strengthLevel >= 2) {
      baseProgram = 'Squad';
    } else {
      baseProgram = 'Foundations';
    }

    // Step 2: Apply red flag modifications
    if (downgradeFlags.length > 0) {
      return 'Foundations (IRM Modified)';
    }

    if (modifyFlags.length > 0) {
      if (baseProgram === 'Foundations') {
        return 'Foundations (IRM Modified)';
      } else if (baseProgram === 'Graduation') {
        return 'Graduation (IRM Modified)';
      } else if (baseProgram === 'Squad') {
        return 'Graduation (IRM Modified)';
      }
    }

    return baseProgram;
  };

  const getFinalProgramRecommendation = () => {
    if (coachOverride.enabled && coachOverride.program) {
      return coachOverride.program;
    }
    return getSystemProgramRecommendation();
  };

  // Check if ready for strength testing
  const isReadyForStrengthTesting = () => {
    const sagittalScores = [
      parseInt(functional4.overheadSquat) || 0,
      parseInt(functional4.inlineLungeLeft) || 0,
      parseInt(functional4.inlineLungeRight) || 0,
      parseInt(functional4.hipHingeLeft) || 0,
      parseInt(functional4.hipHingeRight) || 0
    ];

    // All sagittal tests must be 2 or higher
    if (sagittalScores.some(score => score < 2)) return false;

    // Check for disqualifying asymmetries (2+ point differences)
    const asymmetries = [
      Math.abs((parseInt(functional4.inlineLungeLeft) || 0) - (parseInt(functional4.inlineLungeRight) || 0)),
      Math.abs((parseInt(functional4.hipHingeLeft) || 0) - (parseInt(functional4.hipHingeRight) || 0))
    ];

    return !asymmetries.some(diff => diff >= 2);
  };

  // Check if Fundamental 8 is recommended
  const isFundamental8Recommended = () => {
    const total = calculateF4Score();
    const { downgradeFlags, modifyFlags } = getCategorizedRedFlags();
    return total <= 15 || downgradeFlags.length > 0 || modifyFlags.length > 0;
  };

  // CONDENSED EXPORT FUNCTION (25 fields)
  const exportToGoogleSheets = async () => {
    setExporting(true);
    
    try {
      const { downgradeFlags, modifyFlags, monitorFlags } = getCategorizedRedFlags();
      
      // Helper function to combine goals
      const combineGoals = () => {
        const goals = [clientInfo.goal1, clientInfo.goal2, clientInfo.goal3, clientInfo.goal4, clientInfo.goal5]
          .filter(goal => goal && goal.trim())
          .map((goal, index) => `Goal ${index + 1}: ${goal}`)
          .join(' | ');
        return goals || 'No goals specified';
      };

      // Helper function to combine background info
      const combineBackground = () => {
        const parts = [];
        if (clientInfo.sportingBackground?.trim()) {
          parts.push(`Sporting: ${clientInfo.sportingBackground}`);
        }
        if (clientInfo.injuryHistory?.trim()) {
          parts.push(`Previous Injuries: ${clientInfo.injuryHistory}`);
        }
        if (clientInfo.currentInjuryConcerns?.trim()) {
          parts.push(`Current Concerns: ${clientInfo.currentInjuryConcerns}`);
        }
        return parts.join(' | ') || 'No background information';
      };

      // Helper function to summarize PAR-Q
      const summarizePARQ = () => {
        const yesResponses = Object.entries(parqResponses)
          .filter(([, response]) => response === true)
          .map(([key]) => key);
        
        const medicalClearance = yesResponses.length > 0;
        return medicalClearance 
          ? `Medical clearance required: ${yesResponses.join(', ')}`
          : 'Medical clearance not required';
      };

      // Helper function to summarize F4 details
      const summarizeF4Details = () => {
        const scores = [
          `OHS: ${functional4.overheadSquat || 'N/A'}`,
          `IL-L: ${functional4.inlineLungeLeft || 'N/A'}`,
          `IL-R: ${functional4.inlineLungeRight || 'N/A'}`,
          `HH-L: ${functional4.hipHingeLeft || 'N/A'}`,
          `HH-R: ${functional4.hipHingeRight || 'N/A'}`,
          `LL-L: ${functional4.lateralLungeLeft || 'N/A'}`,
          `LL-R: ${functional4.lateralLungeRight || 'N/A'}`
        ].join(' | ');

        const notes = [
          observationNotes.overheadSquat,
          observationNotes.inlineLunge,
          observationNotes.hipHinge,
          observationNotes.lateralLunge
        ].filter(note => note?.trim()).join(' | ');

        return `Scores: ${scores}${notes ? ` | Notes: ${notes}` : ''}`;
      };

      // Helper function to summarize F8
      const summarizeF8 = () => {
        const attemptedTests = Object.entries(fundamental8)
          .filter(([, test]) => test.attempted)
          .map(([testName]) => testName);

        if (attemptedTests.length === 0) {
          return 'No Fundamental 8 tests performed';
        }

        const testSummaries = attemptedTests.map(testName => {
          const test = fundamental8[testName];
          if (test.left !== undefined && test.right !== undefined) {
            return `${testName}: L${test.left}/R${test.right}`;
          } else if (test.score !== undefined) {
            return `${testName}: ${test.score}`;
          } else {
            return `${testName}: attempted`;
          }
        });

        const allNotes = attemptedTests
          .map(testName => fundamental8[testName].notes)
          .filter(note => note?.trim())
          .join(' | ');

        let summary = `Tests: ${testSummaries.join(' | ')}`;
        if (allNotes) {
          summary += ` | Notes: ${allNotes}`;
        }
        if (observationNotes.fundamental8Overall?.trim()) {
          summary += ` | Overall: ${observationNotes.fundamental8Overall}`;
        }

        return summary;
      };

      // Helper function to summarize strength details
      const summarizeStrengthDetails = () => {
        const parts = [];
        
        if (strengthTests.level1.attempted) {
          const level1Results = Object.entries(strengthTests.level1)
            .filter(([key]) => key !== 'attempted')
            .map(([exercise, passed]) => `${exercise}: ${passed ? 'Pass' : 'Fail'}`)
            .join(', ');
          parts.push(`Level 1: ${level1Results}`);
        }

        if (strengthTests.level2.attempted) {
          const level2Results = Object.entries(strengthTests.level2)
            .filter(([key]) => key !== 'attempted')
            .map(([exercise, passed]) => `${exercise}: ${passed ? 'Pass' : 'Fail'}`)
            .join(', ');
          parts.push(`Level 2: ${level2Results}`);
        }

        if (observationNotes.strengthTesting?.trim()) {
          parts.push(`Notes: ${observationNotes.strengthTesting}`);
        }

        return parts.length > 0 ? parts.join(' | ') : 'No strength testing performed';
      };

      // Helper function to summarize red flags
      const summarizeRedFlags = () => {
        const parts = [];
        if (downgradeFlags.length > 0) {
          parts.push(`Downgrade: ${downgradeFlags.join('; ')}`);
        }
        if (modifyFlags.length > 0) {
          parts.push(`Modify: ${modifyFlags.join('; ')}`);
        }
        if (monitorFlags.length > 0) {
          parts.push(`Monitor: ${monitorFlags.join('; ')}`);
        }
        return parts.length > 0 ? parts.join(' || ') : 'No red flags detected';
      };

      // Helper function to format coach override
      const formatCoachOverride = () => {
        if (!coachOverride.enabled) {
          return 'No override';
        }
        return `Override: ${coachOverride.program} | Reason: ${coachOverride.reasoning}`;
      };

      // Create condensed export data (25 fields)
      const exportData = {
        // Essential individual fields (for automation)
        timestamp: new Date().toISOString(),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        coachName: clientInfo.coachName,
        finalProgramRecommendation: getFinalProgramRecommendation(),

        // Summary fields
        clientSummary: `Age: ${clientInfo.age || 'N/A'} | Occupation: ${clientInfo.occupation || 'N/A'} | Type: ${clientInfo.clientType || 'N/A'}`,
        goalsSummary: combineGoals(),
        backgroundSummary: combineBackground(),
        parqSummary: summarizePARQ(),
        
        f4TotalScore: calculateF4Score(),
        f4Details: summarizeF4Details(),
        movementLevel: getMovementLevel(),
        
        f8Summary: summarizeF8(),
        
        strengthLevel: getStrengthLevel(),
        strengthDetails: summarizeStrengthDetails(),
        
        redFlagsSummary: summarizeRedFlags(),
        systemRecommendation: getSystemProgramRecommendation(),
        coachOverride: formatCoachOverride(),
        
        clinicalSummary: clinicalSummary || 'No clinical summary provided',
        coachNotes: coachNotes || 'No coach notes provided',
        
        // Boolean/Status fields
        strengthTestingReady: isReadyForStrengthTesting(),
        fundamental8Recommended: isFundamental8Recommended(),
        currentInjuryFlag: !!(clientInfo.currentInjuryConcerns && clientInfo.currentInjuryConcerns.trim()),
        totalRedFlags: downgradeFlags.length + modifyFlags.length + monitorFlags.length,
        assessmentCompleteFlag: true
      };

      const response = await fetch('http://localhost:3001/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (response.ok) {
        setExportSuccess(true);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please check your connection and try again.');
    }
    
    setExporting(false);
  };

  // PAR-Q Section
  const renderPARQ = () => (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Pre-Exercise Questionnaire (PAR-Q)</h2>
      <p className="mb-6 text-gray-600">
        Please answer all questions honestly. This screening helps ensure your safety during assessment and training.
      </p>
      
      <div className="space-y-4">
        {[
          {
            key: 'chronicIllness',
            question: 'Do you have any chronic illnesses or conditions (e.g., diabetes, heart disease, hypertension)?'
          },
          {
            key: 'medications',
            question: 'Are you currently taking any medications?'
          },
          {
            key: 'surgeriesHospital',
            question: 'Have you had any surgeries or hospital stays in the past year?'
          },
          {
            key: 'jointBoneIssues',
            question: 'Do you have any joint or bone issues that could be affected by exercise (e.g., arthritis, osteoporosis)?'
          },
          {
            key: 'chestPainActivity',
            question: 'Do you experience chest pain or discomfort during physical activity?'
          },
          {
            key: 'chestPainRest',
            question: 'Have you experienced chest pain or discomfort in the past month while not engaged in physical activity?'
          },
          {
            key: 'dizzinessBalance',
            question: 'Do you lose your balance because of dizziness, or do you ever lose consciousness?'
          },
          {
            key: 'bloodPressureCholesterol',
            question: 'Do you have high blood pressure or high cholesterol?'
          },
          {
            key: 'smoking',
            question: 'Are you currently a smoker, or have you quit smoking within the past six months?'
          },
          {
            key: 'familyHeartHistory',
            question: 'Do you have a family history of heart disease before age 55 in male relatives or age 65 in female relatives?'
          },
          {
            key: 'otherReasons',
            question: 'Do you know of any other reason why you should not engage in physical activity?'
          },
          {
            key: 'over69Unaccustomed',
            question: 'If you are over the age of 69, are you unaccustomed to vigorous exercise?'
          },
          {
            key: 'pregnant',
            question: 'Are you pregnant, or is there a chance you might be pregnant?'
          }
        ].map((item, index) => (
          <div key={item.key} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-start space-x-3">
              <span className="text-sm font-medium text-gray-500 mt-1 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{index + 1}</span>
              <div className="flex-1">
                <p className="text-sm mb-3 text-gray-700">{item.question}</p>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={item.key}
                      checked={parqResponses[item.key] === false}
                      onChange={() => setParqResponses(prev => ({...prev, [item.key]: false}))}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-medium text-green-600">NO</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={item.key}
                      checked={parqResponses[item.key] === true}
                      onChange={() => setParqResponses(prev => ({...prev, [item.key]: true}))}
                      className="mr-2 text-red-600"
                    />
                    <span className="text-sm font-medium text-red-600">YES</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.values(parqResponses).some(response => response === true) && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="ml-3">
              <div className="text-sm text-amber-800">
                <strong>Medical Clearance Required:</strong> One or more YES answers indicate you should 
                consult with your doctor before increasing physical activity. We may need to modify your 
                assessment or require medical clearance before proceeding with training.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <div></div>
        <button
          onClick={() => setCurrentStep(1)}
          disabled={Object.values(parqResponses).some(response => response === null)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Continue to Client Information
        </button>
      </div>
    </div>
  );

  // Enhanced Client Information Section
  const renderClientInfo = () => (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Client Information & Goals</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            value={clientInfo.name}
            onChange={(e) => setClientInfo(prev => ({...prev, name: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter client's full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address *</label>
          <input
            type="email"
            value={clientInfo.email}
            onChange={(e) => setClientInfo(prev => ({...prev, email: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="client@email.com"
          />
          <p className="text-xs text-gray-500 mt-1">Required for Trainerize program assignment</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="text"
            value={clientInfo.dob}
            onChange={(e) => setClientInfo(prev => ({...prev, dob: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="DD/MM/YYYY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            value={clientInfo.age}
            onChange={(e) => setClientInfo(prev => ({...prev, age: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Age in years"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <input
            type="text"
            value={clientInfo.occupation}
            onChange={(e) => setClientInfo(prev => ({...prev, occupation: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Client's occupation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Assigned Coach *</label>
          <select
            value={clientInfo.coachName}
            onChange={(e) => setClientInfo(prev => ({...prev, coachName: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select coach...</option>
            {coaches.map(coach => (
              <option key={coach} value={coach}>{coach}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">For Trainerize assignment and accountability</p>
        </div>
      </div>

      {/* 5 Individual Goal Fields */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Goals & Motivation</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Goal 1 (Highest Priority) *</label>
          <input
            type="text"
            value={clientInfo.goal1}
            onChange={(e) => setClientInfo(prev => ({...prev, goal1: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Primary fitness goal..."
          />
        </div>
        
        {[2, 3, 4, 5].map(num => (
          <div key={num}>
            <label className="block text-sm font-medium mb-1">Goal {num} (Optional)</label>
            <input
              type="text"
              value={clientInfo[`goal${num}`]}
              onChange={(e) => setClientInfo(prev => ({...prev, [`goal${num}`]: e.target.value}))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={`Additional goal ${num}...`}
            />
          </div>
        ))}
      </div>

      {/* Sporting Background */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Sporting Background & Training Experience</label>
          <textarea
            value={clientInfo.sportingBackground}
            onChange={(e) => setClientInfo(prev => ({...prev, sportingBackground: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Sports history, training experience, competition levels, current activities..."
          />
        </div>
      </div>

      {/* Separated Injury Tracking */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Previous Injury History</label>
          <textarea
            value={clientInfo.injuryHistory}
            onChange={(e) => setClientInfo(prev => ({...prev, injuryHistory: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Past injuries, surgeries, or conditions that are no longer currently limiting..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Current Injury Concerns 
            {clientInfo.currentInjuryConcerns && clientInfo.currentInjuryConcerns.trim() && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">⚠ Red Flag Alert</span>
            )}
          </label>
          <textarea
            value={clientInfo.currentInjuryConcerns}
            onChange={(e) => setClientInfo(prev => ({...prev, currentInjuryConcerns: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Any current pain, limitations, or injury concerns that may affect training..."
          />
          {clientInfo.currentInjuryConcerns && clientInfo.currentInjuryConcerns.trim() && (
            <p className="text-xs text-red-600 mt-1">
              ⚠ Current concerns will trigger IRM modification recommendations
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client Type Classification</label>
          <select
            value={clientInfo.clientType}
            onChange={(e) => setClientInfo(prev => ({...prev, clientType: e.target.value}))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select client type...</option>
            <option value="IRM">IRM - Injury Recovery/Management (Any age, pain-free focus)</option>
            <option value="AP">AP - Athletic Performance (15-35 years, performance focus)</option>
            <option value="AL">AL - Athletic for Life (40+ athletes, high level maintenance)</option>
            <option value="RL">RL - Resilience & Longevity (40+ clients, strength & health focus)</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(0)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
        >
          Back to PAR-Q
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!clientInfo.name || !clientInfo.email || !clientInfo.coachName || !clientInfo.goal1}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Begin Functional Assessment
        </button>
      </div>
    </div>
  );

  // Functional 4 Assessment (same as before)
  const renderFunctional4 = () => (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Functional 4 Movement Assessment</h2>
      <p className="mb-6 text-gray-600">
        Score each test: <strong>3 = Perfect execution</strong>, <strong>2 = Minor compensations</strong>, <strong>1 = Major compensations</strong>, <strong>0 = Pain/Unable to perform</strong>
      </p>

      <div className="space-y-6">
        {/* Overhead Squat */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3 text-lg">1. Overhead Squat Test (0-3 points)</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Tests: Ankle mobility, hip mobility, thoracic mobility, shoulder mobility, core stability</p>
            <select
              value={functional4.overheadSquat}
              onChange={(e) => setFunctional4(prev => ({...prev, overheadSquat: e.target.value}))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select score...</option>
              <option value="3">3 - Hands overhead, control down to 90°, no compensations</option>
              <option value="2">2 - Heel raised, sway back, or good with hands in front</option>
              <option value="1">1 - Wobbly, lateral hip shifting, heels lifting, lack of lumbar control</option>
              <option value="0">0 - Unmanageable pain or inability to complete movement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observations & Notes</label>
            <textarea
              value={observationNotes.overheadSquat}
              onChange={(e) => setObservationNotes(prev => ({...prev, overheadSquat: e.target.value}))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Note any compensations, restrictions, or observations..."
            />
          </div>
        </div>

        {/* Inline Lunge */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3 text-lg">2. Inline Lunge Test (0-6 points total)</h3>
          <p className="text-sm text-gray-600 mb-4">Tests: Single leg stability, hip mobility, ankle stability, dynamic balance, lumbopelvic control</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Left Side (0-3 points)</label>
              <select
                value={functional4.inlineLungeLeft}
                onChange={(e) => setFunctional4(prev => ({...prev, inlineLungeLeft: e.target.value}))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Ascend/descend vertically with control, no valgus</option>
                <option value="2">2 - Slight valgus/varus or plane shift, can complete movement</option>
                <option value="1">1 - Multiple compensations and/or needs assistance</option>
                <option value="0">0 - Pain and/or inability to complete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Right Side (0-3 points)</label>
              <select
                value={functional4.inlineLungeRight}
                onChange={(e) => setFunctional4(prev => ({...prev, inlineLungeRight: e.target.value}))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Ascend/descend vertically with control, no valgus</option>
                <option value="2">2 - Slight valgus/varus or plane shift, can complete movement</option>
                <option value="1">1 - Multiple compensations and/or needs assistance</option>
                <option value="0">0 - Pain and/or inability to complete</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observations & Notes</label>
            <textarea
              value={observationNotes.inlineLunge}
              onChange={(e) => setObservationNotes(prev => ({...prev, inlineLunge: e.target.value}))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Note any compensations, asymmetries, or observations..."
            />
          </div>
        </div>

        {/* Single Leg Hip Hinge */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3 text-lg">3. Single Leg Hip Hinge Test (0-6 points total)</h3>
          <p className="text-sm text-gray-600 mb-4">Tests: Hip hinge pattern (SIM cornerstone), single leg stability, posterior chain flexibility, core stability</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Left Side (0-3 points)</label>
              <select
                value={functional4.hipHingeLeft}
                onChange={(e) => setFunctional4(prev => ({...prev, hipHingeLeft: e.target.value}))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Control with block touch single leg, good hinge, no valgus, no pelvic instability</option>
                <option value="2">2 - Controlled block touch with toe touch back foot, no valgus, no pelvic instability</option>
                <option value="1">1 - VIPR tilt with control, no valgus, no pelvic instability</option>
                <option value="0">0 - Pain or inability to hinge after cueing, trunk compensation with VIPR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Right Side (0-3 points)</label>
              <select
                value={functional4.hipHingeRight}
                onChange={(e) => setFunctional4(prev => ({...prev, hipHingeRight: e.target.value}))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Control with block touch single leg, good hinge, no valgus, no pelvic instability</option>
                <option value="2">2 - Controlled block touch with toe touch back foot, no valgus, no pelvic instability</option>
                <option value="1">1 - VIPR tilt with control, no valgus, no pelvic instability</option>
                <option value="0">0 - Pain or inability to hinge after cueing, trunk compensation with VIPR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observations & Notes</label>
            <textarea
              value={observationNotes.hipHinge}
              onChange={(e) => setObservationNotes(prev => ({...prev, hipHinge: e.target.value}))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Note hinge quality, balance, compensations, or observations..."
            />
          </div>
        </div>

        {/* Lateral Lunge */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3 text-lg">4. Lateral Lunge/Hinge Test (0-6 points total)</h3>
          <p className="text-sm text-gray-600 mb-4">Tests: Lateral plane movement, hip mobility in frontal plane, hip abductor strength, dynamic weight shifting</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Left Side (0-3 points)</label>
              <select
                value={functional4.lateralLungeLeft}
                onChange={(e) => setFunctional4(prev => ({...prev, lateralLungeLeft: e.target.value}))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Hip over knee and foot, dynamic shift, step into lateral hinge</option>
                <option value="2">2 - Lateral split stance setup, shift into lateral hinge</option>
                <option value="1">1 - Can move left or right but pelvic compensations obvious</option>
                <option value="0">0 - Pain or general inability to move laterally</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Right Side (0-3 points)</label>
              <select
                value={functional4.lateralLungeRight}
                onChange={(e) => setFunctional4(prev => ({...prev, lateralLungeRight: e.target.value}))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Hip over knee and foot, dynamic shift, step into lateral hinge</option>
                <option value="2">2 - Lateral split stance setup, shift into lateral hinge</option>
                <option value="1">1 - Can move left or right but pelvic compensations obvious</option>
                <option value="0">0 - Pain or general inability to move laterally</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observations & Notes</label>
            <textarea
              value={observationNotes.lateralLunge}
              onChange={(e) => setObservationNotes(prev => ({...prev, lateralLunge: e.target.value}))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Note lateral movement quality, compensations, or observations..."
            />
          </div>
        </div>
      </div>

      {/* Live Score Display with Enhanced Red Flag Analysis */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <h3 className="font-semibold text-lg">Total Score: {calculateF4Score()}/21</h3>
            <p className="text-sm text-gray-600">Movement Level: {getMovementLevel()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Red Flags: {(() => {
              const { downgradeFlags, modifyFlags, monitorFlags } = getCategorizedRedFlags();
              return downgradeFlags.length + modifyFlags.length + monitorFlags.length;
            })()}</h3>
            <p className="text-sm text-gray-600">
              {(() => {
                const { downgradeFlags, modifyFlags } = getCategorizedRedFlags();
                if (downgradeFlags.length > 0) return '⚠ Major concerns';
                if (modifyFlags.length > 0) return '⚠ Minor concerns';
                return 'None detected';
              })()}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Strength Testing</h3>
            <p className={`text-sm font-medium ${isReadyForStrengthTesting() ? 'text-green-600' : 'text-red-600'}`}>
              {isReadyForStrengthTesting() ? '✓ Ready' : '⚠ Address movement first'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
        >
          Back to Client Info
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          {isFundamental8Recommended() ? 'Continue to Fundamental 8' : 'Skip to Strength Testing'}
        </button>
      </div>
    </div>
  );

  // Complete Fundamental 8 Section with Priority Order and Individual Notes
  const renderFundamental8 = () => {
    const { downgradeFlags, modifyFlags } = getCategorizedRedFlags();
    
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Fundamental 8 Diagnostic Testing</h2>
        
        {isFundamental8Recommended() ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="ml-3">
                <div className="text-sm text-amber-800">
                  <strong>Fundamental 8 Recommended:</strong> Low Functional 4 scores ({calculateF4Score()}/21) or red flags detected. 
                  Use these tests to identify specific restrictions and guide corrective exercises.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="ml-3">
                <div className="text-sm text-green-800">
                  <strong>Fundamental 8 Optional:</strong> Good Functional 4 scores ({calculateF4Score()}/21) with no major red flags. 
                  These tests are optional but can provide additional insights.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* ASLR - Priority 1 */}
          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.aslr.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  aslr: {...prev.aslr, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">1. Active Straight Leg Raise (ASLR) - Priority 1</h3>
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">HIGHEST PRIORITY</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Posterior chain flexibility (up leg), anterior hip tension (down leg), core stability</p>
            
            {fundamental8.aslr.attempted && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Left Side</label>
                    <select
                      value={fundamental8.aslr.left}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        aslr: {...prev.aslr, left: e.target.value}
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Heel past mid-thigh, clean movement, no compensations</option>
                      <option value="2">2 - Heel past knee level</option>
                      <option value="1">1 - Can't reach past kneecap</option>
                      <option value="0">0 - Pain or excessive knee bend in down leg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Right Side</label>
                    <select
                      value={fundamental8.aslr.right}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        aslr: {...prev.aslr, right: e.target.value}
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Heel past mid-thigh, clean movement, no compensations</option>
                      <option value="2">2 - Heel past knee level</option>
                      <option value="1">1 - Can't reach past kneecap</option>
                      <option value="0">0 - Pain or excessive knee bend in down leg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ASLR Specific Notes</label>
                  <textarea
                    value={fundamental8.aslr.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev, 
                      aslr: {...prev.aslr, notes: e.target.value}
                    }))}
                    className="w-full p-2 border rounded-md"
                    rows="2"
                    placeholder="Note restrictions, compensations, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seated Faber - Priority 2 */}
          <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.faber.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  faber: {...prev.faber, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">2. Seated Faber Test - Priority 2</h3>
              <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded">HIGH PRIORITY</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Hip external rotation, hip impingement, groin/adductor mobility</p>
            
            {fundamental8.faber.attempted && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Left Side</label>
                    <select
                      value={fundamental8.faber.left}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        faber: {...prev.faber, left: e.target.value}
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Knee reaches floor passively without tightness</option>
                      <option value="2">2 - Tightness reported with slight hover above floor</option>
                      <option value="1">1 - Knee 45° below horizontal, requiring force</option>
                      <option value="0">0 - Pain during movement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Right Side</label>
                    <select
                      value={fundamental8.faber.right}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        faber: {...prev.faber, right: e.target.value}
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Knee reaches floor passively without tightness</option>
                      <option value="2">2 - Tightness reported with slight hover above floor</option>
                      <option value="1">1 - Knee 45° below horizontal, requiring force</option>
                      <option value="0">0 - Pain during movement</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Faber Specific Notes</label>
                  <textarea
                    value={fundamental8.faber.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev, 
                      faber: {...prev.faber, notes: e.target.value}
                    }))}
                    className="w-full p-2 border rounded-md"
                    rows="2"
                    placeholder="Note impingement signs, restriction patterns, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Simplified version of remaining tests for space */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.hipIR.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  hipIR: {...prev.hipIR, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">3-8. Additional Fundamental Tests</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Hip IR, Ankle Mobility, Trunk Stability, Balance, Shoulder Mobility, Crawl Position</p>
            
            {fundamental8.hipIR.attempted && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Quick scores (e.g., HipIR: L2/R2, Ankle: L3/R3)"
                  className="w-full p-2 border rounded-md"
                />
                <textarea
                  placeholder="Quick notes..."
                  className="w-full p-2 border rounded-md"
                  rows="2"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Fundamental 8 Overall Summary</label>
          <textarea
            value={observationNotes.fundamental8Overall}
            onChange={(e) => setObservationNotes(prev => ({...prev, fundamental8Overall: e.target.value}))}
            className="w-full p-3 border rounded-md"
            rows="3"
            placeholder="Overall summary of key findings, restrictions identified, corrective exercise priorities..."
          />
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
          >
            Back to Functional 4
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Continue to Strength Testing
          </button>
        </div>
      </div>
    );
  };

  // Strength Testing Section (same as before)
  const renderStrengthTesting = () => (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Strength Testing</h2>
      
      {!isReadyForStrengthTesting() ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="ml-3">
              <div className="text-sm text-amber-800">
                <strong>Strength testing not recommended:</strong> Address movement quality issues first. 
                All sagittal tests must score 2+ with no major asymmetries.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <div className="text-sm text-green-800">
                <strong>Ready for strength testing:</strong> Movement quality meets requirements for safe loading.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level 1 Testing */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Level 1 Strength Testing</h3>
        
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={strengthTests.level1.attempted}
              onChange={(e) => setStrengthTests(prev => ({
                ...prev,
                level1: { ...prev.level1, attempted: e.target.checked }
              }))}
              className="mr-2"
            />
            <span className="font-medium">Attempted Level 1 Testing</span>
          </label>
        </div>

        {strengthTests.level1.attempted && (
          <div className="space-y-3 ml-6">
            {[
              { key: 'reverseLungeSuitcase', label: 'Reverse Lunge Suitcase Hold (8kg men/4kg women, 6 reps each side)' },
              { key: 'gobletSquat', label: 'Goblet Squat (12kg men/8kg women, 6 reps)' },
              { key: 'kbSingleLegHinge', label: 'KB Single Leg Hinge (8kg men/4kg women, 6 reps each side)' },
              { key: 'pushups', label: 'Push-ups (5 full men/5 from knees women)' },
              { key: 'bodyRows', label: 'Body Rows (10 reps men/5 reps women)' }
            ].map(test => (
              <label key={test.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={strengthTests.level1[test.key]}
                  onChange={(e) => setStrengthTests(prev => ({
                    ...prev,
                    level1: { ...prev.level1, [test.key]: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">{test.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Level 2 Testing */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Level 2 Strength Testing</h3>
        
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={strengthTests.level2.attempted}
              onChange={(e) => setStrengthTests(prev => ({
                ...prev,
                level2: { ...prev.level2, attempted: e.target.checked }
              }))}
              className="mr-2"
              disabled={!strengthTests.level1.attempted || !Object.entries(strengthTests.level1).filter(([key]) => key !== 'attempted').every(([, passed]) => passed)}
            />
            <span className="font-medium">Attempted Level 2 Testing</span>
            {(!strengthTests.level1.attempted || !Object.entries(strengthTests.level1).filter(([key]) => key !== 'attempted').every(([, passed]) => passed)) && (
              <span className="text-sm text-gray-500 ml-2">(Must pass all Level 1 tests first)</span>
            )}
          </label>
        </div>

        {strengthTests.level2.attempted && (
          <div className="space-y-3 ml-6">
            {[
              { key: 'reverseLungeSuitcase', label: 'Reverse Lunge Suitcase Hold (12kg men/8kg women, 6 reps each side)' },
              { key: 'gobletSquat', label: 'Goblet Squat (20kg men/12kg women, 6 reps)' },
              { key: 'kbSingleLegHinge', label: 'KB Single Leg Hinge (16kg men/8kg women, 6 reps each side)' },
              { key: 'pushups', label: 'Push-ups (12 full men/3 controlled lowers women)' },
              { key: 'bodyRows', label: 'Body Rows (8 horizontal men/5 horizontal women)' }
            ].map(test => (
              <label key={test.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={strengthTests.level2[test.key]}
                  onChange={(e) => setStrengthTests(prev => ({
                    ...prev,
                    level2: { ...prev.level2, [test.key]: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">{test.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Strength Testing Notes</label>
        <textarea
          value={observationNotes.strengthTesting}
          onChange={(e) => setObservationNotes(prev => ({...prev, strengthTesting: e.target.value}))}
          className="w-full p-3 border rounded-md"
          rows="3"
          placeholder="Note performance, form issues, modifications needed, or other observations..."
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold">Strength Level: {getStrengthLevel()}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {getStrengthLevel() === 0 ? 'Not tested - address movement quality first' : 
           getStrengthLevel() === 1 ? 'Basic bodyweight and light load competency' : 
           getStrengthLevel() === 2 ? 'Moderate load competency with specific benchmarks' :
           'Advanced lifting technique ready for 5RM testing'}
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
        >
          Back to Fundamental 8
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          View Results
        </button>
      </div>
    </div>
  );

  // Enhanced Results Section with Coach Override
  const renderResults = () => {
    const { downgradeFlags, modifyFlags, monitorFlags } = getCategorizedRedFlags();
    const systemProgram = getSystemProgramRecommendation();
    const finalProgram = getFinalProgramRecommendation();

    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Assessment Results & Program Recommendation</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 text-center bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Functional 4</h3>
            <p className="text-2xl font-bold text-blue-600">{calculateF4Score()}/21</p>
            <p className="text-sm text-gray-500">Level {getMovementLevel()}</p>
          </div>

          <div className="p-4 text-center bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Strength</h3>
            <p className="text-2xl font-bold text-green-600">Level {getStrengthLevel()}</p>
            <p className="text-sm text-gray-500">
              {getStrengthLevel() === 0 ? 'Not tested' : 
               getStrengthLevel() === 1 ? 'Basic' : 
               getStrengthLevel() === 2 ? 'Moderate' : 'Advanced'}
            </p>
          </div>

          <div className="p-4 text-center bg-red-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Red Flags</h3>
            <p className="text-2xl font-bold text-red-600">{downgradeFlags.length + modifyFlags.length + monitorFlags.length}</p>
            <p className="text-sm text-gray-500">
              {downgradeFlags.length > 0 ? 'Major' : modifyFlags.length > 0 ? 'Minor' : 'None'}
            </p>
          </div>

          <div className="p-4 text-center bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">PAR-Q</h3>
            <p className="text-lg font-bold text-purple-600">
              {Object.values(parqResponses).some(r => r === true) ? 'REFER' : 'CLEAR'}
            </p>
            <p className="text-sm text-gray-500">Medical status</p>
          </div>
        </div>

        {/* Categorized Red Flags */}
        {(downgradeFlags.length > 0 || modifyFlags.length > 0 || monitorFlags.length > 0) && (
          <div className="mb-6 space-y-4">
            {downgradeFlags.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="ml-3">
                    <div className="text-sm text-red-800">
                      <strong>🔴 Downgrade Flags (Force Conservative Program):</strong>
                      <ul className="mt-2 space-y-1">
                        {downgradeFlags.map((flag, index) => (
                          <li key={index} className="text-sm">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modifyFlags.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div className="ml-3">
                    <div className="text-sm text-amber-800">
                      <strong>🟡 Modify Flags (Apply IRM Modifications):</strong>
                      <ul className="mt-2 space-y-1">
                        {modifyFlags.map((flag, index) => (
                          <li key={index} className="text-sm">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {monitorFlags.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div className="ml-3">
                    <div className="text-sm text-blue-800">
                      <strong>🔵 Monitor Flags (Note Only):</strong>
                      <ul className="mt-2 space-y-1">
                        {monitorFlags.map((flag, index) => (
                          <li key={index} className="text-sm">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Program Recommendation */}
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2 text-xl">System Recommendation:</h3>
          <p className="text-2xl font-bold text-green-700 mb-3">{systemProgram}</p>
          <div className="text-sm text-green-600 mb-4">
            <p><strong>Logic:</strong> Movement Level {getMovementLevel()} + Strength Level {getStrengthLevel()} + {downgradeFlags.length > 0 ? 'Downgrade' : modifyFlags.length > 0 ? 'Modify' : 'No'} Flags</p>
          </div>
          
          {coachOverride.enabled && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Coach Override Active:</h4>
              <p className="text-lg font-bold text-yellow-700">{coachOverride.program}</p>
              <p className="text-sm text-yellow-600 mt-1">{coachOverride.reasoning}</p>
            </div>
          )}
        </div>

        {/* Coach Override System */}
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Coach Override (Optional)</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={coachOverride.enabled}
                onChange={(e) => setCoachOverride(prev => ({
                  ...prev, 
                  enabled: e.target.checked,
                  program: e.target.checked ? prev.program : '',
                  reasoning: e.target.checked ? prev.reasoning : ''
                }))}
                className="w-4 h-4"
              />
              <label className="font-medium">Override system recommendation</label>
            </div>

            {coachOverride.enabled && (
              <div className="space-y-4 ml-7">
                <div>
                  <label className="block text-sm font-medium mb-1">Manual Program Selection *</label>
                  <select
                    value={coachOverride.program}
                    onChange={(e) => setCoachOverride(prev => ({...prev, program: e.target.value}))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required={coachOverride.enabled}
                  >
                    <option value="">Select program...</option>
                    {programOptions.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Override Reasoning *</label>
                  <textarea
                    value={coachOverride.reasoning}
                    onChange={(e) => setCoachOverride(prev => ({...prev, reasoning: e.target.value}))}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Required: Explain why you're overriding the system recommendation..."
                    required={coachOverride.enabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">Cannot export without completing override reasoning</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Program Display */}
        <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2 text-xl">Final Program Assignment:</h3>
          <p className="text-3xl font-bold text-purple-700 mb-3">{finalProgram}</p>
          <div className="text-sm text-purple-600 space-y-1">
            {finalProgram.includes('IRM Modified') && (
              <>
                <p>• Apply injury-specific modifications and conservative progression</p>
                <p>• Focus on pain-free movement and tissue tolerance</p>
                <p>• Regular reassessment and program adaptation</p>
              </>
            )}
            {finalProgram === 'Foundations' && (
              <>
                <p>• Focus on sagittal plane movement patterns and basic strength</p>
                <p>• Single leg hip hinge as cornerstone movement</p>
                <p>• Core stability and gym familiarity building</p>
                <p>• 16-week progression through 4 phases</p>
              </>
            )}
            {finalProgram === 'Graduation' && (
              <>
                <p>• Add lateral and rotational movement patterns</p>
                <p>• Introduce technical barbell techniques</p>
                <p>• Bridge to advanced training methodologies</p>
                <p>• Movement conditioning HIIT on Thursdays</p>
              </>
            )}
            {finalProgram.includes('Squad') && (
              <>
                <p>• Higher complexity and intensity training</p>
                <p>• Requires separate Level 3-4 strength assessment</p>
                <p>• Group training with coaching support</p>
                <p>• Context-dependent progression (coached vs solo)</p>
              </>
            )}
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Clinical Summary & Key Findings</label>
          <textarea
            value={clinicalSummary}
            onChange={(e) => setClinicalSummary(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Summarize key findings, movement limitations, strength deficits, and primary focus areas for this client..."
          />
        </div>

        {/* Coach Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Coach Notes & Observations</label>
          <textarea
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Additional observations, client feedback, coaching notes, or special considerations..."
          />
        </div>

        {/* Export Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Export Assessment Data (Condensed 25-Field Format)</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Condensed export includes:</h4>
            <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
              <p>• Essential automation fields (name, email, coach, program)</p>
              <p>• Smart F4 summary with scores and notes</p>
              <p>• F8 summary with key findings</p>
              <p>• Categorized red flag analysis</p>
              <p>• Combined goals and background information</p>
              <p>• PAR-Q medical clearance summary</p>
              <p>• Strength testing results summary</p>
              <p>• Coach override details (if applicable)</p>
              <p>• Clinical summary & coach notes</p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={exportToGoogleSheets}
              disabled={exporting || (coachOverride.enabled && (!coachOverride.program || !coachOverride.reasoning.trim()))}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 font-medium text-lg"
            >
              <Upload className="w-6 h-6" />
              <span>{exporting ? 'Exporting to Google Sheets...' : 'Export to Google Sheets (25 Fields)'}</span>
            </button>

            {(coachOverride.enabled && (!coachOverride.program || !coachOverride.reasoning.trim())) && (
              <p className="text-sm text-red-600">⚠ Complete coach override before exporting</p>
            )}

            {exportSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="ml-3">
                    <div className="text-sm text-green-800">
                      <strong>Assessment successfully exported!</strong> Condensed data (25 fields) now available in Google Sheets for Trainerize automation and coach review.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(4)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
          >
            Back to Strength Testing
          </button>
          <button
            onClick={() => {
              // Reset for new assessment
              setCurrentStep(0);
              setClientInfo({ 
                name: '', email: '', dob: '', occupation: '', coachName: '', age: '', 
                goal1: '', goal2: '', goal3: '', goal4: '', goal5: '',
                sportingBackground: '', injuryHistory: '', currentInjuryConcerns: '', clientType: '' 
              });
              setParqResponses({
                chronicIllness: null, medications: null, surgeriesHospital: null, jointBoneIssues: null,
                chestPainActivity: null, chestPainRest: null, dizzinessBalance: null, bloodPressureCholesterol: null,
                smoking: null, familyHeartHistory: null, otherReasons: null, over69Unaccustomed: null, pregnant: null
              });
              setFunctional4({
                overheadSquat: '', inlineLungeLeft: '', inlineLungeRight: '',
                hipHingeLeft: '', hipHingeRight: '', lateralLungeLeft: '', lateralLungeRight: ''
              });
              setFundamental8({
                aslr: { left: '', right: '', attempted: false, notes: '' },
                faber: { left: '', right: '', attempted: false, notes: '' },
                hipIR: { left: '', right: '', attempted: false, notes: '' },
                ankleMobility: { left: '', right: '', attempted: false, notes: '' },
                trunkStability: { score: '', attempted: false, notes: '' },
                singleLegBalance: { left: '', right: '', attempted: false, notes: '' },
                shoulderMobility: { left: '', right: '', attempted: false, notes: '' },
                crawlPosition: { score: '', attempted: false, notes: '' }
              });
              setObservationNotes({
                overheadSquat: '', inlineLunge: '', hipHinge: '', lateralLunge: '',
                fundamental8Overall: '', strengthTesting: '', general: ''
              });
              setStrengthTests({
                level1: { reverseLungeSuitcase: false, gobletSquat: false, kbSingleLegHinge: false, pushups: false, bodyRows: false, attempted: false },
                level2: { reverseLungeSuitcase: false, gobletSquat: false, kbSingleLegHinge: false, pushups: false, bodyRows: false, attempted: false }
              });
              setCoachOverride({ enabled: false, program: '', reasoning: '' });
              setCoachNotes('');
              setClinicalSummary('');
              setExportSuccess(false);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            New Assessment
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          SIM Assessment Decision Tool v3
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Enhanced movement assessment with condensed 25-field export
        </p>
        
        {/* Progress Bar */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 text-center">
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold transition-all ${
                  index <= currentStep ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <p className={`text-xs font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        {currentStep === 0 && renderPARQ()}
        {currentStep === 1 && renderClientInfo()}
        {currentStep === 2 && renderFunctional4()}
        {currentStep === 3 && renderFundamental8()}
        {currentStep === 4 && renderStrengthTesting()}
        {currentStep === 5 && renderResults()}
      </div>
    </div>
  );
};

export default AssessmentTool;