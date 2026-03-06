const fs = require('fs');
const target = 'C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/CandidateInterview.jsx';
let code = fs.readFileSync(target, 'utf8');

if (!code.includes('const textareaRef = useRef(null);')) {
  code = code.replace("const recognitionRef = useRef(null);", "const recognitionRef = useRef(null);\n  const textareaRef = useRef(null);");
}

code = code.replace("<textarea", "<textarea\n                ref={textareaRef}");

if (!code.includes('textareaRef.current?.focus()')) {
  const useEffectFocus = `// Focus textarea on question change
    useEffect(() => {
      if (isStarted && !loading && textareaRef.current) {
        setTimeout(() => textareaRef.current.focus(), 100);
      }
    }, [currentIdx, isStarted, loading]);

    // Format time helpers`;

  code = code.replace("// Format time helpers", useEffectFocus);
}

fs.writeFileSync(target, code);
console.log('Autofocus added to CandidateInterview.jsx');
