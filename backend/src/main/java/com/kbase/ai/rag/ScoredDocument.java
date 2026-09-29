package com.kbase.ai.rag;

import com.kbase.model.Document;

public record ScoredDocument(Document doc, double score, String snippet) {}
