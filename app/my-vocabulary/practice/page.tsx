"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  VolumeUp,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Close,
  EmojiEvents,
} from "@mui/icons-material";

interface VocabularyItem {
  id: string;
  vocabulary: {
    id: string;
    word: string;
    definition: string;
    vietnamese_translation: string;
    pronunciation: string;
    collocations: string[];
    synonyms: string[];
    ielts_band_level: string;
  };
  example_sentence: string;
  mastery_level: string;
}

interface Exercise {
  id?: string;
  type: string;
  question: string;
  correct_answer: string;
  options: string[];
  explanation: string;
}

interface SentenceFeedback {
  isCorrect: boolean;
  feedback: string;
  correctedSentence: string;
  grammarTips: string;
  betterExample: string;
  encouragement: string;
}

export default function PracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0: Pronunciation, 1: Exercise 1, 2: Exercise 2, 3: Sentence
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExerciseResult, setShowExerciseResult] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
  const [studentSentence, setStudentSentence] = useState("");
  const [sentenceFeedback, setSentenceFeedback] = useState<SentenceFeedback | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalWords: 0,
    completed: 0,
    correct: 0,
  });

  const currentVocab = vocabularyList[currentIndex];
  const steps = ["Listen & Learn", "Quiz 1", "Quiz 2", "Write a Sentence"];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch vocabulary for practice
  useEffect(() => {
    if (status === "authenticated") {
      fetchPracticeVocabulary();
    }
  }, [status]);

  const fetchPracticeVocabulary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/my-vocabulary/practice?limit=10");

      if (!response.ok) {
        throw new Error("Failed to fetch practice vocabulary");
      }

      const data = await response.json();

      if (!data.vocabulary || data.vocabulary.length === 0) {
        setError("No vocabulary due for review! Great job keeping up with your practice.");
        setLoading(false);
        return;
      }

      setVocabularyList(data.vocabulary);
      setSessionStats({
        totalWords: data.vocabulary.length,
        completed: 0,
        correct: 0,
      });
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError(err instanceof Error ? err.message : "Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  // Fetch exercises when vocabulary changes
  useEffect(() => {
    if (currentVocab) {
      fetchExercises();
    }
  }, [currentIndex]);

  const fetchExercises = async () => {
    if (!currentVocab) return;

    try {
      const response = await fetch("/api/my-vocabulary/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocabularyId: currentVocab.vocabulary.id,
          word: currentVocab.vocabulary.word,
          definition: currentVocab.vocabulary.definition,
          exampleSentence: currentVocab.example_sentence,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();
      setExercises(data.exercises || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setExercises([]);
    }
  };

  // Handle pronunciation
  const handlePronounce = () => {
    if (!currentVocab || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setPlayingAudio(true);

    const utterance = new SpeechSynthesisUtterance(currentVocab.vocabulary.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;

    utterance.onend = () => setPlayingAudio(false);
    utterance.onerror = () => setPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle exercise answer selection
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // Handle exercise submission
  const handleExerciseSubmit = async () => {
    if (!selectedAnswer || !currentVocab) return;

    const currentExerciseIndex = currentStep - 1; // Step 1 = Exercise 0, Step 2 = Exercise 1
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise) return;

    const isCorrect = selectedAnswer === currentExercise.correct_answer;

    // Update results
    const newResults = [...exerciseResults];
    newResults[currentExerciseIndex] = isCorrect;
    setExerciseResults(newResults);
    setShowExerciseResult(true);

    // Record attempt
    await recordExerciseAttempt(currentExercise.id, currentExercise.type, isCorrect);
  };

  // Record exercise attempt
  const recordExerciseAttempt = async (
    exerciseId: string | undefined,
    exerciseType: string,
    isCorrect: boolean
  ) => {
    try {
      await fetch("/api/my-vocabulary/exercises/record", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savedVocabularyId: currentVocab.id,
          exerciseId,
          exerciseType,
          isCorrect,
        }),
      });
    } catch (err) {
      console.error("Error recording attempt:", err);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowExerciseResult(false);
    }
  };

  // Handle sentence submission
  const handleSentenceSubmit = async () => {
    if (!studentSentence.trim() || !currentVocab) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/my-vocabulary/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savedVocabularyId: currentVocab.id,
          word: currentVocab.vocabulary.word,
          sentence: studentSentence,
          definition: currentVocab.vocabulary.definition,
          exampleSentence: currentVocab.example_sentence,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check sentence");
      }

      const data = await response.json();
      setSentenceFeedback(data.feedback);
    } catch (err) {
      console.error("Error checking sentence:", err);
      alert("Failed to check sentence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Complete current vocabulary and move to next
  const handleCompleteVocabulary = async () => {
    if (!currentVocab) return;

    // Calculate performance
    const exercisesCompleted = exerciseResults.length;
    const exercisesCorrect = exerciseResults.filter((r) => r).length;
    const pronunciationPlayed = playingAudio;

    // Update vocabulary with spaced repetition
    try {
      const response = await fetch("/api/my-vocabulary/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savedVocabularyId: currentVocab.id,
          exercisesCompleted,
          exercisesCorrect,
          pronunciationPlayed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Vocabulary updated:", data);
      }
    } catch (err) {
      console.error("Error updating vocabulary:", err);
    }

    // Update session stats
    setSessionStats({
      ...sessionStats,
      completed: sessionStats.completed + 1,
      correct: sessionStats.correct + exercisesCorrect,
    });

    // Move to next vocabulary or complete session
    if (currentIndex < vocabularyList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentStep(0);
      setExerciseResults([]);
      setStudentSentence("");
      setSentenceFeedback(null);
      setSelectedAnswer(null);
      setShowExerciseResult(false);
    } else {
      setSessionComplete(true);
    }
  };

  // Render loading state
  if (status === "loading" || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity={error.includes("No vocabulary") ? "success" : "error"} sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => router.push("/my-vocabulary")}>
          Back to My Vocabulary
        </Button>
      </Container>
    );
  }

  // Render session complete
  if (sessionComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <EmojiEvents sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Practice Session Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Great job! You've completed your vocabulary practice session.
          </Typography>

          <Box sx={{ my: 4 }}>
            <Stack direction="row" spacing={4} justifyContent="center">
              <Box>
                <Typography variant="h3">{sessionStats.completed}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Words Practiced
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3">{Math.round((sessionStats.correct / (sessionStats.totalWords * 2)) * 100)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accuracy
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={() => router.push("/my-vocabulary")}>
              Back to My Vocabulary
            </Button>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Practice More
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!currentVocab) return null;

  const currentExerciseIndex = currentStep - 1;
  const currentExercise = exercises[currentExerciseIndex];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <IconButton onClick={() => router.push("/my-vocabulary")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">Vocabulary Practice</Typography>
        <IconButton onClick={() => router.push("/my-vocabulary")}>
          <Close />
        </IconButton>
      </Stack>

      {/* Progress */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body2">
            Word {currentIndex + 1} of {vocabularyList.length}
          </Typography>
          <Typography variant="body2">
            Step {currentStep + 1} of {steps.length}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={((currentIndex * steps.length + currentStep) / (vocabularyList.length * steps.length)) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Stepper */}
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Main Content */}
      <Paper sx={{ p: 4 }}>
        {/* Step 0: Pronunciation Practice */}
        {currentStep === 0 && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" gutterBottom sx={{ color: "primary.main", fontWeight: 600 }}>
              {currentVocab.vocabulary.word}
            </Typography>

            <IconButton
              onClick={handlePronounce}
              disabled={playingAudio}
              sx={{ mb: 3 }}
              size="large"
            >
              {playingAudio ? (
                <CircularProgress size={40} />
              ) : (
                <VolumeUp sx={{ fontSize: 60, color: "primary.main" }} />
              )}
            </IconButton>

            <Typography variant="h6" gutterBottom>
              {currentVocab.vocabulary.definition}
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>Vietnamese:</strong> {currentVocab.vocabulary.vietnamese_translation}
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f5f5f5", mb: 3 }}>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                {currentVocab.example_sentence}
              </Typography>
            </Paper>

            <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
              <Chip label={currentVocab.vocabulary.ielts_band_level} color="secondary" />
              <Chip label={currentVocab.mastery_level} />
            </Stack>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleNextStep}
              fullWidth
            >
              I'm Ready - Let's Practice!
            </Button>
          </Box>
        )}

        {/* Steps 1-2: MCQ Exercises */}
        {(currentStep === 1 || currentStep === 2) && currentExercise && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {currentExercise.question}
            </Typography>

            <Stack spacing={2} my={3}>
              {currentExercise.options.map((option, idx) => (
                <Paper
                  key={idx}
                  onClick={() => !showExerciseResult && handleAnswerSelect(option)}
                  sx={{
                    p: 2,
                    cursor: showExerciseResult ? "default" : "pointer",
                    border: 2,
                    borderColor:
                      showExerciseResult && option === currentExercise.correct_answer
                        ? "success.main"
                        : selectedAnswer === option
                        ? "primary.main"
                        : "transparent",
                    bgcolor:
                      showExerciseResult && option === currentExercise.correct_answer
                        ? "success.light"
                        : showExerciseResult && selectedAnswer === option && option !== currentExercise.correct_answer
                        ? "error.light"
                        : "background.paper",
                    "&:hover": {
                      bgcolor: showExerciseResult ? undefined : "action.hover",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {showExerciseResult && option === currentExercise.correct_answer && (
                      <CheckCircle color="success" />
                    )}
                    {showExerciseResult && selectedAnswer === option && option !== currentExercise.correct_answer && (
                      <Close color="error" />
                    )}
                    <Typography>{option}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            {showExerciseResult && (
              <Alert severity={exerciseResults[currentExerciseIndex] ? "success" : "error"} sx={{ mb: 2 }}>
                {currentExercise.explanation}
              </Alert>
            )}

            {!showExerciseResult ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleExerciseSubmit}
                disabled={!selectedAnswer}
                fullWidth
              >
                Check Answer
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleNextStep}
                fullWidth
              >
                Continue
              </Button>
            )}
          </Box>
        )}

        {/* Step 3: Sentence Writing */}
        {currentStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Write your own sentence using "{currentVocab.vocabulary.word}"
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Create a meaningful sentence that demonstrates you understand how to use this word correctly.
            </Typography>

            <textarea
              value={studentSentence}
              onChange={(e) => setStudentSentence(e.target.value)}
              placeholder="Type your sentence here..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "16px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "16px",
                fontFamily: "inherit",
              }}
            />

            {!sentenceFeedback ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleSentenceSubmit}
                disabled={!studentSentence.trim() || submitting}
                fullWidth
              >
                {submitting ? "Checking..." : "Get AI Feedback"}
              </Button>
            ) : (
              <>
                <Alert severity={sentenceFeedback.isCorrect ? "success" : "info"} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {sentenceFeedback.feedback}
                  </Typography>
                  {sentenceFeedback.grammarTips && (
                    <Typography variant="body2" paragraph>
                      <strong>Grammar Tip:</strong> {sentenceFeedback.grammarTips}
                    </Typography>
                  )}
                  {sentenceFeedback.correctedSentence !== studentSentence && (
                    <Typography variant="body2" paragraph>
                      <strong>Corrected:</strong> {sentenceFeedback.correctedSentence}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Better Example:</strong> {sentenceFeedback.betterExample}
                  </Typography>
                </Alert>

                <Alert severity="success" sx={{ mb: 2 }}>
                  {sentenceFeedback.encouragement}
                </Alert>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<CheckCircle />}
                  onClick={handleCompleteVocabulary}
                  fullWidth
                >
                  Complete & Next Word
                </Button>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
