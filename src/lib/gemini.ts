async function fetchWithRetry(
  action: string, 
  payload: any, 
  retries = 3, 
  delay = 1000
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 429) {
      console.warn(`Rate limited (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
        continue;
      }
    }

    // For other errors, or if retries are exhausted
    const text = await response.text();
    let errorMessage = text;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage || `Server error ${response.status}`);
  }
  throw new Error("Max retries exceeded for Gemini API");
}

export async function generateNPCResponse(
  npcName: string, 
  npcRole: string, 
  userMessage: string, 
  history: { role: string; parts: { text: string }[] }[] = [], 
  context?: { reputation: string; worldEvent: string; bias: string }
) {
  return fetchWithRetry("generateNPCResponse", { npcName, npcRole, userMessage, history, context });
}

export async function analyzeCombatPatterns(playerHistory: string[], enemyType: string) {
  return fetchWithRetry("analyzeCombatPatterns", { playerHistory, enemyType });
}

export async function generateQuest(location: string, difficulty: string) {
  return fetchWithRetry("generateQuest", { location, difficulty });
}

export async function generateQuantumQuest(
  location: string, 
  baseDifficulty: string, 
  suaParams: { 
    globalDifficulty: number; 
    playerHonor: number;
    playerBrutality: number;
  }
) {
  return fetchWithRetry("generateQuantumQuest", { location, baseDifficulty, suaParams });
}

export async function generateSovereignAnalysis(
  rep: { [key: string]: number }, 
  diff: { [key: string]: number }
) {
  return fetchWithRetry("generateSovereignAnalysis", { rep, diff });
}

export async function getAlchemyAssistant(potionName: string) {
  return fetchWithRetry("getAlchemyAssistant", { potionName });
}
