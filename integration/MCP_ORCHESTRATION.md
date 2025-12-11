# 🔄 MCP Orchestrierung - Verbesserungen

## Multi-Agent Workflows

### Workflow-API
```javascript
// /opt/mcp/server.js erweitern

app.post('/workflow/execute', async (req, res) => {
  const { workflow, input } = req.body;
  
  // Beispiel: Reading → Marketing → Social-YouTube
  const results = {};
  
  for (const step of workflow.steps) {
    results[step.agent] = await callAgent(step.agent, {
      ...input,
      context: results
    });
  }
  
  return res.json(results);
});
```

## Caching

### Response-Caching
```javascript
const cache = new Map();
const CACHE_TTL = 3600000; // 1 Stunde

app.post('/agent/:agentId', async (req, res) => {
  const cacheKey = `${agentId}:${JSON.stringify(req.body)}`;
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const response = await processAgentRequest(...);
  cache.set(cacheKey, response);
  setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
  return res.json(response);
});
```

## Rate Limiting

### Pro Agent
```javascript
const rateLimit = require('express-rate-limit');

const agentLimiter = rateLimit({
  windowMs: 60000, // 1 Minute
  max: 10 // 10 Requests pro Minute
});

app.use('/agent/:agentId', agentLimiter);
```

