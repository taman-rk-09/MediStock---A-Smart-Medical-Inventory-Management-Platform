import React, { useState } from 'react';
import { 
  Paper, Box, Typography, Button, CircularProgress, 
  Divider, Chip 
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReactMarkdown from 'react-markdown';
import { fetchExecutiveInsights } from '../../services/aiService';

const AiExecutiveCard = () => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchExecutiveInsights();
      setInsight(data);
    } catch (err) {
      setError('Unable to reach the AI Advisor service. Please ensure Ollama is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: '16px', 
        bgcolor: '#ffffff', 
        border: '1px solid #e2e8f0',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.03)',
        mb: 3
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box 
            sx={{ 
              bgcolor: '#eff6ff', 
              color: '#2563eb', 
              p: 1, 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700" color="#0f172a">
              MediStock AI Reorder & Inventory Advisor
            </Typography>
            <Typography variant="body2" color="#64748b">
              Automated executive summary and predictive stock recommendations
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : (insight ? <RefreshIcon /> : <AutoAwesomeIcon />)}
          sx={{
            borderRadius: '20px',
            bgcolor: '#2563eb',
            textTransform: 'none',
            px: 3,
            fontWeight: '600',
            '&:hover': { bgcolor: '#1d4ed8' }
          }}
        >
          {loading ? 'Analyzing Inventory...' : (insight ? 'Refresh Insight' : 'Generate AI Insights')}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {!insight && !loading && !error && (
        <Box py={4} textAlign="center" bgcolor="#f8fafc" borderRadius="12px" border="1px dashed #cbd5e1">
          <Typography variant="body2" color="#64748b">
            Click <strong>"Generate AI Insights"</strong> to analyze your active batches, expiry risks, and supplier reorders.
          </Typography>
        </Box>
      )}

      {loading && (
        <Box py={4} textAlign="center" bgcolor="#f8fafc" borderRadius="12px">
          <CircularProgress size={28} sx={{ color: '#2563eb', mb: 1.5 }} />
          <Typography variant="body2" color="#64748b" fontWeight="500">
            Running predictive telemetry across medicines, stock logs, and sales velocity...
          </Typography>
        </Box>
      )}

      {error && (
        <Box py={2} px={3} bgcolor="#fef2f2" borderRadius="12px" border="1px solid #fecaca">
          <Typography variant="body2" color="#dc2626">{error}</Typography>
        </Box>
      )}

      {insight && !loading && (
        <Box bgcolor="#f8fafc" p={3} borderRadius="12px" border="1px solid #f1f5f9">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Chip label="Executive Report Generated" size="small" color="primary" sx={{ fontWeight: '600' }} />
            <Typography variant="caption" color="#94a3b8">
              Generated at: {new Date(insight.generatedAt).toLocaleTimeString()}
            </Typography>
          </Box>
          <Box sx={{ typography: 'body2', color: '#334155', lineHeight: 1.7, '& h3': { fontSize: '1rem', mt: 1.5, mb: 0.5 }, '& ul': { pl: 2.5, m: 0 } }}>
            <ReactMarkdown>{insight.executiveSummary}</ReactMarkdown>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AiExecutiveCard;