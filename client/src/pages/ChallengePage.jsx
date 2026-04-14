import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../utils/axios";
import Navbar from "../components/Navbar";

const ChallengePage = () => {
  const { challengeId } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [forking, setForking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [forkInfo, setForkInfo] = useState(null);
  const [githubError, setGithubError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const navigate = useNavigate();
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await API.get(`/courses/challenge/${challengeId}`);
        setChallenge(res.data.data || res.data);
        setCode(res.data.data?.boilerplateCode || res.data?.boilerplateCode || "");
      } catch (err) {
        console.error("Error fetching challenge:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [challengeId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleFork = async () => {
    setForking(true);
    setGithubError(null);
    try {
      const res = await API.post(`/courses/challenge/${challengeId}/fork`);
      setForkInfo(res.data.data || res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setGithubError("Please link your GitHub account in your profile first.");
      } else {
        setGithubError("Failed to fork repository. Please try again later.");
      }
    } finally {
      setForking(false);
    }
  };

  const handleFetchFromGithub = async () => {
    setFetchLoading(true);
    try {
      const res = await API.post(`/courses/challenge/${challengeId}/fetch-from-github`);
      const newCode = res.data.data?.code || res.data?.code;
      if (newCode) {
        setCode(newCode);
      }
    } catch (err) {
      console.error("Error fetching code from GitHub:", err);
      alert("Failed to load code from GitHub. Make sure you've pushed your changes.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResults(null);
    try {
      const res = await API.post(`/courses/challenge/${challengeId}/submit`, { code });
      setResults(res.data.data || res.data);
    } catch (err) {
      console.error("Error submitting code:", err);
      alert("Submission failed. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (forkInfo?.clone_url) {
      navigator.clipboard.writeText(`git clone ${forkInfo.clone_url}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      <Navbar />
      
      <div className="flex-grow flex overflow-hidden">
        {/* Left Panel: Problem Statement */}
        <div className="w-2/5 p-8 overflow-y-auto border-r border-gray-800 bg-gray-900/50">
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </button>

          <h1 className="text-3xl font-black mb-6 text-white tracking-tight">{challenge?.title}</h1>
          
          <div className="prose prose-invert max-w-none mb-10 text-gray-300 leading-relaxed font-medium">
             <div className="whitespace-pre-wrap bg-gray-800/30 p-6 rounded-2xl border border-gray-800/50">
                {challenge?.problemStatement}
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-200 border-b border-gray-800 pb-2">Your Workspace</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition shadow-lg border border-gray-700 flex items-center justify-center gap-2 group"
                onClick={() => document.getElementById('editor-panel').scrollIntoView({ behavior: 'smooth' })}
              >
                <svg className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                Work Online
              </button>
              
              <button 
                className={`w-full py-3 px-6 bg-black hover:bg-gray-900 text-white font-bold rounded-xl transition shadow-lg border border-gray-800 flex items-center justify-center gap-2 group ${forking ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleFork}
                disabled={forking}
              >
                {forking ? (
                   <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                ) : (
                  <svg className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.412-4.041-1.412-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                )}
                Work Locally
              </button>
            </div>

            {githubError && (
              <div className="p-4 bg-red-900/30 border border-red-900/50 text-red-300 rounded-xl text-sm font-semibold flex items-center gap-3 animate-pulse">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {githubError}
              </div>
            )}

            {forkInfo && (
              <div className="p-6 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-sm font-bold text-indigo-300">Repository forked successfully!</p>
                <div className="flex items-center gap-2">
                  <code className="bg-black/50 p-3 rounded-lg flex-grow text-xs text-indigo-400 border border-indigo-900/30 overflow-x-auto whitespace-nowrap">
                    git clone {forkInfo.clone_url}
                  </code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    title="Copy command"
                  >
                    {copySuccess ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    )}
                  </button>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleFetchFromGithub}
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 transition flex items-center justify-center gap-2"
                    disabled={fetchLoading}
                  >
                    {fetchLoading ? (
                       <span className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-400"></span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
                    )}
                    I've pushed my code — Load from GitHub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div id="editor-panel" className="flex-grow flex flex-col bg-gray-900 overflow-hidden relative">
          <div className="bg-gray-800/80 px-6 py-3 border-b border-gray-700 flex justify-between items-center backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ml-4 text-xs font-mono text-gray-400 uppercase tracking-widest">main.js</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${submitting ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-900 border border-indigo-500/50'} text-indigo-100`}>
              {submitting ? 'Submitting...' : 'Ready'}
            </div>
          </div>
          
          <div className="flex-grow overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Monaco', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3
              }}
            />
          </div>

          {/* Submission Results Overlay/Panel */}
          {results && (
            <div className="absolute bottom-24 right-8 w-80 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 animate-in slide-in-from-bottom-8 duration-500 z-20">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-xl text-white">Results</h4>
                <button onClick={() => setResults(null)} className="text-gray-500 hover:text-white transition">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`text-3xl font-black ${results.score >= 80 ? 'text-green-400' : 'text-indigo-400'}`}>
                  {results.score}%
                </div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-widest leading-tight">
                  Overall<br/>Score
                </div>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {results.details?.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${test.passed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.5)]'}`}></div>
                    <span className="text-xs font-bold text-gray-300 truncate">Test Case #{idx + 1}</span>
                    <span className={`ml-auto text-[10px] font-black uppercase ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {test.passed ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 bg-gray-800/50 border-t border-gray-800 flex justify-between items-center">
            <div className="text-gray-500 text-xs font-mono">
              Press Ctrl+Enter to submit
            </div>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-10 py-3 rounded-2xl font-black text-white shadow-xl transition-all flex items-center gap-3 ${submitting ? 'bg-indigo-800 scale-95 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 shadow-indigo-500/20'}`}
            >
              {submitting ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
              )}
              {submitting ? 'SUBMITTING' : 'SUBMIT CODE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
