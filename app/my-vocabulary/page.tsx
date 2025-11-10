"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  BookmarkRemove,
  VolumeUp,
  School,
  TrendingUp,
  LocalLibrary,
  EmojiEvents,
  FilterList,
} from "@mui/icons-material";

interface SavedVocabularyItem {
  id: string;
  vocabulary: {
    word: string;
    definition: string;
    vietnamese_translation: string;
    pronunciation: string;
    word_type: string;
    collocations: string[];
    synonyms: string[];
    ielts_band_level: string;
    vocabulary_definition_tags: Array<{
      tag: {
        name: string;
      };
    }>;
  };
  example_sentence: string;
  mastery_level: string;
  next_review_date: string;
  review_count: number;
  exercises_completed: number;
  exercises_correct: number;
  created_at: string;
  essay?: {
    title: string;
    created_at: string;
  };
}

interface VocabularyStatistics {
  total: number;
  new: number;
  learning: number;
  practiced: number;
  mastered: number;
}

export default function MyVocabularyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vocabularyList, setVocabularyList] = useState<SavedVocabularyItem[]>([]);
  const [statistics, setStatistics] = useState<VocabularyStatistics>({
    total: 0,
    new: 0,
    learning: 0,
    practiced: 0,
    mastered: 0,
  });
  const [dueCount, setDueCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "due">("all");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch vocabulary
  useEffect(() => {
    if (status === "authenticated") {
      fetchVocabulary();
    }
  }, [status, filter]);

  const fetchVocabulary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/my-vocabulary?filter=${filter}&limit=100`);

      if (!response.ok) {
        throw new Error("Failed to fetch vocabulary");
      }

      const data = await response.json();
      setVocabularyList(data.vocabulary || []);
      setStatistics(data.statistics || statistics);
      setDueCount(data.dueCount || 0);
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError(err instanceof Error ? err.message : "Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this vocabulary from your collection?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/my-vocabulary?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vocabulary");
      }

      // Remove from list
      setVocabularyList(vocabularyList.filter((v) => v.id !== id));
      setStatistics((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error("Error deleting vocabulary:", err);
      alert("Failed to delete vocabulary. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle pronunciation
  const handlePronounce = (word: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlayingAudio(word);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;

      utterance.onend = () => setPlayingAudio(null);
      utterance.onerror = () => setPlayingAudio(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Get mastery level color
  const getMasteryColor = (level: string) => {
    switch (level) {
      case "new":
        return "default";
      case "learning":
        return "info";
      case "practiced":
        return "warning";
      case "mastered":
        return "success";
      default:
        return "default";
    }
  };

  // Get mastery level label
  const getMasteryLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  if (status === "loading" || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          📚 My Vocabulary
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personalized vocabulary collection from IELTS essay practice
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <LocalLibrary color="primary" />
                <Typography variant="h4">{statistics.total}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Total Vocabulary
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: dueCount > 0 ? "#fff3e0" : undefined }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <TrendingUp color="warning" />
                <Typography variant="h4">{dueCount}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Due for Review
              </Typography>
              {dueCount > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  sx={{ mt: 1 }}
                  fullWidth
                  onClick={() => router.push("/my-vocabulary/practice")}
                >
                  Practice Now
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <School />
                <Typography variant="h4">{statistics.learning}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Learning
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <TrendingUp color="warning" />
                <Typography variant="h4">{statistics.practiced}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Practiced
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: "#e8f5e9" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <EmojiEvents color="success" />
                <Typography variant="h4">{statistics.mastered}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Mastered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FilterList />
          <Typography variant="subtitle1">Filter:</Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "due")}
            >
              <MenuItem value="all">All Vocabulary</MenuItem>
              <MenuItem value="due">Due for Review ({dueCount})</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {vocabularyList.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <LocalLibrary sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No vocabulary saved yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filter === "due"
              ? "You don't have any vocabulary due for review right now."
              : "Start practicing IELTS essays and save vocabulary to build your collection!"}
          </Typography>
          <Button variant="contained" onClick={() => router.push("/ielts-essay")}>
            Practice IELTS Essay
          </Button>
        </Paper>
      )}

      {/* Vocabulary List */}
      <Grid container spacing={2}>
        {vocabularyList.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                {/* Word + Pronunciation */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600 }}>
                    {item.vocabulary.word}
                  </Typography>
                  <Tooltip title="Listen to pronunciation">
                    <IconButton
                      size="small"
                      onClick={() => handlePronounce(item.vocabulary.word)}
                      disabled={playingAudio === item.vocabulary.word}
                    >
                      {playingAudio === item.vocabulary.word ? (
                        <CircularProgress size={20} />
                      ) : (
                        <VolumeUp fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Tags */}
                <Stack direction="row" spacing={0.5} mb={2} flexWrap="wrap" gap={0.5}>
                  <Chip
                    label={getMasteryLabel(item.mastery_level)}
                    size="small"
                    color={getMasteryColor(item.mastery_level) as any}
                  />
                  {item.vocabulary.ielts_band_level && (
                    <Chip
                      label={item.vocabulary.ielts_band_level}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {item.vocabulary.word_type && (
                    <Chip label={item.vocabulary.word_type} size="small" variant="outlined" />
                  )}
                  {item.vocabulary.vocabulary_definition_tags.map((tagObj, idx) => (
                    <Chip
                      key={idx}
                      label={tagObj.tag.name}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "capitalize" }}
                    />
                  ))}
                </Stack>

                {/* Definition */}
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Definition:</strong> {item.vocabulary.definition}
                </Typography>

                {/* Vietnamese Translation */}
                {item.vocabulary.vietnamese_translation && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Vietnamese:</strong> {item.vocabulary.vietnamese_translation}
                  </Typography>
                )}

                {/* Example Sentence */}
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f5f5f5", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Example:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {item.example_sentence}
                  </Typography>
                </Paper>

                {/* Essay Source */}
                {item.essay && (
                  <Typography variant="caption" color="text.secondary">
                    From essay: <strong>{item.essay.title}</strong>
                  </Typography>
                )}

                {/* Review Info */}
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={2}>
                  <Typography variant="caption" color="text.secondary">
                    Reviews: {item.review_count}
                  </Typography>
                  {item.exercises_completed > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Exercises: {item.exercises_correct}/{item.exercises_completed}
                    </Typography>
                  )}
                </Stack>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<BookmarkRemove />}
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  color="error"
                >
                  {deletingId === item.id ? "Removing..." : "Remove"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
