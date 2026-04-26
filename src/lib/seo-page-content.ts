import type { SeoLandingPageContent } from "@/components/seo/SeoLandingPage";
import type { LegalPageContent } from "@/components/seo/LegalPage";

const productLinks = [
  {
    href: "/app",
    label: "Market intelligence app",
    description: "Open the live dashboard for market data, news, and AI briefings.",
  },
  {
    href: "/app/ask",
    label: "Ask AI",
    description: "Ask market questions against current platform context.",
  },
  {
    href: "/risk-disclaimer",
    label: "Risk disclaimer",
    description: "Review how to use AI crypto research responsibly.",
  },
];

export const seoLandingPages: Record<string, SeoLandingPageContent> = {
  "ai-crypto-analysis": {
    eyebrow: "AI crypto analysis",
    title: "AI Crypto Analysis for Research-Driven Market Decisions",
    description:
      "Learn how CoinTrace AI turns crypto prices, news, narratives, and token context into organized AI market analysis without promising profits or replacing independent research.",
    path: "/ai-crypto-analysis",
    primaryKeyword: "AI crypto analysis",
    sections: [
      {
        title: "What AI crypto analysis means in CoinTrace AI",
        paragraphs: [
          "AI crypto analysis is the practice of using structured market data and language models to help explain what is happening across digital asset markets. In CoinTrace AI, the goal is not to produce a magic buy or sell button. The product is built to collect live price context, recent news, token-level details, and narrative signals, then organize that information into research that is easier to read, question, and compare.",
          "Crypto markets move quickly, and many analysts lose time switching between charts, news feeds, social posts, dashboards, and general-purpose chatbots. CoinTrace AI is designed as a focused research workspace for that problem. It gives users a market brief, token analysis, narrative detection, and an Ask AI interface so that the same source of context can support several research workflows.",
        ],
      },
      {
        title: "Why long-form context matters",
        paragraphs: [
          "Short alerts can be useful, but they often hide the assumptions behind a market view. A token may be moving because of broad market beta, sector rotation, a news catalyst, liquidity changes, or simply noise. CoinTrace AI encourages a more careful workflow by separating observations, drivers, risks, and confidence. That structure helps users see why an AI-generated explanation may or may not be useful for their own research process.",
          "The platform is especially useful when markets are crowded with overlapping stories. For example, Bitcoin strength may influence Ethereum sentiment, while AI tokens, restaking tokens, and infrastructure tokens move for different reasons. AI crypto analysis inside CoinTrace AI attempts to put these signals side by side so researchers can decide which information deserves further attention.",
        ],
      },
      {
        title: "How the product supports analysis",
        paragraphs: [
          "The dashboard starts with market context: current prices, recent movement, chart data, and news. The AI market brief then summarizes the state of the market in plain language. Token pages focus the same approach on individual assets such as Bitcoin and Ethereum, while narrative tools help identify themes that connect multiple tokens. Ask AI lets users pose follow-up questions using platform context instead of starting from a blank prompt.",
          "This architecture is meant to reduce research friction. A user can begin with the broad market view, open a token page, inspect news, read an AI-generated explanation, and then ask a more specific question. Internal links between these surfaces matter for SEO, but they also match how real crypto research tends to happen: broad context first, then deeper investigation.",
        ],
      },
      {
        title: "Responsible use of AI market research",
        paragraphs: [
          "CoinTrace AI does not provide financial advice, personalized investment recommendations, guaranteed returns, or instructions to trade. AI-generated market analysis can be incomplete, delayed, or wrong. It should be treated as a research aid that helps organize information, not as a substitute for risk management, independent verification, or professional advice.",
          "A responsible workflow combines AI summaries with primary data, position sizing rules, time horizon awareness, and a clear understanding of volatility. The best use of CoinTrace AI is to ask better questions faster: What is driving this move? What evidence supports the thesis? What risks would invalidate it? What information is missing?",
        ],
      },
      {
        title: "Who this page is for",
        paragraphs: [
          "This guide is written for crypto analysts, active researchers, product teams, founders, content teams, and sophisticated retail users who want clearer market intelligence. It is also useful for anyone searching for AI crypto analysis tools but wanting a product that presents uncertainty instead of hiding it.",
          "CoinTrace AI is built around the belief that AI can make crypto research more structured and easier to navigate. It works best when users bring judgment to the output, compare it with other sources, and treat every generated explanation as a starting point for analysis rather than a final answer.",
        ],
      },
      {
        title: "What to verify after reading an AI analysis",
        paragraphs: [
          "A useful next step is to compare the generated explanation with current market data, recent headlines, and the user's own time horizon. If the AI says a move is narrative-driven, check whether related tokens are moving too. If it says news is important, verify the source and timing. If it highlights risk, decide whether that risk changes the research thesis.",
          "This verification habit is part of the product philosophy. CoinTrace AI can reduce the time needed to gather context, but it should also make users more skeptical in a productive way. The best outcome is not blind confidence. It is a clearer set of questions, a better understanding of uncertainty, and a research process that is easier to repeat.",
        ],
      },
    ],
    useCases: [
      "Summarize broad crypto market conditions before deeper research.",
      "Compare token-specific explanations against recent price action.",
      "Identify risks and missing context before making independent decisions.",
      "Ask follow-up questions without rebuilding the market context manually.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/crypto-market-intelligence",
        label: "Crypto market intelligence",
        description: "Explore the broader intelligence workflow behind CoinTrace AI.",
      },
      {
        href: "/ai-token-analysis",
        label: "AI token analysis",
        description: "See how token-level research fits into the platform.",
      },
    ],
    faqs: [
      {
        question: "Is CoinTrace AI a trading signal service?",
        answer:
          "No. CoinTrace AI is a market intelligence and research product. It can summarize data, explain possible drivers, and highlight risks, but it does not guarantee profitable trades or provide personal financial advice.",
      },
      {
        question: "What makes AI crypto analysis different from a normal chatbot?",
        answer:
          "CoinTrace AI is designed around crypto-specific market context such as prices, news, narratives, and token pages. A general chatbot may not have the same structured product context or internal research workflow.",
      },
      {
        question: "Can AI crypto analysis be wrong?",
        answer:
          "Yes. AI output can be incomplete, stale, or incorrect. Users should verify important claims with primary sources and use the product as one input in a broader research process.",
      },
    ],
  },
  "crypto-market-intelligence": {
    eyebrow: "Market intelligence",
    title: "Crypto Market Intelligence for AI-Assisted Research",
    description:
      "CoinTrace AI brings market data, crypto news, narrative tracking, and AI briefings into one workspace for researchers who need context instead of isolated alerts.",
    path: "/crypto-market-intelligence",
    primaryKeyword: "crypto market intelligence",
    sections: [
      {
        title: "A single workspace for market context",
        paragraphs: [
          "Crypto market intelligence is broader than price tracking. A useful intelligence layer should help users understand what changed, why it may have changed, what themes are connected, and which risks deserve attention. CoinTrace AI approaches this by combining market data, news, token analysis, narrative detection, and AI-generated briefings inside one product surface.",
          "The value is not only speed. It is consistency. When every research session begins from a shared dashboard, users can compare today's conditions with yesterday's brief, move from Bitcoin to Ethereum, and ask follow-up questions without rebuilding context across many tabs. That consistency helps reduce the scattered feeling of crypto research.",
        ],
      },
      {
        title: "From raw data to usable intelligence",
        paragraphs: [
          "Raw crypto data can be noisy. A 24-hour move may look important until it is compared with volatility, volume, news, and sector behavior. CoinTrace AI does not claim to know the future. Instead, it tries to turn raw signals into a readable explanation that separates facts, possible drivers, and open risks.",
          "This distinction matters for teams. Analysts need to know whether a market brief is grounded in current information, whether a token explanation is speculative, and whether a narrative is broad or isolated. The platform presents analysis in a format that can support discussion, research notes, dashboards, or a personal decision process.",
        ],
      },
      {
        title: "How CoinTrace AI organizes research",
        paragraphs: [
          "The main app includes a dashboard for live market overview, an AI market brief for summarized context, token pages for asset-level investigation, and narrative tools for cross-market themes. The Ask AI feature lets users ask plain-language questions such as why a token is moving or which risks are visible in the current market.",
          "Each surface is connected through internal navigation. A user researching crypto market intelligence can start on the public overview, open the app, inspect Bitcoin or Ethereum analysis, review crypto narratives, and read the risk disclaimer. This structure supports both search engines and real users because the pages answer related questions in a coherent path.",
        ],
      },
      {
        title: "A practical approach to uncertainty",
        paragraphs: [
          "Good market intelligence should not pretend that uncertainty disappears because AI is involved. CoinTrace AI is built for research support, not certainty. It can help frame hypotheses, surface possible catalysts, and highlight areas where more verification is needed. That makes it useful for disciplined users who want context before acting.",
          "Crypto markets are volatile and can react to liquidity, macro events, regulation, security incidents, and social sentiment. The platform's explanations should be read with those risks in mind. No page on CoinTrace AI should be interpreted as financial advice, a recommendation, or a promise of future performance.",
        ],
      },
      {
        title: "Who needs crypto market intelligence",
        paragraphs: [
          "Crypto market intelligence is useful for traders, researchers, founders, analysts, media teams, educators, and operators who need to understand market conditions quickly. It is also helpful for users who want a repeatable process for checking what changed before they form an opinion.",
          "CoinTrace AI is designed for people who value structure. Instead of chasing every market post, users can start with a brief, check the supporting context, inspect related tokens, and ask targeted questions. The result is a calmer research workflow, even when the market itself remains unpredictable.",
        ],
      },
      {
        title: "Signals to compare before trusting a market view",
        paragraphs: [
          "A market intelligence workflow should compare several categories of evidence before accepting a view. Price movement should be compared with volume, volatility, news timing, asset correlation, and sector behavior. If a market brief identifies a bullish theme, users should also ask what would make the theme weaker or less relevant.",
          "CoinTrace AI is designed to make those comparisons easier by keeping the dashboard, token pages, narratives, and Ask AI experience connected. The product cannot know a user's objectives or constraints, so it should not be treated as a final decision layer. Its role is to help users move from scattered information to a more organized research checklist.",
          "That checklist is valuable even when the conclusion is to wait. Sometimes the most useful intelligence is knowing that evidence is mixed, volatility is elevated, or the market story is not supported by enough data.",
        ],
      },
    ],
    useCases: [
      "Prepare a daily market overview before team discussions.",
      "Connect token moves with news and broader market themes.",
      "Use AI summaries as a first-pass research layer.",
      "Move from dashboard context into token and narrative research.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/crypto-narratives",
        label: "Crypto narratives",
        description: "Learn how narrative tracking supports market intelligence.",
      },
      {
        href: "/bitcoin-ai-analysis",
        label: "Bitcoin AI analysis",
        description: "Review how BTC-specific research can fit into the workflow.",
      },
    ],
    faqs: [
      {
        question: "What is crypto market intelligence?",
        answer:
          "It is the process of organizing market data, news, token behavior, narratives, and risks into research that helps users understand market conditions. It is not the same as a guaranteed trading signal.",
      },
      {
        question: "Does CoinTrace AI replace professional research?",
        answer:
          "No. CoinTrace AI can support research workflows, but users should verify important information and consult qualified professionals where appropriate.",
      },
      {
        question: "Can teams use CoinTrace AI for daily briefings?",
        answer:
          "Yes, the product is designed to make daily market context easier to review, though every briefing should still be checked against source data and current events.",
      },
    ],
  },
  "ai-token-analysis": {
    eyebrow: "Token research",
    title: "AI Token Analysis for Bitcoin, Ethereum, and Crypto Assets",
    description:
      "Use CoinTrace AI to structure token research around market movement, recent news, AI explanations, risks, and follow-up questions.",
    path: "/ai-token-analysis",
    primaryKeyword: "AI token analysis",
    sections: [
      {
        title: "Why token analysis needs more than a chart",
        paragraphs: [
          "A token chart shows what happened, but it rarely explains the full context. AI token analysis in CoinTrace AI is designed to pair price movement with news, market structure, and narrative context so users can form better research questions. The product does not claim to identify certain trades. It helps organize what may be relevant.",
          "For major assets such as Bitcoin and Ethereum, context can include macro sentiment, liquidity, ETF flows, network activity, sector rotation, developer narratives, and broad risk appetite. For smaller tokens, context may include catalysts, governance, exchange activity, and theme participation. CoinTrace AI's token workflow is built to make these factors easier to inspect.",
        ],
      },
      {
        title: "How CoinTrace AI presents token context",
        paragraphs: [
          "Token pages provide a focused view of an asset. The page can include current market data, chart context, recent news, and an AI-generated explanation of visible drivers and risks. This gives users a repeatable way to review an asset without jumping between unrelated tools.",
          "The AI layer is most useful when paired with questions. A user might ask why Bitcoin is diverging from Ethereum, whether a token move appears related to a broader narrative, or which risk signals could weaken a thesis. The output should be treated as analysis support, not as a personalized instruction to buy, sell, or hold.",
        ],
      },
      {
        title: "Token research and narrative research work together",
        paragraphs: [
          "Tokens rarely move in isolation. AI infrastructure tokens, layer 2 networks, restaking assets, meme coins, and exchange tokens may all respond to different stories. CoinTrace AI connects token pages with narrative research so users can understand whether an asset move is part of a larger theme or an isolated event.",
          "This is important for long-tail research. A token that appears strong on a chart may simply be following a market-wide rally. Another token may be lagging despite positive sector conditions. By comparing token-level analysis with narrative-level context, researchers can identify questions that deserve deeper verification.",
        ],
      },
      {
        title: "Risk-aware interpretation",
        paragraphs: [
          "AI token analysis should always include risk. Crypto assets are volatile, and market explanations can change quickly when liquidity, regulation, security news, macro data, or exchange conditions shift. CoinTrace AI encourages users to review risk notes alongside any bullish or bearish interpretation.",
          "The product also avoids guaranteed profit language. It is designed for education, organization, and research. Users remain responsible for their own decisions, risk limits, tax considerations, and compliance obligations. A good analysis workflow starts with curiosity and ends with independent judgment.",
        ],
      },
      {
        title: "A practical token research workflow",
        paragraphs: [
          "A simple workflow starts with the market dashboard to understand the broader environment. Next, open a token page for Bitcoin or Ethereum, read the AI analysis, review recent news, and compare the asset with active narratives. Finally, use Ask AI to pressure-test the thesis with specific questions about drivers, risks, or missing context.",
          "This structure turns AI token analysis into a process rather than a headline. It helps users avoid overreacting to a single move and instead examine the token through several lenses. That is the kind of research behavior CoinTrace AI is designed to support.",
        ],
      },
      {
        title: "Questions to ask before acting on token research",
        paragraphs: [
          "After reviewing a token page, users should ask whether the explanation depends on one weak source, whether the move is confirmed by related assets, and whether the token is simply following Bitcoin or Ethereum. They should also ask whether liquidity, unlocks, protocol risk, or market structure could invalidate the surface-level story.",
          "CoinTrace AI can help generate and organize those questions, but it cannot answer whether a token is suitable for a particular person. Suitability depends on capital, time horizon, jurisdiction, risk tolerance, taxes, and personal constraints. That is why the product language is centered on research support rather than recommendations.",
          "Users can also compare the current explanation with prior market conditions. If the same token has reacted differently to similar news in the past, that difference may be more important than the headline. AI token analysis is strongest when it helps expose those follow-up questions.",
        ],
      },
    ],
    useCases: [
      "Review BTC and ETH market context from dedicated token pages.",
      "Compare AI explanations with news and chart behavior.",
      "Identify questions to ask before deeper token research.",
      "Separate token-specific catalysts from broad market movement.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/bitcoin-ai-analysis",
        label: "Bitcoin AI analysis",
        description: "Research Bitcoin with AI-assisted market context.",
      },
      {
        href: "/ethereum-ai-analysis",
        label: "Ethereum AI analysis",
        description: "Research Ethereum drivers, risks, and narratives.",
      },
    ],
    faqs: [
      {
        question: "Which tokens does CoinTrace AI analyze?",
        answer:
          "The current product focuses on supported token pages such as BTC and ETH, with broader market and narrative context available through the app.",
      },
      {
        question: "Is AI token analysis investment advice?",
        answer:
          "No. It is research support. Users should verify information independently and make their own decisions based on their circumstances and risk tolerance.",
      },
      {
        question: "Why combine token analysis with narratives?",
        answer:
          "Narratives can explain why groups of tokens move together. Comparing token data with narrative context helps users avoid treating every move as isolated.",
      },
    ],
  },
  "crypto-narratives": {
    eyebrow: "Narrative intelligence",
    title: "Crypto Narratives Explained with AI Market Context",
    description:
      "Track crypto narratives with CoinTrace AI by connecting token movement, news context, risk signals, and AI-generated explanations.",
    path: "/crypto-narratives",
    primaryKeyword: "crypto narratives",
    sections: [
      {
        title: "Why narratives matter in crypto",
        paragraphs: [
          "Crypto narratives are themes that shape attention, liquidity, and research priorities. They may involve AI tokens, Bitcoin treasury demand, Ethereum scaling, restaking, real-world assets, DeFi, stablecoins, gaming, privacy, or infrastructure. Narratives do not guarantee price movement, but they often influence what the market chooses to watch.",
          "CoinTrace AI treats narratives as research objects. Instead of assuming every popular story is meaningful, the platform is designed to look at supporting signals, related tokens, potential catalysts, confidence, and risks. This helps users separate a durable theme from a short-lived headline.",
        ],
      },
      {
        title: "Narrative tracking inside CoinTrace AI",
        paragraphs: [
          "The narrative workflow connects market data with AI explanations. A detected theme can include leader tokens, related tokens, laggards, supporting signals, risk signals, and a plain-language thesis. The goal is to show why a narrative may be active and what could weaken it.",
          "This is different from reading a social feed. Social narratives can be emotional and fragmented. CoinTrace AI aims to place themes in a structured format so users can compare them across time and against market behavior. It is a research tool, not a popularity contest or a recommendation engine.",
        ],
      },
      {
        title: "Using narratives with token analysis",
        paragraphs: [
          "Narratives become more useful when connected to token pages. If a token is moving, a user can ask whether the move fits a broader theme or whether it is more likely driven by token-specific news. If a narrative is active, a user can inspect the leader tokens and then research each asset in more detail.",
          "This internal workflow supports long-tail research around questions such as which crypto narratives are active, why AI crypto tokens are moving, or how Ethereum-related tokens respond to scaling news. CoinTrace AI helps organize those questions while keeping uncertainty visible.",
        ],
      },
      {
        title: "Common risks in narrative research",
        paragraphs: [
          "Narratives can become crowded, reflexive, or misleading. A strong story may continue attracting attention, but it can also reverse quickly if liquidity changes, expectations become too high, or new information contradicts the thesis. CoinTrace AI includes risk framing because narrative strength is never the same as certainty.",
          "Users should also be careful with hindsight. It is easy to explain a move after it happens. Responsible narrative research asks whether the explanation has evidence, whether alternative explanations exist, and whether the theme is supported by more than one signal. AI can help with that structure, but it cannot remove market risk.",
        ],
      },
      {
        title: "A better workflow for narrative discovery",
        paragraphs: [
          "A practical workflow starts by checking the market dashboard, then opening the narrative page to see which themes are active. From there, users can inspect leader tokens, read risk notes, open token pages, and ask follow-up questions. The goal is to move from a broad story to a verifiable research path.",
          "CoinTrace AI is built for users who want to understand crypto narratives without turning every story into a trade. It can support education, market monitoring, content research, or team briefings. The final interpretation remains with the user.",
        ],
      },
      {
        title: "How to judge whether a narrative is useful",
        paragraphs: [
          "A useful narrative should explain more than one observation. It may connect several tokens, a clear catalyst, repeated news themes, and visible market behavior. A weak narrative may depend only on a social post, a single token move, or a story that sounds convincing but has little supporting evidence.",
          "CoinTrace AI is designed to make that judgment easier by presenting supporting signals and risk signals together. Users can then decide whether the theme deserves deeper work, whether it is too crowded, or whether it conflicts with broader market conditions. This keeps narrative research grounded in questions rather than hype.",
          "It is also useful to watch how narratives behave when the market changes direction. A theme that holds up during weaker conditions may be different from one that only works during broad risk-on rallies. CoinTrace AI's connected pages help users compare that narrative behavior with token and market context.",
          "The goal is a more careful narrative map: what is happening, which assets are involved, what evidence supports the story, and what could prove it wrong.",
        ],
      },
    ],
    useCases: [
      "Find active themes across crypto market segments.",
      "Compare narrative leaders with lagging related tokens.",
      "Use risk signals to pressure-test popular stories.",
      "Connect public SEO research pages with the live narrative app.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/app/narratives",
        label: "Live narratives app",
        description: "Open the product page for AI-assisted narrative tracking.",
      },
      {
        href: "/ai-crypto-agents",
        label: "AI crypto agents",
        description: "Learn how agent-based workflows support research.",
      },
    ],
    faqs: [
      {
        question: "What are crypto narratives?",
        answer:
          "Crypto narratives are market themes that connect assets, news, attention, and expectations. They can influence research priorities but do not guarantee future returns.",
      },
      {
        question: "How does CoinTrace AI detect narratives?",
        answer:
          "The product uses market context, token groupings, news, and AI-generated explanations to organize possible narratives into a structured research view.",
      },
      {
        question: "Should I trade based on a narrative alone?",
        answer:
          "No. Narrative research should be combined with data verification, risk management, and independent judgment. CoinTrace AI does not provide financial advice.",
      },
    ],
  },
  "ai-crypto-agents": {
    eyebrow: "AI agents",
    title: "AI Crypto Agents for Market Research Workflows",
    description:
      "CoinTrace AI uses agent-style research workflows to break crypto market analysis into market data, news, narratives, risks, synthesis, and validation.",
    path: "/ai-crypto-agents",
    primaryKeyword: "AI crypto agents",
    sections: [
      {
        title: "What AI crypto agents are",
        paragraphs: [
          "AI crypto agents are specialized workflow steps that handle different parts of market research. One agent may focus on market data, another on news, another on narratives, and another on risks. A final synthesis step can combine those views into a readable brief. CoinTrace AI uses this style of architecture to make analysis more structured.",
          "The phrase agent can sound futuristic, but the practical value is simple: separate responsibilities. Crypto research involves several kinds of evidence, and a single undifferentiated prompt can blur them together. Agent-style workflows help keep those tasks distinct before a final explanation is produced.",
        ],
      },
      {
        title: "Why agent workflows help crypto research",
        paragraphs: [
          "Crypto markets include quantitative movement, qualitative news, social narratives, liquidity conditions, and fast-changing risk events. A market-data-focused step should not behave like a news summarizer. A risk step should be allowed to challenge the thesis instead of only supporting it. This is where an agent workflow can improve the structure of the output.",
          "CoinTrace AI's approach is to treat the final brief as a synthesis of multiple perspectives rather than a single answer. That does not make the result certain, but it can make the reasoning easier to inspect. Users can then ask whether the supporting signals are strong enough for their own research standards.",
        ],
      },
      {
        title: "How CoinTrace AI applies agents",
        paragraphs: [
          "The market brief workflow is designed around dedicated research roles: market data interpretation, recent news context, narrative detection, short-term risk assessment, synthesis, and validation. The product can then present a final brief that is easier to understand than a raw pile of indicators and headlines.",
          "Agent workflows also support explainability. A user should be able to understand how a brief was built, which inputs mattered, and where uncertainty remains. This is important for trust because AI-generated crypto analysis can sound confident even when the evidence is mixed.",
        ],
      },
      {
        title: "Limits of AI agents in crypto",
        paragraphs: [
          "AI agents do not remove volatility, data quality problems, or model limitations. They can organize research, but they can still misinterpret an event, overstate a weak signal, or miss a relevant source. CoinTrace AI should be used as a research aid, not as an autonomous trading system or a promise of profitable outcomes.",
          "A responsible agent workflow includes validation, risk framing, and human review. Users should be especially careful during major news events, exchange disruptions, regulatory headlines, and unusually thin liquidity. These are moments when market context can change faster than any analysis interface can summarize.",
        ],
      },
      {
        title: "Who benefits from AI crypto agents",
        paragraphs: [
          "Agent-based crypto research can help analysts, founders, content teams, and active market participants who need repeatable briefings. It is useful when a team wants the same structure every day: what moved, what news matters, what narratives are active, what risks are visible, and what questions remain open.",
          "CoinTrace AI is built to make that workflow accessible inside a product rather than a custom internal system. Users can open the app, read the market brief, inspect related pages, and ask follow-up questions. The aim is better research structure, not automated certainty.",
        ],
      },
      {
        title: "What an agent workflow should make visible",
        paragraphs: [
          "An effective AI crypto agent workflow should make its assumptions easier to inspect. Users should be able to see whether the brief is based on market movement, news, narrative strength, risk assessment, or synthesis. If every conclusion is blended into one confident paragraph, it becomes harder to evaluate the analysis.",
          "CoinTrace AI's product direction favors separated research steps because crypto markets reward careful interpretation. Agent outputs should help users compare evidence, identify missing context, and decide which claims need verification. The practical benefit is not that agents are infallible. It is that the workflow can make uncertainty easier to discuss.",
          "This matters for teams as well as individuals. A shared agent workflow can make briefings easier to review because everyone sees the same categories of evidence. Teams can debate the inputs and risks instead of debating an unexplained answer.",
          "That makes the agent model a practical research structure, not a promise that automation can replace human review.",
        ],
      },
    ],
    useCases: [
      "Break market research into specialized AI-assisted steps.",
      "Review risk commentary alongside market and news analysis.",
      "Use synthesis to turn fragmented inputs into a readable brief.",
      "Create repeatable research workflows for daily market checks.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/crypto-market-intelligence",
        label: "Market intelligence",
        description: "See how agent workflows support the wider intelligence product.",
      },
      {
        href: "/ai-crypto-analysis",
        label: "AI crypto analysis",
        description: "Understand the broader analysis method behind the app.",
      },
    ],
    faqs: [
      {
        question: "Are CoinTrace AI agents autonomous trading bots?",
        answer:
          "No. The agents are research workflow roles used to organize analysis. They are not presented as autonomous trading bots or guaranteed profit systems.",
      },
      {
        question: "Why use multiple AI agents instead of one prompt?",
        answer:
          "Separate roles can keep market data, news, narratives, risk, and synthesis clearer. That makes the final explanation easier to inspect.",
      },
      {
        question: "Do AI agents make crypto research risk-free?",
        answer:
          "No. They can support research structure, but crypto markets remain volatile and users are responsible for independent verification and risk decisions.",
      },
    ],
  },
  "bitcoin-ai-analysis": {
    eyebrow: "Bitcoin research",
    title: "Bitcoin AI Analysis for Market Structure, News, and Risk",
    description:
      "Research Bitcoin with CoinTrace AI using market context, AI explanations, risk framing, news, and follow-up questions.",
    path: "/bitcoin-ai-analysis",
    primaryKeyword: "Bitcoin AI analysis",
    sections: [
      {
        title: "Why Bitcoin needs its own analysis workflow",
        paragraphs: [
          "Bitcoin often acts as the reference asset for the rest of the crypto market. When BTC moves, it can change sentiment across majors, altcoins, stablecoin flows, and risk appetite. Bitcoin AI analysis in CoinTrace AI is designed to help users inspect that context without treating every price move as a simple signal.",
          "BTC analysis can involve spot demand, derivatives positioning, macro expectations, ETF-related discussion, liquidity, miner behavior, and broad market psychology. CoinTrace AI does not claim to forecast Bitcoin with certainty. It helps organize visible information into a research view that users can question and verify.",
        ],
      },
      {
        title: "How CoinTrace AI supports BTC research",
        paragraphs: [
          "A Bitcoin research session can start on the market dashboard, where BTC price, change, chart context, and market sentiment are visible. From there, users can open the BTC token page, read the AI token analysis, review recent news, and ask follow-up questions through Ask AI.",
          "This flow is useful because Bitcoin is both an individual asset and a market signal. A BTC move may reflect asset-specific demand, macro conditions, or broad crypto beta. CoinTrace AI is designed to make those possibilities easier to compare instead of forcing users to jump between disconnected tools.",
        ],
      },
      {
        title: "Bitcoin narratives and broader market impact",
        paragraphs: [
          "Bitcoin can influence narratives across the entire market. A strong BTC move may support risk-on behavior, while BTC weakness may reduce appetite for speculative themes. At the same time, Bitcoin can diverge from Ethereum or altcoin sectors, which makes narrative context important.",
          "CoinTrace AI connects Bitcoin research with crypto narrative pages so users can ask whether BTC is leading, lagging, or moving independently. This does not produce a guaranteed conclusion, but it creates a better research path for understanding what the market may be pricing.",
        ],
      },
      {
        title: "Risk framing for Bitcoin analysis",
        paragraphs: [
          "Bitcoin is liquid relative to many crypto assets, but it is still volatile. News, macro data, exchange conditions, leverage, regulatory developments, and liquidity shocks can all change the interpretation of a move. AI-generated BTC analysis should therefore be read with caution and compared against primary sources.",
          "CoinTrace AI does not provide financial advice or recommend Bitcoin positions. The product can support research by highlighting drivers and risks, but users remain responsible for their own decisions. That includes understanding time horizon, position size, drawdown tolerance, and the possibility that an explanation is wrong.",
        ],
      },
      {
        title: "A simple BTC research process",
        paragraphs: [
          "Start with the dashboard to understand whether the overall market is risk-on, risk-off, or mixed. Open the Bitcoin token page to review price context, chart behavior, and AI commentary. Check related news, then use Ask AI to ask targeted questions such as what might invalidate the current BTC thesis.",
          "This process turns Bitcoin AI analysis into a repeatable routine. Instead of relying on a single headline or social post, users can review several types of context and decide what deserves more investigation. CoinTrace AI is built to make that routine faster and more organized.",
        ],
      },
      {
        title: "What to compare when BTC leads the market",
        paragraphs: [
          "When Bitcoin is leading, users should compare BTC strength with Ethereum behavior, stablecoin flows, altcoin breadth, volatility, and recent news. A BTC-led move can mean broad confidence, but it can also mean defensive concentration where market participants prefer the most liquid crypto asset over higher-beta tokens.",
          "CoinTrace AI helps frame these comparisons by connecting Bitcoin analysis to the dashboard, narratives, and Ask AI. The product can summarize visible conditions, but the interpretation still belongs to the user. A disciplined BTC workflow asks what evidence supports the move, what evidence contradicts it, and what could change quickly.",
          "Bitcoin research also benefits from watching what does not move. If BTC rallies while many sectors lag, that may say something different than a rally with broad participation. CoinTrace AI gives users a path from BTC context into wider market intelligence so those differences are easier to investigate.",
          "The same process can be used during selloffs, when users need to separate broad risk reduction from Bitcoin-specific concerns.",
          "Either way, the output should be treated as a research prompt that needs evidence, not as a trade instruction.",
        ],
      },
    ],
    useCases: [
      "Review Bitcoin market context before researching altcoins.",
      "Ask whether BTC strength is broad market beta or asset-specific.",
      "Compare Bitcoin and Ethereum research paths.",
      "Identify visible BTC risks before forming an independent view.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/app/token/BTC",
        label: "BTC token page",
        description: "Open the live Bitcoin analysis page inside CoinTrace AI.",
      },
      {
        href: "/ethereum-ai-analysis",
        label: "Ethereum AI analysis",
        description: "Compare Bitcoin context with Ethereum research.",
      },
    ],
    faqs: [
      {
        question: "Does CoinTrace AI predict the Bitcoin price?",
        answer:
          "No. CoinTrace AI can organize market context and possible drivers, but it does not guarantee BTC price predictions or profitable outcomes.",
      },
      {
        question: "What should I compare with Bitcoin analysis?",
        answer:
          "Users often compare BTC with Ethereum, broad market sentiment, active narratives, news, liquidity conditions, and their own risk plan.",
      },
      {
        question: "Is Bitcoin AI analysis financial advice?",
        answer:
          "No. It is research support only. Users should verify information independently and consult qualified professionals when needed.",
      },
    ],
  },
  "ethereum-ai-analysis": {
    eyebrow: "Ethereum research",
    title: "Ethereum AI Analysis for ETH Market Drivers and Narratives",
    description:
      "Use CoinTrace AI to research Ethereum with AI-assisted token analysis, narrative context, news, market data, and risk notes.",
    path: "/ethereum-ai-analysis",
    primaryKeyword: "Ethereum AI analysis",
    sections: [
      {
        title: "Why Ethereum analysis is different",
        paragraphs: [
          "Ethereum is not only a crypto asset. It is also a settlement layer, application platform, staking ecosystem, and anchor for many DeFi, layer 2, restaking, NFT, and stablecoin narratives. Ethereum AI analysis in CoinTrace AI is designed to help users connect ETH market behavior with this wider context.",
          "An ETH move may reflect Bitcoin beta, network-specific news, layer 2 activity, staking expectations, developer sentiment, regulatory discussion, or broader risk appetite. CoinTrace AI does not claim to identify the one true cause. It helps organize plausible drivers and risks so users can research more efficiently.",
        ],
      },
      {
        title: "ETH research inside CoinTrace AI",
        paragraphs: [
          "Users can begin with the dashboard, open the Ethereum token page, review AI token analysis, inspect news, and compare ETH with active crypto narratives. This workflow is useful because Ethereum often sits between Bitcoin-driven market direction and sector-specific narratives.",
          "The Ask AI interface can support follow-up questions such as why ETH may be underperforming BTC, whether Ethereum-related tokens are confirming a narrative, or which risks could weaken an ETH thesis. The answers are research aids and should be verified before being used in any decision process.",
        ],
      },
      {
        title: "Ethereum and crypto narratives",
        paragraphs: [
          "Ethereum is closely tied to narratives around scaling, restaking, DeFi, stablecoins, modular infrastructure, and developer ecosystems. These themes can influence attention even when ETH itself is not the strongest performer. CoinTrace AI connects token analysis with narrative context so users can examine those relationships.",
          "For example, a layer 2 or restaking narrative may be active while ETH trades sideways. That does not automatically imply anything about future ETH performance, but it creates a research question. CoinTrace AI helps surface that question by keeping token pages and narrative pages connected.",
        ],
      },
      {
        title: "Risk-aware Ethereum interpretation",
        paragraphs: [
          "Ethereum research should include risks such as smart contract incidents, regulatory changes, liquidity shifts, staking concentration, competition from other chains, bridge risk, and macro market pressure. AI-generated analysis can miss or underweight these risks, so users should treat it as one input rather than a final answer.",
          "CoinTrace AI avoids guaranteed profit claims and does not provide personalized advice. ETH remains volatile, and even well-structured research can be wrong. Users should combine platform output with independent data, risk management, and a clear understanding of their own constraints.",
        ],
      },
      {
        title: "A practical ETH analysis workflow",
        paragraphs: [
          "A practical workflow starts by checking whether the overall market is being led by BTC, ETH, or a specific sector. Next, open the Ethereum token page for current context, read the AI analysis, inspect news, and compare with crypto narratives. Finally, ask targeted follow-up questions about drivers, risks, or missing evidence.",
          "This approach makes Ethereum AI analysis more useful than a single summary. It turns the page into a research hub where users can move between market data, news, narratives, and questions. That is the product experience CoinTrace AI is built to support.",
        ],
      },
      {
        title: "What to compare when researching ETH",
        paragraphs: [
          "Ethereum research often benefits from comparison. Users can compare ETH against BTC, layer 2 tokens, DeFi assets, staking-related tokens, and broader market breadth. If ETH is lagging while related ecosystems are active, that creates one research question. If ETH is leading while application tokens lag, that creates another.",
          "CoinTrace AI helps users move through those comparisons without presenting them as guaranteed conclusions. The product can organize market context and highlight possible drivers, but ETH remains exposed to liquidity, macro, regulatory, technical, and ecosystem-specific risks. Good research keeps those risks visible while evaluating the thesis.",
          "The same approach applies when Ethereum narratives are active but ETH price action is muted. That gap may reflect timing, liquidity, market preference, or weak transmission from ecosystem activity to the asset itself. CoinTrace AI helps users turn that gap into a specific research question.",
          "Users can then decide whether to investigate protocol metrics, news timing, related tokens, or broader market appetite before forming a view.",
          "This keeps Ethereum research focused on evidence and uncertainty instead of a single confident explanation or an unsupported current market narrative.",
        ],
      },
    ],
    useCases: [
      "Research ETH alongside Bitcoin and active crypto narratives.",
      "Ask why Ethereum may be leading or lagging the market.",
      "Review Ethereum-related risks before forming a thesis.",
      "Connect ETH token analysis with DeFi, scaling, and infrastructure themes.",
    ],
    internalLinks: [
      ...productLinks,
      {
        href: "/app/token/ETH",
        label: "ETH token page",
        description: "Open the live Ethereum analysis page inside CoinTrace AI.",
      },
      {
        href: "/crypto-narratives",
        label: "Crypto narratives",
        description: "Explore the themes that can affect Ethereum research.",
      },
    ],
    faqs: [
      {
        question: "Does CoinTrace AI give Ethereum price targets?",
        answer:
          "No. The product focuses on research context and explanations, not guaranteed ETH price targets or personalized recommendations.",
      },
      {
        question: "Why analyze Ethereum with narratives?",
        answer:
          "Ethereum is connected to many crypto themes, including DeFi, scaling, staking, and infrastructure. Narrative context can help users frame better research questions.",
      },
      {
        question: "Can Ethereum AI analysis replace my own research?",
        answer:
          "No. AI analysis can support your workflow, but users should verify important claims and consider their own risk tolerance and objectives.",
      },
    ],
  },
};

export const legalPages: Record<string, LegalPageContent> = {
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    description:
      "How CoinTrace AI thinks about personal information, analytics, cookies, and product data.",
    updatedAt: "April 25, 2026",
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "This Privacy Policy explains how CoinTrace AI may collect, use, and protect information when you visit the website or use the product. It is written for transparency and should be read together with the Terms and Risk Disclaimer.",
          "We aim to collect only information that is useful for operating, securing, and improving the service. CoinTrace AI is a research product and should not be used to submit secrets, private keys, seed phrases, or sensitive financial credentials.",
        ],
      },
      {
        title: "Information We May Collect",
        paragraphs: [
          "We may collect account information, contact details, product usage events, device and browser data, cookie preferences, support messages, and analytics data. If integrations are added, we may collect integration metadata needed to provide the requested feature.",
          "We do not ask users to provide wallet seed phrases or private keys. If you accidentally submit highly sensitive information into a prompt, form, or support message, contact us and rotate any affected credentials immediately.",
        ],
      },
      {
        title: "How We Use Information",
        paragraphs: [
          "Information may be used to provide the service, personalize product experiences, secure accounts, troubleshoot errors, analyze performance, communicate updates, and comply with legal obligations.",
          "We may use aggregated or de-identified data to improve product quality, understand feature usage, and evaluate system reliability. We do not use this policy to claim ownership of your independent research or trading decisions.",
        ],
      },
      {
        title: "Cookies and Analytics",
        paragraphs: [
          "CoinTrace AI may use cookies or similar technologies for essential site behavior, preferences, analytics, and product improvement. You can control cookies through your browser settings, though some features may not work as expected if cookies are disabled.",
          "Analytics help us understand which pages and workflows are useful. Where practical, we prefer privacy-conscious measurement and avoid collecting more information than is necessary for operating the product.",
        ],
      },
      {
        title: "Data Sharing and Retention",
        paragraphs: [
          "We may share information with vendors that help operate infrastructure, analytics, authentication, support, observability, or security. These vendors are expected to process information only for authorized purposes.",
          "We retain information for as long as reasonably necessary to operate the service, comply with law, resolve disputes, and enforce agreements. Retention periods may vary by data type and legal requirement.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "Terms of Service",
    description:
      "The rules for accessing and using CoinTrace AI's website, research content, and product workflows.",
    updatedAt: "April 25, 2026",
    sections: [
      {
        title: "Acceptance of Terms",
        paragraphs: [
          "By accessing CoinTrace AI, you agree to these Terms of Service. If you do not agree, you should not use the website or product. These terms may change as the product evolves.",
          "CoinTrace AI is provided as a crypto market intelligence and research tool. It does not provide financial, investment, legal, accounting, tax, or trading advice.",
        ],
      },
      {
        title: "Use of the Service",
        paragraphs: [
          "You agree to use the service lawfully and responsibly. You may not interfere with platform security, scrape the service in a disruptive way, attempt unauthorized access, or use the product to violate third-party rights.",
          "You are responsible for your account activity and for keeping credentials secure. Do not submit private keys, seed phrases, passwords, or sensitive financial credentials into CoinTrace AI.",
        ],
      },
      {
        title: "AI Output",
        paragraphs: [
          "AI-generated output may be incomplete, outdated, inaccurate, or unsuitable for your circumstances. You are responsible for evaluating output before relying on it.",
          "CoinTrace AI does not guarantee that any analysis, market brief, token explanation, narrative, or answer will be correct or profitable. You should verify important information through independent sources.",
        ],
      },
      {
        title: "Intellectual Property",
        paragraphs: [
          "The website, product design, brand, software, and documentation are owned by CoinTrace AI or its licensors. You may not copy, reverse engineer, or redistribute protected parts of the service except where allowed by law or written permission.",
          "You retain responsibility for content you submit. By submitting content to the service, you grant us permission to process it as needed to provide and improve the product.",
        ],
      },
      {
        title: "Limitation of Liability",
        paragraphs: [
          "To the maximum extent allowed by law, CoinTrace AI is provided on an as-is and as-available basis. We are not liable for trading losses, missed opportunities, data errors, service interruptions, or reliance on AI-generated output.",
          "Some jurisdictions do not allow certain limitations, so parts of this section may not apply to every user. Your rights may vary based on applicable law.",
        ],
      },
    ],
  },
  "risk-disclaimer": {
    eyebrow: "Risk",
    title: "Risk Disclaimer",
    description:
      "Important limitations for using CoinTrace AI as an AI-assisted crypto research product.",
    updatedAt: "April 25, 2026",
    sections: [
      {
        title: "No Financial Advice",
        paragraphs: [
          "CoinTrace AI provides market information, AI-generated summaries, token analysis, narrative context, and research tools. It does not provide financial advice, investment advice, legal advice, tax advice, or personalized trading recommendations.",
          "Nothing on the website or inside the product should be interpreted as an instruction to buy, sell, hold, short, leverage, stake, lend, borrow, or otherwise transact in any crypto asset.",
        ],
      },
      {
        title: "Crypto Market Risk",
        paragraphs: [
          "Crypto assets are highly volatile and may lose value quickly. Liquidity can disappear, exchanges can halt activity, protocols can fail, and market conditions can change without warning.",
          "Past performance does not guarantee future results. A market explanation that appears reasonable can still be wrong, incomplete, or irrelevant to future price action.",
        ],
      },
      {
        title: "AI and Data Limitations",
        paragraphs: [
          "AI-generated content can contain errors, omissions, outdated information, or unsupported reasoning. Market data and news feeds may be delayed, unavailable, inaccurate, or interpreted incorrectly.",
          "Users should independently verify important information and avoid relying on AI output as the sole basis for any decision. AI tools are best used to organize research, not to remove judgment.",
        ],
      },
      {
        title: "Your Responsibility",
        paragraphs: [
          "You are responsible for your own research, decisions, risk management, compliance obligations, and tax considerations. Consider consulting qualified professionals before making financial decisions.",
          "If you choose to trade or invest, you should understand position sizing, leverage risk, custody risk, smart contract risk, exchange risk, and the possibility of total loss.",
        ],
      },
      {
        title: "Educational Purpose",
        paragraphs: [
          "CoinTrace AI content is intended for educational and informational purposes. It may help users ask better questions about market behavior, but it cannot determine what is suitable for any individual.",
          "Use the product carefully, compare outputs with other sources, and do not treat any AI-generated analysis as guaranteed, complete, or risk-free.",
        ],
      },
    ],
  },
  about: {
    eyebrow: "About",
    title: "About CoinTrace AI",
    description:
      "CoinTrace AI is building an AI-powered crypto market intelligence workspace for clearer research, token analysis, narratives, and market briefings.",
    updatedAt: "April 25, 2026",
    sections: [
      {
        title: "Our Mission",
        paragraphs: [
          "CoinTrace AI exists to make crypto market research more structured, transparent, and useful. Crypto users often rely on scattered charts, news, social feeds, and general AI tools. We believe a dedicated intelligence workspace can make the research process clearer.",
          "The product focuses on market data, AI-generated briefings, token-level context, narrative detection, and question answering. The goal is to help users understand what is happening and what questions to ask next.",
        ],
      },
      {
        title: "What We Build",
        paragraphs: [
          "CoinTrace AI combines dashboard views, token pages, news context, market briefs, narrative analysis, and AI workflows. The system is designed around research support rather than guaranteed predictions.",
          "We build with a risk-aware approach. Every AI explanation should be treated as a starting point for verification, not a final answer or personalized financial recommendation.",
        ],
      },
      {
        title: "Who It Is For",
        paragraphs: [
          "CoinTrace AI is for analysts, researchers, founders, content teams, and active crypto users who want organized context. It can support daily market checks, token research, narrative monitoring, and internal discussions.",
          "The product is also useful for users learning how different parts of the crypto market connect. By linking market data, news, tokens, and narratives, CoinTrace AI makes the research path easier to follow.",
        ],
      },
      {
        title: "Trust and Responsibility",
        paragraphs: [
          "We do not present CoinTrace AI as a guaranteed trading system. Crypto markets are risky, and AI can be wrong. Our trust approach starts with clear disclaimers, careful product language, and visible limitations.",
          "Users should verify important information, read the Risk Disclaimer, and make independent decisions. The platform is built to improve research workflow, not to replace judgment.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "For product, partnership, or policy questions, contact the CoinTrace AI team through the official product channels as they become available. Avoid sending private keys, seed phrases, passwords, or sensitive account credentials.",
          "We welcome feedback that helps make AI-assisted crypto research more transparent, useful, and responsible.",
        ],
      },
    ],
  },
};
