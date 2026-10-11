---
name: node-rag-patterns
description: Use when designing or changing retrieval-augmented generation (RAG) pipelines in a Node.js backend: chunking, embedding, retrieval, reranking, citation.
---

# Node RAG Patterns

## Purpose

RAG pipelines bridge LLMs to private or current knowledge. Each stage (chunking, embedding, retrieval, reranking, citation, hallucination guard) is a contract that bounds correctness, latency, and cost.

## Activate when

- Adding or changing a RAG pipeline: vector store, embedding model, retrieval, reranking, citation.
- Diagnosing low retrieval precision, hallucinated citations, or stale context.
- Choosing between vector stores (Pinecone, Qdrant, pgvector, Weaviate, Chroma).
- Choosing between embedding models (OpenAI text-embedding-3, Cohere, Voyage, mixedbread, open-source via Ollama).

## Repository inspection

1. Vector store — grep for `@pinecone-database/pgvector`, `@qdrant/js`, `pgvector`, `weaviate-client`, `chromadb`. Read the version.
2. Embedding client — grep for `embed`, `embedMany`, `OpenAIEmbeddings`, `CohereEmbeddings`. Find the model name.
3. Chunking — grep for `chunk`, `split`, `RecursiveCharacterTextSplitter`, `TokenTextSplitter`. Find the chunk size and overlap.
4. Retrieval — grep for `similaritySearch`, `query`, `retrieve`. Find the top-k and the similarity metric.
5. Reranking — grep for `rerank`, `cohere.rerank`, `cross-encoder`. Find the reranker and the top-n.
6. Citation — grep for `citation`, `source`, `metadata.source`. Find how sources are surfaced to the LLM and the user.
7. Hallucination guard — grep for `verify`, `hallucination`, `faithfulness`. Find the post-generation check.

## Decision rules

| Concern | Rule |
|---|---|
| Chunking | 200-500 tokens per chunk, 10-20% overlap. Bound the chunk size to the embedding model's context window. |
| Embedding query | Embed the query (not the prompt). Same embedding model for query and corpus. |
| Top-k | Retrieve 10-20 candidates. Rerank to top-n (3-5) for the LLM context. |
| Similarity metric | Cosine for normalized embeddings. Dot product for unnormalized. Document the choice. |
| Reranking | Use a cross-encoder (Cohere Rerank, mixedbread) for the top-10 → top-3 step. |
| Citation | Every fact in the answer must trace to a retrieved source. Surface `[1]`, `[2]` inline. |
| Hallucination guard | Post-generation check: ask the LLM (or a different model) to verify each claim against the retrieved context. Reject if unverified. |
| Staleness | Re-embed when the source document changes. Use document version + embedding version as the cache key. |
| Multi-modal | Separate embedding for text and image (e.g., CLIP). Join at retrieval. |
| Privacy | Sensitive documents: run embeddings on-prem (Ollama, vLLM) or in a private region. Do not send raw text to a public embedding API. |
| Cost | Embedding is cheap; reranking is cheap; LLM call is the cost. Bound the top-n to bound the LLM context. |
| Latency | Embedding query (50ms) + retrieval (50ms) + reranking (200ms) + LLM (1-5s). Total p99 ≤ 6s. |
| Evaluation | Use ragas or RAGAS-style metrics: faithfulness, answer relevance, context precision, context recall. |

## Implementation procedure

1. State the RAG use case: knowledge-base QA, document chat, codebase Q&A.
2. Pick the vector store: pgvector for small/medium, Pinecone/Qdrant for scale.
3. Pick the embedding model: OpenAI text-embedding-3-small (cheap, good), Voyage (best), or on-prem for privacy.
4. Define the chunking strategy: size, overlap, separator hierarchy. Document.
5. Implement the retrieval: embed query → vector search top-k → rerank top-n.
6. Implement citation: pass top-n with `[1]`, `[2]` indices; prompt the LLM to cite inline.
7. Implement hallucination guard: post-generation LLM verification against the retrieved context.
8. Add evaluation: ragas metrics on a golden test set.

## Failure modes

- Chunk too small (50 tokens) → context fragmentation, retrieval precision drops.
- Chunk too large (2000 tokens) → context dilution, retrieval precision drops.
- Embed the prompt, not the query → embedding mismatch, retrieval misses.
- No reranking → top-k by vector similarity may be off-topic; LLM context confused.
- No citation → user cannot verify the answer; trust deficit.
- No hallucination guard → user acts on fabricated facts.
- Stale embeddings → document updated, embedding not refreshed, retrieval returns old version.
- Public embedding API for sensitive docs → privacy leak.
- Top-n too large → LLM context overflow, cost explosion.
- Same embedding model for query and corpus but different versions → embedding mismatch.

## Verification

- Run the RAG pipeline on a golden test set; measure faithfulness, answer relevance, context precision, context recall (ragas).
- Test retrieval: feed a known fact; confirm the source is retrieved in top-k.
- Test reranking: confirm the top-n is more relevant than the raw top-k.
- Test citation: confirm every fact in the answer traces to a retrieved source.
- Test hallucination guard: inject a fabricated claim; confirm rejection.
- Test staleness: update a source; re-embed; confirm retrieval returns the new version.
- Test latency: p99 ≤ 6s end-to-end.
- Source references: https://docs.pinecone.io/, https://qdrant.tech/documentation/, https://github.com/pgvector/pgvector, https://weaviate.io/developers/weaviate, https://docs.trychroma.com/, https://platform.openai.com/docs/guides/embeddings, https://docs.cohere.com/docs/reranking, https://docs.ragas.io/.
