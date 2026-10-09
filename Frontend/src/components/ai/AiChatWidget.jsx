import React, { useState, useRef, useEffect } from 'react';
import {
  Fab, Drawer, Box, Typography, IconButton, TextField,
  Paper, CircularProgress, Avatar, InputAdornment
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ReactMarkdown from 'react-markdown';
import { sendAiChatQuery } from '../../services/aiService';

const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your **MediStock Assistant**. Ask me anything about inventory, expiry tracking, or general knowledge.' }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await sendAiChatQuery(userMsg);
      setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to the AI service.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab 
        color="primary" 
        onClick={() => setOpen(true)} 
        sx={{ 
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000, 
          boxShadow: '0px 8px 24px rgba(37, 99, 235, 0.3)',
          bgcolor: '#2563eb',
          '&:hover': { bgcolor: '#1d4ed8' }
        }}
      >
        <AutoAwesomeIcon />
      </Fab>

      <Drawer 
        anchor="right" 
        open={open} 
        onClose={() => setOpen(false)} 
        PaperProps={{ 
          sx: { 
            width: { xs: '100vw', sm: 420 },
            borderTopLeftRadius: { xs: 0, sm: '24px' },
            borderBottomLeftRadius: { xs: 0, sm: '24px' },
            boxShadow: '-12px 0px 40px rgba(0,0,0,0.08)'
          } 
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
          
          <Box 
            px={3} py={2.5} 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ borderBottom: '1px solid #f1f5f9' }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 38, height: 38 }}>
                <AutoAwesomeIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="700" color="#0f172a" lineHeight={1.2}>
                  MediStock AI
                </Typography>
                <Typography variant="caption" color="#64748b" fontWeight="500">
                  Inventory & Systems Assistant
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Box flexGrow={1} px={3} py={3} sx={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#f8fafc' }}>
            {messages.map((msg, index) => (
              <Box key={index} display="flex" gap={1.5} flexDirection={msg.sender === 'user' ? 'row-reverse' : 'row'} alignItems="flex-start">
                <Avatar sx={{ 
                  bgcolor: msg.sender === 'user' ? '#0f172a' : '#2563eb', 
                  color: '#ffffff',
                  width: 30, height: 30, mt: 0.5,
                  fontSize: '0.85rem'
                }}>
                  {msg.sender === 'user' ? <PersonRoundedIcon fontSize="small" /> : <SmartToyRoundedIcon fontSize="small" />}
                </Avatar>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    px: 2.5, py: 1.75, 
                    maxWidth: '82%', 
                    bgcolor: msg.sender === 'user' ? '#2563eb' : '#ffffff', 
                    color: msg.sender === 'user' ? '#ffffff' : '#334155',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.02)',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                  }}
                >
                  {msg.sender === 'user' ? (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      {msg.text}
                    </Typography>
                  ) : (
                    <Box sx={{ typography: 'body2', fontSize: '0.9rem', lineHeight: 1.6, '& p': { m: 0 }, '& ul': { mt: 1, mb: 0, pl: 2 } }}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
            
            {loading && (
              <Box display="flex" gap={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: '#2563eb', color: '#ffffff', width: 30, height: 30 }}>
                  <SmartToyRoundedIcon fontSize="small" />
                </Avatar>
                <Paper elevation={0} sx={{ px: 2.5, py: 1.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px 18px 18px 4px' }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CircularProgress size={14} thickness={5} sx={{ color: '#2563eb' }} />
                    <Typography variant="caption" color="#64748b" fontWeight="500">Analyzing MediStock metrics...</Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box p={2.5} bgcolor="#ffffff" sx={{ borderTop: '1px solid #f1f5f9' }}>
            <TextField 
              fullWidth 
              placeholder="Ask MediStock AI..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
              disabled={loading} 
              variant="outlined"
              InputProps={{
                sx: { 
                  borderRadius: '28px',
                  bgcolor: '#f8fafc',
                  paddingLeft: '16px',
                  pr: 1,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '1.5px' },
                  '& input': {
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    fontSize: '0.9rem'
                  }
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSend} 
                      disabled={loading || !input.trim()}
                      sx={{ 
                        bgcolor: input.trim() ? '#2563eb' : 'transparent', 
                        color: input.trim() ? '#ffffff' : '#94a3b8',
                        '&:hover': { bgcolor: input.trim() ? '#1d4ed8' : 'transparent' },
                        width: 34, height: 34
                      }}
                    >
                      <SendRoundedIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AiChatWidget;