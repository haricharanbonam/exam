import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import SubmitPopup from "../components/SubmitPopup.jsx";
import Popup from "../components/Popup.jsx";
import toast from "react-hot-toast";
import AttemptHeader from "../components/AttemptTest/AttemptHeader.jsx";
import QuestionCard from "../components/AttemptTest/QuestionCard.jsx";
import QuestionPalette from "../components/AttemptTest/QuestionPalette.jsx";
import CameraThumbnail from "../components/AttemptTest/CameraThumbnail.jsx";
import TrustScoreBadge from "../components/AttemptTest/TrustScoreBadge.jsx";
import FullscreenGuard from "../components/AttemptTest/FullscreenGuard.jsx";

const MAX_FLAGS = 5;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
      <div className="h-6 w-2/3 rounded animate-shimmer mb-6" />
      <div className="space-y-3">
        <div className="h-14 rounded-xl animate-shimmer" />
        <div className="h-14 rounded-xl animate-shimmer" />
        <div className="h-14 rounded-xl animate-shimmer" />
        <div className="h-14 rounded-xl animate-shimmer" />
      </div>
      <div className="mt-6 flex gap-2">
        <div className="h-10 w-24 rounded-xl animate-shimmer" />
        <div className="h-10 w-32 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}

function SkeletonPalette() {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 sm:p-6">
      <div className="h-5 w-1/2 rounded animate-shimmer mb-4" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-10 w-10 rounded-lg animate-shimmer" />
        ))}
      </div>
    </div>
  );
}

function AttemptTest() {
  const quizId = useParams().id;
  const nav = useNavigate();

  const [quizData, setQuizData] = useState([]);
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [option, setOption] = useState(null);
  const [reviewFlags, setReviewFlags] = useState([]);
  const [visited, setVisited] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [testId, setTestId] = useState("");
  const [submitPopup, setSubmitPopup] = useState(false);
  const timerRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cheatCount, setCheatCount] = useState(0);
  const [trustScore, setTrustScore] = useState(100);
  const [violations, setViolations] = useState([]);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const savingRef = useRef(false);
  const questionCardRef = useRef(null);
  const lastFocusedIndexRef = useRef(-1);

  // ----- Initial fetch -------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const fetchQuizData = async () => {
      try {
        const response = await API.post(`/test/start`, { id: quizId });
        if (cancelled) return;
        const data = response.data.data;
        setQuizData(data.questions || []);
        setResponses(
          Array(data.questions ? data.questions.length : 0).fill(null)
        );
        setReviewFlags(
          Array(data.questions ? data.questions.length : 0).fill(false)
        );
        setVisited(
          Array(data.questions ? data.questions.length : 0).fill(false)
        );
        setTestId(data._id || "");
        setTestTitle(data.title || "");
        setTestDescription(data.description || "");
        setRemainingTime(Math.max(0, Math.floor((data.remainingTime || 0) * 60)));
        if (typeof data.cheatCount === "number") setCheatCount(data.cheatCount);
        if (typeof data.trustScore === "number") setTrustScore(data.trustScore);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load test. Please try again.");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    fetchQuizData();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  // ----- Timer ---------------------------------------------------------
  useEffect(() => {
    if (remainingTime === null) return undefined;
    if (remainingTime <= 0) {
      handleAutoSubmitRef.current?.();
      return undefined;
    }
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime === null]);

  // ----- Violation / popup --------------------------------------------
  const showPopup = useCallback(
    async (message) => {
      if (message?.limitExceeded) {
        setCheatCount(MAX_FLAGS);
        handleSubmitRef.current?.();
        return;
      }

      const severity =
        message?.severity === "warning" ? "warning" : "violation";
      const reason =
        message?.suspicious_reason ||
        (typeof message === "string" ? message : "Suspicious Activity");

      if (severity === "warning") {
        // Soft warning path: show toast, log to server but don't trigger modal
        toast(reason, {
          duration: 4000,
          icon: "⚠",
          style: {
            background: "#fffbeb",
            color: "#92400e",
            border: "1px solid #fde68a",
            fontWeight: 500,
          },
        });
        try {
          const res = await API.post("/test/violation", {
            examCode: quizId,
            type: reason,
            snapshot: null,
            severity: "warning",
          });
          const violation = res?.data?.data?.violation;
          if (violation) {
            setViolations((prev) => [...prev, violation]);
          }
          if (res?.data?.data?.cheatCount !== undefined) {
            setCheatCount(res.data.data.cheatCount);
          }
          if (res?.data?.data?.trustScore !== undefined) {
            setTrustScore(res.data.data.trustScore);
          }
        } catch (err) {
          console.error("Failed to log warning:", err);
        }
        return;
      }

      try {
        const res = await API.post("/test/violation", {
          examCode: quizId,
          type: reason,
          snapshot: message?.image || null,
          severity: "violation",
        });
        if (res?.data?.data?.cheatCount !== undefined) {
          setCheatCount(res.data.data.cheatCount);
        }
        if (res?.data?.data?.trustScore !== undefined) {
          setTrustScore(res.data.data.trustScore);
        }
        const violation = res?.data?.data?.violation;
        if (violation) {
          setViolations((prev) => [...prev, violation]);
        }
      } catch (err) {
        console.error("Failed to log violation:", err);
      }
      setPopupMessage(message);
    },
    [quizId]
  );

  const handleFullscreenExit = useCallback(() => {
    showPopup({
      suspicious: true,
      suspicious_reason: "Fullscreen exited",
      severity: "violation",
    });
  }, [showPopup]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        showPopup({
          suspicious: true,
          suspicious_reason: "Tab switched / Window minimized",
          severity: "warning",
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showPopup]);

  // ----- Submit (refs to break timer/visibility ordering) --------------
  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    try {
      const response = await API.post(`/test/submit`, { id: quizId });
      const submittedScore = response.data?.data?.score;
      const attemptId = response.data?.data?.attemptId || testId || "";
      const timeTaken = response.data?.data?.timeTaken || 0;
      nav("/success", {
        state: {
          score: submittedScore,
          attemptId,
          testTitle,
          timeTaken,
        },
      });
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  }, [nav, quizId, testId, testTitle]);

  const handleAutoSubmit = useCallback(async () => {
    await handleSubmit();
  }, [handleSubmit]);

  const handleSubmitRef = useRef(handleSubmit);
  const handleAutoSubmitRef = useRef(handleAutoSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
    handleAutoSubmitRef.current = handleAutoSubmit;
  }, [handleSubmit, handleAutoSubmit]);

  // ----- Option / flag / save -----------------------------------------
  const handleOption = (i) => {
    setOption(i);
    const updatedResponses = [...responses];
    updatedResponses[index] = i;
    setResponses(updatedResponses);
    saveResponse(i, false, { silent: true });
  };

  const saveResponse = async (
    selectedOptionIndex,
    markForReview,
    { silent = false } = {}
  ) => {
    if (savingRef.current) return;
    if (selectedOptionIndex === null || selectedOptionIndex === undefined) return;
    savingRef.current = true;
    setLoading(true);
    try {
      await API.post(`/test/question`, {
        questionIndex: index,
        selectedOptionIndex,
        markForReview,
        id: quizId,
      });
      const updatedFlags = [...reviewFlags];
      updatedFlags[index] = markForReview;
      setReviewFlags(updatedFlags);
      setLastSavedAt(new Date());
      if (!silent) toast.success("Saved");
    } catch (error) {
      console.error("Error saving response:", error);
      if (!silent) toast.error("Failed to save answer");
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (option !== null) {
      await saveResponse(option, false);
    }
    if (index < quizData.length - 1) {
      goToIndex(index + 1);
    }
  };

  const handleToggleFlag = async () => {
    const newFlag = !reviewFlags[index];
    const updatedFlags = [...reviewFlags];
    updatedFlags[index] = newFlag;
    setReviewFlags(updatedFlags);
    if (option !== null) {
      await saveResponse(option, newFlag, { silent: true });
    } else {
      toast.success(newFlag ? "Question flagged" : "Flag removed");
    }
  };

  const handleClear = () => {
    setOption(null);
    const updatedResponses = [...responses];
    updatedResponses[index] = null;
    setResponses(updatedResponses);
  };

  const handlePrev = () => {
    if (index > 0) goToIndex(index - 1);
  };

  const handleNext = () => {
    if (index < quizData.length - 1) goToIndex(index + 1);
  };

  const goToIndex = (i) => {
    setIndex(i);
    setVisited((prev) => {
      if (prev[i]) return prev;
      const copy = [...prev];
      copy[i] = true;
      return copy;
    });
  };

  // Sync option to responses[index] when index changes; mark visited
  useEffect(() => {
    setOption(responses[index] !== undefined ? responses[index] : null);
    setVisited((prev) => {
      if (prev[index]) return prev;
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Move focus to the question card when the user navigates to a new question
  useEffect(() => {
    if (initialLoading) return;
    if (lastFocusedIndexRef.current === index) return;
    lastFocusedIndexRef.current = index;
    const node = questionCardRef.current;
    if (!node) return;
    try {
      node.focus({ preventScroll: true });
    } catch {
      node.focus();
    }
  }, [index, initialLoading]);

  // ----- Keyboard shortcuts -------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (
        submitPopup ||
        popupMessage ||
        initialLoading ||
        quizData.length === 0
      ) {
        return;
      }
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.ctrlKey && e.shiftKey && (e.key === "Enter" || e.key === "\n")) {
        e.preventDefault();
        setSubmitPopup(true);
        return;
      }
      if (e.ctrlKey && (e.key === "Enter" || e.key === "\n")) {
        e.preventDefault();
        handleSaveAndNext();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleToggleFlag();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        const n = e.key === "0" ? 9 : parseInt(e.key, 10) - 1;
        if (n >= 0 && n < (quizData[index]?.options?.length || 0)) {
          e.preventDefault();
          handleOption(n);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, quizData, submitPopup, popupMessage, initialLoading]);

  // ----- Loading skeleton ---------------------------------------------
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
            <div className="h-5 w-1/3 rounded animate-shimmer" />
            <div className="h-4 w-1/4 rounded animate-shimmer" />
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-9">
            <SkeletonCard />
          </div>
          <div className="md:col-span-3">
            <SkeletonPalette />
          </div>
        </main>
      </div>
    );
  }

  if (quizData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">No questions found for this test.</p>
      </div>
    );
  }

  const currentQuestion = quizData[index];
  const safeResponses = quizData.map(
    (_, i) => responses[i] !== undefined ? responses[i] : null
  );
  const safeFlags = quizData.map(
    (_, i) => Boolean(reviewFlags[i])
  );
  const safeVisited = quizData.map(
    (_, i) => Boolean(visited[i])
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <a
        href="#question-content"
        onClick={(e) => {
          e.preventDefault();
          const node = questionCardRef.current;
          if (node) {
            node.focus({ preventScroll: false });
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-1.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow"
      >
        Skip to question
      </a>
      <FullscreenGuard active onExit={handleFullscreenExit} />

      <AttemptHeader
        testTitle={testTitle}
        testDescription={testDescription}
        currentIndex={index}
        totalQuestions={quizData.length}
        remainingSeconds={remainingTime}
        trustScore={trustScore}
        cheatCount={cheatCount}
        maxCheats={MAX_FLAGS}
      >
        <div className="inline-flex items-center gap-2">
          <TrustScoreBadge
            score={trustScore}
            cheatCount={cheatCount}
            maxCheats={MAX_FLAGS}
            violations={violations}
          />
          <CameraThumbnail
            userId={JSON.parse(localStorage.getItem("user"))._id}
            testId={quizId}
            onSuspiciousActivity={showPopup}
          />
        </div>
      </AttemptHeader>

      <main className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-9">
            <QuestionCard
              ref={questionCardRef}
              question={currentQuestion}
              index={index}
              totalQuestions={quizData.length}
              selectedOption={option}
              flagged={Boolean(reviewFlags[index])}
              onSelect={handleOption}
              onPrev={handlePrev}
              onNext={handleNext}
              onToggleFlag={handleToggleFlag}
              onClear={handleClear}
              onSubmit={() => setSubmitPopup(true)}
              isFirst={index === 0}
              isLast={index === quizData.length - 1}
              lastSavedAt={lastSavedAt}
              saving={loading && !lastSavedAt}
            />
          </div>

          <div className="md:col-span-3">
            <QuestionPalette
              total={quizData.length}
              currentIndex={index}
              responses={safeResponses}
              flags={safeFlags}
              visited={safeVisited}
              onJump={goToIndex}
            />
          </div>
        </div>
      </div>
      </main>

      {loading && !initialLoading && (
        <div
          className="fixed top-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow ring-1 ring-slate-200 text-xs text-slate-600"
          aria-live="polite"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Saving...
        </div>
      )}

      {submitPopup && (
        <SubmitPopup
          onConfirm={() => {
            setSubmitPopup(false);
            handleSubmit();
          }}
          onCancel={() => setSubmitPopup(false)}
          answeredCount={safeResponses.filter((r) => r !== null && r !== undefined).length}
          totalCount={quizData.length}
          flaggedCount={safeFlags.filter(Boolean).length}
          notVisitedCount={quizData.length - safeVisited.filter(Boolean).length}
          timeRemainingLabel={
            remainingTime === null
              ? null
              : `${Math.floor(remainingTime / 60)}:${String(remainingTime % 60).padStart(2, "0")}`
          }
        />
      )}
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
      {submitLoading && (
        <div className="fixed inset-0 z-40 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 shadow ring-1 ring-slate-200">
            <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-700">
              Grading your test...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttemptTest;
