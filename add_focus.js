const fs = require('fs');
const target = 'C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/InterviewSession.jsx';
let code = fs.readFileSync(target, 'utf8');

code = code.replace("const finalTranscriptRef = useRef('');", "const finalTranscriptRef = useRef('');\n  const textareaRef = useRef(null);");

code = code.replace("<textarea", "<textarea\n            ref={textareaRef}");

const useEffectFocus = `// Focus textarea on question change
  useEffect(() => {
    if (isStarted && !loading) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [currentIdx, isStarted, loading]);

  // Auto-read question when it changes`;

code = code.replace("// Auto-read question when it changes", useEffectFocus);

fs.writeFileSync(target, code);
console.log('Autofocus added to InterviewSession.jsx');
