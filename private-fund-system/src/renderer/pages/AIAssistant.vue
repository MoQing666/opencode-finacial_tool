<template>
  <div class="ai-assistant-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="session-card">
          <template #header>
            <div class="card-header">
              <span>会话列表</span>
              <el-button type="primary" size="small" @click="newSession">
                <el-icon><Plus /></el-icon>
                新建
              </el-button>
            </div>
          </template>
          
          <div class="session-list">
            <div
              v-for="session in sessions"
              :key="session"
              class="session-item"
              :class="{ active: currentSession === session }"
              @click="switchSession(session)"
            >
              <span class="session-name">{{ session }}</span>
              <el-button type="danger" link size="small" @click.stop="deleteSession(session)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-empty v-if="sessions.length === 0" description="暂无会话" :image-size="60" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card shadow="hover" class="chat-card">
          <template #header>
            <div class="card-header">
              <span>AI投资助手</span>
              <el-tag type="success">在线</el-tag>
            </div>
          </template>
          
          <div class="chat-messages" ref="messagesRef">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message"
              :class="msg.role"
            >
              <div class="message-avatar">
                <el-avatar :size="36" :icon="msg.role === 'user' ? 'User' : 'ChatDotRound'" />
              </div>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>
            <div v-if="loading" class="message assistant">
              <div class="message-avatar">
                <el-avatar :size="36" icon="ChatDotRound" />
              </div>
              <div class="message-content">
                <div class="message-text typing">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入您的问题..."
              @keydown.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <span class="tip">按 Ctrl+Enter 发送</span>
              <el-button type="primary" @click="sendMessage" :loading="loading">
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { aiApi } from '../services/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const messages = ref([]);
const sessions = ref([]);
const currentSession = ref('');
const inputMessage = ref('');
const messagesRef = ref(null);

onMounted(() => {
  fetchSessions();
});

async function fetchSessions() {
  try {
    const res = await aiApi.getSessions();
    if (res.data.success) {
      sessions.value = res.data.data;
      if (sessions.value.length > 0) {
        switchSession(sessions.value[0]);
      }
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
  }
}

async function switchSession(sessionId) {
  currentSession.value = sessionId;
  try {
    const res = await aiApi.getHistory({ sessionId });
    if (res.data.success) {
      messages.value = res.data.data.reverse();
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('获取会话历史失败:', error);
  }
}

function newSession() {
  currentSession.value = `session_${Date.now()}`;
  messages.value = [];
}

async function deleteSession(sessionId) {
  try {
    await ElMessageBox.confirm('确定删除该会话吗？', '提示', {
      type: 'warning'
    });
    
    await aiApi.deleteSession(sessionId);
    ElMessage.success('会话已删除');
    
    if (currentSession.value === sessionId) {
      currentSession.value = '';
      messages.value = [];
    }
    
    fetchSessions();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除会话失败');
    }
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim() || loading.value) return;
  
  const message = inputMessage.value.trim();
  inputMessage.value = '';
  
  messages.value.push({
    role: 'user',
    content: message,
    createdAt: new Date().toISOString()
  });
  
  await nextTick();
  scrollToBottom();
  
  loading.value = true;
  try {
    const res = await aiApi.chat({
      message,
      sessionId: currentSession.value || undefined
    });
    
    if (res.data.success) {
      messages.value.push({
        role: 'assistant',
        content: res.data.data.content,
        createdAt: new Date().toISOString()
      });
      
      if (!currentSession.value) {
        fetchSessions();
      }
    }
  } catch (error) {
    ElMessage.error('发送消息失败: ' + error.message);
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return new Date(timeStr).toLocaleTimeString('zh-CN');
}
</script>

<style lang="scss" scoped>
.ai-assistant-container {
  padding: 20px;
  height: calc(100vh - 120px);
}

.session-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-list {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 8px;
  
  &:hover {
    background: #f5f7fa;
  }
  
  &.active {
    background: #ecf5ff;
    color: #409eff;
  }
  
  .session-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .el-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  
  &.user {
    flex-direction: row-reverse;
    
    .message-content {
      align-items: flex-end;
    }
    
    .message-text {
      background: #409eff;
      color: #fff;
    }
  }
  
  &.assistant {
    .message-text {
      background: #f5f7fa;
    }
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
  word-break: break-word;
  
  &.typing {
    display: flex;
    gap: 4px;
    
    .dot {
      width: 8px;
      height: 8px;
      background: #909399;
      border-radius: 50%;
      animation: typing 1.4s infinite;
      
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  
  .tip {
    font-size: 12px;
    color: #909399;
  }
}

@keyframes typing {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
