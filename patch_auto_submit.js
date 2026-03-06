const fs = require('fs');

function patch(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Let's find: `const wasListeningRef = useRef(false);` and add our latestAnswerRef
  if (!code.includes('const latestAnswerRef = useRef(answer);')) {
    code = code.replace(
      'const wasListeningRef = useRef(false);', 
      'const wasListeningRef = useRef(false);\n  const latestAnswerRef = useRef(answer);\n  useEffect(() => { latestAnswerRef.current = answer; }, [answer]);'
    );
  }

  // Now, find the auto-submit effect block
  const oldEffect = /\/\/ Auto-submit when mic turns off[\s\S]*?wasListeningRef\.current = isListening;\s*\}, \[isListening\]\);/g;

  let goNextCall = code.includes('handleSaveAndNext') ? 'handleSaveAndNext()' : 'goNext()';

  // For auto submit, we only care about `isListening` transitioning from true -> false.
  // And we will use the `latestAnswerRef.current` to submit so we don't have dependency cycles on `answer`.
  const newEffect = `// Auto-submit when mic turns off
  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      if (latestAnswerRef.current.trim()) {
        ${goNextCall};
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening]);`;

  code = code.replace(oldEffect, newEffect);

  fs.writeFileSync(filePath, code);
  console.log('Patched ' + filePath);
}

patch('C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/InterviewSession.jsx');
patch('C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/CandidateInterview.jsx');
