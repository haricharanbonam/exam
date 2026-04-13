import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const TestDetailsView = () => {
  const { examCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get(`/test/instructor/dashboard/${examCode}`);
        setData(response.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [examCode]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!data) return <div className="p-10 text-center">No data found.</div>;

  const { test, participants } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-indigo-600 flex items-center gap-2 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{test.title}</h1>
            <p className="text-gray-500 mt-1">Exam Code: <span className="font-mono text-indigo-600 font-bold">{test.examCode}</span></p>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-2xl">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Participants</p>
              <p className="text-2xl font-black text-blue-900">{participants.length}</p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-2xl">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Average Score</p>
              <p className="text-2xl font-black text-indigo-900">
                {participants.length > 0 
                  ? (participants.reduce((acc, curr) => acc + (curr.score || 0), 0) / participants.length).toFixed(1)
                  : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trust Score</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Violations</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {participants.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                        {p.person.fullName?.[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{p.person.fullName}</div>
                        <div className="text-xs text-gray-500">{p.person.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    @{p.person.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      p.trustScore > 80 ? 'bg-green-100 text-green-800' :
                      p.trustScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.trustScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {p.violations.length} flags
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.submit ? (
                      <span className="text-green-600 flex items-center gap-1 text-sm font-bold">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        Submitted
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1 text-sm font-bold animate-pulse">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                        InProgress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                    {p.score !== undefined ? `${p.score} / ${test.numberOfQuestions}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button 
                      onClick={() => setSelectedCandidate(p)}
                      className="text-indigo-600 font-bold hover:text-indigo-900"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Modal/Overlay */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Violation Audit</h2>
                  <p className="text-gray-500">Reviewing logs for {selectedCandidate.person.fullName}</p>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {selectedCandidate.violations.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl">
                  No violations recorded for this candidate.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCandidate.violations.map((v, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-red-100 bg-red-50 rounded-2xl">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-red-900">{v.type}</span>
                          <span className="text-xs text-red-600">{new Date(v.timestamp).toLocaleTimeString()}</span>
                        </div>
                        {v.snapshot && (
                          <div className="mt-3">
                            <p className="text-xs font-bold text-gray-400 mb-1 caps tracking-wider uppercase">Snapshot Captured</p>
                            <img src={v.snapshot} alt="Violation" className="rounded-xl border-2 border-red-200 max-h-48" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDetailsView;
