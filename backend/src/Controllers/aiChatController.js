import { AIChat } from '../models/AIChat.js';
import { logger } from '../utils/logger.js';

export const createSession = async (req, res) => {
  try {
    const { farmId, title } = req.body;
    const session = await AIChat.createSession(req.user.id, farmId, title);
    logger.info(`AI chat session created: ${session.id}`);
    res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    logger.error('Create AI session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await AIChat.getSessions(req.user.id, req.params.farmId);
    res.json(sessions);
  } catch (error) {
    logger.error('Get AI sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { sessionId, role, content } = req.body;
    const message = await AIChat.addMessage(sessionId, role, content);
    logger.info(`AI message added: ${message.id}`);
    res.status(201).json({ message: 'Message added successfully', message });
  } catch (error) {
    logger.error('Add AI message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await AIChat.getMessages(req.params.sessionId);
    res.json(messages);
  } catch (error) {
    logger.error('Get AI messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await AIChat.deleteSession(req.params.sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    logger.error('Delete AI session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};