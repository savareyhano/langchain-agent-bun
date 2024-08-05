import { ChatOllama } from '@langchain/ollama';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { searchTool, calculatorTool } from './agent-tools';
import { createStructuredChatAgent, AgentExecutor } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { collection, sessionId } from './mongo';

const llm = new ChatOllama({
  model: process.env.LLM_MODEL,
  temperature: 0,
});

const tools = [searchTool, calculatorTool];

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Respond to the human as helpfully and accurately as possible. You have access to the following tools:

    {tools}

    Use a json blob to specify a tool by providing an action key (tool name) and an action_input key (tool input).

    Valid "action" values: "Final Answer" or {tool_names}

    Provide only ONE action per $JSON_BLOB, as shown:

    \`\`\`
    {{
      "action": $TOOL_NAME,
      "action_input": $INPUT
    }}
    \`\`\`

    Follow this format:

    Question: input question to answer
    Thought: consider previous and subsequent steps
    Action:
    \`\`\`
    $JSON_BLOB
    \`\`\`
    Observation: action result
    ... (repeat Thought/Action/Observation N times)
    Thought: I know what to respond
    Action:
    \`\`\`
    {{
      "action": "Final Answer",
      "action_input": "Final response to human"
    }}

    Begin! Reminder to ALWAYS respond with a valid json blob of a single action. Use tools if necessary. Respond directly if appropriate. Format is Action:\`\`\`$JSON_BLOB\`\`\`then Observation`,
  ],
  ['placeholder', '{chat_history}'],
  [
    'human',
    `{input}

    {agent_scratchpad}
    (reminder to respond in a JSON blob no matter what)`,
  ],
]);

const agent = await createStructuredChatAgent({
  llm,
  tools,
  prompt,
});

const memory = new BufferMemory({
  chatHistory: new MongoDBChatMessageHistory({
    collection,
    sessionId,
  }),
  memoryKey: 'chat_history',
  inputKey: 'input',
  outputKey: 'output',
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  memory,
  maxIterations: 8,
});

const res1 = await agentExecutor.invoke({
  input: 'My name is Jacob.',
});

console.log(res1);

const res2 = await agentExecutor.invoke({
  input: 'What is my name?',
});

console.log(res2);
