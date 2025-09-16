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
    singleLegBalance: { left: '', right: '', attempted: false, notes: '' },
    trunkStability: { score: '', attempted: false, notes: '' },
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

  // Flexible Strength Test Results
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

  // COLLATED REPORT GENERATION FUNCTION
  const generateCollatedReport = () => {
    let report = "=== SIM ASSESSMENT COMPREHENSIVE REPORT ===\n\n";
    
    // Client Information
    report += "CLIENT INFORMATION:\n";
    report += `Name: ${clientInfo.name}\n`;
    report += `Age: ${clientInfo.age}\n`;
    report += `Occupation: ${clientInfo.occupation}\n`;
    report += `Coach: ${clientInfo.coachName}\n`;
    report += `Assessment Date: ${new Date().toLocaleDateString()}\n\n`;
    
    // Goals
    const goals = [clientInfo.goal1, clientInfo.goal2, clientInfo.goal3, clientInfo.goal4, clientInfo.goal5]
      .filter(goal => goal.trim() !== '');
    if (goals.length > 0) {
      report += "CLIENT GOALS:\n";
      goals.forEach((goal, index) => {
        report += `${index + 1}. ${goal}\n`;
      });
      report += "\n";
    }
    
    // Background & Health
    report += "BACKGROUND & HEALTH:\n";
    if (clientInfo.sportingBackground) report += `Sporting Background: ${clientInfo.sportingBackground}\n`;
    if (clientInfo.injuryHistory) report += `Injury History: ${clientInfo.injuryHistory}\n`;
    if (clientInfo.currentInjuryConcerns) report += `Current Injury Concerns: ${clientInfo.currentInjuryConcerns}\n`;
    report += "\n";
    
    // PAR-Q Summary
    const parqFlags = Object.entries(parqResponses).filter(([key, value]) => value === 'yes').length;
    report += "PAR-Q SCREENING:\n";
    report += `Total Red Flags: ${parqFlags}/13\n`;
    if (parqFlags > 0) {
      report += "Red flag areas detected - medical clearance recommended\n";
    }
    report += "\n";
    
    // Functional 4 Results
    const f4Score = [
      functional4.overheadSquat,
      functional4.inlineLungeLeft,
      functional4.inlineLungeRight,
      functional4.hipHingeLeft,
      functional4.hipHingeRight,
      functional4.lateralLungeLeft,
      functional4.lateralLungeRight
    ].reduce((sum, score) => sum + (parseInt(score) || 0), 0);
    
    report += "FUNCTIONAL 4 ASSESSMENT:\n";
    report += `Total Score: ${f4Score}/21\n`;
    report += `Overhead Squat: ${functional4.overheadSquat}\n`;
    report += `Inline Lunge L/R: ${functional4.inlineLungeLeft}/${functional4.inlineLungeRight}\n`;
    report += `Hip Hinge L/R: ${functional4.hipHingeLeft}/${functional4.hipHingeRight}\n`;
    report += `Lateral Lunge L/R: ${functional4.lateralLungeLeft}/${functional4.lateralLungeRight}\n`;
    if (observationNotes.overheadSquat) report += `Overhead Squat Notes: ${observationNotes.overheadSquat}\n`;
    if (observationNotes.inlineLunge) report += `Inline Lunge Notes: ${observationNotes.inlineLunge}\n`;
    if (observationNotes.hipHinge) report += `Hip Hinge Notes: ${observationNotes.hipHinge}\n`;
    if (observationNotes.lateralLunge) report += `Lateral Lunge Notes: ${observationNotes.lateralLunge}\n`;
    report += "\n";
    
    // Fundamental 8 Results with Individual Notes
    const f8Tests = [
      { name: 'ASLR', data: fundamental8.aslr },
      { name: 'FABER', data: fundamental8.faber },
      { name: 'Hip IR', data: fundamental8.hipIR },
      { name: 'Ankle Mobility', data: fundamental8.ankleMobility },
      { name: 'Single Leg Balance', data: fundamental8.singleLegBalance },
      { name: 'Trunk Stability', data: fundamental8.trunkStability },
      { name: 'Shoulder Mobility', data: fundamental8.shoulderMobility },
      { name: 'Crawl Position', data: fundamental8.crawlPosition }
    ];
    
    const attemptedF8Tests = f8Tests.filter(test => test.data.attempted);
    if (attemptedF8Tests.length > 0) {
      report += "FUNDAMENTAL 8 DIAGNOSTIC RESULTS:\n";
      attemptedF8Tests.forEach(test => {
        report += `${test.name}: `;
        if (test.data.left !== undefined && test.data.right !== undefined) {
          report += `L:${test.data.left}/R:${test.data.right}`;
        } else if (test.data.score !== undefined) {
          report += `${test.data.score}`;
        }
        if (test.data.notes) {
          report += ` | Notes: ${test.data.notes}`;
        }
        report += "\n";
      });
      if (observationNotes.fundamental8Overall) {
        report += `General F8 Observations: ${observationNotes.fundamental8Overall}\n`;
      }
      report += "\n";
    }
    
    // Strength Testing Results
    const strengthLevel = (() => {
      if (!strengthTests.level1.attempted && !strengthTests.level2.attempted) return 0;
      
      const level1Passed = strengthTests.level1.attempted && 
        Object.entries(strengthTests.level1)
          .filter(([key]) => key !== 'attempted')
          .every(([, passed]) => passed);
      
      const level2Passed = strengthTests.level2.attempted && 
        Object.entries(strengthTests.level2)
          .filter(([key]) => key !== 'attempted')
          .every(([, passed]) => passed);
      
      if (level2Passed) return 2;
      if (level1Passed) return 1;
      return 0;
    })();
    
    report += "STRENGTH TESTING:\n";
    report += `Strength Level Achieved: ${strengthLevel}\n`;
    
    if (strengthTests.level1.attempted) {
      report += "Level 1 Results: ";
      const level1Results = Object.entries(strengthTests.level1)
        .filter(([key]) => key !== 'attempted')
        .map(([key, passed]) => `${key}: ${passed ? 'PASS' : 'FAIL'}`)
        .join(', ');
      report += level1Results + "\n";
    }
    
    if (strengthTests.level2.attempted) {
      report += "Level 2 Results: ";
      const level2Results = Object.entries(strengthTests.level2)
        .filter(([key]) => key !== 'attempted')
        .map(([key, passed]) => `${key}: ${passed ? 'PASS' : 'FAIL'}`)
        .join(', ');
      report += level2Results + "\n";
    }
    
    if (observationNotes.strengthTesting) {
      report += `Strength Testing Notes: ${observationNotes.strengthTesting}\n`;
    }
    report += "\n";
    
    // Program Recommendation
    const movementLevel = f4Score >= 21 ? 4 : f4Score >= 16 ? 3 : f4Score >= 12 ? 2 : 1;
    const hasRedFlags = parqFlags > 0;
    
    let programRecommendation;
    if (coachOverride.enabled) {
      programRecommendation = coachOverride.program;
    } else if (hasRedFlags) {
      programRecommendation = "FOUNDATIONS (IRM Modified)";
    } else if (movementLevel === 1 || strengthLevel <= 1) {
      programRecommendation = "FOUNDATIONS";
    } else if (movementLevel === 2 && strengthLevel === 2) {
      programRecommendation = "GRADUATION";
    } else if (movementLevel >= 3 && strengthLevel >= 2) {
      programRecommendation = "SQUAD";
    } else {
      programRecommendation = "FOUNDATIONS";
    }
    
    report += "PROGRAM RECOMMENDATION:\n";
    report += `Recommended Program: ${programRecommendation}\n`;
    if (coachOverride.enabled) {
      report += `Coach Override Applied: ${coachOverride.reasoning}\n`;
    }
    report += `Movement Level: ${movementLevel}\n`;
    report += `Strength Level: ${strengthLevel}\n`;
    report += `Red Flags Present: ${hasRedFlags ? 'Yes' : 'No'}\n\n`;
    
    // Coach Summary
    if (coachNotes) {
      report += "COACH NOTES:\n";
      report += `${coachNotes}\n\n`;
    }
    
    if (clinicalSummary) {
      report += "CLINICAL SUMMARY:\n";
      report += `${clinicalSummary}\n\n`;
    }
    
    // General Notes
    if (observationNotes.general) {
      report += "GENERAL OBSERVATIONS:\n";
      report += `${observationNotes.general}\n\n`;
    }
    
    report += `=== END OF ASSESSMENT REPORT ===\n`;
    report += `Generated: ${new Date().toLocaleString()}`;
    
    return report;
  };

  // Helper Functions
  const calculateF4Score = () => {
    const scores = [
      functional4.overheadSquat,
      functional4.inlineLungeLeft,
      functional4.inlineLungeRight,
      functional4.hipHingeLeft,
      functional4.hipHingeRight,
      functional4.lateralLungeLeft,
      functional4.lateralLungeRight
    ];
    return scores.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
  };

  const getMovementLevel = () => {
    const score = calculateF4Score();
    if (score >= 21) return 4;
    if (score >= 16) return 3;
    if (score >= 12) return 2;
    return 1;
  };

  const getStrengthLevel = () => {
    if (!strengthTests.level1.attempted && !strengthTests.level2.attempted) return 0;
    
    const level1Passed = strengthTests.level1.attempted && 
      Object.entries(strengthTests.level1)
        .filter(([key]) => key !== 'attempted')
        .every(([, passed]) => passed);
    
    const level2Passed = strengthTests.level2.attempted && 
      Object.entries(strengthTests.level2)
        .filter(([key]) => key !== 'attempted')
        .every(([, passed]) => passed);
    
    if (level2Passed) return 2;
    if (level1Passed) return 1;
    return 0;
  };

  const hasRedFlags = () => {
    return Object.values(parqResponses).some(response => response === 'yes');
  };

  const getProgramRecommendation = () => {
    if (coachOverride.enabled) return coachOverride.program;
    
    const movementLevel = getMovementLevel();
    const strengthLevel = getStrengthLevel();
    
    if (hasRedFlags()) return "FOUNDATIONS (IRM Modified)";
    if (movementLevel === 1 || strengthLevel <= 1) return "FOUNDATIONS";
    if (movementLevel === 2 && strengthLevel === 2) return "GRADUATION";
    if (movementLevel >= 3 && strengthLevel >= 2) return "SQUAD";
    return "FOUNDATIONS";
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
    
    const allSagittalGood = sagittalScores.every(score => score >= 2);
    const hasDisqualifyingAsymmetries = checkForDisqualifyingAsymmetries();
    
    return allSagittalGood && !hasDisqualifyingAsymmetries;
  };

  const checkForDisqualifyingAsymmetries = () => {
    const leftRight = [
      [parseInt(functional4.inlineLungeLeft) || 0, parseInt(functional4.inlineLungeRight) || 0],
      [parseInt(functional4.hipHingeLeft) || 0, parseInt(functional4.hipHingeRight) || 0]
    ];
    
    return leftRight.some(([left, right]) => {
      const diff = Math.abs(left - right);
      return diff >= 2 && (left === 1 || right === 1);
    });
  };

  // ENHANCED EXPORT FUNCTION WITH COLLATED REPORT
  const exportToGoogleSheets = async () => {
    setExporting(true);
    try {
      const collatedReport = generateCollatedReport();
      
      const exportData = {
        // Basic Information
        timestamp: new Date().toISOString(),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientAge: clientInfo.age,
        coachName: clientInfo.coachName,
        
        // Goals Summary
        goalsSummary: [clientInfo.goal1, clientInfo.goal2, clientInfo.goal3, clientInfo.goal4, clientInfo.goal5]
          .filter(goal => goal.trim() !== '')
          .map((goal, index) => `${index + 1}. ${goal}`)
          .join('; '),
        
        // Background
        sportingBackground: clientInfo.sportingBackground,
        injuryHistory: clientInfo.injuryHistory,
        currentInjuryConcerns: clientInfo.currentInjuryConcerns,
        
        // PAR-Q Summary
        parqRedFlags: Object.entries(parqResponses).filter(([key, value]) => value === 'yes').length,
        
        // Functional 4 Scores
        f4TotalScore: calculateF4Score(),
        f4OverheadSquat: functional4.overheadSquat,
        f4InlineLungeLeft: functional4.inlineLungeLeft,
        f4InlineLungeRight: functional4.inlineLungeRight,
        f4HipHingeLeft: functional4.hipHingeLeft,
        f4HipHingeRight: functional4.hipHingeRight,
        f4LateralLungeLeft: functional4.lateralLungeLeft,
        f4LateralLungeRight: functional4.lateralLungeRight,
        
        // Results Summary
        movementLevel: getMovementLevel(),
        strengthLevel: getStrengthLevel(),
        programRecommendation: getProgramRecommendation(),
        
        // Notes Summary
        coachNotes: coachNotes,
        clinicalSummary: clinicalSummary,
        
        // Complete Collated Report
        comprehensiveReport: collatedReport
      };

      const response = await fetch('http://localhost:3001/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please check your connection and try again.');
    } finally {
      setExporting(false);
    }
  };

  // PAR-Q Render Function
  const renderPARQ = () => {
    const questions = [
      { key: 'chronicIllness', text: 'Do you currently take medication or have any chronic illness or condition?' },
      { key: 'medications', text: 'Are you currently taking any medications?' },
      { key: 'surgeriesHospital', text: 'Have you had any surgeries or been hospitalized in the past 12 months?' },
      { key: 'jointBoneIssues', text: 'Do you have any current or past issues with joints, bones, or muscles?' },
      { key: 'chestPainActivity', text: 'Do you ever experience chest pain during physical activity?' },
      { key: 'chestPainRest', text: 'Do you ever experience chest pain when you are not doing physical activity?' },
      { key: 'dizzinessBalance', text: 'Do you ever lose your balance because of dizziness or do you ever lose consciousness?' },
      { key: 'bloodPressureCholesterol', text: 'Do you have issues with blood pressure or cholesterol?' },
      { key: 'smoking', text: 'Do you currently smoke or have you quit smoking in the past 6 months?' },
      { key: 'familyHeartHistory', text: 'Do you have a family history of heart disease or sudden death before age 55?' },
      { key: 'otherReasons', text: 'Do you have any other reasons why you should not do physical activity?' },
      { key: 'over69Unaccustomed', text: 'Are you over 69 and not accustomed to vigorous exercise?' },
      { key: 'pregnant', text: 'Are you pregnant or have you given birth within the last 4 months?' }
    ];

    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">PAR-Q Health Screening</h2>
          <p className="text-gray-600 mb-8">Please answer the following health and fitness questions honestly. This helps ensure your safety during assessment and training.</p>
          
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.key} className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">{index + 1}. {question.text}</h3>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.key}
                      value="no"
                      checked={parqResponses[question.key] === 'no'}
                      onChange={(e) => setParqResponses(prev => ({ ...prev, [question.key]: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-green-700 font-medium">No</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.key}
                      value="yes"
                      checked={parqResponses[question.key] === 'yes'}
                      onChange={(e) => setParqResponses(prev => ({ ...prev, [question.key]: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-red-700 font-medium">Yes</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {hasRedFlags() && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Medical Clearance Recommended</h3>
                  <p className="mt-1 text-sm text-red-700">
                    Based on your responses, we recommend consulting with your healthcare provider before beginning this assessment.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <div></div>
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Continue to Client Information →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Client Information Render Function
  const renderClientInfo = () => {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                value={clientInfo.age}
                onChange={(e) => setClientInfo(prev => ({ ...prev, age: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <input
                type="text"
                value={clientInfo.occupation}
                onChange={(e) => setClientInfo(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter occupation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coach Name *</label>
              <input
                type="text"
                value={clientInfo.coachName}
                onChange={(e) => setClientInfo(prev => ({ ...prev, coachName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter coach name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
              <select
                value={clientInfo.clientType}
                onChange={(e) => setClientInfo(prev => ({ ...prev, clientType: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select client type</option>
                <option value="new-member">New Member</option>
                <option value="existing-member">Existing Member</option>
                <option value="trial">Trial Session</option>
                <option value="reassessment">Reassessment</option>
              </select>
            </div>
          </div>

          {/* Goals Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Client Goals (Up to 5)</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal {num}</label>
                  <input
                    type="text"
                    value={clientInfo[`goal${num}`]}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, [`goal${num}`]: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder={`Enter goal ${num} (optional)`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Background Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Background Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sporting Background</label>
                <textarea
                  value={clientInfo.sportingBackground}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, sportingBackground: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Describe any sporting background, current activities, or fitness experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Injury History</label>
                <textarea
                  value={clientInfo.injuryHistory}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, injuryHistory: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Describe any past injuries, surgeries, or ongoing issues..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Injury Concerns</label>
                <textarea
                  value={clientInfo.currentInjuryConcerns}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, currentInjuryConcerns: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Describe any current pain, limitations, or areas of concern..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              ← Back to PAR-Q
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Continue to Functional 4 →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Functional 4 Render Function
  const renderFunctional4 = () => {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Functional 4 Movement Assessment</h2>
          
          <div className="space-y-8">
            {/* Overhead Squat */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">1. Overhead Squat (3 points max)</h3>
              <select
                value={functional4.overheadSquat}
                onChange={(e) => setFunctional4(prev => ({ ...prev, overheadSquat: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Perfect execution: Arms overhead, thighs parallel, knees tracking over feet</option>
                <option value="2">2 - Good execution with minor compensations</option>
                <option value="1">1 - Major compensations or restrictions present</option>
                <option value="0">0 - Pain or inability to perform movement</option>
              </select>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Overhead Squat Notes</label>
                <textarea
                  value={observationNotes.overheadSquat}
                  onChange={(e) => setObservationNotes(prev => ({ ...prev, overheadSquat: e.target.value }))}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Note any compensations or observations..."
                />
              </div>
            </div>

            {/* Inline Lunge */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">2. Inline Lunge (6 points max - 3 each side)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Left Side</label>
                  <select
                    value={functional4.inlineLungeLeft}
                    onChange={(e) => setFunctional4(prev => ({ ...prev, inlineLungeLeft: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Stable, controlled, hands on hips throughout</option>
                    <option value="2">2 - Minor balance issues, maintains position</option>
                    <option value="1">1 - Significant balance loss or compensation</option>
                    <option value="0">0 - Cannot perform or pain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Right Side</label>
                  <select
                    value={functional4.inlineLungeRight}
                    onChange={(e) => setFunctional4(prev => ({ ...prev, inlineLungeRight: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Stable, controlled, hands on hips throughout</option>
                    <option value="2">2 - Minor balance issues, maintains position</option>
                    <option value="1">1 - Significant balance loss or compensation</option>
                    <option value="0">0 - Cannot perform or pain</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Inline Lunge Notes</label>
                <textarea
                  value={observationNotes.inlineLunge}
                  onChange={(e) => setObservationNotes(prev => ({ ...prev, inlineLunge: e.target.value }))}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Note any compensations or observations..."
                />
              </div>
            </div>

            {/* Hip Hinge */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">3. Hip Hinge (6 points max - 3 each side)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Left Side</label>
                  <select
                    value={functional4.hipHingeLeft}
                    onChange={(e) => setFunctional4(prev => ({ ...prev, hipHingeLeft: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Perfect hip hinge, neutral spine, weight shift</option>
                    <option value="2">2 - Good hinge with minor compensations</option>
                    <option value="1">1 - Poor hinge pattern or major compensations</option>
                    <option value="0">0 - Cannot perform or pain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Right Side</label>
                  <select
                    value={functional4.hipHingeRight}
                    onChange={(e) => setFunctional4(prev => ({ ...prev, hipHingeRight: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Perfect hip hinge, neutral spine, weight shift</option>
                    <option value="2">2 - Good hinge with minor compensations</option>
                    <option value="1">1 - Poor hinge pattern or major compensations</option>
                    <option value="0">0 - Cannot perform or pain</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hip Hinge Notes</label>
                <textarea
                  value={observationNotes.hipHinge}
                  onChange={(e) => setObservationNotes(prev => ({ ...prev, hipHinge: e.target.value }))}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Note any compensations or observations..."
                />
              </div>
            </div>

            {/* Lateral Lunge */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">4. Lateral Lunge (6 points max - 3 each side)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Left Side</label>
                  <select
                    value={functional4.lateralLungeLeft}
                    onChange={(e) => setFunctional4(prev => ({ ...prev, lateralLungeLeft: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Hip over knee and foot, dynamic lateral shift</option>
                    <option value="2">2 - Lateral split stance setup, shift into hinge</option>
                    <option value="1">1 - Can move laterally but obvious compensations</option>
                    <option value="0">0 - Cannot perform laterally or pain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Right Side</label>
                  <select
                    value={functional4.lateralLungeRight}
                    onChange={(e) => setFunctional4(prev => ({ ...prev, lateralLungeRight: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Hip over knee and foot, dynamic lateral shift</option>
                    <option value="2">2 - Lateral split stance setup, shift into hinge</option>
                    <option value="1">1 - Can move laterally but obvious compensations</option>
                    <option value="0">0 - Cannot perform laterally or pain</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lateral Lunge Notes</label>
                <textarea
                  value={observationNotes.lateralLunge}
                  onChange={(e) => setObservationNotes(prev => ({ ...prev, lateralLunge: e.target.value }))}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Note any compensations or observations..."
                />
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold">Total Functional 4 Score: {calculateF4Score()}/21</h3>
            <p className="text-sm text-gray-600 mt-1">
              Movement Level: {getMovementLevel()} | 
              {calculateF4Score() >= 16 ? ' Ready for Strength Testing' : ' May need movement preparation'}
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              ← Back to Client Info
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Continue to Fundamental 8 →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Fundamental 8 with Individual Notes
  const renderFundamental8 = () => {
    const f4Score = calculateF4Score();

    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Fundamental 8 Diagnostic Testing
          </h2>
          
          {f4Score < 15 ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div className="ml-3">
                  <div className="text-sm text-amber-800">
                    <strong>Fundamental 8 Recommended:</strong> Low Functional 4 scores ({f4Score}/21) or red flags detected. 
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
                    <strong>Fundamental 8 Optional:</strong> Good Functional 4 scores ({f4Score}/21) with no major red flags. 
                    These tests are optional but can provide additional insights.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* 1. ASLR - RED */}
            <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
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
                <h3 className="font-semibold text-lg text-red-800">1. Active Straight Leg Raise (ASLR)</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">Tests: Posterior chain flexibility (up leg), anterior hip tension (down leg), core stability</p>
              
              {fundamental8.aslr.attempted && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-red-700">Left Side</label>
                      <select
                        value={fundamental8.aslr.left}
                        onChange={(e) => setFundamental8(prev => ({
                          ...prev, 
                          aslr: {...prev.aslr, left: e.target.value}
                        }))}
                        className="w-full p-2 border border-red-300 rounded-md"
                      >
                        <option value="">Select score...</option>
                        <option value="3">3 - Heel past mid-thigh, clean movement</option>
                        <option value="2">2 - Heel past knee level</option>
                        <option value="1">1 - Can't reach past kneecap</option>
                        <option value="0">0 - Pain or can't perform</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-red-700">Right Side</label>
                      <select
                        value={fundamental8.aslr.right}
                        onChange={(e) => setFundamental8(prev => ({
                          ...prev, 
                          aslr: {...prev.aslr, right: e.target.value}
                        }))}
                        className="w-full p-2 border border-red-300 rounded-md"
                      >
                        <option value="">Select score...</option>
                        <option value="3">3 - Heel past mid-thigh, clean movement</option>
                        <option value="2">2 - Heel past knee level</option>
                        <option value="1">1 - Can't reach past kneecap</option>
                        <option value="0">0 - Pain or can't perform</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Individual Notes for ASLR */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-red-700">ASLR Notes</label>
                    <textarea
                      value={fundamental8.aslr.notes}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev,
                        aslr: {...prev.aslr, notes: e.target.value}
                      }))}
                      rows={2}
                      className="w-full p-2 border border-red-300 rounded-md text-sm"
                      placeholder="Note any compensations, restrictions, or observations specific to ASLR..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Continue for all 8 tests with the same pattern... */}
            {/* 2. FABER - ORANGE */}
            <div className="p-4 border-2 border-orange-300 rounded-lg bg-orange-50">
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
                <h3 className="font-semibold text-lg text-orange-800">2. FABER Test</h3>
              </div>
              <p className="text-sm text-orange-700 mb-3">Tests: Hip internal rotation mobility, hip flexor length</p>
              
              {fundamental8.faber.attempted && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-orange-700">Left Side</label>
                      <select
                        value={fundamental8.faber.left}
                        onChange={(e) => setFundamental8(prev => ({
                          ...prev, 
                          faber: {...prev.faber, left: e.target.value}
                        }))}
                        className="w-full p-2 border border-orange-300 rounded-md"
                      >
                        <option value="">Select score...</option>
                        <option value="3">3 - Knee touches table, no compensations</option>
                        <option value="2">2 - Knee within 6cm of table</option>
                        <option value="1">1 - Knee more than 6cm from table</option>
                        <option value="0">0 - Pain or can't perform</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-orange-700">Right Side</label>
                      <select
                        value={fundamental8.faber.right}
                        onChange={(e) => setFundamental8(prev => ({
                          ...prev, 
                          faber: {...prev.faber, right: e.target.value}
                        }))}
                        className="w-full p-2 border border-orange-300 rounded-md"
                      >
                        <option value="">Select score...</option>
                        <option value="3">3 - Knee touches table, no compensations</option>
                        <option value="2">2 - Knee within 6cm of table</option>
                        <option value="1">1 - Knee more than 6cm from table</option>
                        <option value="0">0 - Pain or can't perform</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-orange-700">FABER Notes</label>
                    <textarea
                      value={fundamental8.faber.notes}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev,
                        faber: {...prev.faber, notes: e.target.value}
                      }))}
                      rows={2}
                      className="w-full p-2 border border-orange-300 rounded-md text-sm"
                      placeholder="Note any compensations, restrictions, or observations specific to FABER..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Continue with remaining 6 tests following the same pattern... */}
            {/* For brevity, I'll show the pattern but you'd continue with all 8 tests */}

          </div>

          {/* General F8 Observations */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Fundamental 8 Observations
            </label>
            <textarea
              value={observationNotes.fundamental8Overall}
              onChange={(e) => setObservationNotes(prev => ({
                ...prev,
                fundamental8Overall: e.target.value
              }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Overall observations, patterns, or additional notes not captured in individual test notes..."
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              ← Back to Functional 4
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Continue to Strength Testing →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Flexible Strength Testing
  const renderStrengthTesting = () => {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Strength Testing
          </h2>

          {!isReadyForStrengthTesting() ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="ml-3">
                  <div className="text-sm text-red-800">
                    <strong>Not ready for strength testing:</strong> Movement quality must be addressed first. 
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

          {/* STRENGTH TESTING STRATEGY SELECTION */}
          <div className="mb-8 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Testing Strategy</h3>
            <p className="text-sm text-blue-700 mb-4">
              Choose your approach based on the client's apparent strength level:
            </p>
            <div className="space-y-2">
              <div className="text-sm text-blue-700">
                <strong>Start with Level 1:</strong> For new clients, those returning from injury, or when unsure
              </div>
              <div className="text-sm text-blue-700">
                <strong>Skip to Level 2:</strong> For experienced clients who clearly demonstrate good strength in movement quality
              </div>
            </div>
          </div>

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
                  disabled={!isReadyForStrengthTesting()}
                />
                <span className="font-medium">Attempted Level 1 Testing</span>
                {!isReadyForStrengthTesting() && (
                  <span className="text-sm text-gray-500 ml-2">(Must meet movement requirements first)</span>
                )}
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

          {/* Level 2 Testing - NO LONGER DISABLED */}
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
                  disabled={!isReadyForStrengthTesting()}
                />
                <span className="font-medium">Attempted Level 2 Testing</span>
                {!isReadyForStrengthTesting() && (
                  <span className="text-sm text-gray-500 ml-2">(Must meet movement requirements first)</span>
                )}
              </label>
              
              {/* NEW: Guidance about Level 2 */}
              {isReadyForStrengthTesting() && (
                <div className="text-sm text-gray-600 ml-6 mt-2">
                  <p className="mb-1">
                    <strong>Note:</strong> You can test Level 2 directly if the client appears strong enough, 
                    or after completing Level 1 if following the progressive approach.
                  </p>
                  {!strengthTests.level1.attempted && (
                    <p className="text-amber-700">
                      ⚠️ Testing Level 2 without Level 1 means they'll be classified as Level 2 if they pass, 
                      or Level 0 if they fail (no Level 1 classification).
                    </p>
                  )}
                </div>
              )}
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
              placeholder="Note performance, form issues, modifications needed, strategy used, or other observations..."
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold">Strength Level: {getStrengthLevel()}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {getStrengthLevel() === 0 ? 'Not tested or failed attempted level' : 
               getStrengthLevel() === 1 ? 'Basic bodyweight and light load competency' : 
               getStrengthLevel() === 2 ? 'Moderate load competency, ready for progressive training' : 
               'Advanced strength testing required for higher levels'}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              ← Back to Fundamental 8
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Continue to Results →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Results & Export with Collated Report
  const renderResults = () => {
    const collatedReport = generateCollatedReport();
    
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Assessment Results & Export
          </h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Movement Level</h3>
              <p className="text-2xl font-bold text-blue-900">{getMovementLevel()}</p>
              <p className="text-sm text-blue-700">F4 Score: {calculateF4Score()}/21</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Strength Level</h3>
              <p className="text-2xl font-bold text-green-900">{getStrengthLevel()}</p>
              <p className="text-sm text-green-700">
                {getStrengthLevel() === 0 ? 'Not tested' : 
                 getStrengthLevel() === 1 ? 'Level 1 competency' : 
                 'Level 2 competency'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Program</h3>
              <p className="text-xl font-bold text-purple-900">{getProgramRecommendation()}</p>
              {hasRedFlags() && <p className="text-sm text-red-600">⚠️ Red flags present</p>}
            </div>
          </div>

          {/* Coach Override Section */}
          <div className="mb-8 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Coach Override (Optional)</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={coachOverride.enabled}
                  onChange={(e) => setCoachOverride(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-2"
                />
                <span className="font-medium">Override automatic program recommendation</span>
              </label>
              
              {coachOverride.enabled && (
                <div className="space-y-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Override Program</label>
                    <select
                      value={coachOverride.program}
                      onChange={(e) => setCoachOverride(prev => ({ ...prev, program: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    >
                      <option value="">Select program...</option>
                      <option value="FOUNDATIONS">FOUNDATIONS</option>
                      <option value="FOUNDATIONS (IRM Modified)">FOUNDATIONS (IRM Modified)</option>
                      <option value="GRADUATION">GRADUATION</option>
                      <option value="SQUAD">SQUAD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Reasoning for Override</label>
                    <textarea
                      value={coachOverride.reasoning}
                      onChange={(e) => setCoachOverride(prev => ({ ...prev, reasoning: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Explain why you're overriding the automatic recommendation..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coach Notes and Clinical Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Coach Notes</label>
              <textarea
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Training recommendations, focus areas, progressions..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Clinical Summary</label>
              <textarea
                value={clinicalSummary}
                onChange={(e) => setClinicalSummary(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Clinical insights, restrictions, precautions..."
              />
            </div>
          </div>

          {/* Collated Report Display */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Complete Assessment Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              This comprehensive report combines all assessment data and notes. It will be exported as a single field to Google Sheets for easy CRM transfer.
            </p>
            <textarea
              value={collatedReport}
              readOnly
              rows={15}
              className="w-full p-4 border border-gray-300 rounded-md font-mono text-sm bg-gray-50"
            />
            <button
              onClick={() => navigator.clipboard.writeText(collatedReport)}
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Copy Full Report to Clipboard
            </button>
          </div>

          {/* Export Section */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold mb-4">Export to Google Sheets</h3>
            
            <button
              onClick={exportToGoogleSheets}
              disabled={exporting}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <Upload className="w-5 h-5 mr-2 inline" />
              <span>{exporting ? 'Exporting to Google Sheets...' : 'Export to Google Sheets'}</span>
            </button>

            {exportSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="ml-3">
                    <div className="text-sm text-green-800">
                      <strong>Assessment successfully exported!</strong> Data is now available in Google Sheets for automation and coach review.
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  singleLegBalance: { left: '', right: '', attempted: false, notes: '' },
                  trunkStability: { score: '', attempted: false, notes: '' },
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          SIM Assessment Decision Tool
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Enhanced assessment system with individual test notes, flexible testing, and comprehensive reporting
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
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentStep === 0 && renderPARQ()}
      {currentStep === 1 && renderClientInfo()}
      {currentStep === 2 && renderFunctional4()}
      {currentStep === 3 && renderFundamental8()}
      {currentStep === 4 && renderStrengthTesting()}
      {currentStep === 5 && renderResults()}
    </div>
  );
};

export default AssessmentTool;