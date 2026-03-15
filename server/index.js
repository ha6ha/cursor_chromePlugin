import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.warn(
    '[Quick Translator Backend] 环境变量 DEEPSEEK_API_KEY 未设置，DeepSeek 代理接口将无法正常工作。'
  );
}

app.use(cors());
app.use(express.json());

app.post('/deepseek', async (req, res) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'Server API key not configured' });
    }

    const { text } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text' });
    }

    const url = 'https://api.deepseek.com/chat/completions';

    const body = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的中英文翻译助手，只返回翻译后的文本本身，不要解释，不要添加前后缀。',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: 'DeepSeek API 请求失败', status: response.status });
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();

    if (!result) {
      return res.status(500).json({ error: 'DeepSeek 返回结果为空' });
    }

    return res.json({ translation: result });
  } catch (error) {
    console.error('[Quick Translator Backend] DeepSeek error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(
    `[Quick Translator Backend] Server is running on http://localhost:${PORT}`
  );
});

