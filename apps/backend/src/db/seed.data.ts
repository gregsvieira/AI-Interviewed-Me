export interface SeedQuestion {
  topicId: string;
  subtopicId: string;
  level: string;
  question: string;
  followUps: string[];
  tags: string[];
  expectedAnswer: string;
  criteria: string[];
  keywords: string[];
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  {
    topicId: 'frontend',
    subtopicId: 'react',
    level: 'mid',
    question: 'Explain the React component lifecycle and when you would use each phase.',
    followUps: [
      'When would you use useEffect?',
      'How do you handle cleanup in useEffect?',
      'What is the difference between useEffect and useLayoutEffect?',
    ],
    tags: ['react', 'hooks', 'lifecycle'],
    expectedAnswer: `React has three main lifecycle phases:

1. MOUNTING: component is being created and inserted into DOM
   - constructor(): initialize state, bind methods
   - render(): returns JSX
   - componentDidMount(): side effects, data fetching, subscriptions

2. UPDATING: component re-renders due to state/props changes
   - render(): re-renders with new data
   - componentDidUpdate(): respond to changes, side effects

3. UNMOUNTING: component is being removed from DOM
   - componentWillUnmount(): cleanup subscriptions, timers, cancel requests

For functional components, useEffect hook handles all these phases:
- Run on mount: useEffect(() => {}, [])
- Run on mount + updates: useEffect(() => {}, [dependency])
- Run on unmount + before update: useEffect(() => { return () => {} }, [])`,
    criteria: [
      'Mention the 3 main phases (mounting, updating, unmounting)',
      'Explain what happens in each phase',
      'Differentiate class components from functional components',
      'Explain useEffect as an alternative to lifecycle in hooks',
      'Know when to use each phase',
    ],
    keywords: ['mounting', 'updating', 'unmounting', 'useEffect', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'render', 'constructor'],
  },
  {
    topicId: 'frontend',
    subtopicId: 'react',
    level: 'senior',
    question: 'How would you optimize a React application with 1000+ components that causes slow re-renders?',
    followUps: [
      'What is React.memo and when should you use it?',
      'How does the reconciliation algorithm work?',
      'When would you use useMemo vs useCallback?',
    ],
    tags: ['react', 'performance', 'optimization'],
    expectedAnswer: `For optimizing a large React application with slow re-renders:

1. IDENTIFY THE PROBLEM:
   - Use React DevTools Profiler to identify components that re-render unnecessarily
   - Check for inline functions and objects being recreated on every render

2. MEMOIZATION STRATEGIES:
   - React.memo: Memoize entire component, re-render only when props change
   - useMemo: Memoize expensive calculations
   - useCallback: Memoize callback functions to prevent child re-renders

3. CODE SPLITTING:
   - React.lazy() and Suspense for code splitting
   - Dynamic imports for routes and heavy components

4. VIRTUALIZATION:
   - react-window or react-virtual for long lists
   - Only render visible items in viewport

5. STATE MANAGEMENT:
   - Lift state up only when necessary
   - Use context wisely, avoid unnecessary re-renders

6. RENDER OPTIMIZATION:
   - Avoid inline functions in JSX
   - Use keys properly (not index for dynamic lists)`,
    criteria: [
      'Identify the problem using profiling tools',
      'Apply React.memo correctly',
      'Explain difference between useMemo and useCallback',
      'Implement code splitting with React.lazy',
      'Use virtualization for large lists',
    ],
    keywords: ['React.memo', 'useMemo', 'useCallback', 'reconciliation', 'virtualization', 'profiler', 'code splitting', 'React.lazy', 'Suspense'],
  },
  {
    topicId: 'backend',
    subtopicId: 'node',
    level: 'mid',
    question: 'Explain the Node.js event loop and how it handles asynchronous operations.',
    followUps: [
      'What is the difference between setTimeout and process.nextTick?',
      'How does the microtask queue work?',
      'What are worker threads and when should you use them?',
    ],
    tags: ['node', 'event-loop', 'async'],
    expectedAnswer: `The Node.js event loop has multiple phases:

1. TIMERS: execute setTimeout/setInterval callbacks
2. PENDING CALLBACKS: I/O callbacks deferred from previous cycle
3. IDLE, PREPARE: internal use
4. POLL: retrieve new I/O events, execute I/O related callbacks
5. CHECK: execute setImmediate callbacks
6. CLOSE CALLBACKS: handle close events

ORDER OF EXECUTION:
- Timers → Pending → Idle → Poll → Check → Close

MICROTASKS (processed after each phase):
- Promise callbacks (then, catch, finally)
- process.nextTick (highest priority, before other microtasks)

ASYNC OPERATIONS:
- Non-blocking I/O: File, Network, Database operations
- libuv thread pool: handles file I/O, DNS lookups, compression`,
    criteria: [
      'Explain the 6 phases of the event loop',
      'Understand the order of phase execution',
      'Differentiate setTimeout from process.nextTick',
      'Explain how microtasks work',
      'Know when to use worker threads',
    ],
    keywords: ['event loop', 'timers', 'poll', 'check', 'microtasks', 'setTimeout', 'nextTick', 'libuv', 'async I/O'],
  },
  {
    topicId: 'backend',
    subtopicId: 'node',
    level: 'senior',
    question: 'How would you design a scalable API gateway pattern in Node.js?',
    followUps: [
      'What are the main responsibilities of an API gateway?',
      'How would you handle rate limiting and authentication at the gateway level?',
      'How would you implement circuit breaker pattern?',
    ],
    tags: ['node', 'architecture', 'api-gateway'],
    expectedAnswer: `API Gateway Design in Node.js:

1. RESPONSIBILITIES:
   - Request routing (route to appropriate service)
   - Request/response transformation
   - Authentication & Authorization
   - Rate limiting & throttling
   - SSL termination
   - Load balancing
   - Caching
   - Circuit breaker

2. ARCHITECTURE:
   Client → API Gateway → Auth Service / Rate Limiter / Service A, B, C

3. IMPLEMENTATION PATTERNS:

   RATE LIMITING:
   - Token bucket or sliding window algorithm
   - Redis for distributed rate limiting

   CIRCUIT BREAKER:
   - States: CLOSED (normal), OPEN (failing), HALF-OPEN (testing)
   - Monitor failed requests, fallback response when open

4. SCALABILITY:
   - Stateless design (store state in Redis)
   - Horizontal scaling with multiple instances
   - Use nginx or cloud load balancer in front`,
    criteria: [
      'List main responsibilities of an API gateway',
      'Implement rate limiting with Redis',
      'Implement circuit breaker pattern',
      'Design scalable architecture',
      'Configure JWT authentication',
    ],
    keywords: ['API gateway', 'rate limiting', 'circuit breaker', 'load balancing', 'JWT', 'authentication', 'middleware'],
  },
];
