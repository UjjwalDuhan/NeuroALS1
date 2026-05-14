import { KNOWLEDGE_BASE, KnowledgeChunk } from "./knowledgeBase";

/**
 * RAGService — Retrieval-Augmented Generation
 *
 * Current implementation: Keyword-based retrieval (BM25-style scoring).
 * Production upgrade path: Replace with vector embeddings + Pinecone/pgvector.
 *
 * Upgrade guide is documented at the bottom of this file.
 */
export class RAGService {
  private readonly TOP_K = 3;       // Max chunks to inject into prompt
  private readonly MIN_SCORE = 1;   // Minimum keyword match score to include a chunk

  /**
   * Given a user query, returns the most relevant knowledge chunks as a
   * formatted context string to inject into the Gemini prompt.
   */
  async retrieveContext(query: string): Promise<string> {
    const normalizedQuery = query.toLowerCase();
    const queryWords = this.tokenize(normalizedQuery);

    // Score each chunk
    const scored = KNOWLEDGE_BASE.map((chunk) => ({
      chunk,
      score: this.scoreChunk(queryWords, chunk),
    }));

    // Sort by score descending, take top K above threshold
    const relevant = scored
      .filter((item) => item.score >= this.MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.TOP_K)
      .map((item) => item.chunk);

    if (relevant.length === 0) return "";

    return this.formatContext(relevant);
  }

  // ── Keyword scoring ─────────────────────────────────────────────────────
  private scoreChunk(queryWords: string[], chunk: KnowledgeChunk): number {
    let score = 0;

    for (const word of queryWords) {
      // Check keywords list (high weight)
      if (chunk.keywords.some((kw) => kw.includes(word) || word.includes(kw))) {
        score += 3;
      }
      // Check title (medium weight)
      if (chunk.title.toLowerCase().includes(word)) {
        score += 2;
      }
      // Check content (low weight)
      if (chunk.content.toLowerCase().includes(word)) {
        score += 1;
      }
    }

    return score;
  }

  // ── Tokenizer ───────────────────────────────────────────────────────────
  private tokenize(text: string): string[] {
    return text
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .filter((w) => !STOP_WORDS.has(w));
  }

  // ── Format retrieved chunks for prompt injection ────────────────────────
  private formatContext(chunks: KnowledgeChunk[]): string {
    return chunks
      .map(
        (c) =>
          `### ${c.title}\nCategory: ${c.category}\n${c.content.trim()}`
      )
      .join("\n\n---\n\n");
  }
}

// ── Common English stop words ─────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
  "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
  "did", "its", "let", "put", "say", "she", "too", "use", "that", "this",
  "with", "have", "from", "they", "will", "what", "been", "were", "said",
  "each", "which", "their", "there", "when", "about", "would", "could",
  "than", "then", "them", "some", "into", "more", "also",
]);

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PRODUCTION UPGRADE: Vector Embeddings + Semantic Search
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Replace the scoreChunk/keyword approach with:
 *
 * 1. EMBEDDING GENERATION (once, at startup or via script):
 *    - Use Google's text-embedding-004 or OpenAI text-embedding-3-small
 *    - Embed each knowledge chunk's content into a vector
 *    - Store vectors in a vector database
 *
 * 2. VECTOR DATABASE OPTIONS:
 *    - Pinecone (managed, easiest to integrate)
 *    - pgvector extension on PostgreSQL (fits your existing PostgreSQL DB)
 *    - Weaviate (open-source, self-hosted)
 *    - ChromaDB (lightweight, local)
 *
 * 3. RETRIEVAL:
 *    - Embed the user query with the same model
 *    - Run cosine similarity search against stored vectors
 *    - Return top-k most similar chunks
 *
 * Example with Google Generative AI embeddings + pgvector:
 *
 *    const queryEmbedding = await genAI
 *      .getGenerativeModel({ model: "text-embedding-004" })
 *      .embedContent(query);
 *
 *    const rows = await pool.query(
 *      `SELECT content, 1 - (embedding <=> $1::vector) AS score
 *       FROM knowledge_chunks
 *       ORDER BY score DESC LIMIT $2`,
 *      [queryEmbedding.embedding.values, TOP_K]
 *    );
 *
 * 4. ADD YOUR OWN DOCUMENTS:
 *    - Drop PDF/text files into a /docs folder
 *    - Run an ingestion script to chunk + embed them
 *    - They become instantly queryable by the chatbot
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
