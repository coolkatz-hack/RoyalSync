import {
  ClientProfile,
  PolicyAsset,
  LiabilityItem,
  AutomatedReminder,
  FinancialGoal,
  MotorClaim,
  ServiceRequest,
  AccidentChecklistItem
} from './types';

export const initialProfile: ClientProfile = {
  id: 'cl-89021',
  fullName: 'Sipho Dlamini',
  idNumber: '840612 5289 084',
  clientNumber: 'RSF-8921-ZA',
  email: 'sipho.dlamini@techventures.co.za',
  phone: '+27 82 555 7842',
  address: '42 West Road South, Morningside, Sandton, 2196',
  employment: 'Chief Operating Officer',
  employer: 'Apex Cloud Solutions Africa',
  occupation: 'Chief Operating Officer & FinTech Director',
  monthlyGrossIncome: 145000,
  monthlyExpenses: 68500,
  taxNumber: '9284 102 441',
  adviser: {
    name: 'Qiniso Ntuli',
    director: 'Qiniso Ntuli',
    fspNumber: '29370',
    office: 'Johannesburg Central',
    phone: '011 492 1566',
    email: 'adviser@royalsquare.co.za',
    address: '4 Pritchard Street, Johannesburg - 2001'
  }
};

export const initialPolicies: PolicyAsset[] = [
  {
    id: 'pol-1',
    category: 'short_term',
    provider: 'Santam',
    name: 'Comprehensive Motor & Household Contents',
    policyNumber: 'SAN-774921-B',
    currentValue: 680000,
    monthlyPremium: 2850,
    coverAmount: 1850000,
    status: 'Active',
    renewalDate: '2026-11-01',
    description: '2023 BMW 320d M Sport + R1.2M Morningside household contents & all-risk portable possessions',
    details: {
      'Vehicle': '2023 BMW 320d M Sport (Reg: HG 44 DF GP)',
      'Excess': 'R 3,500 basic excess',
      'Car Hire Option': 'Group B unlimited days included',
      'Building / Contents': 'R 1,200,000 combined sum insured'
    }
  },
  {
    id: 'pol-2',
    category: 'investments',
    provider: 'Allan Gray',
    name: 'Balanced Fund & Tax-Free Investment',
    policyNumber: 'AG-902148',
    currentValue: 1845000,
    monthlyPremium: 9500,
    status: 'Active',
    description: 'High capital growth multi-asset fund with annualized 13.8% return over 5 years + TFSA maxed',
    details: {
      'Tax-Free Investment': 'R 36,000 annual limit utilized',
      'Risk Profile': 'Moderate-Aggressive Balanced Growth',
      'Fund Manager': 'Allan Gray Unit Trusts',
      'Quarterly Fee': '0.65% p.a. clean class'
    }
  },
  {
    id: 'pol-3',
    category: 'investments',
    provider: 'Sanlam',
    name: 'Glacier Retirement Annuity & Offshore Feeder',
    policyNumber: 'SLM-RA-55102',
    currentValue: 1420000,
    monthlyPremium: 12000,
    status: 'Active',
    description: 'Regulation 28 compliant retirement vehicle maximizing 27.5% SARS tax deductions',
    details: {
      'SARS Deduction Benefit': 'R 39,600 tax rebate annually',
      'Target Retirement Age': '60 years',
      'Offshore Allocation': '45% global equity exposure via Glacier'
    }
  },
  {
    id: 'pol-4',
    category: 'life_insurance',
    provider: 'Discovery',
    name: 'Discovery Life Comprehensive Cover',
    policyNumber: 'DIS-LF-33819',
    currentValue: 0,
    coverAmount: 8500000,
    monthlyPremium: 3420,
    status: 'Active',
    renewalDate: '2027-03-15',
    description: 'R5.5M Pure Life Cover, R2M Capital Disability & R1M Severe Illness with Vitality Diamond discount',
    details: {
      'Life Cover': 'R 5,500,000',
      'Permanent Disability': 'R 2,000,000',
      'Vitality Status': 'Diamond (22.5% premium payback)'
    }
  },
  {
    id: 'pol-5',
    category: 'medical',
    provider: 'Discovery',
    name: 'Classic Comprehensive Medical Scheme',
    policyNumber: 'DH-8812903',
    currentValue: 0,
    monthlyPremium: 7850,
    status: 'Active',
    description: 'Comprehensive hospital cover with private ward access, above-threshold medical savings for family of 4',
    details: {
      'Plan': 'Classic Comprehensive + Gap Cover',
      'Dependents': 'Spouse (Zanele) + 2 Minor Children',
      'Savings Balance': 'R 18,420 available'
    }
  },
  {
    id: 'pol-6',
    category: 'life_insurance',
    provider: 'Liberty',
    name: 'Lifestyle Protector Severe Illness',
    policyNumber: 'LIB-LP-66219',
    currentValue: 0,
    coverAmount: 1500000,
    monthlyPremium: 1150,
    status: 'Active',
    description: 'Comprehensive critical illness cover covering 100% of cardiac, oncological, and neurological events',
    details: {
      'Payout Model': 'Tier 1 Multi-stage Claim',
      'Indexation': 'CPI + 2% annual cover increase'
    }
  },
  {
    id: 'pol-7',
    category: 'life_insurance',
    provider: 'Old Mutual',
    name: 'Extended Family Funeral Scheme',
    policyNumber: 'OM-FN-10492',
    currentValue: 0,
    coverAmount: 250000,
    monthlyPremium: 680,
    status: 'Active',
    description: 'Immediate 24-hour pay-out cover for extended family members, repatriations and tombstone allowance',
    details: {
      'Lives Covered': '8 extended family members',
      'Payout Speed': 'Under 4 hours upon receipt of BI-1663'
    }
  }
];

export const initialLiabilities: LiabilityItem[] = [
  {
    id: 'liab-1',
    provider: 'Standard Bank',
    name: 'Primary Residence Home Loan',
    accountNumber: 'HL-094182910',
    totalBalance: 1150000,
    monthlyPayment: 14200,
    interestRate: 'Prime - 1.15% (10.60%)'
  },
  {
    id: 'liab-2',
    provider: 'WesBank',
    name: 'BMW Financial Services Vehicle Finance',
    accountNumber: 'WB-7729104',
    totalBalance: 270000,
    monthlyPayment: 7850,
    interestRate: 'Prime (11.75%)'
  }
];

export const initialReminders: AutomatedReminder[] = [
  {
    id: 'rem-1',
    type: 'valuation_certificate',
    title: 'Insurance Valuation Certificate Due (Every 2 Years)',
    description: 'Santam requires an updated valuation certificate for specified jewellery, art, and high-value home contents every 24 months to prevent under-insurance average clauses.',
    dueDate: '2026-09-30',
    frequency: 'Every 2 years',
    targetRecipient: 'both',
    severity: 'urgent',
    status: 'action_required',
    actionLabel: 'Upload Valuation Cert',
    actionType: 'upload_valuation'
  },
  {
    id: 'rem-2',
    type: 'driving_licence',
    title: 'Driving Licence Card Renewal (Expiring in 45 Days)',
    description: 'Your South African driver licence card expires on 20 October 2026. Insurers may repudiate motor accident claims if driving with an expired licence card without valid booking proof.',
    dueDate: '2026-10-20',
    frequency: 'Every 5 years',
    targetRecipient: 'client',
    severity: 'warning',
    status: 'pending',
    actionLabel: 'DLTC Booking Guide',
    actionType: 'dltc_guide'
  },
  {
    id: 'rem-3',
    type: 'annual_review',
    title: 'Annual Financial Review Meeting with Qiniso Ntuli',
    description: 'Scheduled comprehensive portfolio review at Royal Square Financial (4 Pritchard St or Microsoft Teams). Review asset allocation, tax deductions, and will/estate update.',
    dueDate: '2026-10-15',
    frequency: 'Annual',
    targetRecipient: 'us',
    severity: 'info',
    status: 'pending',
    actionLabel: 'Confirm Review Slot',
    actionType: 'book_review'
  },
  {
    id: 'rem-4',
    type: 'retirement_fee',
    title: 'Retirement Fee & Expense Ratio Benchmarking',
    description: 'Mandatory annual FAIS fee disclosure review: Check Allan Gray & Sanlam Total Expense Ratios (TER) to verify fee competitiveness and optimize SARS 27.5% annual limits.',
    dueDate: '2026-11-10',
    frequency: 'Annual',
    targetRecipient: 'us',
    severity: 'info',
    status: 'pending',
    actionLabel: 'View Fee Report',
    actionType: 'view_fees'
  },
  {
    id: 'rem-5',
    type: 'birthday_anniversary',
    title: 'Client 42nd Birthday & Policy Milestone Anniversary',
    description: 'Automated Royal Square relationship touchpoint & policy longevity review scheduled for delivery.',
    dueDate: '2026-10-12',
    frequency: 'Annual (Automated)',
    targetRecipient: 'us',
    severity: 'info',
    status: 'pending'
  }
];

export const initialGoals: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Retirement Wealth Nest Egg',
    category: 'retirement',
    targetAmount: 15000000,
    currentAmount: 3265000,
    currency: 'ZAR',
    targetYear: 2044,
    monthlyContribution: 21500,
    progressPercent: 21.8,
    ownership: 'individual',
    adviserNote: 'On track with CPI+5% growth assumption across Allan Gray Balanced and Sanlam Glacier. Consider increasing debit order by 8% annually to account for inflation.',
    status: 'on_track'
  },
  {
    id: 'goal-2',
    title: "Children's Tertiary Education & Overseas University",
    category: 'education',
    targetAmount: 1200000,
    currentAmount: 680000,
    currency: 'ZAR',
    targetYear: 2031,
    monthlyContribution: 6500,
    progressPercent: 56.7,
    ownership: 'shared',
    sharedWith: 'Zanele Dlamini (Spouse)',
    adviserNote: 'Funded through Tax-Free Savings Account (TFSA) and global index equity feeder. Sufficient to fund 4-year undergraduate degree at UCT or international equivalent tuition.',
    status: 'on_track'
  },
  {
    id: 'goal-3',
    title: 'Offshore Hard-Currency Diversification ($50k)',
    category: 'offshore',
    targetAmount: 925000, // ~$50k at R18.50/$
    currentAmount: 550000,
    currency: 'ZAR',
    targetYear: 2028,
    monthlyContribution: 8000,
    progressPercent: 59.5,
    ownership: 'individual',
    adviserNote: 'Utilizing Single Discretionary Allowance (SDA) via Glacier offshore platform. Hedging against rand volatility.',
    status: 'on_track'
  },
  {
    id: 'goal-4',
    title: '6-Month Emergency Liquidity Reserve',
    category: 'emergency',
    targetAmount: 300000,
    currentAmount: 300000,
    currency: 'ZAR',
    targetYear: 2026,
    monthlyContribution: 0,
    progressPercent: 100,
    ownership: 'individual',
    adviserNote: 'Fully funded! Held in Nedbank 32-day notice deposit earning 8.75% interest, accessible immediately for emergencies.',
    status: 'completed'
  }
];

export const initialSceneChecklist: AccidentChecklistItem[] = [
  {
    id: 'chk-1',
    label: 'Photos of the road surface and direction of travel',
    description: 'Capture skid marks, road conditions, traffic signs, traffic lights, and direction of travel.',
    completed: true,
    photoCount: 3
  },
  {
    id: 'chk-2',
    label: 'The address or nearest cross streets',
    description: 'Exact location of collision or GPS pin (e.g. Corner Rivonia Rd & Sandton Dr).',
    completed: true,
    notes: 'Corner Grayston Drive & Rivonia Road, Sandton'
  },
  {
    id: 'chk-3',
    label: 'Photos of all vehicles and people involved',
    description: 'Wide and close-up angles of impact damage on your car and other vehicles.',
    completed: true,
    photoCount: 4
  },
  {
    id: 'chk-4',
    label: 'Licence plates and windscreen registration discs',
    description: 'Clear photo of licence plates and licence disc on windscreen (shows VIN and expiry).',
    completed: true,
    photoCount: 2
  },
  {
    id: 'chk-5',
    label: 'ID documents or driver licence cards of everyone involved',
    description: 'Photo of the other driver(s) RSA licence card front & back.',
    completed: true,
    photoCount: 2
  },
  {
    id: 'chk-6',
    label: 'Witness names, contact numbers, plus a voice note',
    description: 'Independent eyewitness statements are vital for Santam third-party recovery.',
    completed: false,
    voiceNoteAttached: false
  },
  {
    id: 'chk-7',
    label: 'Insurance details of the other parties',
    description: 'Ask for the other driver insurer name, policy number, and brokerage if known.',
    completed: true,
    notes: 'Insured with Discovery Insure (Policy #DIS-77189)'
  },
  {
    id: 'chk-8',
    label: 'Police report reminder within 48 hours (CRITICAL)',
    description: 'South African law requires motor accidents involving damage/injury to be reported to SAPS within 48 hours to receive an Accident Report (AR) / CAS number.',
    completed: false,
    notes: 'Deadline: 48 hours from incident time'
  }
];

export const initialClaims: MotorClaim[] = [
  {
    id: 'claim-1',
    claimReference: 'SAN-883921-MTR',
    insurer: 'Santam',
    policyNumber: 'SAN-774921-B',
    incidentDate: '2026-09-02',
    incidentTime: '17:45',
    incidentLocation: 'Corner Grayston Drive & Rivonia Road, Sandton',
    incidentDescription: 'Third party vehicle failed to yield at traffic intersection and clipped the right-front bumper, headlamp, and fender of the BMW 320d. No injuries sustained.',
    policeNotified: true,
    policeCaseNumber: 'CAS 312/09/2026',
    policeStation: 'Sandton Police Station (SAPS)',
    policeReportDeadline: 'Completed within 48 hours',
    driverName: 'Sipho Dlamini',
    driverLicenceNumber: 'DL-840612-GP',
    driverUsageType: 'personal',
    vehicleModel: '2023 BMW 320d M Sport (Alpine White)',
    vehicleRegistration: 'HG 44 DF GP',
    thirdPartyInvolved: true,
    thirdPartyDetails: {
      name: 'Kagiso Moeketsi',
      phone: '071 892 4410',
      vehicleReg: 'ND 819 203',
      insurer: 'Discovery Insure',
      policyNumber: 'DIS-MTR-9021'
    },
    witnessDetails: 'Security guard at Grayston Shopping Centre (Mr. Ndlovu, 073 119 4821)',
    hasWitnessStatement: true,
    photosCount: 8,
    hasSketch: true,
    hasLicenceDiscPhoto: true,
    currentStepIndex: 5, // Currently on step 6: "Client picks a date for the vehicle to go in"
    handlerName: 'Thabo Molefe',
    handlerContact: '011 380 4000 (Ext 4192) / claims@santam.co.za',
    authorisedAmount: 42850,
    excessPayable: 3500,
    createdAt: '2026-09-02T19:20:00Z',
    steps: [
      {
        stepNumber: 1,
        title: 'Insurer returns a claim number and a claims handler',
        description: 'Santam registered claim #SAN-883921-MTR. Claims handler assigned: Thabo Molefe.',
        status: 'completed',
        date: '2026-09-03 08:30',
        notes: 'Claim registered directly via Royal Square Financial broker portal.'
      },
      {
        stepNumber: 2,
        title: 'Client takes the vehicle for assessment',
        description: 'Vehicle booked and inspected at Santam Drive-In Assessment Centre, Sandton.',
        status: 'completed',
        date: '2026-09-03 14:15',
        notes: 'Driveable damage: front bumper skin, RH LED headlight cluster, front RH quarter fender.'
      },
      {
        stepNumber: 3,
        title: 'Assessment goes to the insurer and to us',
        description: 'Digital assessor report transmitted to Santam claims department and Royal Square Financial.',
        status: 'completed',
        date: '2026-09-04 09:10',
        notes: 'Report received by Qiniso Ntuli at Royal Square Financial.'
      },
      {
        stepNumber: 4,
        title: 'Repair quotes go to the insurer',
        description: 'Authorized factory-approved repairer (Renew-it Sandton - BMW Approved) submitted quote.',
        status: 'completed',
        date: '2026-09-04 11:45',
        notes: 'Quote reference #REN-2026-8812 totaling R 42,850.00 incl. VAT.'
      },
      {
        stepNumber: 5,
        title: 'Insurer authorises repairs',
        description: 'Santam issued repair authorization letter. Basic client excess: R 3,500.00.',
        status: 'completed',
        date: '2026-09-04 16:00',
        notes: 'Santam approved 100% of parts and paint labor with BMW OEM parts.'
      },
      {
        stepNumber: 6,
        title: 'Client picks a date for the vehicle to go in',
        description: 'Select your preferred drop-off date with Renew-it Sandton for repair commencement.',
        status: 'current',
        date: 'Pending your selection',
        actionRequired: true,
        actionPrompt: 'Select vehicle drop-off date'
      },
      {
        stepNumber: 7,
        title: 'We arrange car hire and delivery to the repairer',
        description: 'Royal Square Financial coordinates your Europcar Group B replacement vehicle directly at the panel shop on drop-off day.',
        status: 'upcoming'
      },
      {
        stepNumber: 8,
        title: 'Weekly repair updates pushed to us',
        description: 'Panel beating, primer, spray booth, and electronic sensor calibration progress updates sent automatically.',
        status: 'upcoming'
      },
      {
        stepNumber: 9,
        title: 'We arrange collection and return of the hire car',
        description: 'Quality inspection sign-off, vehicle collection from Renew-it, and hire car drop-off.',
        status: 'upcoming'
      },
      {
        stepNumber: 10,
        title: 'Client writes a short review and closes the transaction',
        description: 'Confirm vehicle satisfaction, excess settlement receipt, and provide feedback on broker service.',
        status: 'upcoming'
      }
    ]
  }
];

export const initialServiceRequests: ServiceRequest[] = [
  {
    id: 'req-1',
    type: 'request_border_letter',
    title: 'Cross-Border Travel Letter (Mozambique)',
    status: 'Approved & Synced',
    submittedDate: '2026-08-28',
    details: {
      'Vehicle': '2023 BMW 320d M Sport (Reg: HG 44 DF GP)',
      'Destination': 'Mozambique (Ponta do Ouro & Maputo)',
      'Trip Dates': '18 Sep 2026 - 25 Sep 2026',
      'Financier Permission': 'WesBank Permission letter attached',
      'Insurer Confirmation': 'Santam Territorial extension active (R0 excess penalty)'
    },
    documentUrl: 'Royal_Square_Border_Letter_HG44DFGP.pdf'
  },
  {
    id: 'req-2',
    type: 'request_tax_cert',
    title: 'IT3(b) & IT3(c) Tax Certificates (2025/2026 SARS)',
    status: 'Approved & Synced',
    submittedDate: '2026-07-15',
    details: {
      'Provider': 'Allan Gray & Sanlam Glacier',
      'Tax Year': '2026 Assessment Year',
      'Purpose': 'SARS eFiling Individual Income Tax submission',
      'Status': 'Transmitted directly to client and accountant'
    },
    documentUrl: 'Allan_Gray_IT3b_IT3c_2026_Tax_Certificate.pdf'
  },
  {
    id: 'req-3',
    type: 'change_address',
    title: 'Residential Address Update Across All Policies',
    status: 'Approved & Synced',
    submittedDate: '2026-05-10',
    details: {
      'New Address': '42 West Road South, Morningside, Sandton, 2196',
      'FICA Document': 'City of Johannesburg Rates & Taxes bill verified',
      'Synced Providers': 'Santam, Sanlam, Discovery, Allan Gray, Liberty'
    }
  }
];

// Export aliases matching App and Component imports
export const mockClientProfile = initialProfile;
export const mockPolicies = initialPolicies;
export const mockLiabilities = initialLiabilities;
export const mockReminders = initialReminders;
export const mockGoals = initialGoals;
export const mockActiveClaim = initialClaims[0];
export const mockAccidentChecklist = initialSceneChecklist;
export const mockServiceRequests = initialServiceRequests;

