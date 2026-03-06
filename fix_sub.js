const fs = require('fs');
let s = fs.readFileSync('frontend/src/pages/SubscriptionPlan.jsx', 'utf8');

// Header size
s = s.replace(/fontSize: '2.5rem',/, "fontSize: '2rem',");
s = s.replace(/marginBottom: '4rem'/, "marginBottom: '2rem'");

// Card styling - reduce padding
s = s.replace(/padding: '32px',/, "padding: '24px',");
s = s.replace(/border: '1px solid rgba\\(255,255,255,0.05\\)',/g, "border: '1px solid rgba(255,255,255,0.1)',\n    boxShadow: '0 4px 20px rgba(255,255,255,0.05)',");

// Modifying the features to be generous
s = s.replace(
  /<Feature text="Basic AI Chatbot \\(5 interviews\\/mo\\)" \\/>\\n\\s*<Feature text="Limited Question Bank" \\/>\\n\\s*<Feature text="Standard Resume Parsing \\(2\\/mo\\)" \\/>\\n\\s*<Feature text="Community Support" missing \\/>\\n\\s*<Feature text="Advanced Analytics" missing \\/>/,
  \<Feature text="10 AI Live Interviews / mo" />
              <Feature text="5 Smart Resume Scans (ATS) / mo" />
              <Feature text="Access to 5 Question Banks" />
              <Feature text="2 AI Mock Scenarios" />
              <Feature text="Community Support" missing />\
);

s = s.replace(
  /<Feature text="Advanced AI Interviewer \\(20\\/mo\\)" \\/>\\n\\s*<Feature text="Unlimited Question Banks" \\/>\\n\\s*<Feature text="Deep ATS Resume Optimization \\(10\\/mo\\)" \\/>\\n\\s*<Feature text="Priority Email Support" \\/>\\n\\s*<Feature text="Personalized Feedback" \\/>/,
  \<Feature text="50 AI Live Interviews / mo" />
              <Feature text="25 Smart Resume Scans (ATS) / mo" />
              <Feature text="Unlimited Question Banks" />
              <Feature text="10 AI Mock Scenarios" />
              <Feature text="Personalized Feedback" />\
);

s = s.replace(
  /<Feature text="Unlimited AI Interviews & Scenarios" \\/>\\n\\s*<Feature text="Live Human Review \\(1\\/mo\\)" \\/>\\n\\s*<Feature text="Unlimited ATS Resume Scans" \\/>\\n\\s*<Feature text="24\\/7 Priority Support" \\/>\\n\\s*<Feature text="1-on-1 Strategy Session" \\/>/,
  \<Feature text="Unlimited AI Live Interviews" />
              <Feature text="Unlimited Smart Resume Scans" />
              <Feature text="Unlimited Question Banks (All)" />
              <Feature text="Unlimited AI Mock Scenarios" />
              <Feature text="Live Human Review (1/mo)" />\
);

fs.writeFileSync('frontend/src/pages/SubscriptionPlan.jsx', s, 'utf8');
