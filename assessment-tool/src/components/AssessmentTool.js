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

  const isReadyForStrengthTesting = () => {
    const sagittalScores = [
      parseInt(functional4.overheadSquat) || 0,
      parseInt(functional4.inlineLungeLeft) || 0,
      parseInt(functional4.inlineLungeRight) || 0,
      parseInt(functional4.hipHingeLeft) || 0,
      parseInt(functional4.hipHingeRight) || 0
    ];
    
    return sagittalScores.every(score => score >= 2) && !hasDisqualifyingAsymmetries();
  };

  const hasDisqualifyingAsymmetries = () => {
    const leftRight = [
      [parseInt(functional4.inlineLungeLeft) || 0, parseInt(functional4.inlineLungeRight) || 0],
      [parseInt(functional4.hipHingeLeft) || 0, parseInt(functional4.hipHingeRight) || 0]
    ];
    
    return leftRight.some(([left, right]) => {
      const diff = Math.abs(left - right);
      return diff >= 2 && (left === 1 || right === 1);
    });
  };

  const isFundamental8Recommended = () => {
    return calculateF4Score() < 15 || hasRedFlags();
  };

  const hasRedFlags = () => {
    return Object.values(parqResponses).some(response => response === 'yes');
  };

  const getCategorizedRedFlags = () => {
    const downgradeFlags = [];
    const modifyFlags = [];
    const monitorFlags = [];
    
    // PAR-Q Red Flags
    Object.entries(parqResponses).forEach(([key, value]) => {
      if (value === 'yes') {
        if (['chestPainActivity', 'chestPainRest', 'dizzinessBalance'].includes(key)) {
          downgradeFlags.push(key);
        } else if (['jointBoneIssues', 'medications', 'surgeriesHospital'].includes(key)) {
          modifyFlags.push(key);
        } else {
          monitorFlags.push(key);
        }
      }
    });
    
    // Movement Red Flags
    if (hasDisqualifyingAsymmetries()) {
      downgradeFlags.push('major_asymmetry');
    }
    
    // Current injury concerns
    if (clientInfo.currentInjuryConcerns && clientInfo.currentInjuryConcerns.trim()) {
      modifyFlags.push('current_injury_concerns');
    }
    
    return { downgradeFlags, modifyFlags, monitorFlags };
  };

  const getProgramRecommendation = () => {
    if (coachOverride.enabled) return coachOverride.program;
    
    const movementLevel = getMovementLevel();
    const strengthLevel = getStrengthLevel();
    const { downgradeFlags, modifyFlags } = getCategorizedRedFlags();
    
    // Any downgrade flags = Foundations (IRM Modified)
    if (downgradeFlags.length > 0) return "FOUNDATIONS (IRM Modified)";
    
    // Movement Level 1 = Foundations (IRM Modified if concerns)
    if (movementLevel === 1) {
      return modifyFlags.length > 0 ? "FOUNDATIONS (IRM Modified)" : "FOUNDATIONS";
    }
    
    // Strength Level 0-1 = Foundations
    if (strengthLevel <= 1) {
      return modifyFlags.length > 0 ? "FOUNDATIONS (IRM Modified)" : "FOUNDATIONS";
    }
    
    // Movement 2 + Strength 2 = Graduation (IRM Modified if concerns)
    if (movementLevel === 2 && strengthLevel === 2) {
      return modifyFlags.length > 0 ? "GRADUATION (IRM Modified)" : "GRADUATION";
    }
    
    // Movement 3-4 + Strength 2+ = Squad
    if (movementLevel >= 3 && strengthLevel >= 2) {
      return modifyFlags.length > 0 ? "SQUAD (IRM Modified)" : "SQUAD";
    }
    
    return "FOUNDATIONS";
  };

  // Export Function
  const exportToGoogleSheets = async () => {
    setExporting(true);
    try {
      const { downgradeFlags, modifyFlags, monitorFlags } = getCategorizedRedFlags();
      
      const exportData = {
        // Timestamp and identification
        timestamp: new Date().toISOString(),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientAge: clientInfo.age,
        coachName: clientInfo.coachName,
        clientType: clientInfo.clientType,
        
        // Goals (5 individual fields)
        goal1: clientInfo.goal1,
        goal2: clientInfo.goal2,
        goal3: clientInfo.goal3,
        goal4: clientInfo.goal4,
        goal5: clientInfo.goal5,
        
        // Background information
        sportingBackground: clientInfo.sportingBackground,
        injuryHistory: clientInfo.injuryHistory,
        currentInjuryConcerns: clientInfo.currentInjuryConcerns,
        
        // PAR-Q responses (all 13)
        parqChronicIllness: parqResponses.chronicIllness || '',
        parqMedications: parqResponses.medications || '',
        parqSurgeriesHospital: parqResponses.surgeriesHospital || '',
        parqJointBoneIssues: parqResponses.jointBoneIssues || '',
        parqChestPainActivity: parqResponses.chestPainActivity || '',
        parqChestPainRest: parqResponses.chestPainRest || '',
        parqDizzinessBalance: parqResponses.dizzinessBalance || '',
        parqBloodPressureCholesterol: parqResponses.bloodPressureCholesterol || '',
        parqSmoking: parqResponses.smoking || '',
        parqFamilyHeartHistory: parqResponses.familyHeartHistory || '',
        parqOtherReasons: parqResponses.otherReasons || '',
        parqOver69Unaccustomed: parqResponses.over69Unaccustomed || '',
        parqPregnant: parqResponses.pregnant || '',
        
        // Functional 4 scores
        f4OverheadSquat: functional4.overheadSquat,
        f4InlineLungeLeft: functional4.inlineLungeLeft,
        f4InlineLungeRight: functional4.inlineLungeRight,
        f4HipHingeLeft: functional4.hipHingeLeft,
        f4HipHingeRight: functional4.hipHingeRight,
        f4LateralLungeLeft: functional4.lateralLungeLeft,
        f4LateralLungeRight: functional4.lateralLungeRight,
        f4TotalScore: calculateF4Score(),
        
        // Functional 4 notes
        f4OverheadSquatNotes: observationNotes.overheadSquat,
        f4InlineLungeNotes: observationNotes.inlineLunge,
        f4HipHingeNotes: observationNotes.hipHinge,
        f4LateralLungeNotes: observationNotes.lateralLunge,
        
        // Fundamental 8 scores
        f8AslrLeft: fundamental8.aslr.left,
        f8AslrRight: fundamental8.aslr.right,
        f8AslrAttempted: fundamental8.aslr.attempted,
        f8AslrNotes: fundamental8.aslr.notes,
        
        f8FaberLeft: fundamental8.faber.left,
        f8FaberRight: fundamental8.faber.right,
        f8FaberAttempted: fundamental8.faber.attempted,
        f8FaberNotes: fundamental8.faber.notes,
        
        f8HipIRLeft: fundamental8.hipIR.left,
        f8HipIRRight: fundamental8.hipIR.right,
        f8HipIRAttempted: fundamental8.hipIR.attempted,
        f8HipIRNotes: fundamental8.hipIR.notes,
        
        f8AnkleMobilityLeft: fundamental8.ankleMobility.left,
        f8AnkleMobilityRight: fundamental8.ankleMobility.right,
        f8AnkleMobilityAttempted: fundamental8.ankleMobility.attempted,
        f8AnkleMobilityNotes: fundamental8.ankleMobility.notes,
        
        f8TrunkStabilityScore: fundamental8.trunkStability.score,
        f8TrunkStabilityAttempted: fundamental8.trunkStability.attempted,
        f8TrunkStabilityNotes: fundamental8.trunkStability.notes,
        
        f8SingleLegBalanceLeft: fundamental8.singleLegBalance.left,
        f8SingleLegBalanceRight: fundamental8.singleLegBalance.right,
        f8SingleLegBalanceAttempted: fundamental8.singleLegBalance.attempted,
        f8SingleLegBalanceNotes: fundamental8.singleLegBalance.notes,
        
        f8ShoulderMobilityLeft: fundamental8.shoulderMobility.left,
        f8ShoulderMobilityRight: fundamental8.shoulderMobility.right,
        f8ShoulderMobilityAttempted: fundamental8.shoulderMobility.attempted,
        f8ShoulderMobilityNotes: fundamental8.shoulderMobility.notes,
        
        f8CrawlPositionScore: fundamental8.crawlPosition.score,
        f8CrawlPositionAttempted: fundamental8.crawlPosition.attempted,
        f8CrawlPositionNotes: fundamental8.crawlPosition.notes,
        
        f8OverallNotes: observationNotes.fundamental8Overall,
        
        // Strength testing
        level1Attempted: strengthTests.level1.attempted,
        level1ReverseLungeSuitcase: strengthTests.level1.reverseLungeSuitcase,
        level1GobletSquat: strengthTests.level1.gobletSquat,
        level1KbSingleLegHinge: strengthTests.level1.kbSingleLegHinge,
        level1Pushups: strengthTests.level1.pushups,
        level1BodyRows: strengthTests.level1.bodyRows,
        
        level2Attempted: strengthTests.level2.attempted,
        level2ReverseLungeSuitcase: strengthTests.level2.reverseLungeSuitcase,
        level2GobletSquat: strengthTests.level2.gobletSquat,
        level2KbSingleLegHinge: strengthTests.level2.kbSingleLegHinge,
        level2Pushups: strengthTests.level2.pushups,
        level2BodyRows: strengthTests.level2.bodyRows,
        
        strengthTestingNotes: observationNotes.strengthTesting,
        
        // Results
        movementLevel: getMovementLevel(),
        strengthLevel: getStrengthLevel(),
        programRecommendation: getProgramRecommendation(),
        
        // Red flags analysis
        downgradeFlags: downgradeFlags.join(', '),
        modifyFlags: modifyFlags.join(', '),
        monitorFlags: monitorFlags.join(', '),
        totalRedFlags: downgradeFlags.length + modifyFlags.length + monitorFlags.length,
        
        // Coach override
        coachOverrideEnabled: coachOverride.enabled,
        coachOverrideProgram: coachOverride.program,
        coachOverrideReasoning: coachOverride.reasoning,
        
        // Final notes
        coachNotes: coachNotes,
        clinicalSummary: clinicalSummary,
        generalObservations: observationNotes.general
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

  // Enhanced Client Information
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

          {/* Enhanced Goals Section */}
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

          {/* Background Information */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Background Information</h3>
            
            <div className="space-y-6">
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

  // Functional 4 Assessment
  const renderFunctional4 = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Functional 4 Movement Assessment</h2>
        <p className="text-gray-600 mb-6">Assess fundamental movement patterns. Each test is scored from 0-3.</p>
        
        <div className="space-y-6">
          {/* Overhead Squat */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">1. Overhead Squat (3 points max)</h3>
            <p className="text-sm text-gray-600 mb-4">Client performs 3 overhead squats. Score the best repetition.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={functional4.overheadSquat}
                onChange={(e) => setFunctional4(prev => ({ ...prev, overheadSquat: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select score...</option>
                <option value="3">3 - Perfect: Arms overhead, thighs parallel, knees tracking</option>
                <option value="2">2 - Good: Minor compensations present</option>
                <option value="1">1 - Poor: Major compensations or restrictions</option>
                <option value="0">0 - Pain or inability to perform</option>
              </select>
              
              <textarea
                value={observationNotes.overheadSquat}
                onChange={(e) => setObservationNotes(prev => ({ ...prev, overheadSquat: e.target.value }))}
                placeholder="Note compensations..."
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Inline Lunge */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">2. Inline Lunge (6 points max - 3 each side)</h3>
            <p className="text-sm text-gray-600 mb-4">Single leg stance on line, lunge back, return. 3 attempts each side.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Left Side</label>
                <select
                  value={functional4.inlineLungeLeft}
                  onChange={(e) => setFunctional4(prev => ({ ...prev, inlineLungeLeft: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="">Select score...</option>
                  <option value="3">3 - Stable throughout, hands on hips</option>
                  <option value="2">2 - Minor balance issues, completes movement</option>
                  <option value="1">1 - Significant balance loss or trunk compensation</option>
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
                  <option value="3">3 - Stable throughout, hands on hips</option>
                  <option value="2">2 - Minor balance issues, completes movement</option>
                  <option value="1">1 - Significant balance loss or trunk compensation</option>
                  <option value="0">0 - Cannot perform or pain</option>
                </select>
              </div>
            </div>
            
            <textarea
              value={observationNotes.inlineLunge}
              onChange={(e) => setObservationNotes(prev => ({ ...prev, inlineLunge: e.target.value }))}
              placeholder="Note balance issues, compensations..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Hip Hinge */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">3. Hip Hinge (6 points max - 3 each side)</h3>
            <p className="text-sm text-gray-600 mb-4">Single leg hip hinge with dowel. Weight shift onto support leg.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Left Side</label>
                <select
                  value={functional4.hipHingeLeft}
                  onChange={(e) => setFunctional4(prev => ({ ...prev, hipHingeLeft: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="">Select score...</option>
                  <option value="3">3 - Perfect hinge, neutral spine, weight shift</option>
                  <option value="2">2 - Good hinge with minor compensation</option>
                  <option value="1">1 - Poor hinge pattern, trunk compensation</option>
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
                  <option value="3">3 - Perfect hinge, neutral spine, weight shift</option>
                  <option value="2">2 - Good hinge pattern with minor compensation</option>
                  <option value="1">1 - Poor hinge pattern, trunk compensation</option>
                  <option value="0">0 - Cannot perform or pain</option>
                </select>
              </div>
            </div>
            
            <textarea
              value={observationNotes.hipHinge}
              onChange={(e) => setObservationNotes(prev => ({ ...prev, hipHinge: e.target.value }))}
              placeholder="Note hip hinge quality, spine position..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Lateral Lunge */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">4. Lateral Lunge/Hinge (6 points max - 3 each side)</h3>
            <p className="text-sm text-gray-600 mb-4">Lateral movement with hip hinge pattern.</p>
            
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
                  <option value="1">1 - Can move laterally but pelvic compensations</option>
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
                  <option value="1">1 - Can move laterally but pelvic compensations</option>
                  <option value="0">0 - Cannot perform laterally or pain</option>
                </select>
              </div>
            </div>
            
            <textarea
              value={observationNotes.lateralLunge}
              onChange={(e) => setObservationNotes(prev => ({ ...prev, lateralLunge: e.target.value }))}
              placeholder="Note lateral movement quality..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
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
  };

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
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Heel past mid-thigh, clean movement</option>
                      <option value="2">2 - Heel past knee level</option>
                      <option value="1">1 - Can't reach past kneecap</option>
                      <option value="0">0 - Pain or can't perform</option>
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
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Heel past mid-thigh, clean movement</option>
                      <option value="2">2 - Heel past knee level</option>
                      <option value="1">1 - Can't reach past kneecap</option>
                      <option value="0">0 - Pain or can't perform</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ASLR Notes</label>
                  <textarea
                    value={fundamental8.aslr.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      aslr: {...prev.aslr, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* FABER - Priority 1 */}
          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
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
              <h3 className="font-semibold text-lg">2. FABER Test - Priority 1</h3>
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
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Knee touches table, no compensations</option>
                      <option value="2">2 - Knee within 6cm of table</option>
                      <option value="1">1 - Knee more than 6cm from table</option>
                      <option value="0">0 - Pain or can't perform</option>
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
                      className="w-full p-2 border border-gray-300 rounded-md"
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
                  <label className="block text-sm font-medium mb-1">FABER Notes</label>
                  <textarea
                    value={fundamental8.faber.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      faber: {...prev.faber, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hip IR - Priority 1 */}
          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
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
              <h3 className="font-semibold text-lg">3. Hip Internal Rotation - Priority 1</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Hip internal rotation mobility in prone position</p>
            
            {fundamental8.hipIR.attempted && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Left Side</label>
                    <select
                      value={fundamental8.hipIR.left}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        hipIR: {...prev.hipIR, left: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - 35°+ internal rotation</option>
                      <option value="2">2 - 20-34° internal rotation</option>
                      <option value="1">1 - 10-19° internal rotation</option>
                      <option value="0">0 - Less than 10° or pain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Right Side</label>
                    <select
                      value={fundamental8.hipIR.right}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        hipIR: {...prev.hipIR, right: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - 35°+ internal rotation</option>
                      <option value="2">2 - 20-34° internal rotation</option>
                      <option value="1">1 - 10-19° internal rotation</option>
                      <option value="0">0 - Less than 10° or pain</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hip IR Notes</label>
                  <textarea
                    value={fundamental8.hipIR.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      hipIR: {...prev.hipIR, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ankle Mobility - Priority 2 */}
          <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.ankleMobility.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  ankleMobility: {...prev.ankleMobility, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">4. Ankle Dorsiflexion Mobility - Priority 2</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Ankle dorsiflexion range of motion</p>
            
            {fundamental8.ankleMobility.attempted && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Left Side</label>
                    <select
                      value={fundamental8.ankleMobility.left}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        ankleMobility: {...prev.ankleMobility, left: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Knee past toes (13cm+)</option>
                      <option value="2">2 - Knee to toes (10-12cm)</option>
                      <option value="1">1 - Knee close to toes (5-9cm)</option>
                      <option value="0">0 - Less than 5cm or pain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Right Side</label>
                    <select
                      value={fundamental8.ankleMobility.right}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        ankleMobility: {...prev.ankleMobility, right: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Knee past toes (13cm+)</option>
                      <option value="2">2 - Knee to toes (10-12cm)</option>
                      <option value="1">1 - Knee close to toes (5-9cm)</option>
                      <option value="0">0 - Less than 5cm or pain</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ankle Mobility Notes</label>
                  <textarea
                    value={fundamental8.ankleMobility.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      ankleMobility: {...prev.ankleMobility, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Single Leg Balance - Priority 2 */}
          <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.singleLegBalance.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  singleLegBalance: {...prev.singleLegBalance, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">5. Single Leg Balance - Priority 2</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Proprioception and single leg stability</p>
            
            {fundamental8.singleLegBalance.attempted && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Left Side</label>
                    <select
                      value={fundamental8.singleLegBalance.left}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        singleLegBalance: {...prev.singleLegBalance, left: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Stable for 30+ seconds</option>
                      <option value="2">2 - Stable for 15-29 seconds</option>
                      <option value="1">1 - Stable for 5-14 seconds</option>
                      <option value="0">0 - Less than 5 seconds or can't perform</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Right Side</label>
                    <select
                      value={fundamental8.singleLegBalance.right}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        singleLegBalance: {...prev.singleLegBalance, right: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Stable for 30+ seconds</option>
                      <option value="2">2 - Stable for 15-29 seconds</option>
                      <option value="1">1 - Stable for 5-14 seconds</option>
                      <option value="0">0 - Less than 5 seconds or can't perform</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Single Leg Balance Notes</label>
                  <textarea
                    value={fundamental8.singleLegBalance.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      singleLegBalance: {...prev.singleLegBalance, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Trunk Stability - Priority 3 */}
          <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.trunkStability.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  trunkStability: {...prev.trunkStability, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">6. Trunk Stability Push-up - Priority 3</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Core stability and upper body strength</p>
            
            {fundamental8.trunkStability.attempted && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Score</label>
                  <select
                    value={fundamental8.trunkStability.score}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev, 
                      trunkStability: {...prev.trunkStability, score: e.target.value}
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Performs push-up from toes with straight body</option>
                    <option value="2">2 - Performs push-up from knees with straight line</option>
                    <option value="1">1 - Unable to perform one repetition</option>
                    <option value="0">0 - Pain or cannot maintain position</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trunk Stability Notes</label>
                  <textarea
                    value={fundamental8.trunkStability.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      trunkStability: {...prev.trunkStability, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shoulder Mobility - Priority 3 */}
          <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.shoulderMobility.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  shoulderMobility: {...prev.shoulderMobility, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">7. Shoulder Mobility (Apley's Scratch) - Priority 3</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Shoulder and thoracic spine mobility</p>
            
            {fundamental8.shoulderMobility.attempted && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Left Hand Up</label>
                    <select
                      value={fundamental8.shoulderMobility.left}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        shoulderMobility: {...prev.shoulderMobility, left: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Fists within one hand length</option>
                      <option value="2">2 - Fists within 1.5 hand lengths</option>
                      <option value="1">1 - Fists more than 1.5 hand lengths apart</option>
                      <option value="0">0 - Cannot reach or pain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Right Hand Up</label>
                    <select
                      value={fundamental8.shoulderMobility.right}
                      onChange={(e) => setFundamental8(prev => ({
                        ...prev, 
                        shoulderMobility: {...prev.shoulderMobility, right: e.target.value}
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select score...</option>
                      <option value="3">3 - Fists within one hand length</option>
                      <option value="2">2 - Fists within 1.5 hand lengths</option>
                      <option value="1">1 - Fists more than 1.5 hand lengths apart</option>
                      <option value="0">0 - Cannot reach or pain</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shoulder Mobility Notes</label>
                  <textarea
                    value={fundamental8.shoulderMobility.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      shoulderMobility: {...prev.shoulderMobility, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Crawl Position - Priority 3 */}
          <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={fundamental8.crawlPosition.attempted}
                onChange={(e) => setFundamental8(prev => ({
                  ...prev, 
                  crawlPosition: {...prev.crawlPosition, attempted: e.target.checked}
                }))}
                className="mr-2"
              />
              <h3 className="font-semibold text-lg">8. Crawl Position Hold - Priority 3</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests: Total body stability and coordination</p>
            
            {fundamental8.crawlPosition.attempted && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Score</label>
                  <select
                    value={fundamental8.crawlPosition.score}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev, 
                      crawlPosition: {...prev.crawlPosition, score: e.target.value}
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select score...</option>
                    <option value="3">3 - Holds position 30+ seconds with good form</option>
                    <option value="2">2 - Holds position 15-29 seconds</option>
                    <option value="1">1 - Holds position 5-14 seconds</option>
                    <option value="0">0 - Cannot hold for 5 seconds or pain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Crawl Position Notes</label>
                  <textarea
                    value={fundamental8.crawlPosition.notes}
                    onChange={(e) => setFundamental8(prev => ({
                      ...prev,
                      crawlPosition: {...prev.crawlPosition, notes: e.target.value}
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Note compensations, restrictions, or observations..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall Fundamental 8 Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Fundamental 8 Observations
          </label>
          <textarea
            value={observationNotes.fundamental8Overall}
            onChange={(e) => setObservationNotes(prev => ({
              ...prev,
              fundamental8Overall: e.target.value
            }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="General patterns, overall observations, or additional notes about the Fundamental 8 testing..."
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

  // Strength Testing Section
  const renderStrengthTesting = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Strength Testing</h2>
        
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
             getStrengthLevel() === 2 ? 'Moderate load competency, ready for progressive training' : 
             'Advanced strength testing required for higher levels'}
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
            Continue to Results
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Results with Coach Override
  const renderResults = () => {
    const { downgradeFlags, modifyFlags, monitorFlags } = getCategorizedRedFlags();
    
    return (
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Assessment Results & Export</h2>
        
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
            {(downgradeFlags.length > 0 || modifyFlags.length > 0) && (
              <p className="text-sm text-red-600">⚠️ {downgradeFlags.length + modifyFlags.length} concerns</p>
            )}
          </div>
        </div>

        {/* Red Flags Analysis */}
        {(downgradeFlags.length > 0 || modifyFlags.length > 0 || monitorFlags.length > 0) && (
          <div className="mb-8 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Red Flags Analysis</h3>
            
            {downgradeFlags.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-medium text-red-800">Major Concerns (Downgrade Flags):</h4>
                <p className="text-sm text-red-700">{downgradeFlags.join(', ')}</p>
              </div>
            )}
            
            {modifyFlags.length > 0 && (
              <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded">
                <h4 className="font-medium text-orange-800">Minor Concerns (Modify Flags):</h4>
                <p className="text-sm text-orange-700">{modifyFlags.join(', ')}</p>
              </div>
            )}
            
            {monitorFlags.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800">Monitor Flags:</h4>
                <p className="text-sm text-yellow-700">{monitorFlags.join(', ')}</p>
              </div>
            )}
          </div>
        )}

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
                    <option value="GRADUATION (IRM Modified)">GRADUATION (IRM Modified)</option>
                    <option value="SQUAD">SQUAD</option>
                    <option value="SQUAD (IRM Modified)">SQUAD (IRM Modified)</option>
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

        {/* General Observations */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">General Observations</label>
          <textarea
            value={observationNotes.general}
            onChange={(e) => setObservationNotes(prev => ({ ...prev, general: e.target.value }))}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Any additional observations or notes about the assessment..."
          />
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
                    <strong>Assessment successfully exported!</strong> Data is now available in Google Sheets for Trainerize automation and coach review.
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
          SIM Assessment Decision Tool
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Comprehensive movement assessment and program recommendation system (Working V3)
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