// FILE: server/server.js (Updated for condensed 25-field export)
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['https://sim-assessment-tool.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1v0V-Ny8HVjXI03jpn6J5jFh_foIHGw_SyoGL1F2Jfc8';

async function getGoogleSheetsClient() {
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: SCOPES,
});
  });
  
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Export endpoint for condensed data structure
app.post('/export', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received condensed export request for:', data.clientName);
    
    const sheets = await getGoogleSheetsClient();
    
    // Convert condensed data object to array of 25 values for Google Sheets
    const row = [
      // Essential individual fields (for automation)
      data.timestamp,                    // A1
      data.clientName,                   // B2
      data.clientEmail,                  // C3
      data.coachName,                    // D4
      data.finalProgramRecommendation,   // E5

      // Summary fields
      data.clientSummary,                // F6
      data.goalsSummary,                 // G7
      data.backgroundSummary,            // H8
      data.parqSummary,                  // I9
      
      data.f4TotalScore,                 // J10
      data.f4Details,                    // K11
      data.movementLevel,                // L12
      
      data.f8Summary,                    // M13
      
      data.strengthLevel,                // N14
      data.strengthDetails,              // O15
      
      data.redFlagsSummary,              // P16
      data.systemRecommendation,         // Q17
      data.coachOverride,                // R18
      
      data.clinicalSummary,              // S19
      data.coachNotes,                   // T20
      
      // Boolean/Status fields
      data.strengthTestingReady,         // U21
      data.fundamental8Recommended,      // V22
      data.currentInjuryFlag,            // W23
      data.totalRedFlags,                // X24
      data.assessmentCompleteFlag        // Y25
    ];
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:Y',  // Updated range for 25 columns
      valueInputOption: 'RAW',
      resource: {
        values: [row]
      }
    });
    
    console.log('Successfully exported condensed data to Google Sheets');
    res.json({ 
      success: true, 
      response: response.data,
      fieldsExported: 25,
      message: 'Condensed assessment data exported successfully'
    });
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack,
      message: 'Failed to export condensed assessment data'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SIM Assessment Export API',
    version: 'v3-condensed',
    fieldsSupported: 25,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SIM Assessment Server running on http://localhost:${PORT}`);
  console.log('📊 Google Sheets integration ready (25-field condensed structure)');
  console.log('✅ Ready to receive assessment exports');
});