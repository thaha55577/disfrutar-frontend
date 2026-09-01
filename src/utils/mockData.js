/**
 * Mock & Demo Dataset for DSFRUTAR-2K26
 * Enables standalone UI/CSS testing and demo evaluation.
 */

export const DEMO_TEAMS = {
  "TEAM-101": {
    TeamID: "TEAM-101",
    password: "dsfrutar2026",
    "Team Name": "CYBER NEXUS",
    Members: [
      {
        name: "Alex Mercer",
        regNo: "REG-9801",
        email: "alex.mercer@klu.ac.in",
        phone: "+91 98765 43210",
        year: "3rd Year",
        branch: "CSE",
        FeedbackSubmitted: true
      },
      {
        name: "Sarah Connor",
        regNo: "REG-9802",
        email: "sarah.connor@klu.ac.in",
        phone: "+91 98765 43211",
        year: "3rd Year",
        branch: "AI & DS",
        FeedbackSubmitted: false
      },
      {
        name: "Bruce Wayne",
        regNo: "REG-9803",
        email: "bruce.wayne@klu.ac.in",
        phone: "+91 98765 43212",
        year: "3rd Year",
        branch: "ECE",
        FeedbackSubmitted: false
      }
    ],
    SelectedProblem: {
      id: "PS-01",
      title: "Autonomous Disaster Relief Mesh Network",
      track: "Artificial Intelligence & Edge Computing",
      description: "Design and implement a decentralized mesh communication system capable of coordinating drone telemetry and rescue payloads in severe emergency scenarios with zero internet access."
    },
    Certificates: {
      "Alex Mercer": ["https://example.com/alex_data_analytics_essentials.pdf"]
    }
  },

  "STUDENT-01": {
    TeamID: "STUDENT-01",
    password: "student123",
    "Team Name": "NEURAL SYNAPSE",
    Members: [
      {
        name: "Shaik Thaha",
        regNo: "REG-7701",
        email: "shaik.thaha@klu.ac.in",
        phone: "+91 91234 56780",
        year: "4th Year",
        branch: "CSE - AI",
        FeedbackSubmitted: true
      },
      {
        name: "Maya Lin",
        regNo: "REG-7702",
        email: "maya.lin@klu.ac.in",
        phone: "+91 91234 56781",
        year: "4th Year",
        branch: "IT",
        FeedbackSubmitted: false
      }
    ],
    SelectedProblem: {
      id: "PS-02",
      title: "Real-time Distributed Carbon Telemetry",
      track: "IoT & Sustainable Tech",
      description: "Build an ultra-low-power industrial sensor gateway using edge ML to measure and forecast real-time localized emissions with cryptographic audit trails."
    },
    Certificates: {}
  },

  "DEMO": {
    TeamID: "DEMO",
    password: "demo123",
    "Team Name": "ALPHA PROTOTYPE",
    Members: [
      {
        name: "John Doe",
        regNo: "REG-1001",
        email: "john.doe@klu.ac.in",
        phone: "+91 90000 00001",
        year: "2nd Year",
        branch: "CSE",
        FeedbackSubmitted: false
      },
      {
        name: "Jane Smith",
        regNo: "REG-1002",
        email: "jane.smith@klu.ac.in",
        phone: "+91 90000 00002",
        year: "2nd Year",
        branch: "AI & ML",
        FeedbackSubmitted: false
      }
    ],
    SelectedProblem: null,
    Certificates: {}
  }
};

export const DEMO_ADMIN_KEYS = [
  "admin123",
  "dsfrutar26",
  "ob26acm",
  "ob26gfg"
];
