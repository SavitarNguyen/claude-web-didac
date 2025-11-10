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
  Divider,
  Tooltip,
  Collapse,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  BookmarkRemove,
  VolumeUp,
  School,
  TrendingUp,
  LocalLibrary,
  EmojiEvents,
  ExpandMore,
  ExpandLess,
  OpenInNew,
  ArrowDropDown,
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
    id?: string;
    title: string;
    created_at: string;
  };
  essay_id?: string;
}

interface VocabularyStatistics {
  total: number;
  new: number;
  learning: number;
  practiced: number;
  mastered: number;
}

interface EssaySource {
  id: string;
  title: string;
  wordCount: number;
  createdAt: string;
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
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New state for filters and collapsible cards
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [masteryFilter, setMasteryFilter] = useState<string>("all");
  const [essayFilter, setEssayFilter] = useState<string | null>(null);
  const [essaySources, setEssaySources] = useState<EssaySource[]>([]);

  // Menu state for dropdowns
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [essayMenuAnchor, setEssayMenuAnchor] = useState<null | HTMLElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch vocabulary and essay sources
  useEffect(() => {
    if (status === "authenticated") {
      fetchVocabulary();
      fetchEssaySources();
    }
  }, [status, masteryFilter, essayFilter]);

  const fetchVocabulary = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api/my-vocabulary?limit=100";

      // Apply essay filter first (server-side)
      if (essayFilter) {
        url += `&filter=by_essay&essayId=${essayFilter}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch vocabulary");
      }

      const data = await response.json();
      let vocabList = data.vocabulary || [];

      // Apply mastery level filter (client-side)
      if (masteryFilter && masteryFilter !== "all") {
        vocabList = vocabList.filter((item: SavedVocabularyItem) =>
          item.mastery_level === masteryFilter
        );
      }

      setVocabularyList(vocabList);
      setStatistics(data.statistics || statistics);
      setDueCount(data.dueCount || 0);
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError(err instanceof Error ? err.message : "Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const fetchEssaySources = async () => {
    try {
      const response = await fetch("/api/my-vocabulary/essays");

      if (!response.ok) {
        console.error("Failed to fetch essay sources - status:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Essay sources API response:", data);
      console.log("Number of essays:", data.essays?.length || 0);
      setEssaySources(data.essays || []);
    } catch (err) {
      console.error("Error fetching essay sources:", err);
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

      // Refresh essay sources
      fetchEssaySources();
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

  // Toggle card expansion
  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle menu open/close
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleEssayMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setEssayMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleEssayMenuClose = () => {
    setEssayMenuAnchor(null);
  };

  // Handle filter selection
  const handleStatusFilterSelect = (status: string) => {
    setMasteryFilter(status);
    handleStatusMenuClose();
  };

  const handleEssayFilterSelect = (essayId: string | null) => {
    setEssayFilter(essayId);
    handleEssayMenuClose();
  };

  // Navigate to essay
  const navigateToEssay = (essayId: string) => {
    router.push(`/ielts/essay-corrections/${essayId}`);
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

  // Get status display text
  const getStatusDisplayText = () => {
    if (masteryFilter === "all") return "All";
    return getMasteryLabel(masteryFilter);
  };

  // Get essay display text
  const getEssayDisplayText = () => {
    if (!essayFilter) return "All Essays";
    const essay = essaySources.find((e) => e.id === essayFilter);
    return essay ? essay.title : "All Essays";
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

      {/* Practice Now Alert - Prominent */}
      {statistics.total > 0 && (
        <Paper
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "#fff3e0",
            border: "2px solid #f57c00",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="warning"
              size="large"
              onClick={() => router.push("/my-vocabulary/practice")}
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                minWidth: 180,
              }}
            >
              Practice Now
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {dueCount > 0
                  ? `${dueCount} word${dueCount > 1 ? "s" : ""} ready for review!`
                  : "Practice your vocabulary!"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep your learning momentum going - practice makes perfect
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Statistics Cards - Display Only */}
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
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <School />
                <Typography variant="h4">{statistics.new}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                New
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <School color="info" />
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

      {/* Active Filters - Dropdown Based */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Active Filters:
          </Typography>

          {/* By Status Dropdown */}
          <Button
            variant="outlined"
            endIcon={<ArrowDropDown />}
            onClick={handleStatusMenuOpen}
            sx={{ minWidth: 150 }}
          >
            By Status: {getStatusDisplayText()}
          </Button>
          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={handleStatusMenuClose}
          >
            <MenuItem
              onClick={() => handleStatusFilterSelect("all")}
              selected={masteryFilter === "all"}
            >
              All
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilterSelect("new")}
              selected={masteryFilter === "new"}
            >
              New
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilterSelect("learning")}
              selected={masteryFilter === "learning"}
            >
              Learning
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilterSelect("practiced")}
              selected={masteryFilter === "practiced"}
            >
              Practiced
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilterSelect("mastered")}
              selected={masteryFilter === "mastered"}
            >
              Mastered
            </MenuItem>
          </Menu>

          {/* By Essay Dropdown */}
          <Button
            variant="outlined"
            endIcon={<ArrowDropDown />}
            onClick={handleEssayMenuOpen}
            sx={{ minWidth: 200 }}
          >
            By Essay: {getEssayDisplayText()}
          </Button>
          <Menu
            anchorEl={essayMenuAnchor}
            open={Boolean(essayMenuAnchor)}
            onClose={handleEssayMenuClose}
            PaperProps={{
              style: {
                maxHeight: 400,
                width: '350px',
              },
            }}
          >
            <MenuItem
              onClick={() => handleEssayFilterSelect(null)}
              selected={essayFilter === null}
            >
              All Essays
            </MenuItem>
            <Divider />
            {essaySources.map((essay) => {
              const essayDate = new Date(essay.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <MenuItem
                  key={essay.id}
                  onClick={() => handleEssayFilterSelect(essay.id)}
                  selected={essayFilter === essay.id}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {essay.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {essayDate}
                      </Typography>
                      <Chip
                        label={`${essay.wordCount} words`}
                        size="small"
                        sx={{ height: 18 }}
                      />
                    </Stack>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
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
            No vocabulary found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {(masteryFilter !== "all" || essayFilter)
              ? "No vocabulary matches your current filters. Try adjusting your filters."
              : "Start practicing IELTS essays and save vocabulary to build your collection!"}
          </Typography>
          {masteryFilter === "all" && !essayFilter && (
            <Button variant="contained" onClick={() => router.push("/ielts-essay")}>
              Practice IELTS Essay
            </Button>
          )}
        </Paper>
      )}

      {/* Vocabulary List - Collapsible Cards */}
      <Grid container spacing={2}>
        {vocabularyList.map((item) => {
          const isExpanded = expandedCards.has(item.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  {/* Collapsed View - Always Visible */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600 }}>
                      {item.vocabulary.word}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleCardExpansion(item.id)}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Stack>

                  {/* Tags - Always Visible */}
                  <Stack direction="row" spacing={0.5} mb={1} flexWrap="wrap" gap={0.5}>
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
                  </Stack>

                  {/* Expanded View - Collapsible */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2 }}>
                      {/* Pronunciation Button */}
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Tooltip title="Listen to pronunciation">
                          <IconButton
                            size="small"
                            onClick={() => handlePronounce(item.vocabulary.word)}
                            disabled={playingAudio === item.vocabulary.word}
                            color="primary"
                          >
                            {playingAudio === item.vocabulary.word ? (
                              <CircularProgress size={20} />
                            ) : (
                              <VolumeUp fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary">
                          Click to hear pronunciation
                        </Typography>
                      </Stack>

                      {/* Category Tags */}
                      {item.vocabulary.vocabulary_definition_tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} mb={2} flexWrap="wrap" gap={0.5}>
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
                      )}

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
                      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f5f5f5", mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          Example:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          {item.example_sentence}
                        </Typography>
                      </Paper>

                      {/* Essay Source with Navigation */}
                      {item.essay && (
                        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "#e3f2fd" }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                From essay:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.essay.title}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<OpenInNew fontSize="small" />}
                              onClick={() => navigateToEssay(item.essay_id || item.essay?.id || "")}
                            >
                              View
                            </Button>
                          </Stack>
                        </Paper>
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
                    </Box>
                  </Collapse>
                </CardContent>

                <CardActions sx={{ pt: 0 }}>
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
          );
        })}
      </Grid>
    </Container>
  );
}
