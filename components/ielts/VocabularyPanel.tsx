"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  BookmarkAdd,
  VolumeUp,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { SelectedVocabulary } from "@/lib/types/ielts";
import { useSession } from "next-auth/react";

interface VocabularyPanelProps {
  selectedVocabulary: SelectedVocabulary[];
  essayId?: string;
}

export function VocabularyPanel({ selectedVocabulary, essayId }: VocabularyPanelProps) {
  const { data: session } = useSession();
  const [savedVocabIds, setSavedVocabIds] = useState<Set<string>>(new Set());
  const [savingVocabIds, setSavingVocabIds] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handle vocabulary save
  const handleSaveVocabulary = async (vocab: SelectedVocabulary) => {
    if (!session) {
      setSaveError("Please sign in to save vocabulary");
      return;
    }

    const vocabKey = vocab.term;
    setSavingVocabIds(new Set(savingVocabIds).add(vocabKey));
    setSaveError(null);

    try {
      const response = await fetch("/api/my-vocabulary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: vocab.term,
          type: vocab.type,
          original: vocab.original,
          exampleSentence: vocab.exampleSentence,
          sourceType: "essay_correction",
          essayId: essayId,
          sentenceId: vocab.sentenceId,
          definition: vocab.definition,
          explanation: vocab.explanation,
          tags: vocab.tags,
          ieltsLevel: vocab.ieltsLevel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save vocabulary");
      }

      const result = await response.json();
      console.log("Vocabulary saved:", result);

      // Mark as saved
      setSavedVocabIds(new Set(savedVocabIds).add(vocabKey));
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save vocabulary");
    } finally {
      // Remove from saving set
      const newSaving = new Set(savingVocabIds);
      newSaving.delete(vocabKey);
      setSavingVocabIds(newSaving);
    }
  };

  // Handle save all vocabulary
  const handleSaveAll = async () => {
    for (const vocab of selectedVocabulary) {
      if (!savedVocabIds.has(vocab.term)) {
        await handleSaveVocabulary(vocab);
      }
    }
  };

  // Handle pronunciation (using Web Speech API)
  const handlePronounce = (word: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      setPlayingAudio(word);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // Slightly slower for learning
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setPlayingAudio(null);
      };

      utterance.onerror = () => {
        setPlayingAudio(null);
        console.error("Speech synthesis error");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported");
    }
  };

  if (!selectedVocabulary || selectedVocabulary.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No vocabulary items were selected for this essay. This usually means your vocabulary usage is already strong!
        </Alert>
      </Box>
    );
  }

  const unsavedCount = selectedVocabulary.length - savedVocabIds.size;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              📚 Key Vocabulary for Learning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We've selected {selectedVocabulary.length} valuable vocabulary items from your essay corrections
            </Typography>
          </Box>

          {unsavedCount > 0 && (
            <Button
              variant="contained"
              startIcon={<BookmarkAdd />}
              onClick={handleSaveAll}
              disabled={savingVocabIds.size > 0}
            >
              Save All ({unsavedCount})
            </Button>
          )}
        </Stack>

        {saveError && (
          <Alert severity="error" onClose={() => setSaveError(null)} sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
      </Box>

      {/* Vocabulary Cards */}
      <Stack spacing={2}>
        {selectedVocabulary.map((vocab, index) => {
          const isSaved = savedVocabIds.has(vocab.term);
          const isSaving = savingVocabIds.has(vocab.term);

          return (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 2.5,
                border: isSaved ? "2px solid #4caf50" : "1px solid #e0e0e0",
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              {/* Saved Badge */}
              {isSaved && (
                <Chip
                  icon={<CheckCircle />}
                  label="Saved"
                  color="success"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                  }}
                />
              )}

              {/* Vocabulary Term */}
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600 }}>
                  {vocab.term}
                </Typography>

                {/* Pronunciation Button */}
                <Tooltip title="Listen to pronunciation">
                  <IconButton
                    size="small"
                    onClick={() => handlePronounce(vocab.term)}
                    disabled={playingAudio === vocab.term}
                  >
                    {playingAudio === vocab.term ? (
                      <CircularProgress size={20} />
                    ) : (
                      <VolumeUp fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Type Badge */}
                <Chip
                  label={vocab.type}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Stack>

              {/* Tags */}
              <Stack direction="row" spacing={0.5} mb={1.5} flexWrap="wrap">
                <Chip label={vocab.ieltsLevel} size="small" color="secondary" />
                {vocab.tags.map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                ))}
              </Stack>

              {/* Replacement Info */}
              {vocab.original && vocab.original !== vocab.term && (
                <Box
                  sx={{
                    bgcolor: "#fff3e0",
                    p: 1.5,
                    borderRadius: 1,
                    mb: 1.5,
                    border: "1px solid #ffe0b2",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Info fontSize="small" sx={{ color: "#f57c00" }} />
                    <Typography variant="body2" sx={{ color: "#e65100" }}>
                      Replaces: <strong>"{vocab.original}"</strong>
                    </Typography>
                  </Stack>
                </Box>
              )}

              {/* Definition */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Definition:
                </Typography>
                <Typography variant="body2">{vocab.definition}</Typography>
              </Box>

              {/* Example Sentence */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Example from your essay:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: "#f5f5f5",
                    fontStyle: "italic",
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {highlightTermInSentence(vocab.exampleSentence, vocab.term)}
                  </Typography>
                </Paper>
              </Box>

              {/* Explanation */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Why it's useful:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vocab.explanation}
                </Typography>
              </Box>

              {/* Save Button */}
              {!isSaved && (
                <Button
                  variant="outlined"
                  startIcon={isSaving ? <CircularProgress size={16} /> : <BookmarkAdd />}
                  onClick={() => handleSaveVocabulary(vocab)}
                  disabled={isSaving}
                  fullWidth
                >
                  {isSaving ? "Saving..." : "Save to My Vocabulary"}
                </Button>
              )}
            </Paper>
          );
        })}
      </Stack>

      {/* Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Tip:</strong> Save these vocabulary items to practice them later with spaced repetition exercises in "My Vocabulary"
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Helper function to highlight the vocabulary term in the example sentence
 */
function highlightTermInSentence(sentence: string, term: string): React.ReactNode {
  const lowerSentence = sentence.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const startIndex = lowerSentence.indexOf(lowerTerm);

  if (startIndex === -1) {
    return sentence;
  }

  const before = sentence.substring(0, startIndex);
  const highlighted = sentence.substring(startIndex, startIndex + term.length);
  const after = sentence.substring(startIndex + term.length);

  return (
    <>
      {before}
      <Box
        component="span"
        sx={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "2px 6px",
          borderRadius: "3px",
          fontWeight: 600,
          fontStyle: "normal",
        }}
      >
        {highlighted}
      </Box>
      {after}
    </>
  );
}
