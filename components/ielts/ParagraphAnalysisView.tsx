import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ParagraphAnalysis } from "@/lib/types/ielts";

interface ParagraphAnalysisViewProps {
  paragraphs: ParagraphAnalysis[];
  selectedParagraphNumber?: number | null;
  onParagraphClick?: (paragraphNumber: number) => void;
}

export function ParagraphAnalysisView({
  paragraphs,
  selectedParagraphNumber,
  onParagraphClick,
}: ParagraphAnalysisViewProps) {
  return (
    <Box>
      {/* Paragraph-by-Paragraph Breakdown */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Paragraph-by-Paragraph Analysis
      </Typography>

      {paragraphs.map((para) => {
        const isSelected = selectedParagraphNumber === para.paragraphNumber;

        return (
          <Accordion
            key={para.paragraphNumber}
            expanded={isSelected}
            onChange={(_, expanded) => {
              if (expanded && onParagraphClick) {
                onParagraphClick(para.paragraphNumber);
              }
            }}
            sx={{
              mb: 2,
              ...(isSelected && {
                boxShadow: 3,
                border: "2px solid",
                borderColor: "primary.main",
              }),
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Paragraph {para.paragraphNumber}
                </Typography>
                {para.overallParagraphBand && (
                  <Chip
                    label={para.overallParagraphBand.match(/Band\s+[\d.]+/i)?.[0] || para.overallParagraphBand}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="body2">
                  <strong>Original:</strong> {para.text}
                </Typography>
                <Typography variant="body2">
                  <strong>Revised:</strong> {para.revisedParagraph}
                </Typography>
                {para.overallParagraphBand && (
                  <Typography variant="body2">
                    <strong>Band Score:</strong> {para.overallParagraphBand}
                  </Typography>
                )}
                {para.issues && para.issues.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">Issues:</Typography>
                    {para.issues.map((issue, idx) => (
                      <Typography key={idx} variant="body2" color="error" sx={{ ml: 2 }}>
                        • {issue.issue}
                      </Typography>
                    ))}
                  </Box>
                )}
                {para.improvements && para.improvements.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">Improvements:</Typography>
                    {para.improvements.map((improvement, idx) => (
                      <Typography key={idx} variant="body2" color="warning.main" sx={{ ml: 2 }}>
                        • {improvement.suggestion}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
