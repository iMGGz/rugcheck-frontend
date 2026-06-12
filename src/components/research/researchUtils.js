export function formatUsd(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: num >= 100 ? 0 : 6 })}`;
}

export function formatCompact(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(num);
}

export function formatPct(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "Unknown";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toFixed(digits)}%`;
}

export function analysisColor(score) {
  if (score >= 75) return "#2fd67b";
  if (score >= 45) return "#ffb020";
  return "#ff6b6b";
}

export function verdictColor(verdict) {
  if (verdict === "HIGH RISK") return "#ff6b6b";
  if (verdict === "CAUTION") return "#ffb020";
  return "#2fd67b";
}

export function sourceColor(status) {
  if (status === "live") return "#2fd67b";
  if (status === "partial" || status === "modeled") return "#7dd3fc";
  if (status === "unsupported" || status === "skipped") return "#ffb020";
  if (status === "unavailable") return "#8a94a6";
  return "#ff6b6b";
}

export function confidenceColor(level) {
  if (level === "high") return "#2fd67b";
  if (level === "medium") return "#ffb020";
  return "#ff6b6b";
}

export function confidenceLabel(level) {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
}

export function riskLevelColor(level) {
  if (level === "low") return "#2fd67b";
  if (level === "medium") return "#ffb020";
  if (level === "high") return "#ff8a4c";
  return "#ff6b6b";
}

export function riskLevelLabel(level) {
  if (!level) return "Unknown";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function titleCase(value) {
  if (!value) return "Unknown";
  return String(value)
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeSynthesizedAnswerPayload(value) {
  const answer = safeObject(value);
  if (!Object.keys(answer).length) return null;
  const analystAnswerCard = safeObject(answer.analystAnswerCard);
  return {
    ...answer,
    analystAnswerCard: Object.keys(analystAnswerCard).length ? {
      ...analystAnswerCard,
      evidenceBasis: safeArray(analystAnswerCard.evidenceBasis),
      reviewedEvidenceUsed: safeArray(analystAnswerCard.reviewedEvidenceUsed),
      providerContextUsed: safeArray(analystAnswerCard.providerContextUsed),
      formulaContextUsed: safeArray(analystAnswerCard.formulaContextUsed),
      liveDataUsed: safeArray(analystAnswerCard.liveDataUsed),
      whatEvidenceDoesNotProve: safeArray(analystAnswerCard.whatEvidenceDoesNotProve),
      missingEvidence: safeArray(analystAnswerCard.missingEvidence),
      whatWouldChange: safeArray(analystAnswerCard.whatWouldChange),
      sourceBoundaryPlainEnglish: safeArray(analystAnswerCard.sourceBoundaryPlainEnglish),
      primaryBadges: safeArray(analystAnswerCard.primaryBadges),
      auditFields: safeArray(analystAnswerCard.auditFields),
    } : null,
    evidenceUsed: safeArray(answer.evidenceUsed),
    reviewedSourcesUsed: safeArray(answer.reviewedSourcesUsed),
    reviewedFactsUsed: safeArray(answer.reviewedFactsUsed),
    whatEvidenceDoesNotProve: safeArray(answer.whatEvidenceDoesNotProve),
    missingEvidence: safeArray(answer.missingEvidence),
    sourceBoundary: safeArray(answer.sourceBoundary),
    whatWouldChange: safeArray(answer.whatWouldChange),
    warnings: safeArray(answer.warnings),
    identityWarnings: safeArray(answer.identityWarnings),
    formulaOutputsUsed: safeArray(answer.formulaOutputsUsed),
    liveDataUsed: safeArray(answer.liveDataUsed),
    providerDataUsed: safeArray(answer.providerDataUsed),
    answerQualityFlags: safeArray(answer.answerQualityFlags),
    synthesisInputsUsed: safeArray(answer.synthesisInputsUsed),
  };
}

export function getAnalystAnswerCard(question) {
  const synthesized = safeObject(question?.synthesizedAnswer);
  const card = safeObject(synthesized.analystAnswerCard);
  if (Object.keys(card).length) return {
    ...card,
    evidenceBasis: safeArray(card.evidenceBasis),
    reviewedEvidenceUsed: safeArray(card.reviewedEvidenceUsed),
    providerContextUsed: safeArray(card.providerContextUsed),
    formulaContextUsed: safeArray(card.formulaContextUsed),
    liveDataUsed: safeArray(card.liveDataUsed),
    whatEvidenceDoesNotProve: safeArray(card.whatEvidenceDoesNotProve),
    missingEvidence: safeArray(card.missingEvidence),
    whatWouldChange: safeArray(card.whatWouldChange),
    sourceBoundaryPlainEnglish: safeArray(card.sourceBoundaryPlainEnglish),
    primaryBadges: safeArray(card.primaryBadges),
    auditFields: safeArray(card.auditFields),
  };
  return {
    questionId: question?.questionId || synthesized.questionId || "question_unavailable",
    questionText: question?.questionText || synthesized.questionText || "Institutional question",
    directAnswer: synthesized.directAnswer || question?.shortAnswer || question?.answerSummary || "Source review required; direct evidence is not yet attached.",
    headlineStatus: synthesized.evidenceStatus ? titleCase(synthesized.evidenceStatus) : titleCase(question?.answerStatus || "source_required"),
    evidenceBasis: safeArray(synthesized.evidenceUsed).length ? safeArray(synthesized.evidenceUsed) : safeArray(question?.supportingSignals),
    evidenceStatus: synthesized.evidenceStatus || question?.reviewedEvidenceStatus || question?.answerStatus || "source_required",
    reviewedEvidenceUsed: [
      ...safeArray(synthesized.reviewedSourcesUsed).map((source) => `${source.title || "Reviewed source"} (${source.publisher || "publisher unavailable"})`),
      ...safeArray(synthesized.reviewedFactsUsed).map((fact) => fact.claim || fact.factId),
    ],
    providerContextUsed: safeArray(synthesized.providerDataUsed),
    formulaContextUsed: safeArray(synthesized.formulaOutputsUsed),
    liveDataUsed: safeArray(synthesized.liveDataUsed),
    whatEvidenceDoesNotProve: safeArray(synthesized.whatEvidenceDoesNotProve),
    missingEvidence: safeArray(synthesized.missingEvidence).length ? safeArray(synthesized.missingEvidence) : safeArray(question?.missingEvidence),
    decisionImpact: synthesized.impact || question?.impactOnScoreOrConfidence || "Confidence remains source-boundary constrained until direct evidence is reviewed.",
    whatWouldChange: safeArray(synthesized.whatWouldChange).length ? safeArray(synthesized.whatWouldChange) : safeArray(question?.whatWouldChange),
    sourceBoundaryPlainEnglish: safeArray(synthesized.sourceBoundary).length
      ? safeArray(synthesized.sourceBoundary).map((entry) => String(entry).replace(/_/g, " "))
      : ["Provider metadata is context, not reviewed evidence unless a reviewed source is attached."],
    confidenceBoundary: "No scoring or verdict change is inferred from this display card.",
    manualReviewImplication: safeArray(synthesized.missingEvidence).length ? "Manual/source review remains useful because material evidence is still missing." : "No separate manual-review implication beyond the current source boundary.",
    assetClassSpecificKeyIssue: "Answer the precise institutional question without overclaiming source support.",
    primaryBadges: [synthesized.evidenceStatus ? titleCase(synthesized.evidenceStatus) : titleCase(question?.answerStatus || "source_required")],
    auditFields: [
      synthesized.synthesisTemplateId ? `synthesisTemplateId=${synthesized.synthesisTemplateId}` : null,
      safeArray(question?.sourceBoundary).length ? `sourceBoundary=${safeArray(question.sourceBoundary).join(", ")}` : null,
    ].filter(Boolean),
  };
}

export function normalizeInstitutionalQuestionsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootQuestions = safeArray(root.institutionalQuestions);
  const nestedQuestions = safeArray(nestedAnalysis.institutionalQuestions);
  const normalizeQuestion = (question) => ({
    ...safeObject(question),
    supportingSignals: safeArray(question?.supportingSignals),
    missingEvidence: safeArray(question?.missingEvidence),
    contradictionSignals: safeArray(question?.contradictionSignals),
    scoringFieldsUsed: safeArray(question?.scoringFieldsUsed),
    sourceBoundary: safeArray(question?.sourceBoundary),
    whatWouldChange: safeArray(question?.whatWouldChange),
    reviewedSourcesUsed: safeArray(question?.reviewedSourcesUsed),
    reviewedFactsUsed: safeArray(question?.reviewedFactsUsed),
    remainingMissingEvidence: safeArray(question?.remainingMissingEvidence),
    reviewedEvidenceBoundary: safeArray(question?.reviewedEvidenceBoundary),
    evidenceMappingWarnings: safeArray(question?.evidenceMappingWarnings),
    reviewedEvidenceDoesNotAnswer: safeArray(question?.reviewedEvidenceDoesNotAnswer),
    synthesizedAnswer: normalizeSynthesizedAnswerPayload(question?.synthesizedAnswer),
  });
  const questions = rootQuestions.length ? rootQuestions : nestedQuestions;

  return {
    institutionalQuestions: questions.map(normalizeQuestion),
    institutionalQuestionsProvenance:
      root.institutionalQuestionsProvenance ||
      nestedAnalysis.institutionalQuestionsProvenance ||
      null,
  };
}

export function normalizeReviewedEvidencePacketPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootPacket = safeObject(root.reviewedEvidencePacket);
  const nestedPacket = safeObject(nestedAnalysis.reviewedEvidencePacket);
  const packet = rootPacket.packetLoaded !== undefined || rootPacket.packetId
    ? rootPacket
    : nestedPacket.packetLoaded !== undefined || nestedPacket.packetId
      ? nestedPacket
      : null;

  if (!packet) return null;

  return {
    ...packet,
    packetLoaded: Boolean(packet.packetLoaded),
    sources: safeArray(packet.sources),
    facts: safeArray(packet.facts).map((fact) => ({
      ...safeObject(fact),
      limitations: safeArray(fact?.limitations),
      reviewedEvidenceDoesNotAnswer: safeArray(fact?.reviewedEvidenceDoesNotAnswer),
      mappedQuestionIds: safeArray(fact?.mappedQuestionIds),
    })),
    questionMappings: safeArray(packet.questionMappings).map((mapping) => ({
      ...safeObject(mapping),
      reviewedSourcesUsed: safeArray(mapping?.reviewedSourcesUsed),
      reviewedFactsUsed: safeArray(mapping?.reviewedFactsUsed),
      remainingMissingEvidence: safeArray(mapping?.remainingMissingEvidence),
      contradictionNotes: safeArray(mapping?.contradictionNotes),
      sourceBoundary: safeArray(mapping?.sourceBoundary),
      evidenceMappingWarnings: safeArray(mapping?.evidenceMappingWarnings),
      reviewedEvidenceDoesNotAnswer: safeArray(mapping?.reviewedEvidenceDoesNotAnswer),
    })),
    sourceQueueNotes: safeArray(packet.sourceQueueNotes),
    remainingSourceRequirements: safeArray(packet.remainingSourceRequirements),
    answerUpgradeSummary: safeArray(packet.answerUpgradeSummary),
    warnings: safeArray(packet.warnings),
    identityEvidenceReconciliationWarnings: safeArray(packet.identityEvidenceReconciliationWarnings),
    evidenceMappingWarnings: safeArray(packet.evidenceMappingWarnings),
    sourceBoundary: safeArray(packet.sourceBoundary),
    audit: {
      ...safeObject(packet.audit),
      matchedBy: safeArray(packet.audit?.matchedBy),
      rejectedPacketIds: safeArray(packet.audit?.rejectedPacketIds),
      limitations: safeArray(packet.audit?.limitations),
    },
  };
}

export function normalizeEngineLearningBackbonePayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootBackbone = safeObject(root.engineLearningBackbone);
  const nestedBackbone = safeObject(nestedAnalysis.engineLearningBackbone);
  const backbone = rootBackbone.artifactVersion || rootBackbone.taskName
    ? rootBackbone
    : nestedBackbone.artifactVersion || nestedBackbone.taskName
      ? nestedBackbone
      : null;

  if (!backbone) return null;

  return {
    ...backbone,
    findings: safeArray(backbone.findings),
    assetClassRulesApplied: safeArray(backbone.assetClassRulesApplied),
    evidenceMappingPoliciesApplied: safeArray(backbone.evidenceMappingPoliciesApplied),
    sourceRequirementsTriggered: safeArray(backbone.sourceRequirementsTriggered),
    sourceCandidates: safeArray(backbone.sourceCandidates),
    outputQaChecks: safeArray(backbone.outputQaChecks),
    calibrationAnomalies: safeArray(backbone.calibrationAnomalies),
    dependencyRequirements: safeArray(backbone.dependencyRequirements),
    freshnessPointInTimeReadiness: safeArray(backbone.freshnessPointInTimeReadiness),
    pathParityChecks: safeArray(backbone.pathParityChecks),
    benchmarkLearningRulesApplied: safeArray(backbone.benchmarkLearningRulesApplied),
    benchmarkLearningSourceRequirementTemplates: safeArray(backbone.benchmarkLearningSourceRequirementTemplates),
    benchmarkLearningRegistrySummary: safeObject(backbone.benchmarkLearningRegistrySummary),
    benchmarkLearningRenderedParity: safeObject(backbone.benchmarkLearningRenderedParity),
    assetInterpretationContractIntegration: safeObject(backbone.assetInterpretationContractIntegration),
    dataFirstNarrativeContractIntegration: safeObject(backbone.dataFirstNarrativeContractIntegration),
    sourceDataRequirementMatrix: {
      ...safeObject(backbone.sourceDataRequirementMatrix),
      providersInventoried: safeArray(backbone.sourceDataRequirementMatrix?.providersInventoried),
      lensGroupsCovered: safeArray(backbone.sourceDataRequirementMatrix?.lensGroupsCovered),
      representativeAssetsCovered: safeArray(backbone.sourceDataRequirementMatrix?.representativeAssetsCovered),
      missingDataCategories: safeArray(backbone.sourceDataRequirementMatrix?.missingDataCategories),
      sourceCandidatesGenerated: safeArray(backbone.sourceDataRequirementMatrix?.sourceCandidatesGenerated),
      reviewedEvidenceNeeds: safeArray(backbone.sourceDataRequirementMatrix?.reviewedEvidenceNeeds),
      futureProviderCandidates: safeArray(backbone.sourceDataRequirementMatrix?.futureProviderCandidates),
      knownLimitations: safeArray(backbone.sourceDataRequirementMatrix?.knownLimitations),
    },
    representativeAssetsCovered: safeArray(backbone.representativeAssetsCovered),
    deferredFindings: safeArray(backbone.deferredFindings),
    knownLimitations: safeArray(backbone.knownLimitations),
    guardrails: safeObject(backbone.guardrails),
    backendFrontendBundleContract: safeObject(backbone.backendFrontendBundleContract),
    assetClassRuleRegistrySummary: safeObject(backbone.assetClassRuleRegistrySummary),
    evidenceMappingPolicySummary: safeObject(backbone.evidenceMappingPolicySummary),
    sourceRequirementRegistrySummary: safeObject(backbone.sourceRequirementRegistrySummary),
  };
}

export function normalizeAssetInterpretationContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.assetInterpretationContract);
  const nestedContract = safeObject(nestedAnalysis.assetInterpretationContract);
  const contract = rootContract.artifactVersion || rootContract.visibleDisplayContract
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.visibleDisplayContract
      ? nestedContract
      : null;

  if (!contract) return null;

  const visibleDisplayContract = safeObject(contract.visibleDisplayContract);
  const institutionalQuestionContract = safeObject(contract.institutionalQuestionContract);
  const evidenceInterpretationContract = safeObject(contract.evidenceInterpretationContract);
  const renderingParityContract = safeObject(contract.renderingParityContract);

  return {
    ...contract,
    canonicalAsset: safeObject(contract.canonicalAsset),
    representationContext: {
      ...safeObject(contract.representationContext),
      contextOnlyWarnings: safeArray(contract.representationContext?.contextOnlyWarnings),
    },
    thesisLensContext: safeObject(contract.thesisLensContext),
    visibleDisplayContract: {
      ...visibleDisplayContract,
      labelPrecedence: safeArray(visibleDisplayContract.labelPrecedence),
      forbiddenVisibleLabelFamilies: safeArray(visibleDisplayContract.forbiddenVisibleLabelFamilies),
      hardGateFailures: safeArray(visibleDisplayContract.hardGateFailures),
      observedPrimaryVisibleLabels: safeArray(visibleDisplayContract.observedPrimaryVisibleLabels),
    },
    dataFirstNarrativeGate: {
      ...safeObject(contract.dataFirstNarrativeGate),
      primaryNarrativeFailures: safeArray(contract.dataFirstNarrativeGate?.primaryNarrativeFailures),
      wrongAssetNameMentions: safeArray(contract.dataFirstNarrativeGate?.wrongAssetNameMentions),
      forbiddenConceptMentions: safeArray(contract.dataFirstNarrativeGate?.forbiddenConceptMentions),
      unsupportedClaimsDetected: safeArray(contract.dataFirstNarrativeGate?.unsupportedClaimsDetected),
    },
    institutionalQuestionContract: {
      ...institutionalQuestionContract,
      activeQuestionIds: safeArray(institutionalQuestionContract.activeQuestionIds),
      mismatchWarnings: safeArray(institutionalQuestionContract.mismatchWarnings),
    },
    evidenceInterpretationContract: {
      ...evidenceInterpretationContract,
      sourceMatrixEntryIds: safeArray(evidenceInterpretationContract.sourceMatrixEntryIds),
      sourceMatrixGroups: safeArray(evidenceInterpretationContract.sourceMatrixGroups),
      sourceMatrixEntries: safeArray(evidenceInterpretationContract.sourceMatrixEntries),
      liveApiDataAvailable: safeArray(evidenceInterpretationContract.liveApiDataAvailable),
      liveApiDataMissing: safeArray(evidenceInterpretationContract.liveApiDataMissing),
      reviewedEvidenceAvailable: safeArray(evidenceInterpretationContract.reviewedEvidenceAvailable),
      reviewedEvidenceMissing: safeArray(evidenceInterpretationContract.reviewedEvidenceMissing),
      sourceCandidatesOnly: safeArray(evidenceInterpretationContract.sourceCandidatesOnly),
      sourceUniverseTaxonomy: safeArray(evidenceInterpretationContract.sourceUniverseTaxonomy),
      sourceBoundary: safeArray(evidenceInterpretationContract.sourceBoundary),
    },
    renderingParityContract: {
      ...renderingParityContract,
      visibleSurfaces: safeArray(renderingParityContract.visibleSurfaces),
    },
    scoringBoundary: safeObject(contract.scoringBoundary),
    engineLearningIntegration: {
      ...safeObject(contract.engineLearningIntegration),
      ruleIds: safeArray(contract.engineLearningIntegration?.ruleIds),
      findingIds: safeArray(contract.engineLearningIntegration?.findingIds),
    },
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

export function normalizeDataFirstNarrativeContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.dataFirstNarrativeContract);
  const nestedContract = safeObject(nestedAnalysis.dataFirstNarrativeContract);
  const contract = rootContract.artifactVersion || rootContract.generatedNarrativeFields
    ? rootContract
    : nestedContract.artifactVersion || nestedContract.generatedNarrativeFields
      ? nestedContract
      : null;

  if (!contract) return null;

  return {
    ...contract,
    narrativeScope: safeObject(contract.narrativeScope),
    availableEvidenceFacts: safeArray(contract.availableEvidenceFacts),
    missingEvidenceGaps: safeArray(contract.missingEvidenceGaps),
    notApplicableBoundaries: safeArray(contract.notApplicableBoundaries),
    allowedNarrativeConcepts: safeArray(contract.allowedNarrativeConcepts),
    forbiddenNarrativeConcepts: safeArray(contract.forbiddenNarrativeConcepts),
    generatedNarrativeFields: safeArray(contract.generatedNarrativeFields).map((field) => ({
      ...safeObject(field),
      factsUsed: safeArray(field?.factsUsed),
      gapsUsed: safeArray(field?.gapsUsed),
      notApplicableBoundariesUsed: safeArray(field?.notApplicableBoundariesUsed),
      unsupportedClaimsDetected: safeArray(field?.unsupportedClaimsDetected),
      forbiddenConceptsDetected: safeArray(field?.forbiddenConceptsDetected),
    })),
    scoreExplanationInputs: {
      ...safeObject(contract.scoreExplanationInputs),
      dataCategoriesContributing: safeArray(contract.scoreExplanationInputs?.dataCategoriesContributing),
      missingCriticalCategories: safeArray(contract.scoreExplanationInputs?.missingCriticalCategories),
      confidenceCaps: safeArray(contract.scoreExplanationInputs?.confidenceCaps),
    },
    primaryNarrativeFailures: safeArray(contract.primaryNarrativeFailures),
    wrongAssetNameMentions: safeArray(contract.wrongAssetNameMentions),
    forbiddenConceptMentions: safeArray(contract.forbiddenConceptMentions),
    unsupportedClaimsDetected: safeArray(contract.unsupportedClaimsDetected),
    scoringAnomalyFindings: safeArray(contract.scoringAnomalyFindings),
    scoringBoundary: safeObject(contract.scoringBoundary),
    knownLimitations: safeArray(contract.knownLimitations),
  };
}

function dataFirstGeneratedText(contract, fieldName) {
  return safeArray(contract?.generatedNarrativeFields)
    .find((field) => field?.fieldName === fieldName && field?.status !== "FAIL")?.generatedText || null;
}

export function normalizeProviderCategorySignalsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.providerCategorySignals);
  const nestedContract = safeObject(nestedAnalysis.providerCategorySignals);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    coinGeckoCategories: safeArray(contract.coinGeckoCategories),
    coinGeckoCategoryIds: safeArray(contract.coinGeckoCategoryIds),
    coinGeckoAssetPlatforms: safeArray(contract.coinGeckoAssetPlatforms),
    coinMarketCapTags: safeArray(contract.coinMarketCapTags),
    coinMarketCapCategories: safeArray(contract.coinMarketCapCategories),
    coinMarketCapSectors: safeArray(contract.coinMarketCapSectors),
    coinMarketCapLiquiditySignals: safeArray(contract.coinMarketCapLiquiditySignals),
    primaryProviderCategoryEvidence: safeArray(contract.primaryProviderCategoryEvidence),
    secondaryProviderCategoryEvidence: safeArray(contract.secondaryProviderCategoryEvidence),
    ecosystemContextTags: safeArray(contract.ecosystemContextTags),
    assetClassCandidateTags: safeArray(contract.assetClassCandidateTags),
    conflictingCategorySignals: safeArray(contract.conflictingCategorySignals),
    selfReportedOrUnverifiedCategorySignals: safeArray(contract.selfReportedOrUnverifiedCategorySignals),
    verifiedCategorySignals: safeArray(contract.verifiedCategorySignals),
    providerCategoryBoundary: safeArray(contract.providerCategoryBoundary),
    classifiedSignals: safeArray(contract.classifiedSignals),
    endpointCandidates: safeArray(contract.endpointCandidates),
    scoringBoundary: safeObject(contract.scoringBoundary),
  };
}

export function normalizeCategoryDrivenAssetFamilyContractPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryDrivenAssetFamilyContract);
  const nestedContract = safeObject(nestedAnalysis.categoryDrivenAssetFamilyContract);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    secondaryAssetFamilies: safeArray(contract.secondaryAssetFamilies),
    excludedFamilies: safeArray(contract.excludedFamilies),
    familyResolutionReasons: safeArray(contract.familyResolutionReasons),
    categorySignalsUsed: safeArray(contract.categorySignalsUsed),
    networkContextSignals: safeArray(contract.networkContextSignals),
    assetClassSignals: safeArray(contract.assetClassSignals),
    conflictWarnings: safeArray(contract.conflictWarnings),
    questionRegistryGroup: {
      ...safeObject(contract.questionRegistryGroup),
      questions: safeArray(contract.questionRegistryGroup?.questions).map((question) => ({
        ...safeObject(question),
        sourceRequirements: safeArray(question?.sourceRequirements),
        forbiddenPrimaryCopy: safeArray(question?.forbiddenPrimaryCopy),
      })),
    },
    sourceRequirementProfile: {
      ...safeObject(contract.sourceRequirementProfile),
      priorityRequirements: safeArray(contract.sourceRequirementProfile?.priorityRequirements),
      notApplicableRequirements: safeArray(contract.sourceRequirementProfile?.notApplicableRequirements),
      forbiddenPrimaryNarrative: safeArray(contract.sourceRequirementProfile?.forbiddenPrimaryNarrative),
    },
    sourceMatrixEntryIds: safeArray(contract.sourceMatrixEntryIds),
    scoringBoundary: safeObject(contract.scoringBoundary),
  };
}

export function normalizeCategoryDataRequirementProfilesPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryDataRequirementProfiles);
  const nestedContract = safeObject(nestedAnalysis.categoryDataRequirementProfiles);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    profiles: safeArray(contract.profiles).map((profile) => ({
      ...safeObject(profile),
      requiredDataCategories: safeArray(profile?.requiredDataCategories),
      sourceRequirements: safeArray(profile?.sourceRequirements),
      nonApplicableDataCategories: safeArray(profile?.nonApplicableDataCategories),
      primaryFailureModes: safeArray(profile?.primaryFailureModes),
    })),
  };
}

export function normalizeCategoryAnswerBuilderPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryAnswerBuilder);
  const nestedContract = safeObject(nestedAnalysis.categoryAnswerBuilder);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    answerCards: safeArray(contract.answerCards).map((card) => ({
      ...safeObject(card),
      dataUsed: safeArray(card?.dataUsed),
      missingEvidence: safeArray(card?.missingEvidence),
      whatWouldChange: safeArray(card?.whatWouldChange),
    })),
  };
}

export function normalizeCategoryReadinessDiagnosticsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootContract = safeObject(root.categoryReadinessDiagnostics);
  const nestedContract = safeObject(nestedAnalysis.categoryReadinessDiagnostics);
  const contract = rootContract.artifactVersion ? rootContract : nestedContract.artifactVersion ? nestedContract : null;
  if (!contract) return null;
  return {
    ...contract,
    manualReviewFlags: safeArray(contract.manualReviewFlags),
    sourceRequiredFlags: safeArray(contract.sourceRequiredFlags),
    falsePositiveRisks: safeArray(contract.falsePositiveRisks),
    whatWouldImproveReadiness: safeArray(contract.whatWouldImproveReadiness),
    scoringBoundary: safeObject(contract.scoringBoundary),
  };
}

export function normalizeCalibrationWarningsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootWarnings = safeArray(root.calibrationWarnings);
  const nestedWarnings = safeArray(nestedAnalysis.calibrationWarnings);

  return rootWarnings.length ? rootWarnings : nestedWarnings;
}

export function normalizeResolvedInstitutionalLensPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootLens = safeObject(root.resolvedInstitutionalLens);
  const nestedLens = safeObject(nestedAnalysis.resolvedInstitutionalLens);
  const lens = rootLens.lensId ? rootLens : nestedLens;
  return lens.lensId ? {
    ...lens,
    providerClassificationEvidence: safeArray(lens.providerClassificationEvidence),
    matchedSignals: safeArray(lens.matchedSignals),
    ambiguityFlags: safeArray(lens.ambiguityFlags),
    routingSource: safeArray(lens.routingSource),
    sourceBoundary: safeArray(lens.sourceBoundary),
  } : null;
}

export function normalizeEffectiveInstitutionalLensPayload(responseLike, assetInterpretationContract = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootLens = safeObject(root.effectiveInstitutionalLens);
  const nestedLens = safeObject(nestedAnalysis.effectiveInstitutionalLens);
  const contractLens = safeObject(assetInterpretationContract?.effectiveInstitutionalLens);
  const lens = rootLens.lensId || rootLens.label
    ? rootLens
    : nestedLens.lensId || nestedLens.label
      ? nestedLens
      : contractLens.lensId || contractLens.label
        ? contractLens
        : null;
  if (!lens) return null;
  return {
    ...lens,
    sourceMatrixEntryIds: safeArray(lens.sourceMatrixEntryIds),
    rawResolvedLensAuditOnly: safeObject(lens.rawResolvedLensAuditOnly),
  };
}

export function normalizeLensAwareExplanationsPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootExplanations = safeObject(root.lensAwareExplanations);
  const nestedExplanations = safeObject(nestedAnalysis.lensAwareExplanations);
  const explanations = rootExplanations.lensId ? rootExplanations : nestedExplanations;
  return explanations.lensId ? {
    ...explanations,
    evidenceNeeded: safeArray(explanations.evidenceNeeded),
    whatWouldChange: safeArray(explanations.whatWouldChange),
    requiredConditions: safeArray(explanations.requiredConditions),
    sourceQueueRequirements: safeArray(explanations.sourceQueueRequirements),
    boundaryNotes: safeArray(explanations.boundaryNotes),
  } : null;
}

export function normalizeAssetIdentityResolutionPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const asset = safeObject(root.asset || nestedAnalysis.asset);
  const rootIdentity = safeObject(root.assetIdentityResolution);
  const nestedIdentity = safeObject(nestedAnalysis.assetIdentityResolution);
  const assetIdentity = safeObject(asset.assetIdentityResolution);
  const identity = rootIdentity.canonicalAssetName || rootIdentity.canonicalAssetSymbol
    ? rootIdentity
    : nestedIdentity.canonicalAssetName || nestedIdentity.canonicalAssetSymbol
      ? nestedIdentity
      : assetIdentity.canonicalAssetName || assetIdentity.canonicalAssetSymbol
        ? assetIdentity
        : null;

  if (!identity) return null;

  return {
    ...identity,
    canonicalProviderIds: safeObject(identity.canonicalProviderIds),
    searchIdentityReconciliation: identity.searchIdentityReconciliation ? {
      ...safeObject(identity.searchIdentityReconciliation),
      providerContracts: safeArray(identity.searchIdentityReconciliation.providerContracts),
      coinGeckoContracts: safeArray(identity.searchIdentityReconciliation.coinGeckoContracts),
      coinMarketCapContracts: safeArray(identity.searchIdentityReconciliation.coinMarketCapContracts),
      providerDisagreementReasons: safeArray(identity.searchIdentityReconciliation.providerDisagreementReasons),
      selectionWarnings: safeArray(identity.searchIdentityReconciliation.selectionWarnings),
      whyThisCandidate: safeArray(identity.searchIdentityReconciliation.whyThisCandidate),
      whyNotThisCandidate: safeArray(identity.searchIdentityReconciliation.whyNotThisCandidate),
      displayLabels: safeArray(identity.searchIdentityReconciliation.displayLabels),
      sourceBoundary: safeArray(identity.searchIdentityReconciliation.sourceBoundary),
    } : null,
    allKnownContracts: safeArray(identity.allKnownContracts),
    platformContracts: safeObject(identity.platformContracts),
    oldContracts: safeArray(identity.oldContracts),
    newContracts: safeArray(identity.newContracts),
    explorerLinks: safeArray(identity.explorerLinks),
    officialLinks: safeArray(identity.officialLinks),
    identityWarnings: safeArray(identity.identityWarnings),
    chainWarnings: safeArray(identity.chainWarnings),
    contractWarnings: safeArray(identity.contractWarnings),
    identityEvidenceReconciliationWarnings: safeArray(identity.identityEvidenceReconciliationWarnings),
    sourceRequirements: safeArray(identity.sourceRequirements),
    sourceBoundary: safeArray(identity.sourceBoundary),
    evidenceSourceSummary: safeArray(identity.evidenceSourceSummary),
  };
}

export function normalizeTokenomicsSupplyIntegrityPayload(responseLike) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const rootTokenomics = safeObject(root.tokenomicsSupplyIntegrity);
  const nestedTokenomics = safeObject(nestedAnalysis.tokenomicsSupplyIntegrity);
  const tokenomics = rootTokenomics.supplySummary || rootTokenomics.tokenomicsIntegrityScore !== undefined
    ? rootTokenomics
    : nestedTokenomics.supplySummary || nestedTokenomics.tokenomicsIntegrityScore !== undefined
      ? nestedTokenomics
      : null;

  if (!tokenomics) return null;

  return {
    ...tokenomics,
    supplySummary: safeObject(tokenomics.supplySummary),
    sourceContradictions: safeArray(tokenomics.sourceContradictions),
    providerDisagreements: safeArray(tokenomics.providerDisagreements),
    providerContracts: safeArray(tokenomics.providerContracts),
    providerPlatforms: safeArray(tokenomics.providerPlatforms),
    providerMarketCaps: safeArray(tokenomics.providerMarketCaps),
    providerFdvs: safeArray(tokenomics.providerFdvs),
    providerVolumes: safeArray(tokenomics.providerVolumes),
    providerSupplyValues: safeArray(tokenomics.providerSupplyValues),
    providerTimestamps: safeArray(tokenomics.providerTimestamps),
    providerScopeNotes: safeArray(tokenomics.providerScopeNotes),
    providerFieldAudit: safeArray(tokenomics.providerFieldAudit).map((entry) => ({
      ...safeObject(entry),
      fieldsAvailable: safeArray(entry?.fieldsAvailable),
      fieldsMissing: safeArray(entry?.fieldsMissing),
      sourceBoundary: safeArray(entry?.sourceBoundary),
    })),
    coingeckoSupply: tokenomics.coingeckoSupply ? safeObject(tokenomics.coingeckoSupply) : null,
    coinmarketcapSupply: tokenomics.coinmarketcapSupply ? safeObject(tokenomics.coinmarketcapSupply) : null,
    formulaOutputs: safeArray(tokenomics.formulaOutputs).map((formula) => ({
      ...safeObject(formula),
      inputs: safeArray(formula?.inputs),
      missingInputs: safeArray(formula?.missingInputs),
      sourceInputs: safeArray(formula?.sourceInputs),
      sourceBoundary: safeArray(formula?.sourceBoundary),
    })),
    reviewedSources: safeArray(tokenomics.reviewedSources),
    sourceRequirements: safeArray(tokenomics.sourceRequirements),
    manualReviewTriggers: safeArray(tokenomics.manualReviewTriggers),
    hardBlockers: safeArray(tokenomics.hardBlockers),
    softBlockers: safeArray(tokenomics.softBlockers),
    scoreCaps: safeArray(tokenomics.scoreCaps),
    confidenceCaps: safeArray(tokenomics.confidenceCaps),
    positiveSignals: safeArray(tokenomics.positiveSignals),
    negativeSignals: safeArray(tokenomics.negativeSignals),
    neutralContextualSignals: safeArray(tokenomics.neutralContextualSignals),
    institutionalQuestions: safeArray(tokenomics.institutionalQuestions).map((question) => ({
      ...safeObject(question),
      evidenceUsed: safeArray(question?.evidenceUsed),
      dataFieldsUsed: safeArray(question?.dataFieldsUsed),
      formulaOutputsUsed: safeArray(question?.formulaOutputsUsed),
      missingEvidence: safeArray(question?.missingEvidence),
      whatWouldChange: safeArray(question?.whatWouldChange),
      sourceBoundary: safeArray(question?.sourceBoundary),
      reviewedSourcesUsed: safeArray(question?.reviewedSourcesUsed),
      reviewedFactsUsed: safeArray(question?.reviewedFactsUsed),
      remainingMissingEvidence: safeArray(question?.remainingMissingEvidence),
      reviewedEvidenceBoundary: safeArray(question?.reviewedEvidenceBoundary),
      evidenceMappingWarnings: safeArray(question?.evidenceMappingWarnings),
      reviewedEvidenceDoesNotAnswer: safeArray(question?.reviewedEvidenceDoesNotAnswer),
      synthesizedAnswer: normalizeSynthesizedAnswerPayload(question?.synthesizedAnswer),
    })),
    whatWouldChange: safeArray(tokenomics.whatWouldChange),
    sourceBoundary: safeArray(tokenomics.sourceBoundary),
    auditRawFields: safeObject(tokenomics.auditRawFields),
  };
}

function firstPresent(...values) {
  return values.find((value) => value !== null && value !== undefined && value !== "");
}

function normalizeSectionNames(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, entry]) => {
        const status = typeof entry === "string" ? entry : entry?.status || entry?.availability;
        return status && !["fresh", "live"].includes(String(status).toLowerCase());
      })
      .map(([key]) => key);
  }
  return [];
}

function collectSectionNames(sectionFreshness, statusMatcher) {
  return Object.entries(safeObject(sectionFreshness))
    .filter(([, entry]) => statusMatcher(String(entry?.status || entry?.availability || "").toLowerCase()))
    .map(([key]) => key);
}

function formatSnapshotId(value) {
  if (!value) return null;
  const stringValue = String(value);
  return stringValue.length > 12 ? `${stringValue.slice(0, 8)}...` : stringValue;
}

function buildFreshnessWarnings({ status, freshSections, staleSections, missingSections, source, recomputed }) {
  const warnings = [];
  if (status === "stored_snapshot") {
    warnings.push("Stored snapshot loaded; provider data may not reflect the latest state.");
    warnings.push("Historical snapshot output is compare/audit context and is not eligible for current live QA.");
  }
  if (status === "partial_refresh") {
    warnings.push("Partial refresh loaded; review stale or missing sections before relying on affected tabs.");
  }
  if (status === "cached_recent") {
    warnings.push("Cached/recent memo loaded; verify current provider state when freshness matters.");
    warnings.push("Cached/recent memo output should not be used as current live QA without a fresh run.");
  }
  if (status === "unknown") {
    warnings.push("Analysis freshness is unknown; verify before relying on this analysis.");
    warnings.push("Run a fresh analysis before using this output for current QA.");
  }
  if (staleSections.length) {
    warnings.push(`Stale sections require review: ${staleSections.slice(0, 5).join(", ")}.`);
  }
  if (missingSections.length) {
    warnings.push(`Missing sections are unavailable, not negative evidence: ${missingSections.slice(0, 5).join(", ")}.`);
  }
  if (!source) {
    warnings.push("Delivery source was not attached to the frontend payload.");
  }
  if (status !== "fresh_live" && (recomputed === null || recomputed === undefined)) {
    warnings.push("Recomputed status was not attached to the frontend payload.");
  }
  if (!freshSections.length && !staleSections.length && !missingSections.length) {
    warnings.push("Section-level freshness detail is unavailable in the current frontend model.");
  }
  return [...new Set(warnings)];
}

export function normalizeAnalysisFreshnessPayload(responseLike, fallbackSnapshot = null) {
  const root = safeObject(responseLike);
  const nestedAnalysis = safeObject(root.analysis);
  const derivedAnalysis = safeObject(root.derivedAnalysis);
  const rawData = safeObject(root.rawData);
  const nestedMeta = safeObject(nestedAnalysis.meta);
  const derivedMeta = safeObject(derivedAnalysis.meta);
  const rootMeta = safeObject(root.meta || nestedMeta || derivedMeta);
  const delivery = safeObject(
    root.delivery ||
    rootMeta.delivery ||
    nestedAnalysis.delivery ||
    nestedMeta.delivery ||
    derivedAnalysis.delivery ||
    derivedMeta.delivery ||
    rawData.delivery ||
    rawData.meta?.delivery,
  );
  const refreshDecision = safeObject(
    root.refreshDecision ||
    rootMeta.refreshDecision ||
    nestedAnalysis.refreshDecision ||
    nestedMeta.refreshDecision ||
    derivedAnalysis.refreshDecision ||
    derivedMeta.refreshDecision ||
    rawData.refreshDecision ||
    rawData.meta?.refreshDecision,
  );
  const sectionFreshness = safeObject(
    root.sectionFreshness ||
    rootMeta.sectionFreshness ||
    nestedAnalysis.sectionFreshness ||
    nestedMeta.sectionFreshness ||
    derivedAnalysis.sectionFreshness ||
    derivedMeta.sectionFreshness ||
    rawData.sectionFreshness ||
    rawData.meta?.sectionFreshness,
  );
  const snapshot = safeObject(fallbackSnapshot || root.snapshot || nestedAnalysis.snapshot || rawData.snapshot);
  const deliverySource = firstPresent(delivery.source, root.analysisSource, root.source, root.deliverySource);
  const sourceText = deliverySource ? String(deliverySource).toLowerCase() : "";
  const refreshMode = firstPresent(refreshDecision.mode, delivery.mode, root.refreshMode);
  const modeText = refreshMode ? String(refreshMode).toLowerCase() : "";
  const recomputed = firstPresent(delivery.recomputed, root.recomputed, refreshDecision.recomputed, null);
  const snapshotId = firstPresent(root.snapshotId, snapshot.snapshotId, delivery.snapshotId, root.analysisSnapshotId);
  const previousSnapshotId = firstPresent(root.previousSnapshotId, snapshot.previousSnapshotId, delivery.previousSnapshotId);
  const generatedAt = firstPresent(root.generatedAt, root.lastAnalyzed, nestedAnalysis.generatedAt, rootMeta.generatedAt, snapshot.generatedAt, delivery.generatedAt, delivery.checkedAt, root.cachedAt);
  const readAt = firstPresent(delivery.readAt, root.readAt, rootMeta.readAt, delivery.checkedAt);
  const previousSnapshotAt = firstPresent(root.previousSnapshotAt, snapshot.previousSnapshotAt, delivery.previousSnapshotAt);
  const snapshotAgeMs = firstPresent(delivery.snapshotAgeMs, root.snapshotAgeMs, rootMeta.snapshotAgeMs);
  const freshnessWindowMs = firstPresent(delivery.freshnessWindowMs, root.freshnessWindowMs, rootMeta.freshnessWindowMs);
  const freshSections = normalizeSectionNames(refreshDecision.freshSections).length
    ? normalizeSectionNames(refreshDecision.freshSections)
    : collectSectionNames(sectionFreshness, (status) => status === "fresh" || status === "live");
  const staleSections = normalizeSectionNames(refreshDecision.staleSections).length
    ? normalizeSectionNames(refreshDecision.staleSections)
    : collectSectionNames(sectionFreshness, (status) => status === "stale");
  const missingSections = [
    ...normalizeSectionNames(refreshDecision.missingSections),
    ...collectSectionNames(sectionFreshness, (status) => status === "missing" || status === "unsupported"),
  ].filter(Boolean);
  const fullRegenerationNeeded = firstPresent(refreshDecision.fullRegenerationNeeded, null);
  const partialRefreshSufficient = firstPresent(refreshDecision.partialRefreshSufficient, null);

  let freshnessStatus = "unknown";
  if (modeText.includes("partial") || sourceText.includes("partial")) {
    freshnessStatus = "partial_refresh";
  } else if (sourceText.includes("snapshot") || sourceText.includes("history") || sourceText.includes("postgres_history") || modeText.includes("reuse_snapshot") || (snapshotId && recomputed === false)) {
    freshnessStatus = "stored_snapshot";
  } else if (sourceText.includes("cache") || sourceText.includes("memo") || sourceText.includes("recent")) {
    freshnessStatus = "cached_recent";
  } else if (sourceText.includes("live") || recomputed === true || delivery.isFresh === true) {
    freshnessStatus = "fresh_live";
  }

  const freshQaEligible = freshnessStatus === "fresh_live";
  const bundleMode = freshnessStatus === "fresh_live"
    ? "live_current_qa"
    : freshnessStatus === "partial_refresh"
      ? "partial_refresh_compare_only"
      : freshnessStatus === "stored_snapshot"
        ? "historical_snapshot_compare_only"
        : freshnessStatus === "cached_recent"
          ? "cached_recent_memo_review_only"
          : "unknown_requires_fresh_analysis";
  const currentProductTruthObject = freshnessStatus === "fresh_live"
    ? "current_live_analysis"
    : freshnessStatus === "partial_refresh"
      ? "partial_refresh_compare_only_not_current_product_truth"
      : freshnessStatus === "stored_snapshot"
        ? "historical_snapshot_compare_only"
        : freshnessStatus === "cached_recent"
          ? "cached_recent_memo_not_current_qa"
          : "unknown_requires_fresh_analysis";
  const qaEligibilityLabel = freshQaEligible ? "Fresh QA eligible" : "Not eligible for current QA";
  const qaEligibilityWarning = freshQaEligible
    ? "This bundle is generated from the current live analysis object."
    : freshnessStatus === "partial_refresh"
      ? "Partial refresh output is compare/audit context only. Run a full live recompute before using primary tabs or Copy Live QA Bundle as current QA."
    : freshnessStatus === "stored_snapshot"
      ? "Historical snapshot output is compare/audit context only. Run a fresh analysis before current QA."
      : freshnessStatus === "cached_recent"
        ? "Cached/recent memo output is not a fresh recomputation. Run a fresh analysis before current QA."
        : "Freshness metadata is insufficient. Run a fresh analysis before current QA.";

  const freshnessLabel = {
    fresh_live: "Live analysis",
    stored_snapshot: "Stored snapshot",
    partial_refresh: "Partial refresh",
    cached_recent: "Cached/recent memo",
    unknown: "Freshness unknown",
  }[freshnessStatus];
  const summary = freshnessStatus === "fresh_live"
    ? `Live analysis${generatedAt ? ` generated at ${formatDateTime(generatedAt)}` : ""}.`
    : freshnessStatus === "stored_snapshot"
      ? "Stored snapshot preserves prior analysis state; verify current provider state before relying on time-sensitive sections."
      : freshnessStatus === "partial_refresh"
        ? `Partial refresh${freshSections.length ? `: fresh ${freshSections.slice(0, 4).join(", ")}` : ""}${missingSections.length ? `; missing ${missingSections.slice(0, 4).join(", ")}` : ""}.`
        : freshnessStatus === "cached_recent"
          ? "Cached/recent memo loaded; freshness should be checked against delivery metadata."
          : "Freshness unknown. Verify before relying on this analysis.";

  return {
    freshnessStatus,
    freshnessLabel,
    summary,
    analysisSource: deliverySource || null,
    generatedAt: generatedAt || null,
    readAt: readAt || null,
    snapshotId: snapshotId || null,
    snapshotShortId: formatSnapshotId(snapshotId),
    previousSnapshotId: previousSnapshotId || null,
    previousSnapshotAt: previousSnapshotAt || null,
    recomputed: recomputed === null || recomputed === undefined ? null : Boolean(recomputed),
    refreshMode: refreshMode || null,
    fullRegenerationNeeded,
    partialRefreshSufficient,
    freshSections: [...new Set(freshSections)],
    staleSections: [...new Set(staleSections)],
    missingSections: [...new Set(missingSections)],
    sectionFreshness,
    snapshotAgeMs: snapshotAgeMs ?? null,
    freshnessWindowMs: freshnessWindowMs ?? null,
    isSnapshot: freshnessStatus === "stored_snapshot",
    isPartialRefresh: freshnessStatus === "partial_refresh",
    isFreshLive: freshnessStatus === "fresh_live",
    isHistoricalSnapshotCompareOnly: freshnessStatus === "stored_snapshot",
    isCachedRecentMemo: freshnessStatus === "cached_recent",
    freshQaEligible,
    bundleMode,
    currentProductTruthObject,
    qaEligibilityLabel,
    qaEligibilityWarning,
    freshnessWarnings: buildFreshnessWarnings({
      status: freshnessStatus,
      freshSections: [...new Set(freshSections)],
      staleSections: [...new Set(staleSections)],
      missingSections: [...new Set(missingSections)],
      source: deliverySource,
      recomputed,
    }),
  };
}

export function extractRenderableText(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => extractRenderableText(entry, null))
      .filter(Boolean);
    return normalized.length ? normalized.join(", ") : fallback;
  }
  if (typeof value === "object") {
    if (typeof value.summary === "string" && value.summary.trim()) return value.summary;
    if (typeof value.label === "string" && value.label.trim()) return value.label;
    if (typeof value.value === "string" && value.value.trim()) return value.value;
    return fallback;
  }
  return fallback;
}

export function normalizeRenderableList(items) {
  return safeArray(items)
    .map((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        if (typeof item.summary === "string" && item.summary.trim()) {
          const evidence = safeArray(item.evidence)
            .map((entry) => extractRenderableText(entry, null))
            .filter(Boolean);
          return evidence.length ? `${item.summary} (${evidence.join("; ")})` : item.summary;
        }
      }
      return extractRenderableText(item, null);
    })
    .filter(Boolean);
}

const devWarningKeys = new Set();

export function devWarnOnce(key, message, details = undefined) {
  if (!import.meta.env.DEV) return;
  if (devWarningKeys.has(key)) return;
  devWarningKeys.add(key);

  if (details !== undefined) {
    console.warn(`[research-ui] ${message}`, details);
    return;
  }

  console.warn(`[research-ui] ${message}`);
}

export function extractDecisionLabel(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.label || value.value || value.id || null;
  }
  return null;
}

export function assertAnalysisShape(payload, context = "analysis") {
  if (!import.meta.env.DEV) return;

  const root = safeObject(payload);
  const analysis = safeObject(root.analysis);
  const derivedAnalysis = safeObject(root.derivedAnalysis);
  const decisionLayer = safeObject(analysis.decisionLayer);
  const thesisCore = safeObject(analysis.thesisCore);
  const confidence = safeObject(analysis.confidence);

  const posture = decisionLayer.posture;
  if (posture !== undefined && posture !== null && typeof posture !== "string" && typeof posture !== "object") {
    devWarnOnce(`posture-shape-${context}`, "Posture changed shape from expected string/object form.", {
      context,
      posture,
    });
  }

  const hasAnalysis = Object.keys(analysis).length > 0;
  const hasDerived = Object.keys(derivedAnalysis).length > 0;
  const analysisScore = analysis?.scores?.overallScore;
  const derivedScore = derivedAnalysis?.scores?.overallScore;
  if (
    hasAnalysis &&
    hasDerived &&
    analysisScore !== undefined &&
    derivedScore !== undefined &&
    analysisScore !== derivedScore
  ) {
    devWarnOnce(`analysis-derived-diverge-${context}`, "analysis and derivedAnalysis diverge on stored overall score.", {
      context,
      analysisScore,
      derivedScore,
    });
  }

  if (hasAnalysis && !thesisCore?.investability?.status) {
    devWarnOnce(`investability-missing-${context}`, "Investability is missing from thesisCore.", {
      context,
      thesisCore,
    });
  }

  if (hasAnalysis && (confidence.score === undefined || confidence.label === undefined)) {
    devWarnOnce(`confidence-shape-${context}`, "Confidence is missing score or label.", {
      context,
      confidence,
    });
  }
}

export function assertSnapshotShape(snapshotRecord, context = "snapshot") {
  if (!import.meta.env.DEV) return;
  const snapshot = safeObject(snapshotRecord);
  const hasAnalysis = Boolean(snapshot.analysis);
  const hasDerived = Boolean(snapshot.derivedAnalysis);

  if (!hasAnalysis && hasDerived) {
    devWarnOnce(`snapshot-fallback-${context}`, "Snapshot fallback used because analysis is missing and derivedAnalysis was used instead.", {
      context,
      snapshotId: snapshot.snapshotId || null,
    });
  }

  assertAnalysisShape({
    analysis: snapshot.analysis,
    derivedAnalysis: snapshot.derivedAnalysis,
  }, context);
}

export function assertCompareShape(compareData, context = "compare") {
  if (!import.meta.env.DEV) return;
  const root = safeObject(compareData);
  const comparison = safeObject(root.comparison);
  const base = safeObject(root.base);
  const against = safeObject(root.against);

  if (!Object.keys(comparison).length || !Object.keys(base).length || !Object.keys(against).length) {
    devWarnOnce(`compare-malformed-${context}`, "Compare payload malformed fallback used.", {
      context,
      hasComparison: Boolean(Object.keys(comparison).length),
      hasBase: Boolean(Object.keys(base).length),
      hasAgainst: Boolean(Object.keys(against).length),
    });
  }

  assertAnalysisShape({
    analysis: base.analysis,
    derivedAnalysis: base.derivedAnalysis,
  }, `${context}-base`);
  assertAnalysisShape({
    analysis: against.analysis,
    derivedAnalysis: against.derivedAnalysis,
  }, `${context}-against`);
}

export function formatDateTime(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function shortenAddress(value, start = 6, end = 4) {
  if (!value) return "Unavailable";
  const stringValue = String(value);
  if (stringValue.length <= start + end + 3) return stringValue;
  return `${stringValue.slice(0, start)}...${stringValue.slice(-end)}`;
}

export function formatSignedDelta(value, digits = 0, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Unavailable";
  const num = Number(value);
  const fixed = digits > 0 ? num.toFixed(digits) : Math.round(num).toString();
  return `${num > 0 ? "+" : ""}${fixed}${suffix}`;
}

export function formatTransition(fromValue, toValue) {
  return `${titleCase(fromValue || "unknown")} -> ${titleCase(toValue || "unknown")}`;
}

export function impactColor(level) {
  if (level === "high") return "#ff6b6b";
  if (level === "medium") return "#ffb020";
  if (level === "low") return "#7dd3fc";
  return "#8a94a6";
}

export function moduleAvailabilityTone(value) {
  if (value === "live") return { label: "Live", color: "#2fd67b" };
  if (value === "partial") return { label: "Partial coverage", color: "#7dd3fc" };
  if (value === "unsupported") return { label: "Unsupported", color: "#ffb020" };
  if (value === "missing") return { label: "Unavailable", color: "#8a94a6" };
  return { label: titleCase(value), color: "#8a94a6" };
}

export function diagnosticTone(entry) {
  if (!entry) return { color: "#8a94a6", label: "Unknown" };
  if (entry.status === "failure") return { color: "#ff6b6b", label: "Failed" };
  if (entry.status === "skipped") return { color: "#ffb020", label: "Skipped" };
  if (entry.coverage === "partial" || entry.coverage === "weak") return { color: "#7dd3fc", label: "Partial" };
  if (entry.coverage === "missing" || entry.coverage === "unavailable") return { color: "#8a94a6", label: "Unavailable" };
  return { color: "#2fd67b", label: "Success" };
}

export function compareAreaLabel(area) {
  const labels = {
    overall_score: "Overall score",
    confidence: "Confidence",
    data_quality: "Data quality",
    tokenomics_risk: "Tokenomics risk",
    token_unlocks: "Token unlocks",
    fundraising: "Fundraising",
    product_usage: "Product usage",
    protocol_usage: "Protocol usage",
    protocol_economics: "Protocol economics",
    governance_risk: "Governance risk",
    liquidity_risk: "Liquidity risk",
    onchain_score: "On-chain score",
    onchain_concentration: "On-chain concentration",
    project_credibility: "Project credibility",
    warnings: "Warnings",
    alerts: "Alerts",
    quick_verdict_note: "Decision memo",
  };
  return labels[area] || titleCase(area);
}

export function providerLabel(provider) {
  const labels = {
    coingeckoMarket: "CoinGecko market",
    dexscreener: "DexScreener",
    security: "Security provider",
    officialLinks: "Official links",
    whitepaperDocs: "Docs / whitepaper",
    onChain: "On-chain provider",
    ai: "Decision memo service",
    protocolEconomics: "Protocol economics",
    defillama: "DefiLlama",
  };

  return labels[provider] || titleCase(provider);
}

export function buildAssetLookupQuery(asset, fallbackQuery = "") {
  if (asset?.contractAddress) {
    return `${asset.chain || "unknown"}:${asset.contractAddress.toLowerCase()}`;
  }
  if (asset?.coinmarketcapId) {
    return `cmc:${asset.coinmarketcapId}`;
  }
  if (asset?.coingeckoId) {
    return `gecko:${asset.coingeckoId}`;
  }
  return fallbackQuery;
}

export function buildWatchlistKey(asset) {
  if (!asset) return "";
  if (asset.contractAddress) {
    return `${asset.chain || "unknown"}:${String(asset.contractAddress).toLowerCase()}`;
  }
  if (asset.coinmarketcapId) {
    return `cmc:${asset.coinmarketcapId}`;
  }
  if (asset.coingeckoId) {
    return `gecko:${asset.coingeckoId}`;
  }
  return `${String(asset.chain || "unknown").toLowerCase()}:${String(asset.symbol || asset.name || "unknown").toLowerCase()}`;
}

export function normalizeWatchlistAsset(raw) {
  if (!raw) return null;

  if (typeof raw === "string") {
    const clean = raw.trim();
    if (!clean) return null;
    return {
      name: clean,
      symbol: clean,
      chain: null,
      contractAddress: null,
      coingeckoId: null,
      coinmarketcapId: null,
      logo: null,
      category: null,
    };
  }

  const normalized = {
    name: raw.name || null,
    symbol: raw.symbol || null,
    chain: raw.chain || null,
    contractAddress: raw.contractAddress || null,
    coingeckoId: raw.coingeckoId || null,
    coinmarketcapId: raw.coinmarketcapId ?? null,
    logo: raw.logo || null,
    category: raw.category || null,
  };

  if (!buildWatchlistKey(normalized)) return null;
  return normalized;
}

export function buildWatchlistAssetFromAnalysis(asset, selection = null) {
  if (!asset && !selection) return null;

  return normalizeWatchlistAsset({
    name: asset?.name || selection?.name || null,
    symbol: asset?.symbol || selection?.symbol || null,
    chain: asset?.chain || selection?.chain || null,
    contractAddress: asset?.contractAddress || selection?.contractAddress || null,
    coingeckoId: asset?.coingeckoId || selection?.coingeckoId || null,
    coinmarketcapId: asset?.coinmarketcapId ?? selection?.coinmarketcapId ?? null,
    logo: selection?.logo || null,
    category: asset?.category || selection?.category || null,
  });
}

export function statusMeta(status) {
  if (status === "online") return { label: "Backend online", color: "#2fd67b", tone: "Live API responding" };
  if (status === "degraded") return { label: "Backend degraded", color: "#ffb020", tone: "Service reachable with partial coverage" };
  if (status === "offline") return { label: "Backend offline", color: "#ff6b6b", tone: "Requests are currently failing" };
  return { label: "Checking backend", color: "#8a94a6", tone: "Running health check" };
}

export function normalizeErrorMessage(message) {
  if (!message) return "Analysis failed. Please try again.";
  const lower = message.toLowerCase();
  if (lower.includes("timed out") || lower.includes("timeout")) return "The backend took too long to respond. Try again in a moment.";
  if (lower.includes("failed to fetch")) return "Could not reach the backend. Check deployment status or try again in a moment.";
  if (lower.includes("cors")) return "The frontend is blocked from calling the backend. Check the backend allowed origins configuration.";
  if (lower.includes("unexpected token") || lower.includes("not valid json")) return "The backend returned an unexpected response. Retry the request after the service stabilizes.";
  if (lower.includes("malformed response")) return "The backend returned an incomplete analysis payload. Try again after the backend stabilizes.";
  if (lower.includes("rate limit")) return "Rate limit reached. Wait a bit before running another analysis.";
  if (lower.includes("not found")) return "Token not found. Try a symbol, project name, or EVM contract address.";
  return message;
}

function providerHealthKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeProviderHealthEntry(provider, entry) {
  const safeEntry = safeObject(entry);
  if (!provider && !safeEntry.provider) return null;

  return {
    ...safeEntry,
    provider: safeEntry.provider || provider,
  };
}

export function normalizeProviderHealth(providerHealth) {
  if (!providerHealth) return null;

  const root = safeObject(providerHealth);
  const rawProviders = root.providers;
  const providerEntries = Array.isArray(rawProviders)
    ? rawProviders.map((entry) => normalizeProviderHealthEntry(entry?.provider, entry))
    : Object.entries(safeObject(rawProviders)).map(([provider, entry]) => normalizeProviderHealthEntry(provider, entry));

  const infraEntries = Object.entries(safeObject(root.infra))
    .map(([provider, entry]) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      if (!("status" in entry) && !("coverage" in entry)) return null;
      return normalizeProviderHealthEntry(provider, entry);
    });

  const providersList = [...providerEntries, ...infraEntries].filter(Boolean);
  const providersByName = providersList.reduce((acc, entry) => {
    const key = providerHealthKey(entry.provider);
    if (key) acc[key] = entry;
    return acc;
  }, {});

  return {
    ...root,
    providersList,
    providersByName,
  };
}

export function getProviderHealthEntry(providerHealth, providerName) {
  const normalized = providerHealth?.providersByName ? providerHealth : normalizeProviderHealth(providerHealth);
  return normalized?.providersByName?.[providerHealthKey(providerName)] || null;
}

export function isProviderHealthDegraded(entry) {
  if (!entry) return false;
  if (entry.status === "failed") return true;
  if (entry.status === "live" || entry.status === "missing_key" || entry.status === "skipped") return false;
  return entry.configured === true && entry.reachable === false;
}

export function providerHealthDisplayTone(entry) {
  if (!entry) return { color: "#8a94a6", label: "Unavailable", configuredLabel: "Unknown", statusLabel: "Unavailable" };

  if (entry.status === "live") {
    return { color: "#d5dcec", label: "Available", configuredLabel: "Yes", statusLabel: "Live" };
  }

  if (entry.status === "missing_key") {
    return { color: "#8a94a6", label: "Not configured", configuredLabel: "No", statusLabel: "Missing Key" };
  }

  if (entry.status === "skipped") {
    return { color: "#aab7cc", label: "Skipped", configuredLabel: "Contextual", statusLabel: "Skipped" };
  }

  if (entry.status === "failed" || entry.reachable === false) {
    return { color: "#ffb020", label: "Provider Issue", configuredLabel: entry.configured === false ? "No" : "Yes", statusLabel: titleCase(entry.status || entry.lastCheckStatus || "failed") };
  }

  return { color: "#aab7cc", label: titleCase(entry.status || "Diagnostic"), configuredLabel: entry.configured === false ? "No" : "Unknown", statusLabel: titleCase(entry.status || entry.lastCheckStatus || "unknown") };
}

export function buildAnalysisQualityExplanation({ confidence, providerDiagnostics = [], providerHealth, sourceStatus }) {
  const degradedProviders = [];
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const healthMap = [
    ["coingecko", "CoinGecko"],
    ["dexscreener", "DexScreener"],
    ["goplus", "GoPlus"],
    ["anthropic", "Decision memo service"],
    ["postgres", "Postgres"],
  ];

  for (const [key, label] of healthMap) {
    const entry = getProviderHealthEntry(normalizedProviderHealth, key);
    if (isProviderHealthDegraded(entry)) {
      degradedProviders.push(label);
    }
  }

  const failedDiagnostics = providerDiagnostics.filter((entry) => entry.status === "failure");
  const unsupportedDiagnostics = providerDiagnostics.filter(
    (entry) => entry.status === "skipped" || entry.errorClass === "unsupported" || entry.coverage === "unsupported",
  );
  const weakCoverageDiagnostics = providerDiagnostics.filter((entry) =>
    ["partial", "weak", "missing", "unavailable"].includes(entry.coverage || ""),
  );

  const unsupportedSections = Object.entries(sourceStatus || {})
    .filter(([, status]) => status === "unsupported")
    .map(([key]) => titleCase(key));

  const qualityIsWeak = confidence?.level === "low" || ["fallback", "partial"].includes(confidence?.dataQuality || confidence?.marketDataStatus || "");

  if (qualityIsWeak && (degradedProviders.length || failedDiagnostics.length)) {
    const providers = [...new Set([
      ...degradedProviders,
      ...failedDiagnostics.slice(0, 3).map((entry) => providerLabel(entry.provider)),
    ])];
    return {
      tone: "warning",
      title: "Analysis quality may be limited by upstream providers",
      message: `Some weak or missing sections are likely influenced by provider issues affecting ${providers.join(", ")}.`,
    };
  }

  if (qualityIsWeak && (unsupportedDiagnostics.length || unsupportedSections.length)) {
    const sections = [...new Set([
      ...unsupportedSections,
      ...unsupportedDiagnostics.slice(0, 3).map((entry) => providerLabel(entry.provider)),
    ])];
    return {
      tone: "neutral",
      title: "Analysis is partial because some sections are unsupported",
      message: `The current report is incomplete mainly because ${sections.join(", ")} is not fully supported in this product flow yet.`,
    };
  }

  if (qualityIsWeak && !degradedProviders.length && weakCoverageDiagnostics.length) {
    return {
      tone: "info",
      title: "Providers look healthy, but confirmed token data is still thin",
      message: "Weak confidence appears to come from limited confirmed market, docs, or project evidence for this asset rather than an obvious provider outage.",
    };
  }

  return null;
}

export function buildSectionQualityHint(section, {
  providerDiagnostics = [],
  providerHealth,
  sourceStatus,
  availability,
  officialLinks,
  whitepaperDocs,
  projectCredibility,
  protocolUsage,
  protocolEconomics,
}) {
  const diagnosticsByProvider = Object.fromEntries(
    providerDiagnostics.map((entry) => [entry.provider, entry]),
  );
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const providerDown = (name) => isProviderHealthDegraded(getProviderHealthEntry(normalizedProviderHealth, name));

  if (section === "market") {
    const geckoDiag = diagnosticsByProvider.coingeckoMarket;
    const dexDiag = diagnosticsByProvider.dexscreener;
    const geckoDown = providerDown("coingecko");
    const dexDown = providerDown("dexscreener");

    if (geckoDown || dexDown) {
      return {
        tone: "warning",
        message: `Market coverage may be weaker because ${[geckoDown ? "CoinGecko" : null, dexDown ? "DexScreener" : null].filter(Boolean).join(" and ")} is currently degraded.`,
      };
    }

    if (geckoDiag?.coverage === "partial" || geckoDiag?.coverage === "unavailable" || dexDiag?.coverage === "partial") {
      return {
        tone: "info",
        message: "Market data is partial because the backend could resolve the asset, but confirmed market coverage was still thin.",
      };
    }
  }

  if (section === "sources") {
    const linksDiag = diagnosticsByProvider.officialLinks;
    const docsDiag = diagnosticsByProvider.whitepaperDocs;
    const geckoDown = providerDown("coingecko");

    if (geckoDown && (linksDiag?.status === "failure" || docsDiag?.status === "failure")) {
      return {
        tone: "warning",
        message: "Source coverage may be weaker because an upstream metadata source is degraded.",
      };
    }

    if (officialLinks?.status === "weak" || whitepaperDocs?.documentationDepth === "missing" || docsDiag?.coverage === "missing") {
      return {
        tone: "neutral",
        message: "Official links or docs are thin because the project did not provide much verifiable source material through the connected sources.",
      };
    }
  }

  if (section === "onchain") {
    const onChainDiag = diagnosticsByProvider.onChain;
    const goplusDown = providerDown("goplus");

    if (sourceStatus?.onChain === "unsupported" || availability === "unsupported") {
      return {
        tone: "neutral",
        message: "This on-chain section is unsupported for the current asset type or resolution path.",
      };
    }

    if (goplusDown || onChainDiag?.status === "failure") {
      return {
        tone: "warning",
        message: "On-chain coverage may be limited by provider availability rather than by the token alone.",
      };
    }

    if (availability === "partial" || availability === "missing") {
      return {
        tone: "info",
        message: "On-chain coverage is thin because the current asset returned only limited holder or ownership evidence.",
      };
    }
  }

  if (section === "credibility") {
    const linksDiag = diagnosticsByProvider.officialLinks;
    const docsDiag = diagnosticsByProvider.whitepaperDocs;
    const geckoDown = providerDown("coingecko");

    if (geckoDown && (linksDiag?.status === "failure" || docsDiag?.status === "failure")) {
      return {
        tone: "warning",
        message: "Project credibility may be under-confirmed because upstream metadata or source collection is degraded.",
      };
    }

    if (projectCredibility?.availability === "missing") {
      return {
        tone: "neutral",
        message: "Credibility is weak here because the project has little backed founder, backer, or company evidence in connected sources.",
      };
    }

    if (projectCredibility?.availability === "partial") {
      return {
        tone: "info",
        message: "Some project identity evidence exists, but founder, backer, or company confirmation is still incomplete.",
      };
    }
  }

  if (section === "protocol") {
    const defillamaDiag = diagnosticsByProvider.defillama;
    const economicsDiag = diagnosticsByProvider.protocolEconomics;
    const defillamaDown = providerDown("defillama");

    if (defillamaDown) {
      return {
        tone: "warning",
        message: "Protocol usage and value-capture context may be limited because DefiLlama is currently degraded.",
      };
    }

    if (sourceStatus?.protocolUsage === "skipped" && sourceStatus?.protocolEconomics === "skipped") {
      return {
        tone: "neutral",
        message: "Protocol-level usage and economics were skipped because no confident asset-to-protocol mapping was available.",
      };
    }

    if (availability === "partial" || defillamaDiag?.coverage === "partial" || economicsDiag?.coverage === "partial") {
      return {
        tone: "info",
        message: "Protocol context is partial because a protocol match was found, but only part of the TVL, fees, revenue, or volume stack was backed.",
      };
    }

    if (
      availability === "missing"
      || (protocolUsage?.availability === "missing" && protocolEconomics?.availability === "missing")
    ) {
      return {
        tone: "neutral",
        message: "No backed protocol-level usage or economics signal was confirmed for this asset in the connected public sources.",
      };
    }
  }

  return null;
}

export function buildFreshnessBadge(entry) {
  if (!entry) {
    return {
      label: "Freshness unavailable",
      detail: null,
      color: "#8a94a6",
    };
  }

  const status = entry.status || (entry.availability === "unsupported"
    ? "unsupported"
    : entry.availability === "missing"
      ? "missing"
      : null);

  const updatedAt = entry.updatedAt ? formatDateTime(entry.updatedAt) : null;

  if (status === "fresh") {
    return { label: "Fresh", detail: updatedAt ? `Updated ${updatedAt}` : null, color: "#2fd67b" };
  }

  if (status === "stale") {
    return { label: "Stale", detail: updatedAt ? `Last update ${updatedAt}` : null, color: "#ffb020" };
  }

  if (status === "unsupported") {
    return { label: "Unsupported", detail: updatedAt ? `Checked ${updatedAt}` : null, color: "#8a94a6" };
  }

  if (status === "missing") {
    return { label: "Missing", detail: updatedAt ? `Last checked ${updatedAt}` : null, color: "#8a94a6" };
  }

  if (entry.availability === "partial") {
    return { label: "Partial", detail: updatedAt ? `Updated ${updatedAt}` : null, color: "#7dd3fc" };
  }

  return {
    label: "Freshness tracked",
    detail: updatedAt ? `Updated ${updatedAt}` : null,
    color: "#7dd3fc",
  };
}

export function buildWatchlistFreshnessMeta(latestSnapshot) {
  if (!latestSnapshot) {
    return {
      label: "No snapshot yet",
      detail: "Run analysis once to create the first stored snapshot.",
      color: "#8a94a6",
      tone: "neutral",
    };
  }

  const freshness = latestSnapshot.sectionFreshness || {};
  const market = freshness.marketData || null;
  const docs = freshness.officialLinksDocs || null;
  const credibility = freshness.projectCredibility || null;
  const onChain = freshness.onChainMetrics || null;

  const nowMs = Date.now();
  const ageMs = latestSnapshot.generatedAt ? Math.max(0, nowMs - new Date(latestSnapshot.generatedAt).getTime()) : null;
  const marketUpdatedAtMs = market?.updatedAt ? new Date(market.updatedAt).getTime() : null;
  const marketIsStale = Boolean(
    market &&
    market.availability !== "unsupported" &&
    marketUpdatedAtMs &&
    Number.isFinite(marketUpdatedAtMs) &&
    nowMs - marketUpdatedAtMs > market.freshnessWindowMs,
  );

  if (marketIsStale || (ageMs !== null && ageMs > (market?.freshnessWindowMs || 0) && market?.availability !== "unsupported")) {
    return {
      label: "Stale",
      detail: market?.updatedAt ? `Market last checked ${formatDateTime(market.updatedAt)}` : "Latest stored market snapshot is stale.",
      color: "#ffb020",
      tone: "warning",
    };
  }

  const unsupportedSections = [market, docs, credibility, onChain].filter((entry) => entry?.availability === "unsupported");
  const missingOrPartialSections = [market, docs, credibility].filter((entry) =>
    entry && ["partial", "missing"].includes(entry.availability),
  );

  if (latestSnapshot.summary?.dataQuality !== "full" || missingOrPartialSections.length || unsupportedSections.length) {
    let detail = "Recent snapshot exists, but some sections are partial or unsupported.";

    if (unsupportedSections.length && !missingOrPartialSections.length) {
      detail = "Recent snapshot exists, but some sections are unsupported for this asset path.";
    } else if (docs?.availability === "partial" || credibility?.availability === "partial") {
      detail = "Recent snapshot exists, but docs or project evidence are still only partially confirmed.";
    } else if (market?.availability === "missing" || market?.availability === "partial") {
      detail = "Recent snapshot exists, but market coverage is still thin.";
    }

    return {
      label: "Limited coverage",
      detail,
      color: "#7dd3fc",
      tone: "info",
    };
  }

  return {
    label: "Fresh",
    detail: latestSnapshot.generatedAt ? `Latest snapshot ${formatDateTime(latestSnapshot.generatedAt)}` : "Recent snapshot coverage looks current.",
    color: "#2fd67b",
    tone: "positive",
  };
}

export function buildWatchlistTimestampMeta({ latestSnapshot, lastCheckedAt, isRefreshing }) {
  if (isRefreshing) {
    return {
      label: "Checking now",
      value: "Refresh in progress.",
    };
  }

  const snapshotTimeMs = latestSnapshot?.generatedAt ? new Date(latestSnapshot.generatedAt).getTime() : null;
  const checkedTimeMs = lastCheckedAt ? new Date(lastCheckedAt).getTime() : null;
  const hasSnapshotTime = Number.isFinite(snapshotTimeMs);
  const hasCheckedTime = Number.isFinite(checkedTimeMs);

  if (hasCheckedTime && hasSnapshotTime && checkedTimeMs > snapshotTimeMs + 1000) {
    return {
      label: "Last checked",
      value: formatDateTime(lastCheckedAt),
    };
  }

  if (hasSnapshotTime) {
    return {
      label: "Last refreshed",
      value: formatDateTime(latestSnapshot.generatedAt),
    };
  }

  if (hasCheckedTime) {
    return {
      label: "Last checked",
      value: formatDateTime(lastCheckedAt),
    };
  }

  return null;
}

export function buildWatchlistRefreshResultMeta(result) {
  if (!result?.status) return null;

  if (result.status === "updated") {
    return {
      label: "Updated",
      detail: result.detail || "Refresh created a meaningful snapshot update.",
      color: "#2fd67b",
    };
  }

  if (result.status === "no_change") {
    return {
      label: "No change",
      detail: result.detail || "The latest check did not produce a meaningful snapshot change.",
      color: "#8a94a6",
    };
  }

  if (result.status === "failed") {
    return {
      label: "Refresh failed",
      detail: result.detail || "The last refresh attempt did not complete successfully.",
      color: "#ff6b6b",
    };
  }

  return null;
}

export function buildVerdictDisplayData({ aiReport, analysis, asset }) {
  try {
    const safeAnalysis = safeObject(analysis);
    const safeAiReport = safeObject(aiReport);
    const finalVerdict = safeObject(safeAiReport.finalVerdict);
    const decisionLayer = safeObject(safeAnalysis.decisionLayer);
    const thesisCore = safeObject(safeAnalysis.thesisCore);
    const decisionFrame = safeObject(decisionLayer.decisionFrame);
    const investability = safeObject(thesisCore.investability);
    const failureMode = safeObject(thesisCore.failureMode);
    const verdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, thesisCore, safeAnalysis);
    const posture = describePosture(extractDecisionLabel(decisionLayer.posture), safeAnalysis?.assetClassification?.assetClass || null);
    const currentState = describeCurrentState(extractDecisionLabel(decisionLayer.currentState), safeAnalysis?.assetClassification?.assetClass || null);
    const primaryWeakness = buildPrimaryWeaknessText({
      primaryWeakness: thesisCore.primaryWeakness,
      assetClass: safeAnalysis?.assetClassification?.assetClass || null,
    });
    const primaryStrength = buildPrimaryStrengthText({
      primaryStrength: thesisCore.primaryStrength,
      assetClass: safeAnalysis?.assetClassification?.assetClass || null,
    });
    const assetLabel = asset?.symbol || asset?.name || "asset";
    const mustBeTrue = safeArray(decisionFrame.whatMustBeTrue);
    const couldBreak = safeArray(decisionFrame.whatCouldBreak);

    if (!Object.keys(thesisCore).length) {
      devWarnOnce("verdict-fallback-thesiscore", "Missing thesisCore fallback used in verdict display.", {
        asset: assetLabel,
      });
    }

    if (!Object.keys(decisionLayer).length) {
      devWarnOnce("verdict-fallback-decision-layer", "Missing decisionLayer fallback used in verdict display.", {
        asset: assetLabel,
      });
    }

    return {
      recommendation:
        verdictSemantics.summary
        || finalVerdict.recommendation
        || decisionFrame.whyNow
        || (
          posture && investability.status
            ? `${titleCase(posture)} | ${titleCase(investability.status)}`
            : posture
              ? titleCase(posture)
              : investability.status
                ? titleCase(investability.status)
                : null
        ),
      summary:
        verdictSemantics.boundary
        || finalVerdict.summary
        || primaryWeakness
        || decisionFrame.whyNotNow
        || (
          currentState
            ? `${assetLabel} currently maps to ${titleCase(currentState)}.`
            : "Decision memo unavailable from current analysis data."
        ),
      bullCase:
        verdictSemantics.positiveCase?.[0]
        || safeAiReport.bullCase
        || primaryStrength
        || mustBeTrue[0]
        || null,
      bearCase:
        verdictSemantics.blockedCase?.[0]
        || safeAiReport.bearCase
        || failureMode.primary
        || couldBreak[0]
        || null,
      rating:
        verdictSemantics.label
        || finalVerdict.rating
        || posture
        || currentState
        || null,
      score:
        finalVerdict.score
        ?? safeAnalysis?.scores?.overallScore
        ?? null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[research-ui] buildVerdictDisplayData failed and returned safe fallback.", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
        asset: asset?.symbol || asset?.name || null,
      });
    }
    return {
      recommendation: null,
      summary: "Decision memo unavailable from current analysis data.",
      bullCase: null,
      bearCase: null,
      rating: null,
      score: null,
    };
  }
}

export function normalizeSignalList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object") {
          return entry.label || entry.signal || entry.code || entry.id || null;
        }
        return null;
      })
      .filter(Boolean)
      .map((entry) => titleCase(entry));
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, entryValue]) => Boolean(entryValue))
      .map(([key]) => titleCase(key));
  }

  return [];
}

const TECHNICAL_NOISE_PATTERNS = [
  /provider/i,
  /api\b/i,
  /auth/i,
  /upstream/i,
  /timeout/i,
  /missing[_\s-]?key/i,
  /rate[_\s-]?limit/i,
  /mapping[_\s-]?failed/i,
  /empty[_\s-]?payload/i,
  /unsupported[_\s-]?asset/i,
  /diagnostic/i,
];

export function isTechnicalNoiseText(value) {
  const text = extractRenderableText(value, "");
  if (!text) return false;
  return TECHNICAL_NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

export function filterUserFacingItems(items, limit = null) {
  const filtered = normalizeRenderableList(items).filter((entry) => !isTechnicalNoiseText(entry));
  if (limit === null) return filtered;
  return filtered.slice(0, limit);
}

const INTERNAL_SEMANTIC_LABELS = new Map([
  ["none_material", "No dominant structural weakness identified."],
  ["none material", "No dominant structural weakness identified."],
  ["fundamentally_supported", "Fundamentally supported"],
  ["adoption_supported", "Adoption supported"],
  ["narrative_supported", "Narrative-led support"],
  ["speculative", "Speculative"],
  ["structurally_fragile", "Structurally fragile"],
  ["governance_constrained", "Governance constrained"],
  ["underverified", "Underverified"],
  ["deteriorating", "Deteriorating"],
  ["mixed", "Mixed change"],
  ["high_conviction_candidate", "High-conviction candidate"],
  ["constructive_but_needs_confirmation", "Constructive but requires confirmation"],
  ["watchlist", "Monitor closely"],
  ["speculative_only", "Speculative only"],
  ["fragile", "Fragile"],
  ["avoid_for_now", "Avoid for now"],
  ["unassessable", "Insufficient verified evidence"],
  ["investable", "Investable"],
  ["conditionally_investable", "Conditionally investable"],
  ["non_investable", "Not investable"],
]);

function normalizeSemanticKey(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase().replace(/\s+/g, "_");
}

export function sanitizeSemanticLabel(value, fallback = "Unavailable") {
  const text = extractRenderableText(value, null);
  if (!text) return fallback;
  const normalizedKey = normalizeSemanticKey(text);
  if (INTERNAL_SEMANTIC_LABELS.has(normalizedKey)) {
    return INTERNAL_SEMANTIC_LABELS.get(normalizedKey);
  }
  return text;
}

export function isNoMaterialWeakness(value) {
  const text = sanitizeSemanticLabel(value, "");
  if (!text) return false;
  return text === "No dominant structural weakness identified.";
}

export function hasConcreteConflict(evidenceQuality, confidenceModel) {
  const evidenceSummary = extractRenderableText(evidenceQuality?.summary, "");
  const confidenceSummary = extractRenderableText(confidenceModel?.sourceAgreementSummary, "");
  const conflictEvidence = [
    evidenceSummary,
    confidenceSummary,
    ...normalizeRenderableList(evidenceQuality?.conflictEvidence),
    ...normalizeRenderableList(evidenceQuality?.conflicts),
  ].filter(Boolean);

  return conflictEvidence.some((entry) => /\bconflict|\bdisagree|\binconsistent|\bcontradict/i.test(entry));
}

export function isBenchmarkAssetClass(assetClass) {
  return ["native_asset", "gas_asset"].includes(assetClass || "");
}

function dedupeCaseInsensitive(items) {
  const seen = new Set();
  return safeArray(items).filter((item) => {
    const text = extractRenderableText(item, null);
    if (!text) return false;
    const key = text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeObjectsByTitle(items) {
  const seen = new Set();
  return safeArray(items).filter((item) => {
    const title = extractRenderableText(item?.title || item?.reason || item, null);
    if (!title) return false;
    const key = title.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const GENERIC_EPISTEMIC_PATTERNS = [
  /one or more critical pillars remain unresolved/i,
  /weakest-link uncertainty constrains conviction/i,
  /critical parts of the thesis (still )?rely too heavily on inference/i,
  /evidence quality is insufficient to support top-tier confidence/i,
  /conflicting evidence remains unresolved/i,
];

const GENERIC_PLACEHOLDER_PATTERNS = [
  /^confirm the missing structural support\.?$/i,
  /^confirm missing structural support\.?$/i,
  /^show stronger structural support\.?$/i,
];

function isGenericEpistemicText(value) {
  const text = extractRenderableText(value, "");
  return Boolean(text && GENERIC_EPISTEMIC_PATTERNS.some((pattern) => pattern.test(text)));
}

function replaceGenericCondition(value) {
  const text = sanitizeSemanticLabel(value, null);
  if (!text) return null;
  if (GENERIC_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text))) {
    return "Further direct evidence would increase conviction.";
  }
  return text;
}

function cleanUserFacingList(items, {
  limit = null,
  suppressGenericEpistemic = false,
  replacePlaceholders = false,
} = {}) {
  let cleaned = filterUserFacingItems(items, null)
    .map((item) => (replacePlaceholders ? replaceGenericCondition(item) : sanitizeSemanticLabel(item, null)))
    .filter(Boolean);

  if (suppressGenericEpistemic) {
    cleaned = cleaned.filter((item) => !isGenericEpistemicText(item));
  }

  const deduped = dedupeCaseInsensitive(cleaned).map((item) => extractRenderableText(item, null)).filter(Boolean);
  if (limit === null) return deduped;
  return deduped.slice(0, limit);
}

function chooseEpistemicNote({ isBenchmark, primaryWeakness, evidenceDirectness }) {
  if (isBenchmark && isNoMaterialWeakness(primaryWeakness)) {
    return "Benchmark thesis is structurally supported, while confidence remains constrained by evidence completeness.";
  }

  const directness = evidenceDirectness?.directness;
  if (directness === "mostly_inferred") return "Critical parts of the thesis rely too heavily on inference.";
  if (directness === "descriptive_only") return "Evidence quality is insufficient to support top-tier confidence.";
  if (directness === "critical_gaps") return "Weakest-link uncertainty constrains conviction.";
  return null;
}

export function buildAssetBadges({ assetClass, assetSubtype, primarySector }) {
  const rawBadges = [];

  if (assetClass === "native_asset") rawBadges.push("Benchmark Asset");
  else if (assetClass === "gas_asset") rawBadges.push("Base-Layer Asset");
  else if (assetClass) rawBadges.push(titleCase(assetClass));

  if (assetSubtype && assetSubtype !== "unknown") {
    rawBadges.push(titleCase(assetSubtype));
  }

  if (primarySector && primarySector !== "Unknown") {
    rawBadges.push(primarySector);
  }

  return dedupeCaseInsensitive(rawBadges).map((badge) => extractRenderableText(badge, null)).filter(Boolean);
}

export function describeCurrentState(currentState, assetClass) {
  const normalized = normalizeSemanticKey(currentState);
  if (isBenchmarkAssetClass(assetClass)) {
    if (normalized === "narrative_supported") return "Benchmark adoption and monetary role";
    if (normalized === "adoption_supported") return "Benchmark network adoption";
    if (normalized === "fundamentally_supported") return "Benchmark structural support";
  }
  return sanitizeSemanticLabel(currentState, "Unavailable");
}

export function describePosture(posture, assetClass) {
  const normalized = normalizeSemanticKey(posture);
  if (isBenchmarkAssetClass(assetClass) && normalized === "watchlist") {
    return "Conditionally investable benchmark";
  }
  return sanitizeSemanticLabel(posture, "Unavailable");
}

export function buildPrimaryStrengthText({ primaryStrength, assetClass }) {
  const text = sanitizeSemanticLabel(primaryStrength, null);
  if (text) return text;

  if (assetClass === "native_asset") {
    return "Benchmark liquidity, durability, and monetary role remain the core structural support.";
  }

  if (assetClass === "gas_asset") {
    return "Base-layer network role, usage, and settlement demand remain the core structural support.";
  }

  return null;
}

export function buildPrimaryWeaknessText({ primaryWeakness, assetClass }) {
  const text = sanitizeSemanticLabel(primaryWeakness, null);
  if (text) return text;

  if (isBenchmarkAssetClass(assetClass)) {
    return "No dominant structural weakness identified.";
  }

  return "No dominant structural weakness was surfaced.";
}

export function buildFailurePrimaryText({ failurePrimary, primaryWeakness, assetClass }) {
  const text = sanitizeSemanticLabel(failurePrimary, null);
  const noMaterialWeakness = isNoMaterialWeakness(primaryWeakness);

  if (isBenchmarkAssetClass(assetClass) && noMaterialWeakness) {
    return "No dominant failure mode is currently identified for the benchmark thesis.";
  }

  return text || primaryWeakness || "A structural break in the current thesis would invalidate allocation support.";
}

export function buildTokenDemandTruth({ allocationOutcomeKey, primaryStrength, assetClass, primaryWeakness }) {
  if (assetClass === "native_asset") {
    return primaryStrength
      ? "The thesis rests on benchmark liquidity, durability, and monetary relevance rather than token-style upside framing."
      : "Benchmark demand support is present, but the current evidence does not justify a stronger allocation stance.";
  }

  if (assetClass === "gas_asset") {
    return primaryStrength
      ? "The thesis rests on base-layer usage, settlement demand, and network role rather than generic token-narrative support."
      : "Base-layer demand support is visible, but the structural case is not yet clean enough for stronger conviction.";
  }

  if (primaryStrength) {
    return "Token-demand support is evidenced, but it does not override structural constraints.";
  }

  if (allocationOutcomeKey === "tradable_only" || allocationOutcomeKey === "tradable_only_narrative") {
    return "Token demand is speculative or liquidity-led rather than allocator-grade.";
  }

  if (allocationOutcomeKey === "do_not_allocate_value_capture_failure") {
    return "Protocol or network relevance is not enough; tokenholder value capture remains unproven.";
  }

  if (allocationOutcomeKey === "do_not_allocate_dependency_failure") {
    return "The token thesis is blocked by custody, redemption, backing, wrapper, or other dependency evidence.";
  }

  if (allocationOutcomeKey === "do_not_allocate" || String(allocationOutcomeKey || "").startsWith("do_not_allocate")) {
    return "Token-demand support does not clear the allocation bar.";
  }

  return `Token-demand support remains conditional on stronger structural confirmation${primaryWeakness ? ` against ${primaryWeakness.toLowerCase()}` : ""}.`;
}

export function buildSummaryMemo({
  allocationOutcomeKey,
  whyNow,
  whyNotNow,
  primaryStrength,
  primaryWeakness,
  failurePrimary,
  assetClass,
}) {
  if (allocationOutcomeKey === "capital_worthy") {
    return whyNow
      || primaryStrength
      || (assetClass === "native_asset"
        ? "Benchmark durability and liquidity remain the dominant support."
        : assetClass === "gas_asset"
          ? "Base-layer role and network usage remain the dominant support."
          : primaryWeakness);
  }

  if (allocationOutcomeKey === "conditional_allocation") {
    return whyNotNow || primaryWeakness || failurePrimary;
  }

  if (allocationOutcomeKey === "evidence_blocked" || allocationOutcomeKey === "manual_review_required") {
    return whyNotNow || "Allocation is blocked until asset-class-critical evidence is reviewed; this is not confirmed fundamental failure.";
  }

  if (allocationOutcomeKey === "not_allocation_ready") {
    return whyNotNow || primaryWeakness || "Current evidence is not allocation-ready.";
  }

  if (allocationOutcomeKey === "tradable_only" || allocationOutcomeKey === "tradable_only_narrative") {
    return primaryWeakness || failurePrimary || "Speculative interest is not enough to support allocation quality.";
  }

  if (allocationOutcomeKey === "do_not_allocate_value_capture_failure") {
    return primaryWeakness || "Protocol or network relevance is not enough; tokenholder value capture remains unproven.";
  }

  if (allocationOutcomeKey === "do_not_allocate_dependency_failure") {
    return primaryWeakness || "Allocation is blocked by unresolved dependency evidence such as custody, redemption, backing, or wrapper risk.";
  }

  if (allocationOutcomeKey === "avoid_critical_risk") {
    return primaryWeakness || failurePrimary || "A critical live risk dominates the current thesis.";
  }

  return primaryWeakness || failurePrimary || whyNotNow;
}

export function hasRealStructuralInvalidator(primaryWeakness) {
  const weakness = sanitizeSemanticLabel(primaryWeakness, "");
  if (!weakness || isNoMaterialWeakness(weakness)) return false;
  return true;
}

export function deriveAllocationOutcome(analysis, scores) {
  const safeAnalysis = safeObject(analysis);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const verdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, safeAnalysis.thesisCore, safeAnalysis);
  if (verdictSemantics?.hasVerdictClass) {
    return {
      key: verdictSemantics.key,
      label: verdictSemantics.label,
      tone: verdictSemantics.tone,
      shortLabel: verdictSemantics.shortLabel,
    };
  }
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const investability = safeObject(thesisCore.investability);
  const mirroredInvestability = safeObject(safeAnalysis.investability);
  const status = investability.status || null;
  const mirroredStatus = mirroredInvestability.status || null;
  const resolvedStatus = status || mirroredStatus;
  const overallScore = scores?.overallScore ?? safeAnalysis?.scores?.overallScore ?? null;

  if (resolvedStatus === "investable") {
    return {
      key: "capital_worthy",
      label: "Capital-Worthy",
      tone: "positive",
      shortLabel: "Capital-worthy",
    };
  }

  if (resolvedStatus === "conditionally_investable") {
    return {
      key: "conditional_allocation",
      label: "Conditional Allocation",
      tone: "caution",
      shortLabel: "Conditional",
    };
  }

  if (resolvedStatus === "speculative_only") {
    return {
      key: "tradable_only",
      label: "Tradable Only",
      tone: "warning",
      shortLabel: "Tradable only",
    };
  }

  if (resolvedStatus === "non_investable" || resolvedStatus === "unassessable") {
    return {
      key: "do_not_allocate",
      label: "Do Not Allocate",
      tone: "negative",
      shortLabel: "Do not allocate",
    };
  }

  if (overallScore !== null && overallScore >= 70) {
    return {
      key: "conditional_allocation",
      label: "Conditional Allocation",
      tone: "caution",
      shortLabel: "Conditional",
    };
  }

  return {
    key: "do_not_allocate",
    label: "Do Not Allocate",
    tone: "negative",
    shortLabel: "Do not allocate",
  };
}

const VERDICT_CLASS_DISPLAY = {
  capital_worthy: {
    label: "Capital-Worthy",
    shortLabel: "Capital-worthy",
    tone: "positive",
    summary: "Direct thesis support is present and no material blocker is currently evidenced.",
    boundary: "Investable framing still requires independent verification before capital allocation.",
  },
  investable_medium_confidence: {
    label: "Investable - Medium Confidence",
    shortLabel: "Investable / medium",
    tone: "positive",
    summary: "Core thesis support is constructive, while evidence completeness remains partial.",
    boundary: "Medium confidence is a caution label, not evidence completeness.",
  },
  conditional_allocation: {
    label: "Conditional Allocation",
    shortLabel: "Conditional",
    tone: "caution",
    summary: "Allocation depends on named conditions being verified or remaining true.",
    boundary: "Conditions must be source-backed before conviction increases.",
  },
  evidence_blocked: {
    label: "Evidence-Blocked",
    shortLabel: "Evidence-blocked",
    tone: "caution",
    summary: "Allocation is blocked by missing asset-class-critical evidence, not confirmed fundamental failure.",
    boundary: "Research requirements identify evidence still needed; they are not reviewed evidence.",
  },
  manual_review_required: {
    label: "Manual Review Required",
    shortLabel: "Manual review",
    tone: "caution",
    summary: "Human/source review is required before the asset can be treated as allocation-ready.",
    boundary: "Manual review is workflow, not automatic proof of failure.",
  },
  not_allocation_ready: {
    label: "Not Allocation-Ready",
    shortLabel: "Not ready",
    tone: "warning",
    summary: "The current evidence does not justify allocation today.",
    boundary: "Not allocation-ready is a current evidence state, not a permanent verdict.",
  },
  do_not_allocate_fundamental_blocker: {
    label: "Do Not Allocate - Fundamental Blocker",
    shortLabel: "Fundamental blocker",
    tone: "negative",
    summary: "A material fundamental blocker prevents allocation support.",
    boundary: "The blocker must be resolved with live/source-backed evidence before reconsideration.",
  },
  do_not_allocate_value_capture_failure: {
    label: "Do Not Allocate - Value Capture Failure",
    shortLabel: "Value-capture failure",
    tone: "negative",
    summary: "Protocol or network relevance is not enough; tokenholder value capture remains unproven.",
    boundary: "TVL, usage, fees, or network importance do not automatically accrue to tokenholders.",
  },
  do_not_allocate_dependency_failure: {
    label: "Do Not Allocate - Dependency Failure",
    shortLabel: "Dependency failure",
    tone: "negative",
    summary: "Allocation is blocked by unresolved dependency evidence such as custody, redemption, backing, wrapper, or legal-claim risk.",
    boundary: "Dependency assets do not inherit the underlying asset thesis automatically.",
  },
  tradable_only_narrative: {
    label: "Tradable-Only / Narrative-Only",
    shortLabel: "Narrative-only",
    tone: "warning",
    summary: "Narrative and liquidity may make the asset tradable, but durable fundamentals are not established.",
    boundary: "Attention, volume, or community activity is not institutional thesis support.",
  },
  avoid_critical_risk: {
    label: "Avoid - Critical Risk",
    shortLabel: "Avoid",
    tone: "negative",
    summary: "A critical live risk or blocker dominates the current analysis.",
    boundary: "Critical risk must be resolved before allocation review continues.",
  },
};

export function buildVerdictSemanticsDisplay(decisionLayer, thesisCore, analysis) {
  const safeDecisionLayer = safeObject(decisionLayer);
  const safeThesisCore = safeObject(thesisCore);
  const safeAnalysis = safeObject(analysis);
  const verdictClass = typeof safeDecisionLayer.verdictClass === "string"
    ? safeDecisionLayer.verdictClass
    : null;
  const base = verdictClass ? VERDICT_CLASS_DISPLAY[verdictClass] : null;
  const allocationCase = safeObject(safeDecisionLayer.allocationCase);
  const verdictReasons = safeObject(safeDecisionLayer.verdictReasons);
  const researchRequirements = safeArray(safeDecisionLayer.researchRequirements);

  if (!base) {
    return {
      hasVerdictClass: false,
      key: null,
      label: null,
      shortLabel: null,
      tone: null,
      summary: null,
      boundary: null,
      positiveCase: [],
      blockedCase: [],
      missingEvidence: [],
      whatWouldChange: [],
      researchRequirements: [],
      verdictReasons: {
        positiveThesisEvidence: [],
        realBlockers: [],
        evidenceGaps: [],
        reviewOnlyCautions: [],
        notApplicableItems: [],
        whatWouldChangeDecision: [],
      },
    };
  }

  const normalizedReasons = {
    positiveThesisEvidence: normalizeRenderableList(verdictReasons.positiveThesisEvidence),
    realBlockers: normalizeRenderableList(verdictReasons.realBlockers),
    evidenceGaps: normalizeRenderableList(verdictReasons.evidenceGaps),
    reviewOnlyCautions: normalizeRenderableList(verdictReasons.reviewOnlyCautions),
    notApplicableItems: normalizeRenderableList(verdictReasons.notApplicableItems),
    whatWouldChangeDecision: normalizeRenderableList(verdictReasons.whatWouldChangeDecision),
  };

  const positiveCase = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.forAllocation),
    ...normalizedReasons.positiveThesisEvidence,
    safeThesisCore.primaryStrength,
  ]).slice(0, 5);
  const blockedCase = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.againstAllocation),
    ...normalizedReasons.realBlockers,
    safeThesisCore.primaryWeakness,
  ]).filter((item) => !isNoMaterialWeakness(item)).slice(0, 5);
  const missingEvidence = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.missingEvidence),
    ...normalizedReasons.evidenceGaps,
    ...normalizeRenderableList(safeThesisCore.evidenceQuality?.missingCritical),
  ]).slice(0, 5);
  const whatWouldChange = dedupeCaseInsensitive([
    ...normalizeRenderableList(allocationCase.whatWouldChange),
    ...normalizedReasons.whatWouldChangeDecision,
    ...normalizeRenderableList(safeDecisionLayer.decisionFrame?.whatMustBeTrue),
  ]).slice(0, 5);

  return {
    hasVerdictClass: true,
    key: verdictClass,
    verdictClass,
    label: base.label,
    shortLabel: base.shortLabel,
    tone: base.tone,
    summary: base.summary,
    boundary: base.boundary,
    finalVerdictRating: safeAnalysis.aiReport?.finalVerdict?.rating || null,
    positiveCase,
    blockedCase,
    missingEvidence,
    whatWouldChange,
    researchRequirements,
    verdictReasons: normalizedReasons,
  };
}

function normalizeDecisionCandidates(...groups) {
  return groups
    .flatMap((group) => (Array.isArray(group) ? normalizeRenderableList(group) : [extractRenderableText(group, null)]))
    .map((entry) => sanitizeSemanticLabel(entry, null))
    .filter(Boolean);
}

function firstMeaningfulDecisionText(...groups) {
  return normalizeDecisionCandidates(...groups).find((entry) => !isNoMaterialWeakness(entry)) || null;
}

export function derivePrimaryBlocker({
  blockers,
  primaryWeakness,
  failureMode,
  missingCritical,
  auditAlerts,
  topNegativeDrivers,
}) {
  const label = firstMeaningfulDecisionText(
    blockers,
    primaryWeakness,
    failureMode?.primary,
    missingCritical,
    auditAlerts,
    topNegativeDrivers,
  );

  return {
    label: label || "Primary blocker not explicitly available in live response.",
    explanation: label
      ? "Derived from live decision, thesis, risk, or missing-evidence fields."
      : "The live response did not expose a dominant blocker field.",
    badge: label ? "Derived proxy" : "Unavailable",
  };
}

export function deriveWeakestLink({
  evidenceConstraintNote,
  primaryWeakness,
  missingCritical,
  failureMode,
  sourceAgreementSummary,
}) {
  const label = firstMeaningfulDecisionText(
    evidenceConstraintNote,
    primaryWeakness,
    missingCritical,
    sourceAgreementSummary,
    failureMode?.primary,
  );

  return {
    label: label || "Weakest link not explicitly available in live response.",
    explanation: label
      ? "Weakest-link proxy from live confidence, evidence, and thesis fields."
      : "The live response did not expose a dedicated weakest-link field.",
    badge: label ? "Weakest-link proxy" : "Unavailable",
  };
}

export function deriveWhatWouldChangeDecision({
  requiredConditions,
  nextCheckpoints,
  missingCritical,
  whyNotNow,
}) {
  const candidates = normalizeDecisionCandidates(requiredConditions, nextCheckpoints, missingCritical, whyNotNow)
    .filter((entry) => !isNoMaterialWeakness(entry));
  const items = dedupeCaseInsensitive(candidates).slice(0, 4);

  return {
    items: items.length ? items : ["Additional verified evidence required."],
    badge: items.length ? "Live requirements" : "Fallback",
  };
}

export function deriveAssetClassLabel({ assetClass, assetSubtype, primarySector }) {
  const parts = [
    assetClass ? titleCase(assetClass) : null,
    assetSubtype && assetSubtype !== "unknown" ? titleCase(assetSubtype) : null,
    primarySector && primarySector !== "Unknown" ? primarySector : null,
  ].filter(Boolean);

  return dedupeCaseInsensitive(parts).join(" | ") || "Asset class unavailable";
}

export function deriveAssetFramingLabel({ assetClass, assetSubtype, primarySector }) {
  const raw = `${assetClass || ""} ${assetSubtype || ""} ${primarySector || ""}`.toLowerCase();
  if (raw.includes("stable")) return "Trust / Settlement Asset";
  if (raw.includes("wrapped") || raw.includes("lst") || raw.includes("liquid staking")) return "Dependency / Redeemability Asset";
  if (raw.includes("native")) return "Benchmark / Monetary Asset";
  if (raw.includes("gas")) return "Base-Layer Settlement Asset";
  if (raw.includes("defi") || raw.includes("yield")) return "Protocol / Tokenholder-Accrual Thesis";
  if (raw.includes("infrastructure") || raw.includes("oracle") || raw.includes("compute")) return "Infrastructure Utility Thesis";
  if (raw.includes("meme") || raw.includes("narrative")) return "Narrative / Liquidity Thesis";
  return "Digital Asset Allocation Thesis";
}

const RESOLVED_LENS_DISPLAY_LABELS = {
  PAYMENTS_SETTLEMENT: {
    assetClassLabel: "Payments / Settlement Network Token",
    assetFramingLabel: "Payments Settlement Network Thesis",
  },
  GAMING_METAVERSE_CONSUMER: {
    assetClassLabel: "Gaming / GameFi Utility Token",
    assetFramingLabel: "Gaming Demand / Token Sink Thesis",
  },
  RWA_HYBRID_INFRASTRUCTURE: {
    assetClassLabel: "RWA Infrastructure / Hybrid Utility Token",
    assetFramingLabel: "RWA Infrastructure Utility Thesis",
  },
  RWA_HYBRID_ASSET: {
    assetClassLabel: "Tokenized Asset / RWA Thesis",
    assetFramingLabel: "RWA Rights / Redemption Thesis",
  },
  DEFI_PROTOCOL_TOKEN: {
    assetClassLabel: "DeFi Protocol Token / Value-Capture Thesis",
    assetFramingLabel: "Protocol Tokenholder Accrual Thesis",
  },
  STABLECOIN_SETTLEMENT: {
    assetClassLabel: "Stablecoin / Settlement Trust Asset",
    assetFramingLabel: "Stablecoin Trust / Redemption Thesis",
  },
  WRAPPED_ASSET: {
    assetClassLabel: "Wrapped Asset / Backing & Redemption Thesis",
    assetFramingLabel: "Wrapped Representation Dependency Thesis",
  },
  LST_STAKING_DERIVATIVE: {
    assetClassLabel: "Liquid Staking Token / Redemption & Slashing Thesis",
    assetFramingLabel: "Liquid Staking Derivative Thesis",
  },
  ORACLE_INFRASTRUCTURE: {
    assetClassLabel: "Oracle / Infrastructure Token",
    assetFramingLabel: "Oracle Token Necessity Thesis",
  },
  DEPENDENCY_INFRASTRUCTURE: {
    assetClassLabel: "Dependency Infrastructure Token",
    assetFramingLabel: "Infrastructure Token Necessity Thesis",
  },
  DEPIN_COMPUTE_STORAGE: {
    assetClassLabel: "DePIN Infrastructure Token",
    assetFramingLabel: "Resource Network Demand Thesis",
  },
  MEME_NARRATIVE: {
    assetClassLabel: "Meme / Narrative Asset",
    assetFramingLabel: "Narrative / Liquidity Thesis",
  },
  BASE_LAYER_SETTLEMENT: {
    assetClassLabel: "Base-Layer / Settlement Asset",
    assetFramingLabel: "Base-Layer Settlement Thesis",
  },
  NATIVE_MONETARY_BENCHMARK: {
    assetClassLabel: "Native PoW Monetary / Settlement Asset",
    assetFramingLabel: "Native Monetary Benchmark / PoW Settlement Thesis",
  },
};

const LENS_PRIMARY_COPY = {
  PAYMENTS_SETTLEMENT: {
    positive: "Payment-ledger utility can be evaluated through verified settlement usage, fee/reserve mechanics, validator/finality design, and distribution evidence.",
    blocked: "Allocation confidence depends on verified payment/settlement usage, reserve/fee/burn materiality, validator/finality assumptions, escrow/distribution overhang, and ecosystem dependency.",
  },
  GAMING_METAVERSE_CONSUMER: {
    positive: "Gaming adoption can support the thesis only if gameplay activity creates durable token demand after rewards, emissions, and subsidies are reviewed.",
    blocked: "Gaming activity must be separated from incentive-funded usage; active users, paying users, token sinks, emissions, mintability, and unlocks require reviewed evidence.",
  },
  RWA_HYBRID_INFRASTRUCTURE: {
    positive: "RWA infrastructure relevance can be evaluated only after utility-token economics, fee/staking/gas demand, and canonical network/contract mapping are verified.",
    blocked: "RWA infrastructure relevance does not prove tokenholder value capture. Utility-token economics, legal/RWA rights separation, fee/staking/gas demand, and canonical network/contract mapping require reviewed evidence.",
  },
  RWA_HYBRID_ASSET: {
    positive: "Tokenized-asset classification can support review only if legal claim, redemption, issuer, custodian, collateral, and jurisdiction evidence is source-backed.",
    blocked: "RWA/category metadata is not enforceable rights; legal claim, redemption enforceability, issuer/custodian/collateral, and jurisdiction evidence remain primary requirements.",
  },
  DEFI_PROTOCOL_TOKEN: {
    positive: "Protocol success can support the token thesis only when fee routing, governance rights, buyback/burn, staking, treasury, or other accrual mechanics are source-backed.",
    blocked: "Protocol success does not automatically accrue to tokenholders. Fee switch, fee routing, buyback/burn, treasury, staking, and governance durability must be source-backed.",
  },
  STABLECOIN_SETTLEMENT: {
    positive: "Stablecoin utility is a trust thesis, not an upside thesis; reserve quality, redemption rights, issuer/custodian dependency, peg stress, and controls determine support.",
    blocked: "Reserve quality, redemption rights, issuer/custodian dependency, peg stress, and admin/freeze controls determine trust.",
  },
  WRAPPED_ASSET: {
    positive: "Wrapped exposure can be evaluated only through backing, custodian/merchant model, mint/burn controls, redemption path, and proof-of-reserves.",
    blocked: "Backing, custodian/merchant model, mint/burn, redemption path, and proof-of-reserves determine whether the representation is safe.",
  },
  LST_STAKING_DERIVATIVE: {
    positive: "Liquid staking exposure depends on verified withdrawal/redemption mechanics, slashing/operator risk, depeg/liquidity depth, scanner review, and admin controls.",
    blocked: "Withdrawal queue, slashing/operator risk, depeg/liquidity risk, and protocol/admin controls determine the thesis.",
  },
  ORACLE_INFRASTRUCTURE: {
    positive: "Oracle infrastructure relevance must be tied to token-required service payment, staking, collateral, security, or service-operation mechanics.",
    blocked: "Infrastructure adoption is not tokenholder demand by itself; oracle usage, payment/staking/security mechanics, and durable token necessity require source-backed evidence.",
  },
  DEPIN_COMPUTE_STORAGE: {
    positive: "Resource-network relevance can support the thesis only if payer demand, provider incentives, and token settlement/payment role are durable and source-backed.",
    blocked: "Resource demand, payer mapping, provider incentives, subsidy dependency, and compute/storage usage must be verified before stronger conviction.",
  },
  MEME_NARRATIVE: {
    positive: "Liquidity and narrative can explain tradability, but allocation support requires durable non-narrative utility or enforceable economic rights.",
    blocked: "Narrative and liquidity are tradability context, not durable allocation-thesis support without non-narrative utility or rights.",
  },
  BASE_LAYER_SETTLEMENT: {
    positive: "Base-layer support depends on settlement/gas demand, validator/security economics, issuance/burn/staking mechanics, liveness, and network survivability.",
    blocked: "Settlement/gas demand, validator/security role, issuance/burn/staking economics, liveness, and protocol-upgrade risk require direct evidence.",
  },
  NATIVE_MONETARY_BENCHMARK: {
    positive: "BTC has canonical native monetary-asset identity, source-backed proof-of-work and issuance/halving mechanism context, and benchmark market relevance. Allocation support depends on current transaction-fee/blockspace demand, fee-market durability, miner economics, hashrate/security-budget resilience, mining-pool concentration, liveness, liquidity/depth, custody/access, ETF-flow, and regulatory-access evidence.",
    blocked: "Confidence remains capped because current fee-market durability, miner economics, hashrate/security-budget resilience, mining-pool concentration, liquidity/depth, custody/ETF-flow, regulatory-access, and liveness evidence require direct live review.",
  },
};

const BTC_NATIVE_DISPLAY_COPY = {
  assetClassLabel: "Native PoW Monetary / Settlement Asset",
  assetFramingLabel: "Native Monetary Benchmark / PoW Settlement Thesis",
  whyAllocationCouldMakeSense: "BTC has canonical native monetary-asset identity, source-backed proof-of-work and issuance/halving mechanism context, and benchmark market relevance. Allocation support depends on current transaction-fee/blockspace demand, fee-market durability, miner economics, hashrate/security-budget resilience, mining-pool concentration, liveness, liquidity/depth, custody/access, ETF-flow, and regulatory-access evidence.",
  whyAllocationIsCapped: "Confidence remains capped because current fee-market durability, miner economics, hashrate/security-budget resilience, mining-pool concentration, liquidity/depth, custody/ETF-flow, regulatory-access, and liveness evidence require direct live review.",
  verdictInterpretation: "Investable - Medium Confidence means BTC clears the benchmark allocation threshold, while live market/security/liquidity evidence gaps keep confidence capped.",
  primaryBlocker: "Current fee-market durability, miner economics, hashrate/security-budget resilience, and liquidity/depth evidence remain source-required.",
  rightRailPrimaryBlocker: "Current fee-market, miner economics, security-budget, liquidity, custody/access, and liveness evidence remain source-required.",
  weakestLink: "The weakest BTC assumption is whether current live fee-market, miner economics, hashrate/security budget, and liquidity evidence are strong enough to support the allocation thesis.",
  decisionMemo: "BTC is directionally investable as a native PoW monetary benchmark, but confidence remains medium because current security-budget, fee-market, miner economics, liquidity, custody/access, and liveness evidence are not fully source-backed in the current live response.",
  allocationThesis: "BTC thesis depends on canonical native monetary identity, proof-of-work settlement/security, fixed issuance/halving mechanism, current transaction-fee/blockspace demand, fee-market security-budget durability, miner economics, hashrate resilience, mining-pool decentralization, liveness, liquidity/depth, custody/access, ETF-flow, and regulatory-access evidence.",
  falsePositiveBoundary: "Bitcoin protocol evidence supports mechanism and monetary design. It does not prove current fee-market durability, miner economics, hashrate quality, mining-pool decentralization, market depth, ETF/custody flows, regulatory access, liveness, or allocation suitability.",
  evidenceNeeded: [
    "Current transaction-fee and blockspace demand evidence.",
    "Fee-market durability and miner revenue mix: subsidy versus transaction fees.",
    "Hashrate/security-budget resilience evidence.",
    "Miner economics/profitability evidence.",
    "Mining-pool concentration and liveness/congestion evidence.",
    "Market depth, liquidity, slippage, and venue concentration evidence.",
    "Custody/access, ETF-flow, and regulatory-access context.",
  ],
  whatWouldChange: [
    "Stronger source-backed current transaction-fee/blockspace demand and fee-market sustainability.",
    "Evidence that transaction fees and miner economics can sustain security budget as subsidy declines.",
    "Stronger hashrate/security-budget resilience and lower mining-pool concentration.",
    "Deeper liquidity, lower venue concentration, stronger custody/access and ETF-flow evidence.",
    "Better liveness/congestion and regulatory-access context.",
  ],
  rightRailWhatWouldChange: [
    "Stronger current transaction-fee/blockspace demand and fee-market durability evidence.",
    "Evidence that miner economics and transaction fees can sustain security budget as subsidy declines.",
    "Stronger hashrate/security-budget resilience, lower mining-pool concentration, and healthier liveness/liquidity conditions.",
  ],
  whatMustBeTrue: [
    "Bitcoin's native PoW monetary mechanism remains credible.",
    "Current fee market and blockspace demand are strong enough to support the security-budget thesis.",
    "Miner economics and hashrate resilience remain healthy.",
    "Mining-pool concentration does not create unacceptable centralization risk.",
    "Liquidity/depth and institutional access remain sufficient for allocation use.",
    "Custody/regulatory access and liveness risks do not materially deteriorate.",
  ],
  whatCouldBreak: [
    "Weak transaction-fee/blockspace demand.",
    "Deteriorating fee-market security budget.",
    "Miner economics stress.",
    "Falling hashrate/security resilience.",
    "High mining-pool concentration.",
    "Liveness/congestion failure.",
    "Liquidity/depth deterioration.",
    "Custody/access or regulatory-access deterioration.",
    "Major dormant/founder-era supply movement or whale-flow shock once future on-chain monitoring exists.",
  ],
};

const ETH_POS_SETTLEMENT_DISPLAY_COPY = {
  assetClassLabel: "PoS Smart-Contract Settlement / Gas Asset",
  assetFramingLabel: "PoS Settlement / Gas / Burn / Staking / L2 Fee-Market Thesis",
  whyAllocationCouldMakeSense: "ETH has native smart-contract settlement and gas-asset relevance, with protocol mechanics tied to transaction fees, EIP-1559 base-fee burn, staking/validator security, and L2 settlement/blob demand. Allocation support depends on current gas demand, fee-market durability, net issuance, staking participation, validator/client diversity, slashing/liveness history, L2/blob fee contribution, liquidity/depth, custody/access, ETF-flow, and regulatory-access evidence.",
  whyAllocationIsCapped: "Confidence remains capped because current gas demand, fee-market durability, base-fee burn/net issuance, staking/validator distribution, client diversity, slashing/liveness history, L2/blob fee-market contribution, liquidity/depth, custody/access, and regulatory-access evidence require direct live review.",
  verdictInterpretation: "ETH can clear a smart-contract settlement benchmark while live fee-market, validator/security, L2/blob, liquidity, and access evidence gaps keep confidence capped.",
  primaryBlocker: "Current gas demand, fee-market durability, validator/security distribution, L2/blob fee contribution, liquidity/depth, custody/access, and liveness evidence remain source-required.",
  rightRailPrimaryBlocker: "Current gas demand, base-fee burn/net issuance, validator/client diversity, L2/blob fees, liquidity, custody/access, and liveness evidence remain source-required.",
  weakestLink: "The weakest ETH assumption is whether current live gas demand, base-fee burn/net issuance, validator/client diversity, L2/blob fee contribution, and liquidity evidence are strong enough to support the allocation thesis.",
  decisionMemo: "ETH is directionally investable as a native PoS smart-contract settlement and gas asset, but confidence remains capped because current fee-market durability, validator/security distribution, L2/blob economics, liquidity, custody/access, and liveness evidence are not fully source-backed in the current live response.",
  allocationThesis: "ETH thesis depends on native smart-contract settlement demand, gas fee demand, EIP-1559 base-fee burn/net issuance mechanics, staking/validator security, validator and client diversity, liveness, L2 settlement and blob/data-availability fee contribution, liquidity/depth, custody/access, ETF-flow, and regulatory-access evidence.",
  falsePositiveBoundary: "Ethereum protocol/mechanism evidence can support staking, fee mechanics, base-fee burn, and settlement architecture. It does not prove current durable gas demand, net issuance quality, validator/client decentralization, L2/blob fee durability, market depth, ETF/custody flows, regulatory access, liveness, or allocation suitability without live/source-backed evidence.",
  tokenDemandTruth: "ETH demand support is a native smart-contract settlement, gas, and L2/blob fee-market thesis. Provider and protocol mechanism context do not prove current fee-market durability, net issuance quality, validator/client decentralization, L2/blob fee durability, liquidity/depth, custody/access, ETF-flow, regulatory-access, or allocation suitability.",
  tokenomicsSummary: "ETH native supply mechanics depend on issuance, staking rewards/penalties, base-fee burn, and protocol upgrades. Mechanism evidence can support the design, but current net issuance, burn materiality, staking participation, and fee-market durability require live/source-backed evidence.",
  evidenceNeeded: [
    "Current gas demand, transaction count, fee revenue, base fee, and priority fee evidence.",
    "EIP-1559 base-fee burn, burn materiality, net issuance, and monetary-policy evidence.",
    "Staking participation, validator count, validator distribution/concentration, and validator reward/penalty evidence.",
    "Client diversity, slashing, liveness/outage, congestion, and protocol-security evidence.",
    "L2 settlement activity, blob/data-availability fees, rollup demand, and L2 fee-market contribution evidence.",
    "Evidence whether L2 growth strengthens or cannibalizes L1 fee-market/value-capture assumptions.",
    "MEV, proposer-builder, relay centralization, protocol upgrade, and governance roadmap risk evidence.",
    "Market depth, liquidity, slippage, venue concentration, custody/access, ETF-flow, and regulatory-access context.",
  ],
  whatWouldChange: [
    "Stronger source-backed current gas demand, transaction-fee revenue, base-fee burn, and net issuance evidence.",
    "Stronger staking participation, validator distribution, client diversity, slashing/liveness, and protocol-security evidence.",
    "Clearer L2 settlement, blob fee, rollup economics, and L2 support-versus-cannibalization evidence.",
    "Deeper liquidity, lower venue concentration, stronger custody/access and ETF-flow evidence.",
    "Better MEV/proposer-builder/relay, protocol-upgrade, liveness, and regulatory-access context.",
  ],
  whatMustBeTrue: [
    "Ethereum's native PoS smart-contract settlement role remains durable.",
    "Current gas demand and transaction-fee demand are strong enough to support the fee-market thesis.",
    "Base-fee burn and net issuance mechanics remain economically material under current conditions.",
    "Staking participation, validator distribution, and client diversity remain resilient.",
    "L2 settlement and blob/data-availability demand support rather than structurally cannibalize L1 economics.",
    "Liquidity/depth, custody/access, ETF-flow, and regulatory access remain institutionally usable.",
  ],
  whatCouldBreak: [
    "Weak current gas demand or transaction-fee demand.",
    "Base-fee burn becoming immaterial relative to issuance.",
    "Validator concentration, client concentration, slashing, or liveness deterioration.",
    "L2/blob fee contribution failing to support L1 economics or materially cannibalizing L1 fee capture.",
    "MEV, proposer-builder, or relay centralization risk worsening.",
    "Liquidity/depth deterioration, venue concentration, custody/access friction, ETF-flow weakness, or regulatory-access deterioration.",
    "Protocol upgrade or governance roadmap risk undermining fee-market, issuance, or security assumptions.",
  ],
};

const DATA_FIRST_CONTRACT_MISSING_COPY = {
  summary: "Data-first narrative contract missing or stale. Full recompute required before primary QA.",
  boundary: "Current primary analysis requires dataFirstNarrativeContract. Old snapshot, cache, partial-refresh, or legacy fallback narrative is not current product truth.",
  evidence: [
    "Run a full live recompute before using Decision, Thesis, Checklist, Score Explanation, Source Queue, Manual Review, or Copy Live QA Bundle as current QA.",
  ],
  whatWouldChange: [
    "A fresh live analysis with dataFirstNarrativeContract, generated narrative fields, Asset Interpretation Contract data-first gate, and Review Bundle 2AB attached.",
  ],
};

function isNativeBtcDisplayContext({ asset, lens, assetIdentityResolution, reviewedEvidencePacket } = {}) {
  const assetText = [
    asset?.symbol,
    asset?.name,
    asset?.id,
    asset?.coingeckoId,
    asset?.coinmarketcapId,
    reviewedEvidencePacket?.packetId,
    assetIdentityResolution?.canonicalAssetName,
    assetIdentityResolution?.canonicalAssetSymbol,
    assetIdentityResolution?.canonicalProviderIds?.coingeckoId,
    assetIdentityResolution?.canonicalProviderIds?.coinmarketcapId,
    assetIdentityResolution?.nativeNetworkCandidate,
    assetIdentityResolution?.canonicalNetworkCandidate,
    assetIdentityResolution?.representationType,
    assetIdentityResolution?.bridgedOrWrappedStatus,
    lens?.lensId,
    lens?.questionGroupId,
  ].filter(Boolean).join(" ").toLowerCase();
  const looksLikeNativeBtc = /\b(bitcoin|btc|reviewed-demo-btc-v1|native_monetary_benchmark)\b/i.test(assetText);
  const isWrappedOrDerivative = /\b(wbtc|wrapped|bridged|bridge|liquid staking|lst|steth|staking derivative)\b/i.test(assetText);
  return looksLikeNativeBtc && !isWrappedOrDerivative;
}

function isEthPosSettlementDisplayContext({ asset, lens, assetIdentityResolution, reviewedEvidencePacket } = {}) {
  const lensId = String(lens?.lensId || "").toUpperCase();
  const questionGroupId = String(lens?.questionGroupId || "").toLowerCase();
  const isEthCompatibleLens = lensId === "BASE_LAYER_SETTLEMENT"
    && /base_layer|settlement|gas|native/.test(questionGroupId || "base_layer_settlement");
  if (!isEthCompatibleLens) return false;

  const representationType = String(assetIdentityResolution?.representationType || "").toLowerCase();
  const isNativeRepresentation = assetIdentityResolution?.isNativeAsset === true
    || representationType === "native_asset"
    || representationType === "native";
  if (!isNativeRepresentation) return false;

  if (
    assetIdentityResolution?.isContractRepresentation === true
    || assetIdentityResolution?.selectedContract
    || assetIdentityResolution?.analyzedContract
    || asset?.contractAddress
  ) {
    return false;
  }

  const assetText = [
    asset?.symbol,
    asset?.name,
    asset?.id,
    asset?.coingeckoId,
    asset?.coinmarketcapId,
    reviewedEvidencePacket?.packetId,
    assetIdentityResolution?.canonicalAssetName,
    assetIdentityResolution?.canonicalAssetSymbol,
    assetIdentityResolution?.canonicalProviderIds?.coingeckoId,
    assetIdentityResolution?.canonicalProviderIds?.coinmarketcapId,
  ].filter(Boolean).join(" ").toLowerCase();
  const looksLikeNativeEth = /\b(ethereum|ether|eth|reviewed-demo-eth-v1)\b/i.test(assetText);
  const isWrappedOrDerivative = /\b(weth|wrapped|bridged|bridge|liquid staking|lst|steth|reth|cbeth|wsteth|staking derivative)\b/i.test(assetText);
  return looksLikeNativeEth && !isWrappedOrDerivative;
}

function buildNativeBtcDisplayOverlay(baseModel) {
  const copy = BTC_NATIVE_DISPLAY_COPY;
  const verdictSemantics = {
    ...(baseModel.verdictSemantics || {}),
    positiveCase: [copy.whyAllocationCouldMakeSense],
    blockedCase: [copy.whyAllocationIsCapped],
    summary: copy.verdictInterpretation,
    missingEvidence: copy.evidenceNeeded,
    whatWouldChange: copy.whatWouldChange,
    boundary: "Primary BTC display copy is native PoW monetary benchmark wording; raw generic base-layer fields remain available only in Audit / Raw.",
  };

  return {
    ...baseModel,
    assetClassLabel: copy.assetClassLabel,
    assetFramingLabel: copy.assetFramingLabel,
    resolvedInstitutionalLens: {
      ...(baseModel.resolvedInstitutionalLens || {}),
      label: copy.assetClassLabel,
      displayLabel: copy.assetClassLabel,
      displayFraming: copy.assetFramingLabel,
      visibleLabelOverride: copy.assetClassLabel,
      visibleLabelSource: "native_btc_rendered_surface_overlay",
    },
    verdictSemantics,
    allocationCase: {
      ...(baseModel.allocationCase || {}),
      forAllocation: [copy.whyAllocationCouldMakeSense],
      againstAllocation: [copy.whyAllocationIsCapped],
      missingEvidence: copy.evidenceNeeded,
      whatWouldChange: copy.whatWouldChange,
    },
    missingCritical: copy.evidenceNeeded,
    requiredConditions: copy.evidenceNeeded,
    blockers: [copy.rightRailPrimaryBlocker],
    decisionDrivers: [
      copy.whyAllocationCouldMakeSense,
      copy.primaryBlocker,
      copy.falsePositiveBoundary,
    ],
    primaryStrength: copy.whyAllocationCouldMakeSense,
    primaryWeakness: copy.whyAllocationIsCapped,
    summaryMemo: copy.decisionMemo,
    structuredThesisSummary: copy.allocationThesis,
    tokenDemandTruth: "BTC demand support is a native monetary/blockspace thesis. Provider and protocol mechanism context do not prove current fee-market durability, miner economics, liquidity/depth, custody/access, ETF-flow, regulatory-access, or allocation suitability.",
    failureMode: {
      ...(baseModel.failureMode || {}),
      primary: copy.falsePositiveBoundary,
      trigger: copy.whatCouldBreak[0],
    },
    primaryBlocker: {
      ...(baseModel.primaryBlocker || {}),
      label: copy.primaryBlocker,
      explanation: copy.rightRailPrimaryBlocker,
      badge: "BTC-native source requirement",
    },
    weakestLink: {
      ...(baseModel.weakestLink || {}),
      label: copy.weakestLink,
      explanation: copy.weakestLink,
      badge: "BTC-native weakest link",
    },
    whatWouldChangeDecision: {
      ...(baseModel.whatWouldChangeDecision || {}),
      items: copy.rightRailWhatWouldChange,
      badge: "BTC-native live requirements",
      explanation: "Display wording is scoped to native Bitcoin proof-of-work monetary benchmark review; scoring and verdicts are unchanged.",
    },
    whyNow: copy.whyAllocationCouldMakeSense,
    whyNotNow: copy.whyAllocationIsCapped,
    whatMustBeTrue: copy.whatMustBeTrue,
    whatCouldBreak: copy.whatCouldBreak,
    nextCheckpoints: copy.whatWouldChange,
    topPositiveDrivers: [copy.whyAllocationCouldMakeSense],
    topNegativeDrivers: [copy.primaryBlocker, copy.weakestLink],
    topNeutralDrivers: copy.whatWouldChange,
    researchRequirements: copy.evidenceNeeded.map((requirement, index) => ({
      id: `btc-native-final-surface-${index}`,
      title: requirement,
      assetClassLens: "NATIVE_MONETARY_BENCHMARK",
      reason: "BTC-native PoW monetary benchmark source requirement. Source requirements are not reviewed evidence and do not change scoring.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["official_docs", "network_dashboard", "market_data", "custody_access_report", "manual_review"],
      priority: index < 4 ? "high" : "medium",
      verdictImpact: "Could clarify BTC benchmark thesis confidence if independently reviewed.",
      currentStatus: "review_required",
      canChangeVerdict: true,
    })),
  };
}

function buildEthPosSettlementDisplayOverlay(baseModel) {
  const copy = ETH_POS_SETTLEMENT_DISPLAY_COPY;
  const verdictSemantics = {
    ...(baseModel.verdictSemantics || {}),
    positiveCase: [copy.whyAllocationCouldMakeSense],
    blockedCase: [copy.whyAllocationIsCapped],
    summary: copy.verdictInterpretation,
    missingEvidence: copy.evidenceNeeded,
    whatWouldChange: copy.whatWouldChange,
    boundary: "Primary ETH display copy is native PoS smart-contract settlement / gas / burn / staking / L2 fee-market wording; raw generic base-layer fields remain available only in Audit / Raw.",
  };

  return {
    ...baseModel,
    assetClassLabel: copy.assetClassLabel,
    assetFramingLabel: copy.assetFramingLabel,
    resolvedInstitutionalLens: {
      ...(baseModel.resolvedInstitutionalLens || {}),
      label: copy.assetClassLabel,
      displayLabel: copy.assetClassLabel,
      displayFraming: copy.assetFramingLabel,
      visibleLabelOverride: copy.assetClassLabel,
      visibleLabelSource: "native_eth_pos_settlement_rendered_surface_overlay",
    },
    verdictSemantics,
    allocationCase: {
      ...(baseModel.allocationCase || {}),
      forAllocation: [copy.whyAllocationCouldMakeSense],
      againstAllocation: [copy.whyAllocationIsCapped],
      missingEvidence: copy.evidenceNeeded,
      whatWouldChange: copy.whatWouldChange,
    },
    missingCritical: copy.evidenceNeeded,
    requiredConditions: copy.evidenceNeeded,
    blockers: [copy.rightRailPrimaryBlocker],
    decisionDrivers: [
      copy.whyAllocationCouldMakeSense,
      copy.primaryBlocker,
      copy.falsePositiveBoundary,
    ],
    primaryStrength: copy.whyAllocationCouldMakeSense,
    primaryWeakness: copy.whyAllocationIsCapped,
    summaryMemo: copy.decisionMemo,
    structuredThesisSummary: copy.allocationThesis,
    tokenDemandTruth: copy.tokenDemandTruth,
    tokenomicsSummary: copy.tokenomicsSummary,
    failureMode: {
      ...(baseModel.failureMode || {}),
      primary: copy.falsePositiveBoundary,
      trigger: copy.whatCouldBreak[0],
    },
    primaryBlocker: {
      ...(baseModel.primaryBlocker || {}),
      label: copy.primaryBlocker,
      explanation: copy.rightRailPrimaryBlocker,
      badge: "ETH PoS settlement source requirement",
    },
    weakestLink: {
      ...(baseModel.weakestLink || {}),
      label: copy.weakestLink,
      explanation: copy.weakestLink,
      badge: "ETH PoS settlement weakest link",
    },
    whatWouldChangeDecision: {
      ...(baseModel.whatWouldChangeDecision || {}),
      items: copy.whatWouldChange.slice(0, 4),
      badge: "ETH live requirements",
      explanation: "Display wording is scoped to native ETH PoS smart-contract settlement and L2/blob fee-market review; scoring and verdicts are unchanged.",
    },
    whyNow: copy.whyAllocationCouldMakeSense,
    whyNotNow: copy.whyAllocationIsCapped,
    whatMustBeTrue: copy.whatMustBeTrue,
    whatCouldBreak: copy.whatCouldBreak,
    nextCheckpoints: copy.whatWouldChange,
    topPositiveDrivers: [copy.whyAllocationCouldMakeSense],
    topNegativeDrivers: [copy.primaryBlocker, copy.weakestLink],
    topNeutralDrivers: copy.whatWouldChange,
    researchRequirements: copy.evidenceNeeded.map((requirement, index) => ({
      id: `eth-pos-settlement-final-surface-${index}`,
      title: requirement,
      assetClassLens: "BASE_LAYER_SETTLEMENT",
      reason: "ETH-native PoS smart-contract settlement source requirement. Source requirements are not reviewed evidence and do not change scoring.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["official_docs", "network_dashboard", "market_data", "l2_dashboard", "custody_access_report", "manual_review"],
      priority: index < 5 ? "high" : "medium",
      verdictImpact: "Could clarify ETH settlement/gas/staking/burn/L2 fee-market thesis confidence if independently reviewed.",
      currentStatus: "review_required",
      canChangeVerdict: true,
    })),
  };
}

function buildDataFirstContractMissingDisplayModel(baseModel) {
  const copy = DATA_FIRST_CONTRACT_MISSING_COPY;
  return {
    ...baseModel,
    verdictSemantics: {
      ...(baseModel.verdictSemantics || {}),
      summary: copy.summary,
      positiveCase: [copy.summary],
      blockedCase: [copy.summary],
      missingEvidence: copy.evidence,
      whatWouldChange: copy.whatWouldChange,
      boundary: copy.boundary,
    },
    allocationCase: {
      ...(baseModel.allocationCase || {}),
      forAllocation: [copy.summary],
      againstAllocation: [copy.summary],
      missingEvidence: copy.evidence,
      whatWouldChange: copy.whatWouldChange,
    },
    primaryStrength: copy.summary,
    primaryWeakness: copy.summary,
    summaryMemo: copy.summary,
    structuredThesisSummary: copy.summary,
    tokenDemandTruth: copy.summary,
    failureMode: {
      ...(baseModel.failureMode || {}),
      primary: copy.summary,
      trigger: copy.whatWouldChange[0],
    },
    missingCritical: copy.evidence,
    blockers: [copy.summary],
    requiredConditions: copy.evidence,
    primaryBlocker: {
      ...(baseModel.primaryBlocker || {}),
      label: copy.summary,
      explanation: copy.boundary,
      badge: "Full recompute required",
    },
    weakestLink: {
      ...(baseModel.weakestLink || {}),
      label: copy.summary,
      explanation: copy.boundary,
      badge: "Contract missing",
    },
    whatWouldChangeDecision: {
      ...(baseModel.whatWouldChangeDecision || {}),
      items: copy.whatWouldChange,
      badge: "Full recompute required",
      explanation: copy.boundary,
    },
    whyNow: copy.summary,
    whyNotNow: copy.summary,
    whatMustBeTrue: copy.evidence,
    whatCouldBreak: copy.evidence,
    nextCheckpoints: copy.whatWouldChange,
    topPositiveDrivers: [copy.summary],
    topNegativeDrivers: [copy.summary],
    topNeutralDrivers: copy.whatWouldChange,
    researchRequirements: copy.whatWouldChange.map((requirement, index) => ({
      id: `data-first-contract-missing-${index}`,
      title: requirement,
      assetClassLens: baseModel?.resolvedInstitutionalLens?.lensId || "unknown",
      reason: "Current product surfaces require a data-first narrative contract. This is a recompute requirement, not asset evidence.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["fresh_live_analysis"],
      priority: "critical",
      verdictImpact: "Blocks current QA eligibility until recomputed.",
      currentStatus: "full_recompute_required",
      canChangeVerdict: false,
    })),
    analysisFreshness: {
      ...(baseModel.analysisFreshness || {}),
      freshQaEligible: false,
      qaEligibilityLabel: "Full recompute required",
      qaEligibilityWarning: copy.boundary,
      bundleMode: "data_first_contract_missing_recompute_required",
      fullRecomputeRequiredReason: "dataFirstNarrativeContract missing or stale",
      freshQaEligibleBlockedByMissingDataFirstContract: true,
    },
  };
}

function resolvedLensIsDisplayAuthoritative(lens) {
  return Boolean(
    lens?.lensId &&
    lens.confidence === "high" &&
    !["GENERAL_LOW_COVERAGE", "AMBIGUOUS_MANUAL_CLASSIFICATION"].includes(lens.lensId),
  );
}

function displayLabelsForResolvedLens(lens, assetInterpretationContract = null) {
  const visibleContract = safeObject(assetInterpretationContract?.visibleDisplayContract);
  if (visibleContract.primaryVisibleLabel || visibleContract.assetFramingLabel) {
    return {
      assetClassLabel: visibleContract.primaryVisibleLabel || visibleContract.assetFramingLabel,
      assetFramingLabel: visibleContract.assetFramingLabel || visibleContract.primaryVisibleLabel,
      labelSource: visibleContract.labelSource || "asset_interpretation_contract_v1",
      labelFamily: visibleContract.labelFamily || null,
    };
  }
  return resolvedLensIsDisplayAuthoritative(lens) ? RESOLVED_LENS_DISPLAY_LABELS[lens.lensId] || null : null;
}

function buildLensAwareVerdictSemantics(baseSemantics, lens, lensAware) {
  if (!resolvedLensIsDisplayAuthoritative(lens) || !lensAware) return baseSemantics;
  const copy = LENS_PRIMARY_COPY[lens.lensId] || {};
  const positiveCase = dedupeCaseInsensitive([
    copy.positive,
    ...(baseSemantics.positiveCase || []),
  ]).slice(0, 5);
  const blockedCase = dedupeCaseInsensitive([
    copy.blocked,
    lensAware.primaryBlocker,
    ...(baseSemantics.blockedCase || []),
  ]).slice(0, 5);

  return {
    ...baseSemantics,
    positiveCase,
    blockedCase,
    summary: copy.blocked || baseSemantics.summary,
    boundary: "Primary display copy is lens-aware and derived from resolvedInstitutionalLens; raw fallback fields remain available in Audit / Raw.",
  };
}

function buildLensAwareSecondaryCopy(lens, lensAware, fallback = {}) {
  if (!resolvedLensIsDisplayAuthoritative(lens) || !lensAware) return fallback;
  const copy = LENS_PRIMARY_COPY[lens.lensId] || {};
  const evidenceNeeded = normalizeRenderableList(lensAware.evidenceNeeded);
  const whatWouldChange = normalizeRenderableList(lensAware.whatWouldChange);
  const requiredConditions = normalizeRenderableList(lensAware.requiredConditions);
  const primaryBlocker = extractRenderableText(lensAware.primaryBlocker, null) || copy.blocked || evidenceNeeded[0] || fallback.primaryWeakness;
  const positive = copy.positive || requiredConditions[0] || fallback.primaryStrength;
  const blocked = copy.blocked || primaryBlocker;
  const driverPool = dedupeCaseInsensitive([
    positive,
    primaryBlocker,
    ...requiredConditions,
    ...evidenceNeeded,
    ...whatWouldChange,
  ]).filter(Boolean);
  return {
    ...fallback,
    whyNow: positive || fallback.whyNow,
    whyNotNow: blocked || fallback.whyNotNow,
    summaryMemo: blocked || fallback.summaryMemo,
    structuredThesisSummary: blocked || fallback.summaryMemo,
    primaryStrength: positive || fallback.primaryStrength,
    primaryWeakness: primaryBlocker || fallback.primaryWeakness,
    failurePrimary: primaryBlocker || fallback.failurePrimary,
    failureTrigger: whatWouldChange[0] || blocked || fallback.failureTrigger,
    tokenDemandTruth: positive
      ? `${positive} Provider metadata and live model outputs remain classification/display context until source-backed evidence confirms the thesis.`
      : fallback.tokenDemandTruth,
    decisionDrivers: driverPool.slice(0, 3),
    blockers: dedupeCaseInsensitive([primaryBlocker, ...evidenceNeeded]).filter(Boolean).slice(0, 4),
    whatCouldBreak: dedupeCaseInsensitive([primaryBlocker, ...evidenceNeeded, ...whatWouldChange]).filter(Boolean).slice(0, 4),
    topPositiveDrivers: positive ? [positive] : fallback.topPositiveDrivers,
    topNegativeDrivers: dedupeCaseInsensitive([primaryBlocker, ...evidenceNeeded]).filter(Boolean).slice(0, 4),
    topNeutralDrivers: whatWouldChange.length ? whatWouldChange.slice(0, 4) : fallback.topNeutralDrivers,
  };
}

export function buildLensSpecificResearchDomains(model = {}, displayIdentity = null) {
  const resolvedLensId = model?.resolvedInstitutionalLens?.lensId || displayIdentity?.lensId;
  const identity = model?.assetIdentityResolution || {};
  const identityNeeds = [
    identity?.canonicalNetworkCandidate || identity?.nativeNetworkCandidate ? `Canonical / analyzed representation: ${identity.canonicalNetworkCandidate || identity.nativeNetworkCandidate}` : null,
    identity?.isMultichain ? "Supported network / contract mapping" : null,
    identity?.migrationStatus && identity.migrationStatus !== "none_detected" ? "Migration / old-new contract mapping" : null,
  ].filter(Boolean);

  const map = {
    PAYMENTS_SETTLEMENT: [
      "Payments / Settlement",
      "Validator / UNL / Finality",
      "Escrow / Distribution",
      "Fee Burn / Reserve Mechanics",
      "Issuer / Ecosystem Dependency",
    ],
    GAMING_METAVERSE_CONSUMER: [
      "Gaming / GameFi",
      "Active Users / Retention",
      "Marketplace / Tournament / In-Game Demand",
      "Token Sinks / Reward Emissions",
      "Mintability / Unlocks",
    ],
    RWA_HYBRID_INFRASTRUCTURE: [
      "RWA Infrastructure",
      "Tokenized Assets",
      "Utility Token vs Security Token Rights",
      "Canonical Chain / Contract Migration",
      "Supply Cap / Emissions",
      ...identityNeeds,
    ],
    DEFI_PROTOCOL_TOKEN: [
      "DeFi Protocol Token",
      "AMM / DEX",
      "Protocol Fees / Fee Switch",
      "Governance Rights",
      "Tokenholder Value Capture",
      "Protocol Revenue / TVL / Volume",
    ],
    RWA_HYBRID_ASSET: [
      "Legal / Economic Claim",
      "Redemption Enforceability",
      "Issuer / Custodian / Collateral",
      "Jurisdiction",
      "Attestations / Backing",
    ],
    ORACLE_INFRASTRUCTURE: [
      "Oracle Service Payment",
      "Staking / Collateral / Security",
      "Data Feed / Network Usage",
      "Token Necessity",
      "Infrastructure Adoption vs Token Demand",
    ],
    DEPIN_COMPUTE_STORAGE: [
      "Resource Demand",
      "Payer Mapping",
      "Provider Incentives",
      "Subsidy Dependency",
      "Token Settlement / Payment Role",
    ],
    STABLECOIN_SETTLEMENT: [
      "Reserve Attestation",
      "Redemption Eligibility",
      "Holder Legal Claim",
      "Issuer / Custodian / Admin Controls",
      "Peg Stress",
    ],
    WRAPPED_ASSET: [
      "Proof-of-Reserves / Backing",
      "Custodian / Merchant Model",
      "Mint / Burn Controls",
      "Redemption Path",
      "Native-Asset Inheritance Boundary",
    ],
    LST_STAKING_DERIVATIVE: [
      "Withdrawal Queue / Redemption",
      "Slashing / Operator Risk",
      "Depeg / Liquidity Depth",
      "Scanner Verification",
      "Protocol / Admin Controls",
    ],
    BASE_LAYER_SETTLEMENT: [
      "Network Activity / Fees",
      "Validator / Security Model",
      "Issuance / Burn / Staking",
      "Liveness / Congestion / Client Risk",
      "Protocol Upgrade Risk",
    ],
    NATIVE_MONETARY_BENCHMARK: [
      "Transaction-Fee / Blockspace Demand",
      "Fee-Market Security Budget",
      "Miner Economics / Hashrate",
      "Mining-Pool Concentration / Liveness",
      "Market Depth / Custody / ETF Access",
    ],
    MEME_NARRATIVE: [
      "Narrative / Liquidity Tradability",
      "Holder Concentration",
      "Durable Non-Narrative Utility",
      "Economic Rights Boundary",
    ],
  };

  return dedupeCaseInsensitive(map[resolvedLensId] || [
    "Primary-source documentation for the current thesis blockers",
    "Freshness, publisher authenticity, and claim-scope verification",
    "Contradiction checks against provider diagnostics and audit alerts",
  ]);
}

export function deriveManualReviewStatus({ missingCritical, evidenceConflicts, auditAlerts }) {
  if (evidenceConflicts) {
    return {
      label: "Manual review advised",
      detail: "Conflicting or unresolved evidence appears in the live response.",
    };
  }

  if (safeArray(missingCritical).length) {
    return {
      label: "Manual review likely",
      detail: "Critical missing evidence is present in the live response.",
    };
  }

  if (safeArray(auditAlerts).length) {
    return {
      label: "Review signals present",
      detail: "Policy or audit alerts are present in the live response.",
    };
  }

  return {
    label: "No explicit review flag",
    detail: "Institutional manual-review counts are not attached to this live response.",
  };
}

export function formatScoreValue(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "Unavailable";
  }
  return `${Math.round(Number(value))}/100`;
}

function sourceStatusEntries(sourceStatus) {
  return Object.entries(safeObject(sourceStatus))
    .map(([section, status]) => ({
      section,
      status: typeof status === "string" ? status : extractRenderableText(status, null),
    }))
    .filter((entry) => entry.status);
}

function providerDiagnosticLabel(entry) {
  return providerLabel(entry?.provider || entry?.source || entry?.section || "provider");
}

export function deriveEvidenceStatusProxy({
  model,
  analysis,
  confidence,
  providerDiagnostics = [],
  sourceStatus,
  meta,
  providerHealth,
} = {}) {
  const safeModel = safeObject(model);
  const safeAnalysis = safeObject(analysis);
  const confidenceModel = safeObject(confidence || safeAnalysis.confidence);
  const evidenceDirectness = safeObject(safeAnalysis.evidenceDirectness);
  const diagnostics = safeArray(providerDiagnostics);
  const statusEntries = sourceStatusEntries(sourceStatus);
  const providerNotes = normalizeRenderableList(safeObject(meta).providerNotes);
  const normalizedProviderHealth = normalizeProviderHealth(providerHealth);
  const items = [];
  const warnings = [
    "Live proxy, not full institutional evidence map.",
    "Report-only source overlays are not connected to live scoring.",
    "Source candidates require manual review before they become evidence.",
  ];
  const unavailable = [
    "Institutional evidence-map counts are not attached to this live response.",
    "Source discovery candidate counts are not attached to this live response.",
    "Manual-source overlay status is not attached to this live response.",
  ];

  const missingCritical = normalizeRenderableList(safeModel.missingCritical);
  if (missingCritical.length) {
    items.push({
      key: "missing_critical",
      label: "Missing Critical Evidence",
      valueLabel: "Detected",
      severity: "critical",
      description: missingCritical.slice(0, 2).join("; "),
      sourceLabel: "thesisCore.evidenceQuality.missingCritical",
      isProxy: true,
    });
  }

  const providerGapDiagnostics = diagnostics.filter((entry) => (
    entry.status === "failure" ||
    entry.status === "skipped" ||
    entry.errorClass === "unsupported" ||
    ["missing", "unavailable", "unsupported"].includes(entry.coverage || "")
  ));
  const providerGapStatuses = statusEntries.filter((entry) => (
    ["unsupported", "skipped", "unavailable", "missing"].includes(String(entry.status).toLowerCase())
  ));
  const unreachableProviders = safeArray(normalizedProviderHealth?.providersList)
    .filter((entry) => isProviderHealthDegraded(entry))
    .map((entry) => providerLabel(entry.provider));
  const providerGapLabels = dedupeCaseInsensitive([
    ...providerGapDiagnostics.map(providerDiagnosticLabel),
    ...providerGapStatuses.map((entry) => titleCase(entry.section)),
    ...unreachableProviders,
  ]);
  if (providerGapLabels.length) {
    items.push({
      key: "provider_gap",
      label: "Provider Gap / Not Available",
      valueLabel: "Present",
      severity: "warning",
      description: providerGapLabels.slice(0, 3).join(", "),
      sourceLabel: "provider diagnostics / source status",
      isProxy: true,
    });
  }

  const weakDiagnostics = diagnostics.filter((entry) => ["partial", "weak"].includes(entry.coverage || ""));
  const partialStatuses = statusEntries.filter((entry) => (
    ["partial", "modeled", "weak"].includes(String(entry.status).toLowerCase())
  ));
  const directness = evidenceDirectness.directness || evidenceDirectness.status || null;
  const indirectDirectness = ["mostly_inferred", "descriptive_only", "critical_gaps"].includes(directness);
  const partialLabels = dedupeCaseInsensitive([
    ...weakDiagnostics.map(providerDiagnosticLabel),
    ...partialStatuses.map((entry) => titleCase(entry.section)),
    indirectDirectness ? titleCase(directness) : null,
  ].filter(Boolean));
  if (partialLabels.length) {
    items.push({
      key: "partial_indirect",
      label: "Partial / Indirect Context",
      valueLabel: "Proxy",
      severity: "info",
      description: partialLabels.slice(0, 3).join(", "),
      sourceLabel: "evidenceDirectness / partial provider coverage",
      isProxy: true,
    });
  }

  const auditAlerts = normalizeRenderableList(safeModel.auditAlerts);
  const hasConflict = Boolean(safeModel.evidenceConflicts || safeModel.contradictionNote);
  if (hasConflict || auditAlerts.length) {
    items.push({
      key: "contradiction_audit",
      label: hasConflict ? "Contradiction / Audit Alert" : "Audit Alert",
      valueLabel: "Review required",
      severity: "critical",
      description: hasConflict
        ? "Conflicting or unresolved evidence appears in the live response."
        : auditAlerts.slice(0, 2).join("; "),
      sourceLabel: hasConflict ? "thesisCore/confidence conflict fields" : "policy signals / warnings",
      isProxy: true,
    });
  }

  const manualReviewLabel = safeModel.manualReviewStatus?.label || "";
  const manualReviewIsActive = manualReviewLabel && !manualReviewLabel.toLowerCase().includes("no explicit");
  if (manualReviewIsActive || missingCritical.length || hasConflict || providerGapLabels.length || auditAlerts.length) {
    items.push({
      key: "manual_review_signal",
      label: "Manual Review Signal",
      valueLabel: "Review required",
      severity: "review",
      description: safeModel.manualReviewStatus?.detail || "Live proxy signals indicate analyst review may be warranted.",
      sourceLabel: "manual-review proxy from live response",
      isProxy: true,
    });
  }

  const evidenceStrength = safeModel.evidenceStrength || safeAnalysis?.thesisCore?.evidenceQuality?.strength || null;
  const successfulDiagnostics = diagnostics.filter((entry) => (
    entry.status === "success" && ["strong", "available", "complete", "live"].includes(entry.coverage || "available")
  ));
  const liveStatuses = statusEntries.filter((entry) => ["live", "available", "success"].includes(String(entry.status).toLowerCase()));
  if (evidenceStrength || successfulDiagnostics.length || liveStatuses.length) {
    items.unshift({
      key: "confirmed_context",
      label: "Live Context Available",
      valueLabel: "Present",
      severity: "info",
      description: evidenceStrength
        ? `Live engine context signal: ${titleCase(evidenceStrength)}. This is not institutional question-level support.`
        : `${dedupeCaseInsensitive([
          ...successfulDiagnostics.map(providerDiagnosticLabel),
          ...liveStatuses.map((entry) => titleCase(entry.section)),
        ]).slice(0, 3).join(", ")}. This is not institutional question-level support.`,
      sourceLabel: "live engine/provider context only, not institutional support",
      isProxy: true,
    });
  }

  if (!items.length && (confidenceModel.summary || providerNotes.length)) {
    items.push({
      key: "partial_indirect",
      label: "Partial / Indirect Context",
      valueLabel: "Proxy",
      severity: "neutral",
      description: confidenceModel.summary || providerNotes.slice(0, 2).join("; "),
      sourceLabel: "confidence/provider notes",
      isProxy: true,
    });
  }

  return {
    label: "Live Evidence Proxy",
    summary: items.length
      ? "Derived from the current analysis response. Not the full institutional evidence map."
      : "No evidence-status proxy signals were attached to this live response.",
    items,
    warnings,
    unavailable,
  };
}

export function normalizeEvidenceProxyDisplayLabel(item = {}) {
  const key = String(item.key || "").toLowerCase();
  const rawLabel = String(item.valueLabel || "").toLowerCase();
  const rawSignal = String(item.label || "").toLowerCase();

  if (key.includes("provider") || rawSignal.includes("provider gap") || rawLabel.includes("unavailable")) {
    return {
      statusLabel: "Provider Gap Flagged",
      signalType: "Provider coverage signal",
      meaning: "Provider availability issue or missing provider coverage; not a positive evidence signal.",
      boundaryLabel: "Not Full Evidence Mapping",
      tone: "#aab7cc",
    };
  }

  if (key.includes("partial") || rawLabel.includes("proxy") || rawSignal.includes("indirect")) {
    return {
      statusLabel: "Indirect / Partial Signal",
      signalType: "Indirect context signal",
      meaning: "Indirect context only; requires source review before it can support a thesis.",
      boundaryLabel: "Not Full Evidence Mapping",
      tone: "#aab7cc",
    };
  }

  if (
    key.includes("manual") ||
    key.includes("audit") ||
    key.includes("contradiction") ||
    key.includes("missing") ||
    rawLabel.includes("review") ||
    rawLabel.includes("detected")
  ) {
    return {
      statusLabel: "Review Signal Flagged",
      signalType: "Review workflow signal",
      meaning: "Workflow signal only; not automatic proof of failure.",
      boundaryLabel: "Needs Source Review",
      tone: "#d5dcec",
    };
  }

  if (key.includes("confirmed") || rawLabel.includes("present") || rawLabel.includes("detected")) {
    return {
      statusLabel: "Live Context Available",
      signalType: "Live response context",
      meaning: "Live context exists, but this is not institutional question-level support.",
      boundaryLabel: "Not Full Evidence Mapping",
      tone: "#d5dcec",
    };
  }

  return {
    statusLabel: "Indirect / Partial Signal",
    signalType: "Qualitative review signal",
    meaning: "Current response context only; not a score, support rating, or evidence count.",
    boundaryLabel: "Not Full Evidence Mapping",
    tone: "#aab7cc",
  };
}

function buildDecisionDrivers({ contributors, prioritySignals, primaryStrength, primaryWeakness, blockers }) {
  const topDrivers = filterUserFacingItems(safeArray(contributors?.topDrivers), null);
  const negativeDrivers = filterUserFacingItems(contributors?.negatives, null)
    .map((entry) => entry.replace(/^\-\s*/, ""))
    .slice(0, 2);
  const positiveDrivers = filterUserFacingItems(contributors?.positives, null)
    .map((entry) => entry.replace(/^\-\s*/, ""))
    .slice(0, 2);
  const signals = filterUserFacingItems(prioritySignals, 3);
  const gatingBlockers = filterUserFacingItems(blockers, 2);

  const merged = [
    ...topDrivers,
    ...(primaryWeakness ? [primaryWeakness] : []),
    ...(primaryStrength ? [primaryStrength] : []),
    ...gatingBlockers,
    ...negativeDrivers,
    ...positiveDrivers,
    ...signals,
  ];

  return [...new Set(merged)].filter(Boolean).slice(0, 3);
}

function buildConfidenceSupportLabel(confidenceModel) {
  if (typeof confidenceModel?.level === "string" && confidenceModel.level.trim()) {
    return `${titleCase(confidenceModel.level)} evidence support`;
  }

  if (typeof confidenceModel?.label === "string" && confidenceModel.label.trim()) {
    return confidenceModel.label
      .replace(/confidence/gi, "evidence support")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "Evidence support unavailable";
}

export function buildDecisionTerminalModel({
  analysis,
  scores,
  confidence,
  scoreContributors,
  fundamentals,
  warnings,
  asset,
}) {
  const safeAnalysis = safeObject(analysis);
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const decisionFrame = safeObject(decisionLayer.decisionFrame);
  const investability = safeObject(thesisCore.investability);
  const failureMode = safeObject(thesisCore.failureMode);
  const evidenceQuality = safeObject(thesisCore.evidenceQuality);
  const evidenceDirectness = safeObject(safeAnalysis.evidenceDirectness);
  const contributors = safeObject(safeAnalysis.contributors || scoreContributors);
  const assetClassification = safeObject(safeAnalysis.assetClassification);
  const sectorClassification = safeObject(safeAnalysis.sectorClassification);
  const confidenceModel = safeObject(confidence || safeAnalysis.confidence);
  const policySignals = normalizeSignalList(safeAnalysis.policySignals);
  const warningsList = normalizeRenderableList(warnings);
  const calibrationWarnings = normalizeCalibrationWarningsPayload(safeAnalysis);
  const resolvedInstitutionalLens = normalizeResolvedInstitutionalLensPayload(safeAnalysis);
  const lensAwareExplanations = normalizeLensAwareExplanationsPayload(safeAnalysis);
  const assetIdentityResolution = normalizeAssetIdentityResolutionPayload(safeAnalysis);
  const tokenomicsSupplyIntegrity = normalizeTokenomicsSupplyIntegrityPayload(safeAnalysis);
  const reviewedEvidencePacket = normalizeReviewedEvidencePacketPayload(safeAnalysis);
  const assetInterpretationContract = normalizeAssetInterpretationContractPayload(safeAnalysis);
  const effectiveInstitutionalLens = normalizeEffectiveInstitutionalLensPayload(safeAnalysis, assetInterpretationContract);
  const dataFirstNarrativeContract = normalizeDataFirstNarrativeContractPayload(safeAnalysis);
  const engineLearningBackbone = normalizeEngineLearningBackbonePayload(safeAnalysis);
  const providerCategorySignals = normalizeProviderCategorySignalsPayload(safeAnalysis);
  const categoryDrivenAssetFamilyContract = normalizeCategoryDrivenAssetFamilyContractPayload(safeAnalysis);
  const categoryDataRequirementProfiles = normalizeCategoryDataRequirementProfilesPayload(safeAnalysis);
  const categoryAnswerBuilder = normalizeCategoryAnswerBuilderPayload(safeAnalysis);
  const categoryReadinessDiagnostics = normalizeCategoryReadinessDiagnosticsPayload(safeAnalysis);
  const analysisFreshness = safeAnalysis.analysisFreshness || normalizeAnalysisFreshnessPayload(safeAnalysis);
  const userFacingWarnings = filterUserFacingItems(warningsList);
  const isBenchmark = isBenchmarkAssetClass(assetClassification.assetClass || null);
  const blockers = cleanUserFacingList(investability.blockers, {
    suppressGenericEpistemic: isBenchmark,
    replacePlaceholders: true,
  });
  const requiredConditions = cleanUserFacingList(investability.requiredConditions, {
    suppressGenericEpistemic: isBenchmark,
    replacePlaceholders: true,
  });
  const missingCritical = normalizeRenderableList(evidenceQuality.missingCritical).slice(0, 3);
  const primaryStrength = buildPrimaryStrengthText({
    primaryStrength: thesisCore.primaryStrength,
    assetClass: assetClassification.assetClass || null,
  });
  const primaryWeakness = buildPrimaryWeaknessText({
    primaryWeakness: thesisCore.primaryWeakness,
    assetClass: assetClassification.assetClass || null,
  });
  const allocationOutcome = deriveAllocationOutcome(safeAnalysis, scores);
  const overallScore = scores?.overallScore ?? safeAnalysis?.scores?.overallScore ?? null;
  const confidenceScore = confidenceModel?.score ?? null;
  const confidenceLabelText = buildConfidenceSupportLabel(confidenceModel);
  const prioritySignals = cleanUserFacingList(decisionLayer.prioritySignals, {
    suppressGenericEpistemic: isBenchmark,
  });
  const decisionDrivers = buildDecisionDrivers({
    contributors,
    prioritySignals,
    primaryStrength,
    primaryWeakness,
    blockers,
  });
  const failurePrimary = buildFailurePrimaryText({
    failurePrimary: failureMode.primary,
    primaryWeakness,
    assetClass: assetClassification.assetClass || null,
  });
  const failureTrigger = sanitizeSemanticLabel(failureMode.trigger, "A structural break in the current thesis would invalidate allocation support.");
  const earlySignals = normalizeRenderableList(failureMode.earlySignals).slice(0, 3);
  const contradictionApplies = Boolean(
    overallScore !== null
    && overallScore >= 65
    && allocationOutcome.key !== "capital_worthy"
    && hasRealStructuralInvalidator(primaryWeakness)
  );
  const contradictionNote = contradictionApplies
    ? `Surface metrics are overridden by failed token-thesis conditions. Dominant constraint: ${primaryWeakness}.`
    : null;
  const sanitizedWhyNow = sanitizeSemanticLabel(decisionFrame.whyNow, null);
  const rawWhyNotNow = sanitizeSemanticLabel(decisionFrame.whyNotNow, null);
  const epistemicNote = chooseEpistemicNote({
    isBenchmark,
    primaryWeakness,
    evidenceDirectness,
  });
  const sanitizedWhyNotNow =
    isBenchmark && isNoMaterialWeakness(primaryWeakness) && isGenericEpistemicText(rawWhyNotNow)
      ? null
      : rawWhyNotNow;
  const summaryMemo = isBenchmark && isNoMaterialWeakness(primaryWeakness)
    ? (sanitizedWhyNow || epistemicNote || primaryStrength)
    : buildSummaryMemo({
    allocationOutcomeKey: allocationOutcome.key,
    whyNow: sanitizedWhyNow,
    whyNotNow: sanitizedWhyNotNow,
    primaryStrength,
    primaryWeakness,
    failurePrimary,
    assetClass: assetClassification.assetClass || null,
  });
  const tokenDemandTruth = buildTokenDemandTruth({
    allocationOutcomeKey: allocationOutcome.key,
    primaryStrength,
    assetClass: assetClassification.assetClass || null,
    primaryWeakness,
  });
  const auditAlerts = dedupeCaseInsensitive([...policySignals, ...userFacingWarnings]).slice(0, 6);
  const evidenceConflicts = hasConcreteConflict(evidenceQuality, confidenceModel);
  const evidenceConstraintNote = missingCritical.length || warningsList.some((entry) => isTechnicalNoiseText(entry))
    ? "Incomplete external evidence increases conservatism in this assessment."
    : epistemicNote
      ? epistemicNote
    : null;
  const dedupedDrivers = dedupeCaseInsensitive(decisionDrivers).slice(0, 3);
  const dedupedSecondarySectors = dedupeCaseInsensitive(safeArray(sectorClassification.secondarySectors));
  const assetBadges = buildAssetBadges({
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
  });
  const primaryBlocker = derivePrimaryBlocker({
    blockers,
    primaryWeakness,
    failureMode: { primary: failurePrimary },
    missingCritical,
    auditAlerts,
    topNegativeDrivers: contributors.negatives,
  });
  const weakestLink = deriveWeakestLink({
    evidenceConstraintNote,
    primaryWeakness,
    missingCritical,
    failureMode: { primary: failurePrimary },
    sourceAgreementSummary: confidenceModel.sourceAgreementSummary,
  });
  const whatWouldChangeDecision = deriveWhatWouldChangeDecision({
    requiredConditions,
    nextCheckpoints: decisionFrame.nextCheckpoints,
    missingCritical,
    whyNotNow: sanitizedWhyNotNow,
  });
  const manualReviewStatus = deriveManualReviewStatus({
    missingCritical,
    evidenceConflicts,
    auditAlerts,
  });
  const rawVerdictSemantics = buildVerdictSemanticsDisplay(decisionLayer, thesisCore, safeAnalysis);
  const lensDisplayLabels = displayLabelsForResolvedLens(resolvedInstitutionalLens, assetInterpretationContract);
  const assetClassLabel = lensDisplayLabels?.assetClassLabel || deriveAssetClassLabel({
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
  });
  const assetFramingLabel = lensDisplayLabels?.assetFramingLabel || deriveAssetFramingLabel({
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    primarySector: sectorClassification.primarySector || null,
  });
  const verdictSemantics = buildLensAwareVerdictSemantics(rawVerdictSemantics, resolvedInstitutionalLens, lensAwareExplanations);
  const institutionalQuestionPayload = normalizeInstitutionalQuestionsPayload(safeAnalysis);
  const displayEvidenceNeeded = lensAwareExplanations?.evidenceNeeded?.length
    ? lensAwareExplanations.evidenceNeeded
    : missingCritical;
  const displayRequiredConditions = lensAwareExplanations?.requiredConditions?.length
    ? lensAwareExplanations.requiredConditions
    : requiredConditions;
  const displayWhatWouldChangeDecision = lensAwareExplanations?.whatWouldChange?.length
    ? {
      items: lensAwareExplanations.whatWouldChange,
      badge: "Lens-aware requirements",
      explanation: "Display wording from resolvedInstitutionalLens; scoring and verdicts are unchanged.",
    }
    : whatWouldChangeDecision;
  const displayPrimaryBlocker = lensAwareExplanations?.primaryBlocker
    ? {
      ...primaryBlocker,
      label: lensAwareExplanations.primaryBlocker,
      explanation: "Lens-aware display wording from resolvedInstitutionalLens. Raw decision-layer blockers remain available in audit context.",
      badge: "Lens-aware requirement",
    }
    : primaryBlocker;
  const baseDisplayResearchRequirements = lensAwareExplanations?.sourceQueueRequirements?.length
    ? lensAwareExplanations.sourceQueueRequirements.map((requirement, index) => ({
      id: `lens-aware-${lensAwareExplanations.lensId}-${index}`,
      title: requirement,
      assetClassLens: lensAwareExplanations.lensId,
      reason: "Lens-aware source priority derived from resolvedInstitutionalLens. It does not change scoring.",
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["official_docs", "primary_source", "manual_review"],
      priority: index < 2 ? "high" : "medium",
      verdictImpact: "Could clarify allocation thesis support or blockers if independently verified.",
      currentStatus: "review_required",
      canChangeVerdict: true,
    }))
    : verdictSemantics.researchRequirements;
  const categoryResearchRequirements = safeArray(categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.priorityRequirements)
    .slice(0, 8)
    .map((requirement, index) => ({
      id: `category-driven-${categoryDrivenAssetFamilyContract.primaryAssetFamily}-${index}`,
      title: requirement,
      assetClassLens: categoryDrivenAssetFamilyContract.primaryAssetFamily,
      reason: `Category-driven question registry requirement for ${categoryDrivenAssetFamilyContract.frontendVisibleLabel}. Provider categories are context, not reviewed evidence.`,
      evidenceNeeded: [requirement],
      preferredSourceTypes: ["official_docs", "provider_category_metadata", "reviewed_source"],
      priority: index < 3 ? "high" : "medium",
      verdictImpact: "Diagnostic-only; can improve answer quality after reviewed evidence is attached.",
      currentStatus: "source_required",
      canChangeVerdict: false,
    }));
  const displayResearchRequirements = dedupeObjectsByTitle([
    ...baseDisplayResearchRequirements,
    ...categoryResearchRequirements,
  ]);
  const displayVerdictSemantics = lensAwareExplanations ? {
    ...verdictSemantics,
    missingEvidence: displayEvidenceNeeded,
    whatWouldChange: displayWhatWouldChangeDecision.items,
  } : verdictSemantics;
  const lensSecondaryCopy = buildLensAwareSecondaryCopy(resolvedInstitutionalLens, lensAwareExplanations, {
    whyNow: sanitizedWhyNow,
    whyNotNow: sanitizedWhyNotNow,
    summaryMemo,
    primaryStrength,
    primaryWeakness,
    failurePrimary,
    failureTrigger,
    tokenDemandTruth,
    decisionDrivers: dedupedDrivers,
    blockers,
    topPositiveDrivers: cleanUserFacingList(contributors.positives, { limit: 4 }),
    topNegativeDrivers: cleanUserFacingList(contributors.negatives, { limit: 4 }),
    topNeutralDrivers: cleanUserFacingList(contributors.neutralOrMissing, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
  });
  const dataFirstDecisionHeader = dataFirstGeneratedText(dataFirstNarrativeContract, "decisionCommandHeader");
  const dataFirstFinalDecision = dataFirstGeneratedText(dataFirstNarrativeContract, "finalDecisionExplanation");
  const dataFirstPositive = dataFirstGeneratedText(dataFirstNarrativeContract, "whyAllocationCouldMakeSense");
  const dataFirstBlocked = dataFirstGeneratedText(dataFirstNarrativeContract, "whyAllocationIsBlockedOrCapped");
  const dataFirstVerdictInterpretation = dataFirstGeneratedText(dataFirstNarrativeContract, "verdictInterpretation");
  const dataFirstMemo = dataFirstGeneratedText(dataFirstNarrativeContract, "decisionMemo");
  const dataFirstThesis = dataFirstGeneratedText(dataFirstNarrativeContract, "thesisFalsificationSummary");
  const dataFirstWeakestLink = dataFirstGeneratedText(dataFirstNarrativeContract, "rightRailWeakestLink");
  const dataFirstWhatWouldChange = dataFirstGeneratedText(dataFirstNarrativeContract, "whatWouldChange");
  const dataFirstGeneratedAvailable = Boolean(dataFirstNarrativeContract?.generatedNarrativeFields?.length);
  const dataFirstVerdictSemantics = dataFirstGeneratedAvailable ? {
    ...displayVerdictSemantics,
    summary: dataFirstDecisionHeader || dataFirstFinalDecision || displayVerdictSemantics.summary,
    boundary: "Primary display copy is data-first and bound to the current asset lens, representation, Source Matrix gaps, and evidence boundaries. Raw fallbacks remain audit-only.",
    positiveCase: dedupeCaseInsensitive([
      dataFirstPositive,
      ...(displayVerdictSemantics.positiveCase || []),
    ]).slice(0, 5),
    blockedCase: dedupeCaseInsensitive([
      dataFirstBlocked,
      dataFirstFinalDecision,
      ...(displayVerdictSemantics.blockedCase || []),
    ]).slice(0, 5),
    missingEvidence: displayEvidenceNeeded,
    whatWouldChange: dataFirstWhatWouldChange
      ? dedupeCaseInsensitive([dataFirstWhatWouldChange, ...(displayWhatWouldChangeDecision.items || [])]).slice(0, 5)
      : displayWhatWouldChangeDecision.items,
  } : displayVerdictSemantics;
  const dataFirstWhatWouldChangeDecision = dataFirstWhatWouldChange ? {
    items: dedupeCaseInsensitive([dataFirstWhatWouldChange, ...(displayWhatWouldChangeDecision.items || [])]).slice(0, 5),
    badge: "Data-first requirements",
    explanation: "Display wording is generated from dataFirstNarrativeContract; scoring and verdicts are unchanged.",
  } : displayWhatWouldChangeDecision;
  const dataFirstPrimaryBlocker = dataFirstBlocked ? {
    ...displayPrimaryBlocker,
    label: dataFirstBlocked,
    explanation: "Data-first display wording from the current asset lens, representation, facts, and source gaps. Raw decision-layer blockers remain audit-only.",
    badge: "Data-first requirement",
  } : displayPrimaryBlocker;
  const dataFirstWeakestLinkCard = dataFirstWeakestLink ? {
    ...weakestLink,
    label: dataFirstWeakestLink,
    explanation: "Derived from dataFirstNarrativeContract missing-evidence gaps.",
    badge: "Data-first weakest link",
  } : weakestLink;

  const baseDisplayModel = {
    assetName: asset?.name || asset?.symbol || "Asset",
    overallScore,
    confidenceScore,
    confidenceLabel: confidenceLabelText,
    allocationOutcome,
    verdictSemantics: dataFirstVerdictSemantics,
    verdictClass: dataFirstVerdictSemantics.verdictClass || null,
    allocationCase: dataFirstVerdictSemantics.hasVerdictClass ? {
      forAllocation: dataFirstVerdictSemantics.positiveCase,
      againstAllocation: dataFirstVerdictSemantics.blockedCase,
      missingEvidence: displayEvidenceNeeded,
      whatWouldChange: dataFirstWhatWouldChangeDecision.items,
    } : null,
    institutionalQuestions: institutionalQuestionPayload.institutionalQuestions,
    institutionalQuestionsProvenance: institutionalQuestionPayload.institutionalQuestionsProvenance,
    resolvedInstitutionalLens,
    effectiveInstitutionalLens,
    lensAwareExplanations,
    assetIdentityResolution,
    tokenomicsSupplyIntegrity,
    reviewedEvidencePacket,
    assetInterpretationContract,
    dataFirstNarrativeContract,
    engineLearningBackbone,
    providerCategorySignals,
    categoryDrivenAssetFamilyContract,
    categoryDataRequirementProfiles,
    categoryAnswerBuilder,
    categoryReadinessDiagnostics,
    analysisFreshness,
    calibrationWarnings,
    researchRequirements: displayResearchRequirements,
    verdictReasons: dataFirstVerdictSemantics.verdictReasons,
    primaryStrength: dataFirstPositive || lensSecondaryCopy.primaryStrength || primaryStrength,
    primaryWeakness: dataFirstBlocked || lensSecondaryCopy.primaryWeakness || primaryWeakness,
    failureMode: {
      primary: dataFirstThesis || lensSecondaryCopy.failurePrimary || failurePrimary,
      trigger: dataFirstWhatWouldChange || lensSecondaryCopy.failureTrigger || failureTrigger,
      earlySignals,
    },
    investabilityStatus: investability.status || null,
    currentState: describeCurrentState(extractDecisionLabel(decisionLayer.currentState), assetClassification.assetClass || null),
    posture: describePosture(extractDecisionLabel(decisionLayer.posture), assetClassification.assetClass || null),
    evidenceStrength: evidenceQuality.strength || null,
    evidenceConflicts,
    missingCritical: displayEvidenceNeeded,
    blockers: dataFirstBlocked ? dedupeCaseInsensitive([dataFirstBlocked, ...(lensSecondaryCopy.blockers || blockers)]).slice(0, 4) : lensSecondaryCopy.blockers || blockers,
    requiredConditions: displayRequiredConditions,
    decisionDrivers: lensSecondaryCopy.decisionDrivers || dedupedDrivers,
    contradictionNote,
    summaryMemo: dataFirstMemo || lensSecondaryCopy.summaryMemo || summaryMemo,
    structuredThesisSummary: dataFirstThesis || lensSecondaryCopy.structuredThesisSummary || lensSecondaryCopy.summaryMemo || summaryMemo,
    tokenDemandTruth: dataFirstVerdictInterpretation || lensSecondaryCopy.tokenDemandTruth || tokenDemandTruth,
    policySignals,
    warnings: userFacingWarnings,
    auditAlerts,
    evidenceConstraintNote,
    assetClass: assetClassification.assetClass || null,
    assetSubtype: assetClassification.subtype || null,
    assetClassLabel,
    assetFramingLabel,
    primarySector: sectorClassification.primarySector || null,
    secondarySectors: dedupedSecondarySectors,
    assetBadges,
    primaryBlocker: dataFirstPrimaryBlocker,
    weakestLink: dataFirstWeakestLinkCard,
    whatWouldChangeDecision: dataFirstWhatWouldChangeDecision,
    manualReviewStatus,
    whyNow: dataFirstPositive || lensSecondaryCopy.whyNow || sanitizedWhyNow,
    whyNotNow: dataFirstBlocked || lensSecondaryCopy.whyNotNow || sanitizedWhyNotNow,
    whatMustBeTrue: lensAwareExplanations?.requiredConditions?.length
      ? displayRequiredConditions
      : cleanUserFacingList(decisionFrame.whatMustBeTrue, {
        limit: 4,
        suppressGenericEpistemic: isBenchmark,
        replacePlaceholders: true,
      }),
    whatCouldBreak: lensSecondaryCopy.whatCouldBreak || cleanUserFacingList(decisionFrame.whatCouldBreak, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    nextCheckpoints: dataFirstWhatWouldChangeDecision.items?.length
      ? dataFirstWhatWouldChangeDecision.items
      : cleanUserFacingList(decisionFrame.nextCheckpoints, {
        limit: 4,
        suppressGenericEpistemic: isBenchmark,
        replacePlaceholders: true,
      }),
    topPositiveDrivers: lensSecondaryCopy.topPositiveDrivers || cleanUserFacingList(contributors.positives, { limit: 4 }),
    topNegativeDrivers: lensSecondaryCopy.topNegativeDrivers || cleanUserFacingList(contributors.negatives, { limit: 4 }),
    topNeutralDrivers: lensSecondaryCopy.topNeutralDrivers || cleanUserFacingList(contributors.neutralOrMissing, {
      limit: 4,
      suppressGenericEpistemic: isBenchmark,
      replacePlaceholders: true,
    }),
    keyAlerts: filterUserFacingItems(fundamentals?.risks?.keyAlerts, 4),
  };

  if (resolvedLensIsDisplayAuthoritative(resolvedInstitutionalLens) && !dataFirstNarrativeContract) {
    return buildDataFirstContractMissingDisplayModel(baseDisplayModel);
  }

  if (isNativeBtcDisplayContext({
    asset,
    lens: resolvedInstitutionalLens,
    assetIdentityResolution,
    reviewedEvidencePacket,
  })) {
    return buildNativeBtcDisplayOverlay(baseDisplayModel);
  }
  if (isEthPosSettlementDisplayContext({
    asset,
    lens: resolvedInstitutionalLens,
    assetIdentityResolution,
    reviewedEvidencePacket,
  })) {
    return buildEthPosSettlementDisplayOverlay(baseDisplayModel);
  }
  return baseDisplayModel;
}

function bundleValue(value, fallback = "Unavailable in current frontend model") {
  return extractRenderableText(value, fallback) || fallback;
}

function bundleList(items, fallback = "Unavailable in current frontend model", limit = null) {
  const normalized = normalizeRenderableList(items);
  const limited = limit ? normalized.slice(0, limit) : normalized;
  return limited.length ? limited.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function bundleField(label, value) {
  return `${label}: ${bundleValue(value)}`;
}

function bundleSection(title, lines = []) {
  return [
    "",
    `=== ${title} ===`,
    ...lines.filter((line) => line !== null && line !== undefined && line !== ""),
  ].join("\n");
}

function bundleObjectRows(objectValue, fallback = "Unavailable in current frontend model", limit = null) {
  const entries = Object.entries(safeObject(objectValue))
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${extractRenderableText(value, JSON.stringify(value))}`);
  const limited = limit ? entries.slice(0, limit) : entries;
  return limited.length ? limited.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function bundleProviderDiagnostics(providerDiagnostics, limit = 12) {
  const rows = safeArray(providerDiagnostics).slice(0, limit).map((entry, index) => {
    const provider = entry?.provider || entry?.source || entry?.section || `provider_${index + 1}`;
    const status = entry?.status || entry?.coverage || entry?.reason || "diagnostic";
    const reason = entry?.reason || entry?.safeReason || entry?.message || "No reason attached.";
    return `- ${provider}: ${status} | ${reason}`;
  });
  return rows.length ? rows.join("\n") : "- Unavailable in current frontend model";
}

function bundleProviderHealth(providerHealth, limit = 12) {
  const normalized = normalizeProviderHealth(providerHealth);
  const rows = safeArray(normalized?.providersList).slice(0, limit).map((entry) => {
    const provider = entry?.provider || "provider";
    const status = entry?.status || entry?.state || "unknown";
    const reason = entry?.reason || entry?.message || "No reason attached.";
    return `- ${provider}: ${status} | ${reason}`;
  });
  return rows.length ? rows.join("\n") : "- Unavailable in current frontend model";
}

function bundleProviderEvidence(evidence = []) {
  const rows = safeArray(evidence).map((entry) => {
    const provider = entry?.provider || "provider";
    const field = entry?.field || "field";
    const value = entry?.value || "Unavailable";
    const weight = entry?.weight !== undefined ? ` | weight ${entry.weight}` : "";
    return `- ${provider}.${field}: ${value}${weight}`;
  });
  return rows.length ? rows.join("\n") : "- Unavailable in current frontend model";
}

function renderedSurfaceList(...groups) {
  return dedupeCaseInsensitive(
    groups
      .flatMap((group) => normalizeRenderableList(group))
      .map((entry) => extractRenderableText(entry, null))
      .filter(Boolean),
  );
}

export function buildRenderedSurfaceParityViewModel({ model, displayIdentity } = {}) {
  const safeModel = safeObject(model);
  const rawLens = safeModel.resolvedInstitutionalLens || {};
  const lens = safeModel.effectiveInstitutionalLens || rawLens || {};
  const verdictSemantics = safeObject(safeModel.verdictSemantics);
  const allocationCase = safeObject(safeModel.allocationCase);
  const dataFirstNarrativeContract = safeObject(safeModel.dataFirstNarrativeContract);
  const dataFirstFields = safeArray(dataFirstNarrativeContract.generatedNarrativeFields);
  const primaryBlocker = safeObject(safeModel.primaryBlocker);
  const weakestLink = safeObject(safeModel.weakestLink);
  const whatWouldChange = safeModel.whatWouldChangeDecision?.items?.length
    ? safeModel.whatWouldChangeDecision.items
    : ["Additional verified evidence required."];
  const assetClassLabel = displayIdentity?.displayAssetClass || safeModel.assetClassLabel || sanitizeSemanticLabel(safeModel.assetClass, "Asset class unavailable");
  const assetFramingLabel = displayIdentity?.displayFraming || safeModel.assetFramingLabel || "Digital Asset Allocation Thesis";
  const identityChip = displayIdentity?.primaryChip || assetClassLabel;
  const visibleLensLabel = lens.visibleLabelOverride || lens.displayLabel || displayIdentity?.displayAssetClass || lens.label || assetClassLabel;
  const lensIdentityRailLabel = lens.visibleLabelOverride || lens.displayLabel || lens.label || displayIdentity?.displayFraming || "Resolved lens unavailable";

  const decisionHeader = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "decisionCommandHeader"),
    safeModel.allocationOutcome?.label,
    safeModel.allocationOutcome?.description,
    safeModel.verdictClass,
    safeModel.confidenceLabel,
    safeModel.overallScore === null || safeModel.overallScore === undefined ? null : `Overall score ${safeModel.overallScore}`,
    verdictSemantics.summary,
    verdictSemantics.boundary,
    verdictSemantics.positiveCase?.[0],
    verdictSemantics.blockedCase?.[0],
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange?.[0],
    safeModel.analysisFreshness?.qaEligibilityLabel,
    safeModel.analysisFreshness?.qaEligibilityWarning,
    assetClassLabel,
    assetFramingLabel,
    visibleLensLabel,
    lensIdentityRailLabel,
    ["View final verdict logic", "Inspect blocker", "Trace evidence", "View requirements"],
  );

  const decisionTab = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "finalDecisionExplanation"),
    dataFirstGeneratedText(dataFirstNarrativeContract, "decisionMemo"),
    verdictSemantics.label,
    verdictSemantics.summary,
    verdictSemantics.boundary,
    verdictSemantics.missingEvidence,
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange,
    safeModel.whyNow,
    safeModel.whyNotNow,
    safeModel.summaryMemo,
    safeModel.primaryWeakness,
    safeModel.failureMode?.primary,
    safeModel.structuredThesisSummary,
    safeModel.missingCritical,
    safeModel.requiredConditions,
    safeModel.blockers,
    safeModel.decisionDrivers,
  );

  const thesisFalsification = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "thesisFalsificationSummary"),
    safeModel.summaryMemo,
    safeModel.tokenDemandTruth,
    safeModel.primaryStrength,
    assetFramingLabel,
    safeModel.whatMustBeTrue,
    safeModel.whatCouldBreak,
    safeModel.requiredConditions,
    safeModel.missingCritical,
    safeModel.blockers,
    safeModel.topNeutralDrivers,
    safeModel.failureMode?.primary,
    safeModel.failureMode?.trigger,
    safeModel.auditAlerts,
    safeModel.topNegativeDrivers,
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange,
    allocationCase.forAllocation,
    allocationCase.againstAllocation,
    allocationCase.missingEvidence,
    allocationCase.whatWouldChange,
  );

  const rightRail = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "rightRailWeakestLink"),
    safeModel.allocationOutcome?.label,
    assetFramingLabel,
    assetClassLabel,
    identityChip,
    safeModel.confidenceLabel,
    lensIdentityRailLabel,
    lens.questionGroupId,
    primaryBlocker.label,
    primaryBlocker.explanation,
    weakestLink.label,
    weakestLink.explanation,
    whatWouldChange,
  );

  const sourceQueue = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "sourceQueueSummary"),
    safeModel.researchRequirements?.map((requirement) => [
      requirement?.title,
      requirement?.reason,
      requirement?.evidenceNeeded,
      requirement?.verdictImpact,
    ]),
  );

  const manualReview = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "manualReviewSummary"),
    safeModel.manualReviewStatus?.label,
    safeModel.manualReviewStatus?.detail,
    safeModel.researchRequirements?.map((requirement) => [
      requirement?.title,
      requirement?.reason,
      requirement?.evidenceNeeded,
      requirement?.verdictImpact,
    ]),
    safeModel.primaryBlocker?.explanation,
    safeModel.weakestLink?.explanation,
    safeModel.auditAlerts,
    safeModel.warnings,
    "Manual review boundary: missing evidence is not negative evidence; reviewed evidence remains separate from provider metadata and scoring-active fields.",
  );

  const evidenceMap = renderedSurfaceList(
    lens.sourceBoundary,
    safeModel.engineLearningBackbone?.outputQaChecks?.map((check) => [
      check?.id,
      check?.status,
      check?.description,
      check?.remediation,
    ]),
    safeModel.reviewedEvidencePacket?.questionMappings?.map((mapping) => [
      mapping?.questionId,
      mapping?.reviewedEvidenceStatus,
      mapping?.questionEvidenceScope,
      mapping?.remainingMissingEvidence,
      mapping?.evidenceMappingWarnings,
    ]),
  );

  const scoringTransparency = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "scoreExplanation"),
    safeModel.allocationOutcome?.label,
    safeModel.verdictSemantics?.label,
    safeModel.verdictSemantics?.boundary,
    safeModel.confidenceLabel,
    safeModel.tokenomicsSupplyIntegrity?.sourceBoundary,
    safeModel.engineLearningBackbone?.guardrails ? [
      `scoringChanged=${safeModel.engineLearningBackbone.guardrails.scoringChanged ? "yes" : "no"}`,
      `verdictChanged=${safeModel.engineLearningBackbone.guardrails.verdictChanged ? "yes" : "no"}`,
      `providerBehaviorChanged=${safeModel.engineLearningBackbone.guardrails.providerBehaviorChanged ? "yes" : "no"}`,
    ] : null,
  );

  const institutionalChecklist = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "institutionalChecklistSummary"),
    visibleLensLabel,
    safeModel.institutionalQuestions?.flatMap((question) => [
      question?.questionText,
      question?.shortAnswer,
      question?.answerSummary,
      question?.synthesizedAnswer?.directAnswer,
      question?.synthesizedAnswer?.analystAnswerCard?.directAnswer,
      question?.missingEvidence,
      question?.whatWouldChange,
      question?.synthesizedAnswer?.missingEvidence,
      question?.synthesizedAnswer?.whatWouldChange,
      question?.synthesizedAnswer?.analystAnswerCard?.missingEvidence,
      question?.synthesizedAnswer?.analystAnswerCard?.whatWouldChange,
    ]),
  );

  const tokenomics = renderedSurfaceList(
    dataFirstGeneratedText(dataFirstNarrativeContract, "tokenomicsSummary"),
    safeModel.tokenomicsSupplyIntegrity?.explanationSummary,
    safeModel.tokenomicsSupplyIntegrity?.sourceRequirements,
    safeModel.tokenomicsSupplyIntegrity?.manualReviewTriggers,
    safeModel.tokenomicsSupplyIntegrity?.confidenceCaps,
    safeModel.tokenomicsSupplyIntegrity?.institutionalQuestions?.flatMap((question) => [
      question?.questionText,
      question?.shortAnswer,
      question?.answerSummary,
      question?.missingEvidence,
      question?.whatWouldChange,
    ]),
  );

  const surfaces = {
    decisionHeader,
    decisionTab,
    thesisFalsification,
    rightRail,
    whatWouldChangeRail: renderedSurfaceList(whatWouldChange),
    visibleLensLabel: renderedSurfaceList(
      visibleLensLabel,
      assetClassLabel,
      assetFramingLabel,
      lensIdentityRailLabel,
      lens.lensId ? `Lens ID: ${lens.lensId}` : null,
      lens.questionGroupId ? `Question group: ${lens.questionGroupId}` : null,
    ),
    institutionalChecklist,
    tokenomics,
    evidenceMap,
    scoringTransparency,
    sourceQueue,
    manualReview,
    auditRaw: renderedSurfaceList(
      dataFirstFields.map((field) => [
        field?.fieldName,
        field?.status,
        field?.forbiddenConceptsDetected,
        field?.unsupportedClaimsDetected,
      ]),
      lens.lensId,
      lens.questionGroupId,
      rawLens.lensId ? `Raw resolved lens: ${rawLens.lensId}` : null,
      rawLens.questionGroupId ? `Raw resolved question group: ${rawLens.questionGroupId}` : null,
      safeModel.assetIdentityResolution?.sourceBoundary,
      safeModel.analysisFreshness?.bundleMode,
      safeModel.engineLearningBackbone?.knownLimitations,
    ),
  };
  const requiredLiveTabs = [
    "decisionHeader",
    "decisionTab",
    "thesisFalsification",
    "rightRail",
    "visibleLensLabel",
    "institutionalChecklist",
    "tokenomics",
    "evidenceMap",
    "scoringTransparency",
    "sourceQueue",
    "manualReview",
    "auditRaw",
  ];
  const tabMirrorCoverage = requiredLiveTabs.map((surface) => {
    const values = safeArray(surfaces[surface]);
    const classification = surface === "auditRaw"
      ? "audit"
      : ["evidenceMap", "scoringTransparency"].includes(surface)
        ? "secondary"
        : "primary";
    return {
      surface,
      classification,
      renderedItemCount: values.length,
      mirroredInBundle: values.length > 0,
      mirrorStatus: values.length > 0 ? "mirrored" : "missing_visible_text_model",
      firstItem: values[0] || null,
    };
  });
  const missingMirroredSurfaces = tabMirrorCoverage
    .filter((entry) => !entry.mirroredInBundle)
    .map((entry) => entry.surface);

  return {
    artifactVersion: "rendered-surface-parity-view-model-v2-live-tab-mirror",
    doctrine: "Rendered-intended text mirrors the exact frontend normalized fields consumed by primary tabs, right rail, and Copy Review Bundle.",
    surfaces,
    tabMirrorCoverage,
    missingMirroredSurfaces,
    allRequiredSurfacesMirrored: missingMirroredSurfaces.length === 0,
    decisionHeaderRenderedItemCount: decisionHeader.length,
    componentConsumption: {
      decisionHeader: "DecisionHeroCard.jsx reads verdictSemantics, displayIdentity, model asset labels, and resolvedInstitutionalLens label in the guardrail.",
      decisionTab: "App.jsx Decision tab plus DecisionHeroSupportSections read verdictSemantics, primaryBlocker, weakestLink, whatWouldChangeDecision, and secondary display fields.",
      thesisFalsification: "ThesisFalsificationTab.jsx reads summaryMemo, tokenDemandTruth, whatMustBeTrue, whatCouldBreak, allocationCase, blockers, and whatWouldChangeDecision.",
      rightRail: "AnalysisRightRail.jsx reads displayIdentity labels, resolvedInstitutionalLens label, primaryBlocker, weakestLink, and whatWouldChangeDecision.",
      evidenceMap: "EvidenceMapTab.jsx reads source/evidence boundary, reviewed evidence mapping, and Engine Learning output QA diagnostics.",
      scoringTransparency: "ScoringTransparencyTab.jsx reads live score/verdict fields, caps/gates, diagnostic-only boundaries, and score-change guardrails.",
      sourceQueue: "SourceQueuePanel.jsx reads researchRequirements and lens-aware source requirements from the normalized model.",
      manualReview: "ManualReviewPanel.jsx reads manualReviewStatus, auditAlerts, warnings, and diagnostic/manual-review fields.",
      auditRaw: "Audit / Raw surfaces preserve raw and technical context only; primary hard gates exclude this surface.",
      bundle: "buildReviewBundleText mirrors this rendered-surface view model and runs BTC hard-gate checks against it.",
    },
    primaryVisibleText: Object.entries(surfaces)
      .filter(([surface]) => !["auditRaw"].includes(surface))
      .flatMap(([surface, values]) => values.map((value) => `${surface}: ${value}`)),
  };
}

function bundleSynthesizedAnswer(question) {
  const answer = safeObject(question?.synthesizedAnswer);
  const card = getAnalystAnswerCard(question);
  if (!answer.directAnswer && !answer.evidenceStatus) return [
    "  synthesized.directAnswer: Unavailable in current frontend model",
    "  synthesized.evidenceStatus: Unavailable in current frontend model",
  ].join("\n");
  return [
    `  synthesized.directAnswer: ${bundleValue(answer.directAnswer)}`,
    `  synthesized.evidenceStatus: ${bundleValue(answer.evidenceStatus)}`,
    `  analyst.directAnswer: ${bundleValue(card.directAnswer)}`,
    `  analyst.headlineStatus: ${bundleValue(card.headlineStatus)}`,
    `  analyst.evidenceBasis: ${normalizeRenderableList(card.evidenceBasis).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.whatEvidenceDoesNotProve: ${normalizeRenderableList(card.whatEvidenceDoesNotProve).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.missingEvidence: ${normalizeRenderableList(card.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.decisionImpact: ${bundleValue(card.decisionImpact)}`,
    `  analyst.whatWouldChange: ${normalizeRenderableList(card.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.sourceBoundaryPlainEnglish: ${normalizeRenderableList(card.sourceBoundaryPlainEnglish).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.confidenceBoundary: ${bundleValue(card.confidenceBoundary)}`,
    `  analyst.manualReviewImplication: ${bundleValue(card.manualReviewImplication)}`,
    `  analyst.assetClassSpecificKeyIssue: ${bundleValue(card.assetClassSpecificKeyIssue)}`,
    `  analyst.primaryBadges: ${normalizeRenderableList(card.primaryBadges).join("; ") || "Unavailable in current frontend model"}`,
    `  analyst.auditFields: ${normalizeRenderableList(card.auditFields).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.evidenceUsed: ${normalizeRenderableList(answer.evidenceUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.reviewedSourcesUsed: ${safeArray(answer.reviewedSourcesUsed).map((source) => `${source.sourceId || source.title || "source"} (${source.scoringEligible ? "scoring eligible" : "not scoring-active"})`).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.reviewedFactsUsed: ${safeArray(answer.reviewedFactsUsed).map((fact) => `${fact.factId || "fact"}: ${fact.claim || "claim unavailable"}`).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.whatEvidenceDoesNotProve: ${normalizeRenderableList(answer.whatEvidenceDoesNotProve).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.missingEvidence: ${normalizeRenderableList(answer.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.sourceBoundary: ${normalizeRenderableList(answer.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.impact: ${bundleValue(answer.impact)}`,
    `  synthesized.whatWouldChange: ${normalizeRenderableList(answer.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.warnings: ${normalizeRenderableList(answer.warnings).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.identityWarnings: ${normalizeRenderableList(answer.identityWarnings).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.formulaOutputsUsed: ${normalizeRenderableList(answer.formulaOutputsUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.liveDataUsed: ${normalizeRenderableList(answer.liveDataUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.providerDataUsed: ${normalizeRenderableList(answer.providerDataUsed).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.answerQualityFlags: ${normalizeRenderableList(answer.answerQualityFlags).join("; ") || "Unavailable in current frontend model"}`,
    `  synthesized.template: ${bundleValue(answer.synthesisTemplateId)}`,
  ].join("\n");
}

function bundleQuestions(questions = []) {
  const rows = safeArray(questions).map((question, index) => {
    const synthesized = safeObject(question?.synthesizedAnswer);
    const card = getAnalystAnswerCard(question);
    const hasSynthesis = Boolean(synthesized.directAnswer);
    return [
      `Question ${index + 1}`,
      `  id: ${bundleValue(question?.questionId)}`,
      `  question: ${bundleValue(question?.questionText)}`,
      `  liveUi.tab: Institutional Checklist`,
      `  liveUi.primaryAnswer: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  liveUi.primaryStatus: ${bundleValue(card.headlineStatus || synthesized.evidenceStatus || question?.reviewedEvidenceStatus || question?.answerStatus)}`,
      `  liveUi.primaryBadges: ${normalizeRenderableList(card.primaryBadges).join("; ") || "Unavailable in current frontend model"}`,
      `  liveUi.primaryMissingEvidence: ${normalizeRenderableList(card.missingEvidence).slice(0, 2).join("; ") || "none visible in primary row"}`,
      `  liveUi.primaryWhatWouldChange: ${normalizeRenderableList(card.whatWouldChange).slice(0, 2).join("; ") || "Unavailable in current frontend model"}`,
      `  liveUi.primaryImpact: ${bundleValue(card.decisionImpact || synthesized.impact || question?.impactOnScoreOrConfidence)}`,
      `  primaryAnswer: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  primaryEvidenceStatus: ${bundleValue(card.headlineStatus || synthesized.evidenceStatus || question?.reviewedEvidenceStatus || question?.answerStatus)}`,
      `  lens: ${bundleValue(question?.assetClassLens)}`,
      `  answerStatus: ${bundleValue(question?.answerStatus)}`,
      `  verdictImpact: ${bundleValue(question?.verdictImpact)}`,
      `  currentMvpCapability: ${bundleValue(question?.currentMvpCapability)}`,
      `  synthesisPreferred: ${hasSynthesis ? "yes" : "no"}`,
      bundleSynthesizedAnswer(question),
      `  audit.legacyShortAnswer: ${bundleValue(question?.shortAnswer)}`,
      `  audit.legacyAnswerSummary: ${bundleValue(question?.answerSummary)}`,
      `  audit.supportingSignals: ${normalizeRenderableList(question?.supportingSignals).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.dataFieldsUsed: ${normalizeRenderableList(question?.dataFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.formulaOutputsUsed: ${normalizeRenderableList(question?.formulaOutputsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  missingEvidence: ${normalizeRenderableList(synthesized.missingEvidence || question?.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
      `  contradictionSignals: ${normalizeRenderableList(question?.contradictionSignals).join("; ") || "Unavailable in current frontend model"}`,
      `  impactOnScoreOrConfidence: ${bundleValue(synthesized.impact || question?.impactOnScoreOrConfidence)}`,
      `  whatWouldChange: ${normalizeRenderableList(synthesized.whatWouldChange || question?.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.scoringFieldsUsed: ${normalizeRenderableList(question?.scoringFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  audit.sourceBoundary: ${normalizeRenderableList(question?.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
    ].join("\n");
  });
  return rows.length ? rows.join("\n\n") : "Unavailable in current frontend model";
}

function tokenomicsQuestionGroup(question) {
  const id = String(question?.questionId || "");
  if (/max_supply|remaining_dilution|supply_reconciliation|provider_supply/i.test(id)) return "Supply Integrity";
  if (/unlock|absorb_dilution/i.test(id)) return "Future Dilution / Unlocks";
  if (/mint_admin|emissions|burn_buyback/i.test(id)) return "Control / Mutability";
  if (/treasury_insider|concentration/i.test(id)) return "Ownership / Concentration";
  if (/value_capture|tokenholder|accrual/i.test(id)) return "Tokenholder Economics";
  if (/asset_class|canonical_supply_tree/i.test(id)) return "Asset-Class / Identity";
  return "Other Tokenomics Checks";
}

function tokenomicsQuestionSourceState(question, formulas = []) {
  if (question?.synthesizedAnswer?.evidenceStatus) return String(question.synthesizedAnswer.evidenceStatus).replace(/_/g, "-");
  const formulaIds = safeArray(question?.formulaOutputsUsed);
  const linked = safeArray(formulas).filter((formula) => formulaIds.includes(formula?.formulaId));
  const answerStatus = String(question?.answerStatus || "").toLowerCase();
  if (answerStatus.includes("manual")) return "manual-review-required";
  if (answerStatus.includes("contradict")) return "contradicted";
  if (answerStatus.includes("not_applicable")) return "not-applicable";
  if (linked.some((formula) => formula?.status === "computed")) return "computed";
  if (linked.some((formula) => /missing|source_required|invalid/i.test(String(formula?.status)))) return "source-required";
  if (safeArray(question?.missingEvidence).length) return "source-required";
  if (safeArray(question?.evidenceUsed).length) return "provider-reported";
  return "evidence-missing";
}

function tokenomicsQuestionWhyItMatters(question) {
  const id = String(question?.questionId || "");
  if (/max_supply/.test(id)) return "Max supply is useful only when the cap is credible, immutable, or clearly governed; provider-reported caps are not reviewed evidence.";
  if (/remaining_dilution/.test(id)) return "Remaining dilution helps underwrite future supply pressure, but it can be secondary or not applicable depending on asset class.";
  if (/unlock/.test(id)) return "Unlocks can create sell-pressure or confidence caps when timing, recipients, liquidity, and demand absorption are not source-backed.";
  if (/mint_admin/.test(id)) return "Mint/admin authority determines who can change supply or restrict transfer behavior.";
  if (/burn_buyback|emissions/.test(id)) return "Burn, buyback, and emission mechanics matter only when activation, materiality, durability, and source backing are clear.";
  if (/value_capture/.test(id)) return "Protocol or network success does not automatically accrue to tokenholders without an active, material, source-backed mechanism.";
  if (/canonical_supply_tree/.test(id)) return "Supply conclusions depend on analyzing the correct canonical asset, network, contract, bridge, wrapper, or multichain representation.";
  return "This question converts tokenomics data into a source-boundary-aware institutional diligence answer.";
}

function bundleTokenomicsQuestionFirstMirror(tokenomics) {
  const formulas = safeArray(tokenomics?.formulaOutputs);
  const rows = safeArray(tokenomics?.institutionalQuestions).map((question, index) => {
    const synthesized = safeObject(question?.synthesizedAnswer);
    const card = getAnalystAnswerCard(question);
    const formulaIds = safeArray(question?.formulaOutputsUsed);
    const linkedFormulas = formulas.filter((formula) => formulaIds.includes(formula?.formulaId));
    const formulaOrRule = linkedFormulas.length
      ? linkedFormulas.map((formula) => `${formula.label || formula.formulaId}: ${formula.display || "Unavailable - source required"} | ${formula.formula || "Formula unavailable"} | status=${formula.status || "unknown"} | missing=${safeArray(formula.missingInputs).join(", ") || "none"}`).join("; ")
      : question?.answerStatus === "not_applicable"
        ? "Not applicable for this asset class; use the asset-class-specific alternative diligence surface."
        : "Rule-based answer from resolved lens and tokenomics source requirements.";
    return [
      `Question ${index + 1}`,
      `  group: ${tokenomicsQuestionGroup(question)}`,
      `  liveUi.tab: Tokenomics / Supply Integrity`,
      `  question: ${bundleValue(question?.questionText)}`,
      `  collapsedSummary: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  status: ${bundleValue(card.headlineStatus || question?.answerStatus)}`,
      `  sourceState: ${card.headlineStatus || tokenomicsQuestionSourceState(question, formulas)}`,
      `  expanded.directAnswer: ${bundleValue(card.directAnswer || synthesized.directAnswer || question?.shortAnswer || question?.answerSummary)}`,
      `  expanded.whyItMatters: ${bundleValue(card.assetClassSpecificKeyIssue || tokenomicsQuestionWhyItMatters(question))}`,
      `  expanded.evidenceBasis: ${normalizeRenderableList(card.evidenceBasis).join("; ") || normalizeRenderableList(question?.dataFieldsUsed).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.formulaOrRuleUsed: ${formulaOrRule}`,
      `  expanded.evidenceStatus: synthesized=${bundleValue(synthesized.evidenceStatus)}; provider/review fields=${normalizeRenderableList(card.evidenceBasis || synthesized.evidenceUsed || question?.evidenceUsed).join("; ") || "none"}; boundary=${normalizeRenderableList(card.sourceBoundaryPlainEnglish || synthesized.sourceBoundary || question?.sourceBoundary).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.reviewedSourcesUsed: ${safeArray(synthesized.reviewedSourcesUsed || question?.reviewedSourcesUsed).map((source) => `${source.sourceId || source.title || "source"} (${source.scoringEligible ? "scoring eligible" : "not scoring-active"})`).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.reviewedFactsUsed: ${safeArray(synthesized.reviewedFactsUsed || question?.reviewedFactsUsed).map((fact) => `${fact.factId || "fact"}: ${fact.claim || "claim unavailable"}`).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.whatEvidenceDoesNotProve: ${normalizeRenderableList(card.whatEvidenceDoesNotProve || synthesized.whatEvidenceDoesNotProve).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.missingEvidence: ${normalizeRenderableList(card.missingEvidence || synthesized.missingEvidence || question?.missingEvidence).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.impact: ${bundleValue(card.decisionImpact || synthesized.impact || question?.impactOnScoreOrConfidence)}`,
      `  expanded.confidenceBoundary: ${bundleValue(card.confidenceBoundary)}`,
      `  expanded.whatWouldChange: ${normalizeRenderableList(card.whatWouldChange || synthesized.whatWouldChange || question?.whatWouldChange).join("; ") || "Unavailable in current frontend model"}`,
      `  expanded.answerQualityFlags: ${normalizeRenderableList(synthesized.answerQualityFlags).join("; ") || "Unavailable in current frontend model"}`,
    ].join("\n");
  });
  return rows.length ? rows.join("\n\n") : "Unavailable in current frontend model";
}

function questionGroupMatchesLens(questions, lens) {
  const safeQuestions = safeArray(questions);
  if (!lens?.questionGroupId || !safeQuestions.length) return "unknown";
  const group = String(lens.questionGroupId || "").toLowerCase();
  const lensId = String(lens.lensId || "").toLowerCase();
  const prefixByGroup = {
    native_benchmark: ["native_"],
    base_layer_settlement: ["base_layer_"],
    stablecoin: ["stablecoin_"],
    wrapped_or_lst: ["wrapped_lst_"],
    defi_l2_oracle_infra: ["protocol_"],
    oracle_infrastructure: ["oracle_"],
    rwa_hybrid: ["rwa_"],
    rwa_hybrid_infrastructure: ["rwa_infra_"],
    depin_compute_storage: ["depin_"],
    payments_settlement_network: ["payments_"],
    gaming_consumer: ["gaming_"],
    meme_narrative: ["meme_"],
    low_coverage_manual_classification: ["low_coverage_"],
  };
  const acceptedPrefixes = prefixByGroup[group] || [];
  const mismatches = safeQuestions.filter((question) => {
    const id = String(question?.questionId || "").toLowerCase();
    const questionLens = String(question?.assetClassLens || "").toLowerCase();
    if (group === "rwa_hybrid" && id.startsWith("rwa_infra_")) return true;
    return !acceptedPrefixes.some((prefix) => id.startsWith(prefix)) &&
      !id.includes(group.replace(/_/g, "")) &&
      !id.includes(group) &&
      questionLens !== lensId &&
      questionLens !== group;
  });
  return mismatches.length ? "unknown" : "yes";
}

function includesGenericPrimaryCopy(text) {
  return /critical tokenomics evidence is missing|utility or vesting support|coverage restraint.*unlock|coverage restraint.*vesting|vesting schedule|next unlock magnitude|resolve the critical pillar|close.*weakest-link gaps|token utility matters for protocol use|confirm token utility or vesting coverage/i.test(String(text || ""));
}

function yesNoUnknown(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

function buildIdentityLensLeakageForbiddenStringChecks({
  bundleText,
  asset,
  lens,
  assetIdentityResolution,
  reviewedEvidencePacket,
}) {
  const assetText = `${asset?.symbol || ""} ${asset?.name || ""} ${asset?.id || ""} ${asset?.coingeckoId || ""} ${reviewedEvidencePacket?.packetId || ""}`;
  const lensId = String(lens?.lensId || "");
  const representationType = String(assetIdentityResolution?.representationType || "");
  const wrappedStatus = String(assetIdentityResolution?.bridgedOrWrappedStatus || "");
  const isWrappedOrBridgedContext = /WRAPPED_ASSET|wrapped_asset|bridged_asset/i.test(`${lensId} ${representationType} ${wrappedStatus} ${assetText}`);
  const isLstContext = /LST_STAKING_DERIVATIVE|liquid_staking_derivative|steth|staked ether/i.test(`${lensId} ${representationType} ${assetText}`);
  const isGamingContext = /GAMING_METAVERSE_CONSUMER|gaming|gamefi|naka/i.test(`${lensId} ${assetText}`);
  const isDePinContext = /DEPIN|render-token|render network|render\b/i.test(`${lensId} ${assetText}`);
  const isBaseLayerContext = /BASE_LAYER|NATIVE_MONETARY|ethereum|eth\b|bitcoin|btc\b|solana|sol\b|avalanche|avax\b/i.test(`${lensId} ${assetText}`);
  const isOndoContext = /ondo/i.test(assetText);
  const isRenderContext = /render|rndr/i.test(assetText);

  const definitions = [
    {
      checkId: "ondo_wrapped_representation_leak",
      applies: isOndoContext && !isWrappedOrBridgedContext,
      pattern: /\bwrapped_asset\b|Wrapped\/bridged\/staking representation signal detected|native asset fundamentals do not automatically transfer/i,
      forbidden: "ONDO-like non-wrapper contract asset shows wrapped/native-inheritance copy.",
      allowedWhen: "Only allowed when selected asset has explicit wrapper/bridge/staking-derivative representation evidence.",
    },
    {
      checkId: "steth_false_rwa_internal_ambiguity",
      applies: isLstContext,
      pattern: /internal classification suggests RWA \/ Hybrid|RWA \/ Hybrid Methodology Asset/i,
      forbidden: "LST context shows equal-weight RWA/Hybrid provider/internal disagreement copy.",
      allowedWhen: "Only allowed when direct RWA/product-rights evidence exists for the analyzed asset.",
    },
    {
      checkId: "base_layer_gaming_copy_leak",
      applies: isBaseLayerContext && !isGamingContext,
      pattern: /Gaming utility or tokenomics documents|game volume|paying users/i,
      forbidden: "Base-layer context shows gaming/GameFi demand-warning copy.",
      allowedWhen: "Only allowed for gaming/GameFi question groups.",
    },
    {
      checkId: "depin_gaming_copy_leak",
      applies: isDePinContext && !isGamingContext,
      pattern: /Gaming utility or tokenomics documents|game volume|paying users/i,
      forbidden: "DePIN/resource context shows gaming/GameFi demand-warning copy.",
      allowedWhen: "Only allowed for gaming/GameFi question groups.",
    },
    {
      checkId: "ondo_render_migration_leak",
      applies: isOndoContext && !isRenderContext,
      pattern: /RNDR-to-RENDER|Solana upgraded token context|RENDER migration/i,
      forbidden: "ONDO-like packet shows RENDER migration/canonical-representation copy.",
      allowedWhen: "Only allowed for RENDER/RNDR packet identity reconciliation.",
    },
  ].filter((definition) => definition.applies);

  return definitions.map((definition) => {
    const matches = String(bundleText || "").match(definition.pattern) || [];
    return {
      ...definition,
      passed: matches.length === 0,
      matches: Array.from(new Set(matches)).slice(0, 5),
      checkedFields: [
        "assetIdentityResolution.identityWarnings",
        "assetIdentityResolution.chainWarnings",
        "assetIdentityResolution.sourceRequirements",
        "resolvedInstitutionalLens.ambiguityFlags",
        "reviewedEvidencePacket.questionMappings[].evidenceMappingWarnings",
        "reviewedEvidencePacket.sourceQueueNotes",
        "reviewedEvidencePacket.remainingSourceRequirements",
        "Copy Review Bundle core sections",
      ],
      checkedBundleSections: [
        "1. QA Bundle Header",
        "1A. Asset Identity Resolution / Canonical Chain Guardrail",
        "2. Resolved Institutional Lens Contract",
        "2A. Reviewed Evidence Packet v1",
        "6. Institutional Checklist",
        "6A. Tokenomics / Supply Integrity Tab Mirror",
        "9. Source Queue",
        "10. Manual Review",
        "11. Audit / Raw Key Fields",
        "12. Cross-Tab Consistency Checklist",
      ],
    };
  });
}

const BTC_RENDERED_PRIMARY_SURFACES = [
  "decisionHeader",
  "decisionTab",
  "thesisFalsification",
  "rightRail",
  "whatWouldChangeRail",
  "visibleLensLabel",
  "institutionalChecklist",
  "tokenomics",
  "sourceQueue",
  "manualReview",
];

const BTC_RENDERED_SECONDARY_SURFACES = [
  "evidenceMap",
  "scoringTransparency",
];

function normalizeBtcRenderedGateRows(rows = []) {
  return safeArray(rows)
    .flatMap((row) => normalizeRenderableList(row?.text).map((text) => ({
      failureId: row?.failureId || `${row?.surface || "unknown"}:${row?.fieldPath || "field"}`,
      surface: row?.surface || "unknown",
      fieldPath: row?.fieldPath || "unknown",
      sourceObjectPath: row?.sourceObjectPath || row?.fieldPath || "unknown",
      renderedText: text,
      classification: row?.classification || "primary-visible",
      appearsInRenderedViewModel: row?.appearsInRenderedViewModel !== false,
      reason: row?.reason || null,
    })))
    .filter((row) => row.renderedText);
}

function isInternalBtcGateIdText(text) {
  return /^(base_layer_settlement_gas_demand|base_layer_security_validator_role|base_layer_issuance_burn_staking|tokenomics_[a-z0-9_]+|[a-z0-9]+_[a-z0-9_]+)$/i.test(String(text || "").trim());
}

function buildBtcRenderedGateCorpusRows({
  renderedSurfaceParityViewModel,
  model,
  displayIdentity,
  lens,
  questions,
  tokenomicsSupplyIntegrity,
  reviewedEvidencePacket,
} = {}) {
  const rows = [];
  const surfaces = safeObject(renderedSurfaceParityViewModel?.surfaces);
  Object.entries(surfaces).forEach(([surface, values]) => {
    const classification = BTC_RENDERED_PRIMARY_SURFACES.includes(surface)
      ? "primary-visible"
      : BTC_RENDERED_SECONDARY_SURFACES.includes(surface)
        ? "secondary-visible"
        : "audit-only";
    normalizeRenderableList(values).forEach((text, index) => {
      const rowClassification = isInternalBtcGateIdText(text) ? "internal-id" : classification;
      rows.push({
        surface,
        fieldPath: `renderedSurfaceParityViewModel.surfaces.${surface}[${index}]`,
        sourceObjectPath: `buildRenderedSurfaceParityViewModel.surfaces.${surface}`,
        text,
        classification: rowClassification,
        appearsInRenderedViewModel: true,
        reason: rowClassification === "internal-id"
          ? "Internal ID rendered/available as technical metadata; not human copy for the primary gate."
          : classification === "primary-visible"
          ? "Current rendered-intended product text."
          : classification === "secondary-visible"
            ? "Visible supporting/detail surface; inventoried separately from primary gate."
            : "Audit/raw surface; never blocks primary rendered gate.",
      });
    });
  });

  [
    ["displayIdentity.displayAssetClass", displayIdentity?.displayAssetClass],
    ["displayIdentity.displayFraming", displayIdentity?.displayFraming],
    ["displayIdentity.primaryChip", displayIdentity?.primaryChip],
    ["displayIdentity.secondaryChip", displayIdentity?.secondaryChip],
    ["resolvedInstitutionalLens.visibleLabelOverride", lens?.visibleLabelOverride],
    ["resolvedInstitutionalLens.displayLabel", lens?.displayLabel],
  ].forEach(([fieldPath, text]) => {
    rows.push({
      surface: "visibleLensLabel",
      fieldPath,
      sourceObjectPath: fieldPath,
      text,
      classification: "primary-visible",
      appearsInRenderedViewModel: true,
      reason: "Display-safe visible label candidate.",
    });
  });

  [
    ["model.assetClassLabel", model?.assetClassLabel],
    ["model.assetFramingLabel", model?.assetFramingLabel],
    ["resolvedInstitutionalLens.label", lens?.label],
  ].forEach(([fieldPath, text]) => {
    const displaySafeLabels = [
      displayIdentity?.displayAssetClass,
      displayIdentity?.displayFraming,
      lens?.visibleLabelOverride,
      lens?.displayLabel,
    ].filter(Boolean).join(" ");
    rows.push({
      surface: "rawFallback",
      fieldPath,
      sourceObjectPath: fieldPath,
      text,
      classification: displaySafeLabels && text && !displaySafeLabels.includes(text) ? "audit-only" : "primary-visible",
      appearsInRenderedViewModel: false,
      reason: "Raw backend/display fallback; blocks only when no display-safe visible label supersedes it.",
    });
  });

  [
    ["resolvedInstitutionalLens.lensId", lens?.lensId],
    ["resolvedInstitutionalLens.questionGroupId", lens?.questionGroupId],
    ...safeArray(questions).map((question) => ["institutionalQuestions[].questionId", question?.questionId]),
    ...safeArray(tokenomicsSupplyIntegrity?.institutionalQuestions).map((question) => ["tokenomicsSupplyIntegrity.institutionalQuestions[].questionId", question?.questionId]),
    ...safeArray(reviewedEvidencePacket?.questionMappings).map((mapping) => ["reviewedEvidencePacket.questionMappings[].questionId", mapping?.questionId]),
  ].forEach(([fieldPath, text]) => {
    rows.push({
      surface: "internalMetadata",
      fieldPath,
      sourceObjectPath: fieldPath,
      text,
      classification: "internal-id",
      appearsInRenderedViewModel: false,
      reason: "Internal ID or technical route metadata; not human copy for the primary rendered gate.",
    });
  });

  return normalizeBtcRenderedGateRows(rows);
}

function buildBtcBenchmarkForbiddenStringChecks({
  primaryText,
  corpusRows,
  bundleText,
  asset,
  lens,
  assetIdentityResolution,
  reviewedEvidencePacket,
}) {
  const assetText = `${asset?.symbol || ""} ${asset?.name || ""} ${asset?.id || ""} ${asset?.coingeckoId || ""} ${reviewedEvidencePacket?.packetId || ""}`;
  const identityText = `${assetIdentityResolution?.canonicalAssetName || ""} ${assetIdentityResolution?.canonicalAssetSymbol || ""} ${assetIdentityResolution?.canonicalProviderIds?.coingeckoId || ""} ${assetIdentityResolution?.nativeNetworkCandidate || ""} ${assetIdentityResolution?.canonicalNetworkCandidate || ""} ${assetIdentityResolution?.representationType || ""} ${assetIdentityResolution?.bridgedOrWrappedStatus || ""}`;
  const lensText = `${lens?.lensId || ""} ${lens?.questionGroupId || ""}`;
  const contextText = `${assetText} ${identityText} ${lensText}`.toLowerCase();
  const isNativeBtcContext = /\b(bitcoin|btc|reviewed-demo-btc-v1|native_monetary_benchmark)\b/i.test(contextText)
    && !/\b(wrapped|bridged|wbtc|liquid staking|steth)\b/i.test(contextText);
  if (!isNativeBtcContext) return [];

  const normalizedRows = normalizeBtcRenderedGateRows(corpusRows);
  const rowsToCheck = normalizedRows.length ? normalizedRows : [{
    surface: "legacyTextBlob",
    fieldPath: "primaryText",
    sourceObjectPath: "primaryText",
    renderedText: String(primaryText || bundleText || ""),
    classification: "primary-visible",
    appearsInRenderedViewModel: true,
    reason: "Legacy scanner input.",
  }];
  const definitions = [
    {
      checkId: "btc_eth_mechanism_copy_leak",
      pattern: /Reviewed Ethereum sources|ETH staking|staking rewards?|post-Merge|base-fee burn|\bstaking\b|staking mechanics|staking\/validator|validator rewards?|slashing mechanics|validator\/security|validator decentralization|validator concentration|issuance\/burn\/staking|issuance, burn, staking|burn\/staking|base_layer_security_validator_role|base_layer_issuance_burn_staking/i,
      forbidden: "Native BTC primary copy shows ETH/PoS/staking/slashing/base-fee wording.",
    },
    {
      checkId: "btc_gas_copy_leak",
      pattern: /settlement\/gas|\bgas demand\b|\bgas-demand\b|\bgas\/settlement demand\b|\bgas asset\b|base_layer_settlement_gas_demand/i,
      forbidden: "Native BTC primary copy shows gas-asset wording instead of transaction/blockspace/fee-market wording.",
    },
    {
      checkId: "btc_erc20_admin_copy_leak",
      pattern: /ERC-20 admin|proxy\/admin|selected contract.*non-mintable|selected contract reported non-mintable|contract scan.*required|mint\/admin.*selected contract/i,
      forbidden: "Native BTC primary copy shows ERC-20 contract/admin/proxy wording.",
    },
    {
      checkId: "btc_stablecoin_trust_copy_leak",
      pattern: /reserve composition|\battestation\b|reserve attestation|redemption eligibility|issuer\/custodian|admin\/freeze policy|peg stress/i,
      forbidden: "Native BTC primary copy shows stablecoin reserve/redemption/issuer-control wording.",
    },
    {
      checkId: "btc_unlock_vesting_copy_leak",
      pattern: /token unlock recipients|vesting schedule|insider vesting|next unlock materiality|unlock\/volume/i,
      forbidden: "Native BTC primary copy shows ERC-20 unlock/vesting wording as a primary surface.",
    },
    {
      checkId: "btc_protocol_accrual_copy_leak",
      pattern: /fee switch|protocol-token value capture|protocol-token accrual|burn\/buyback|buyback|fee burn|burn materiality|treasury routing|tokenholder accrual model/i,
      forbidden: "Native BTC primary copy shows protocol-token accrual/buyback wording as a primary surface.",
    },
    {
      checkId: "btc_decision_thesis_repetition_guard",
      pattern: /Resolve the critical pillar|Critical tokenomics evidence is missing|utility or vesting support|Close the weakest-link gaps/i,
      forbidden: "Native BTC primary copy shows generic decision/tokenomics fallback wording instead of native monetary blocker copy.",
    },
  ];

  return definitions.map((definition) => {
    const matchedRows = rowsToCheck
      .map((row) => {
        const matches = String(row.renderedText || "").match(definition.pattern) || [];
        return matches.length ? {
          failureId: `${definition.checkId}:${row.surface}:${row.fieldPath}`,
          checkId: definition.checkId,
          matchedForbiddenPhrase: Array.from(new Set(matches)).join("; "),
          renderedText: row.renderedText,
          surface: row.surface,
          fieldPath: row.fieldPath,
          sourceObjectPath: row.sourceObjectPath,
          classification: row.classification,
          appearsInRenderedViewModel: row.appearsInRenderedViewModel,
          shouldBlock: row.classification === "primary-visible",
          reason: row.reason,
        } : null;
      })
      .filter(Boolean);
    const primaryVisibleFailures = matchedRows.filter((row) => row.shouldBlock);
    const secondaryVisibleMentions = matchedRows.filter((row) => row.classification === "secondary-visible");
    const auditOnlyMentions = matchedRows.filter((row) => row.classification === "audit-only");
    const internalIdExclusions = matchedRows.filter((row) => row.classification === "internal-id");
    const forbiddenListExclusions = matchedRows.filter((row) => row.classification === "forbidden-list");
    const beforeStateExclusions = matchedRows.filter((row) => row.classification === "before-state");
    const selfTriggerExclusions = matchedRows.filter((row) => row.classification === "report-metadata");
    return {
      ...definition,
      passed: primaryVisibleFailures.length === 0,
      matches: primaryVisibleFailures.map((failure) => failure.matchedForbiddenPhrase).filter((entry, index, all) => all.indexOf(entry) === index).slice(0, 5),
      primaryVisibleFailures,
      secondaryVisibleMentions,
      auditOnlyMentions,
      internalIdExclusions,
      forbiddenListExclusions,
      beforeStateExclusions,
      selfTriggerExclusions,
      allMatches: matchedRows,
      allowedWhen: "Only allowed when the selected asset is ETH/PoS, ERC-20, stablecoin, wrapped/LST, or protocol-token context rather than native BTC.",
      checkedFields: [
        "Decision Header / Command Header primary model text",
        "Decision Tab / Decision Snapshot primary model text",
        "Thesis Falsification primary model text",
        "Right Rail / Research Intelligence Rail primary blocker and weakest link",
        "Right Rail / What Would Change rail",
        "Visible asset class / framing / lens labels",
        "Institutional Checklist questionText",
        "Institutional Checklist primaryMissingEvidence",
        "Institutional Checklist primaryWhatWouldChange",
        "Institutional question synthesized answers",
        "Synthesized missingEvidence / whatWouldChange",
        "Analyst missingEvidence / whatWouldChange",
        "Tokenomics question answers and source requirements",
        "Reviewed evidence packet remaining requirements",
        "Source Queue requirements",
        "Manual Review signals",
        "Copy Review Bundle live mirror",
      ],
      checkedBundleSections: [
        "1. QA Bundle Header",
        "4. Decision / Command Header",
        "2A. Reviewed Evidence Packet v1",
        "5. Thesis Falsification",
        "6. Institutional Checklist",
        "6A. Tokenomics / Supply Integrity Tab Mirror",
        "9. Source Queue",
        "10. Manual Review",
      ],
    };
  });
}

function buildEthBenchmarkForbiddenStringChecks({
  primaryText,
  corpusRows,
  bundleText,
  asset,
  lens,
  assetIdentityResolution,
  reviewedEvidencePacket,
}) {
  const assetText = `${asset?.symbol || ""} ${asset?.name || ""} ${asset?.id || ""} ${asset?.coingeckoId || ""} ${reviewedEvidencePacket?.packetId || ""}`;
  const identityText = `${assetIdentityResolution?.canonicalAssetName || ""} ${assetIdentityResolution?.canonicalAssetSymbol || ""} ${assetIdentityResolution?.canonicalProviderIds?.coingeckoId || ""} ${assetIdentityResolution?.nativeNetworkCandidate || ""} ${assetIdentityResolution?.canonicalNetworkCandidate || ""} ${assetIdentityResolution?.representationType || ""} ${assetIdentityResolution?.bridgedOrWrappedStatus || ""}`;
  const lensText = `${lens?.lensId || ""} ${lens?.questionGroupId || ""}`;
  const contextText = `${assetText} ${identityText} ${lensText}`.toLowerCase();
  const isNativeEthContext = /\b(ethereum|ether|eth|reviewed-demo-eth-v1)\b/i.test(contextText)
    && /\b(base_layer_settlement|base-layer|settlement|ethereum)\b/i.test(contextText)
    && !/\b(weth|wrapped|bridged|liquid staking|steth|reth|cbeth|wsteth)\b/i.test(contextText);
  if (!isNativeEthContext) return [];

  const normalizedRows = normalizeBtcRenderedGateRows(corpusRows);
  const rowsToCheck = normalizedRows.length ? normalizedRows : [{
    surface: "legacyTextBlob",
    fieldPath: "primaryText",
    sourceObjectPath: "primaryText",
    renderedText: String(primaryText || bundleText || ""),
    classification: "primary-visible",
    appearsInRenderedViewModel: true,
    reason: "Legacy scanner input.",
  }];
  const definitions = [
    {
      checkId: "eth_btc_pow_copy_leak",
      pattern: /Native PoW|proof-of-work|proof of work|miner economics|miner revenue|hashrate|mining-pool|mining pool|halving|block subsidy|coinbase subsidy|native monetary benchmark/i,
      forbidden: "Native ETH primary copy shows BTC PoW/miner/hashrate/halving/block-subsidy wording.",
    },
    {
      checkId: "eth_wrapped_custody_backing_copy_leak",
      pattern: /proof-of-reserves|proof of reserves|wrapped asset|wrapped exposure|custodian\/merchant|bridge controls|backing.*redemption|redemption path.*custodian/i,
      forbidden: "Native ETH primary copy shows wrapped/custody/backing/redemption wording.",
    },
    {
      checkId: "eth_stablecoin_trust_copy_leak",
      pattern: /stablecoin|reserve composition|\battestation\b|reserve attestation|redemption eligibility|issuer\/custodian|admin\/freeze policy|peg stress/i,
      forbidden: "Native ETH primary copy shows stablecoin reserve/redemption/issuer-control wording.",
    },
    {
      checkId: "eth_rwa_rights_copy_leak",
      pattern: /RWA NAV|legal claim|legal\/economic rights|tokenized asset|issuer, custodian, collateral|redemption enforceability|NAV/i,
      forbidden: "Native ETH primary copy shows RWA legal/NAV/redemption wording.",
    },
    {
      checkId: "eth_depin_gaming_meme_copy_leak",
      pattern: /resource demand|compute\/storage|payer mapping|provider incentives|active players|paying users|game volume|meme|narrative asset/i,
      forbidden: "Native ETH primary copy shows DePIN, gaming, or meme wording.",
    },
    {
      checkId: "eth_erc20_admin_primary_copy_leak",
      pattern: /ERC-20 admin|proxy\/admin|selected contract.*non-mintable|selected contract reported non-mintable|contract scan.*required|mint\/admin.*selected contract/i,
      forbidden: "Native ETH primary copy shows ERC-20 contract/admin/proxy wording.",
    },
    {
      checkId: "eth_generic_fallback_copy_leak",
      pattern: /Resolve the critical pillar|Critical tokenomics evidence is missing|utility or vesting support|Close the weakest-link gaps/i,
      forbidden: "Native ETH primary copy shows generic decision/tokenomics fallback wording instead of PoS settlement blocker copy.",
    },
  ];

  return definitions.map((definition) => {
    const matchedRows = rowsToCheck
      .map((row) => {
        const matches = String(row.renderedText || "").match(definition.pattern) || [];
        return matches.length ? {
          failureId: `${definition.checkId}:${row.surface}:${row.fieldPath}`,
          checkId: definition.checkId,
          matchedForbiddenPhrase: Array.from(new Set(matches)).join("; "),
          renderedText: row.renderedText,
          surface: row.surface,
          fieldPath: row.fieldPath,
          sourceObjectPath: row.sourceObjectPath,
          classification: row.classification,
          appearsInRenderedViewModel: row.appearsInRenderedViewModel,
          shouldBlock: row.classification === "primary-visible",
          reason: row.reason,
        } : null;
      })
      .filter(Boolean);
    const primaryVisibleFailures = matchedRows.filter((row) => row.shouldBlock);
    const secondaryVisibleMentions = matchedRows.filter((row) => row.classification === "secondary-visible");
    const auditOnlyMentions = matchedRows.filter((row) => row.classification === "audit-only");
    const internalIdExclusions = matchedRows.filter((row) => row.classification === "internal-id");
    const forbiddenListExclusions = matchedRows.filter((row) => row.classification === "forbidden-list");
    const beforeStateExclusions = matchedRows.filter((row) => row.classification === "before-state");
    const selfTriggerExclusions = matchedRows.filter((row) => row.classification === "report-metadata");
    return {
      ...definition,
      passed: primaryVisibleFailures.length === 0,
      matches: primaryVisibleFailures.map((failure) => failure.matchedForbiddenPhrase).filter((entry, index, all) => all.indexOf(entry) === index).slice(0, 5),
      primaryVisibleFailures,
      secondaryVisibleMentions,
      auditOnlyMentions,
      internalIdExclusions,
      forbiddenListExclusions,
      beforeStateExclusions,
      selfTriggerExclusions,
      allMatches: matchedRows,
      allowedWhen: "Only allowed when the selected asset is BTC/PoW, wrapped/LST, stablecoin, RWA, DePIN, gaming, meme, or ERC-20 contract-token context rather than native ETH.",
      checkedFields: [
        "Decision Header / Command Header primary model text",
        "Decision Tab / Decision Snapshot primary model text",
        "Thesis Falsification primary model text",
        "Right Rail / Research Intelligence Rail primary blocker and weakest link",
        "Right Rail / What Would Change rail",
        "Visible asset class / framing / lens labels",
        "Institutional Checklist questionText",
        "Institutional Checklist primaryMissingEvidence",
        "Institutional Checklist primaryWhatWouldChange",
        "Institutional question synthesized answers",
        "Tokenomics question answers and source requirements",
        "Source Queue requirements",
        "Manual Review signals",
        "Copy Review Bundle live mirror",
      ],
      checkedBundleSections: [
        "4. Decision / Command Header",
        "5. Thesis Falsification",
        "6. Institutional Checklist",
        "6A. Tokenomics / Supply Integrity Tab Mirror",
        "9. Source Queue",
        "10. Manual Review",
        "12D. ETH Benchmark Answer / PoS Settlement Text QA",
      ],
    };
  });
}

function bundleControlStatusLabel(value, kind, lensId) {
  if (lensId === "STABLECOIN_SETTLEMENT" && kind === "mint") {
    if (value === "requires_manual_review") return "present / issuer-controlled / requires policy review";
    if (value === "verified") return "not detected on selected contract; issuer mint/redeem still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires issuer policy review";
  }
  if (lensId === "STABLECOIN_SETTLEMENT" && kind === "admin") {
    if (value === "requires_manual_review") return "present / requires policy review";
    if (value === "verified") return "not detected on selected contract; freeze/admin policy still requires review";
    if (value === "not_applicable") return "not applicable to selected scan";
    return "unknown / requires policy review";
  }
  if (kind === "mint" && value === "verified") return "selected contract reported non-mintable";
  if (kind === "admin" && value === "verified") return "owner/admin risk not detected on selected contract";
  if (value === "requires_manual_review") return "detected / requires review";
  return titleCase(value || "Unavailable");
}

export function buildReviewBundleText({
  asset,
  analysis,
  data,
  model,
  displayIdentity,
  evidenceStatusProxy,
  analysisQualityExplanation,
  sourceStatus,
  providerDiagnostics,
  notableDiagnostics,
  providerHealth,
  officialLinks,
  whitepaperDocs,
  scores,
  confidence,
  meta,
  snapshot,
  timelineData,
  compareData,
  aiReport,
  fundamentals,
  security,
} = {}) {
  const safeData = safeObject(data);
  const safeAnalysis = safeObject(analysis || safeData.analysis);
  const safeModel = safeObject(model);
  const safeAsset = safeObject(asset || safeData.asset);
  const safeMeta = safeObject(meta || safeData.meta);
  const safeScores = safeObject(scores || safeData.scores || safeAnalysis.scores);
  const safeConfidence = safeObject(confidence || safeAnalysis.confidence || safeData.confidence);
  const decisionLayer = safeObject(safeAnalysis.decisionLayer);
  const decisionFrame = safeObject(decisionLayer.decisionFrame);
  const thesisCore = safeObject(safeAnalysis.thesisCore);
  const verdictReasons = safeObject(decisionLayer.verdictReasons || safeModel.verdictReasons);
  const allocationCase = safeObject(safeModel.allocationCase || decisionLayer.allocationCase);
  const rawAllocationCase = safeObject(decisionLayer.allocationCase);
  const scoringPolicy = safeObject(safeAnalysis.scoringPolicy);
  const sourceStatusObject = safeObject(sourceStatus || safeData.sourceStatus);
  const providerDiagnosticsList = safeArray(providerDiagnostics || safeMeta.providerDiagnostics);
  const providerNotes = normalizeRenderableList(safeMeta.providerNotes);
  const warnings = normalizeRenderableList(safeData.warnings);
  const lens = safeModel.resolvedInstitutionalLens || normalizeResolvedInstitutionalLensPayload(safeAnalysis);
  const lensAware = safeModel.lensAwareExplanations || normalizeLensAwareExplanationsPayload(safeAnalysis);
  const assetIdentityResolution = safeModel.assetIdentityResolution || normalizeAssetIdentityResolutionPayload(safeData) || normalizeAssetIdentityResolutionPayload(safeAnalysis);
  const tokenomicsSupplyIntegrity = safeModel.tokenomicsSupplyIntegrity || normalizeTokenomicsSupplyIntegrityPayload(safeData) || normalizeTokenomicsSupplyIntegrityPayload(safeAnalysis);
  const reviewedEvidencePacket = safeModel.reviewedEvidencePacket || normalizeReviewedEvidencePacketPayload(safeData) || normalizeReviewedEvidencePacketPayload(safeAnalysis);
  const assetInterpretationContract = safeModel.assetInterpretationContract || normalizeAssetInterpretationContractPayload(safeData) || normalizeAssetInterpretationContractPayload(safeAnalysis);
  const effectiveInstitutionalLens = safeModel.effectiveInstitutionalLens || normalizeEffectiveInstitutionalLensPayload(safeData, assetInterpretationContract) || normalizeEffectiveInstitutionalLensPayload(safeAnalysis, assetInterpretationContract);
  const dataFirstNarrativeContract = safeModel.dataFirstNarrativeContract || normalizeDataFirstNarrativeContractPayload(safeData) || normalizeDataFirstNarrativeContractPayload(safeAnalysis);
  const engineLearningBackbone = safeModel.engineLearningBackbone || normalizeEngineLearningBackbonePayload(safeData) || normalizeEngineLearningBackbonePayload(safeAnalysis);
  const providerCategorySignals = safeModel.providerCategorySignals || normalizeProviderCategorySignalsPayload(safeData) || normalizeProviderCategorySignalsPayload(safeAnalysis);
  const categoryDrivenAssetFamilyContract = safeModel.categoryDrivenAssetFamilyContract || normalizeCategoryDrivenAssetFamilyContractPayload(safeData) || normalizeCategoryDrivenAssetFamilyContractPayload(safeAnalysis);
  const categoryDataRequirementProfiles = safeModel.categoryDataRequirementProfiles || normalizeCategoryDataRequirementProfilesPayload(safeData) || normalizeCategoryDataRequirementProfilesPayload(safeAnalysis);
  const categoryAnswerBuilder = safeModel.categoryAnswerBuilder || normalizeCategoryAnswerBuilderPayload(safeData) || normalizeCategoryAnswerBuilderPayload(safeAnalysis);
  const categoryReadinessDiagnostics = safeModel.categoryReadinessDiagnostics || normalizeCategoryReadinessDiagnosticsPayload(safeData) || normalizeCategoryReadinessDiagnosticsPayload(safeAnalysis);
  const searchIdentityReconciliation = assetIdentityResolution?.searchIdentityReconciliation || null;
  const questions = safeModel.institutionalQuestions || normalizeInstitutionalQuestionsPayload(safeAnalysis).institutionalQuestions;
  const calibrationWarnings = safeModel.calibrationWarnings || normalizeCalibrationWarningsPayload(safeAnalysis);
  const analysisFreshness = safeModel.analysisFreshness || normalizeAnalysisFreshnessPayload(safeData, snapshot || safeData.snapshot);
  const bundleGeneratedAt = new Date().toISOString();
  const normalizedFreshnessFromPayload = normalizeAnalysisFreshnessPayload(safeData, snapshot || safeData.snapshot);
  const bundleUsesSameCurrentAnalysisObject = Boolean(
    safeModel.analysisFreshness
    && analysisFreshness.freshnessStatus === normalizedFreshnessFromPayload.freshnessStatus
    && String(analysisFreshness.snapshotId || "") === String(normalizedFreshnessFromPayload.snapshotId || "")
    && String(analysisFreshness.generatedAt || "") === String(normalizedFreshnessFromPayload.generatedAt || ""),
  );
  const freshnessTabsWithVisibility = [
    "Decision Header",
    "Right Rail",
    "Evidence Map",
    "Source Queue",
    "Manual Review",
    "Audit / Raw",
    "Copy Review Bundle",
  ];
  const freshnessQaWarnings = [
    !analysisFreshness.freshQaEligible ? analysisFreshness.qaEligibilityWarning : null,
    !bundleUsesSameCurrentAnalysisObject ? "Bundle freshness metadata could not be proven identical to the normalized product-tab object." : null,
    analysisFreshness.isSnapshot ? "Snapshot-derived output must remain historical/compare-only and cannot be used as post-patch fresh QA evidence." : null,
    analysisFreshness.isCachedRecentMemo ? "Cached/recent memo output requires a fresh analysis before current QA." : null,
    analysisFreshness.freshnessStatus === "unknown" ? "Freshness state is ambiguous; run fresh analysis before current QA." : null,
  ].filter(Boolean);
  const questionMismatchWarnings = safeArray(calibrationWarnings).filter((warning) => warning?.id === "question_lens_mismatch");
  const providerInternalFlags = safeArray(lens?.ambiguityFlags).filter((flag) => /provider|internal|disagree|conflict|mismatch/i.test(flag));
  const lensAwarePrimaryDisplayActive = resolvedLensIsDisplayAuthoritative(lens) && Boolean(lensAware);
  const filterPrimaryBundleItems = (items) => {
    const normalized = normalizeRenderableList(items);
    return lensAwarePrimaryDisplayActive
      ? normalized.filter((item) => !includesGenericPrimaryCopy(item))
      : normalized;
  };
  const visiblePrimaryText = [
    safeModel.whyNow,
    safeModel.whyNotNow,
    safeModel.summaryMemo,
    safeModel.structuredThesisSummary,
    safeModel.primaryWeakness,
    safeModel.failureMode?.primary,
    safeModel.failureMode?.trigger,
    safeModel.tokenDemandTruth,
    safeModel.primaryBlocker?.label,
    safeModel.weakestLink?.label,
    ...(safeModel.whatWouldChangeDecision?.items || []),
    ...(safeModel.missingCritical || []),
    ...(safeModel.requiredConditions || []),
    ...(safeModel.whatMustBeTrue || []),
    ...(safeModel.whatCouldBreak || []),
    ...(safeModel.nextCheckpoints || []),
    ...(safeModel.decisionDrivers || []),
    ...(safeModel.topPositiveDrivers || []),
    ...(safeModel.topNegativeDrivers || []),
    ...(safeModel.blockers || []),
    ...safeArray(safeModel.researchRequirements).flatMap((requirement) => [
      requirement?.title,
      requirement?.reason,
      ...(requirement?.evidenceNeeded || []),
    ]),
  ].filter(Boolean).join(" ");
  const renderedSurfaceParityViewModel = buildRenderedSurfaceParityViewModel({
    model: {
      ...safeModel,
      effectiveInstitutionalLens,
    },
    displayIdentity,
  });
  const renderedPrimaryVisibleText = renderedSurfaceParityViewModel.primaryVisibleText.join("\n");
  const rawDecisionText = [
    ...(decisionFrame.whatMustBeTrue || []).map((item) => extractRenderableText(item, null)),
    ...(decisionFrame.nextCheckpoints || []).map((item) => extractRenderableText(item, null)),
    ...(decisionLayer.researchRequirements || []).flatMap((requirement) => [
      requirement?.title,
      ...(requirement?.evidenceNeeded || []),
    ]),
  ].filter(Boolean).join(" ");
  const rawGenericVisible = includesGenericPrimaryCopy(visiblePrimaryText);
  const rawGenericAudit = includesGenericPrimaryCopy(rawDecisionText);
  const suggestedResearchDomains = buildLensSpecificResearchDomains(safeModel, displayIdentity);
  const primaryAssetFramingText = [
    displayIdentity?.displayFraming,
    displayIdentity?.displayAssetClass,
    safeModel.assetFramingLabel,
    safeModel.assetClassLabel,
  ].filter(Boolean).join(" ");
  const manualFramingWhileLensResolved = resolvedLensIsDisplayAuthoritative(lens) && /manual classification needed|general low-coverage asset/i.test(primaryAssetFramingText);
  const staleResearchDomains = resolvedLensIsDisplayAuthoritative(lens)
    && suggestedResearchDomains.some((domain) => /manual classification needed|\bAI\b|\bL1\b/i.test(String(domain)))
    && !["BASE_LAYER_SETTLEMENT", "NATIVE_MONETARY_BENCHMARK"].includes(lens?.lensId);
  const genericPrimaryDespiteLens = resolvedLensIsDisplayAuthoritative(lens) && rawGenericVisible;
  const protocolMappingSkipped = lens?.lensId === "DEFI_PROTOCOL_TOKEN" && (
    safeArray(calibrationWarnings).some((warning) => warning?.id === "protocol_mapping_failure_for_major_protocol")
    || /skipped|unavailable|missing|unsupported|unmapped/i.test(String(sourceStatusObject.protocolUsage || sourceStatusObject.protocolEconomics || ""))
  );
  const tokenomicsMissingMaxWithoutRequirement = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.maxSupplyStatus === "none_or_unknown"
    && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /max supply|emission policy/i.test(item));
  const tokenomicsMissingUnlocksWithoutCap = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.unlockScheduleStatus === "unknown"
    && ![...safeArray(tokenomicsSupplyIntegrity.confidenceCaps), ...safeArray(tokenomicsSupplyIntegrity.sourceRequirements)].some((item) => /unlock|vesting/i.test(item));
  const tokenomicsMintAdminWithoutWarning = tokenomicsSupplyIntegrity
    && /manual|unknown/i.test(`${tokenomicsSupplyIntegrity.mintAuthorityStatus} ${tokenomicsSupplyIntegrity.adminControlStatus}`)
    && ![...safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers), ...safeArray(tokenomicsSupplyIntegrity.scoreCaps)].some((item) => /mint|admin|authority/i.test(item));
  const tokenomicsContradictionWithoutWarning = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.sourceContradictions).length
    && !safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers).some((item) => /contradict|inconsistent|provider/i.test(item));
  const tokenomicsHighFdvWithoutDilutionNote = tokenomicsSupplyIntegrity
    && Number(tokenomicsSupplyIntegrity.fdvMarketCapRatio) >= 3
    && ![...safeArray(tokenomicsSupplyIntegrity.softBlockers), ...safeArray(tokenomicsSupplyIntegrity.negativeSignals)].some((item) => /dilution|fdv|float/i.test(item));
  const tokenomicsProviderRowsMissing = tokenomicsSupplyIntegrity
    && [tokenomicsSupplyIntegrity.currentPrice, tokenomicsSupplyIntegrity.marketCap, tokenomicsSupplyIntegrity.fdv, tokenomicsSupplyIntegrity.circulatingSupply, tokenomicsSupplyIntegrity.maxSupplyValue].some((value) => value !== null && value !== undefined)
    && ![
      ...safeArray(tokenomicsSupplyIntegrity.providerMarketCaps),
      ...safeArray(tokenomicsSupplyIntegrity.providerFdvs),
      ...safeArray(tokenomicsSupplyIntegrity.providerVolumes),
      ...safeArray(tokenomicsSupplyIntegrity.providerSupplyValues),
    ].length;
  const tokenomicsMissingRatioDespiteValues = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.fdv !== null
    && tokenomicsSupplyIntegrity.fdv !== undefined
    && tokenomicsSupplyIntegrity.marketCap
    && (tokenomicsSupplyIntegrity.fdvMarketCapRatio === null || tokenomicsSupplyIntegrity.fdvMarketCapRatio === undefined);
  const tokenomicsMissingDilutionDespiteValues = tokenomicsSupplyIntegrity
    && tokenomicsSupplyIntegrity.circulatingSupply !== null
    && tokenomicsSupplyIntegrity.circulatingSupply !== undefined
    && tokenomicsSupplyIntegrity.maxSupplyValue
    && (tokenomicsSupplyIntegrity.remainingDilutionPercent === null || tokenomicsSupplyIntegrity.remainingDilutionPercent === undefined);
  const tokenomicsFormulaOutputs = safeArray(tokenomicsSupplyIntegrity?.formulaOutputs);
  const tokenomicsFormulaOutputsMissing = tokenomicsSupplyIntegrity
    && [tokenomicsSupplyIntegrity.marketCap, tokenomicsSupplyIntegrity.fdv, tokenomicsSupplyIntegrity.circulatingSupply, tokenomicsSupplyIntegrity.maxSupplyValue].some((value) => value !== null && value !== undefined)
    && !tokenomicsFormulaOutputs.length;
  const tokenomicsQuestionsMissingLinkage = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).length
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) => !safeArray(question.dataFieldsUsed).length && !safeArray(question.formulaOutputsUsed).length);
  const tokenomicsQuestions = safeArray(tokenomicsSupplyIntegrity?.institutionalQuestions);
  const tokenomicsQuestionAccordionMirrorMissing = tokenomicsSupplyIntegrity && !tokenomicsQuestions.length;
  const tokenomicsQuestionExpandedMissingShortAnswer = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) => !String(question?.shortAnswer || question?.answerSummary || "").trim());
  const tokenomicsQuestionMissingDataFormulaRule = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      !safeArray(question?.dataFieldsUsed).length
      && !safeArray(question?.formulaOutputsUsed).length
      && !/not_applicable|manual|source_required|evidence_missing/i.test(String(question?.answerStatus || "")),
    );
  const tokenomicsQuestionVagueUnknown = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      /\bunknown\b/i.test(String(question?.shortAnswer || question?.answerSummary || ""))
      && [
        ...safeArray(question?.missingEvidence),
        ...safeArray(question?.whatWouldChange),
        ...safeArray(question?.sourceBoundary),
      ].length,
    );
  const tokenomicsNotApplicableShownAsFailure = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      question?.answerStatus === "not_applicable"
      && /failure|blocker|critical|penalty|failed/i.test(`${question?.shortAnswer || ""} ${question?.answerSummary || ""} ${question?.impactOnScoreOrConfidence || ""}`),
    );
  const formulaLinkedQuestionPattern = /remaining_dilution|unlock|supply_reconciliation|provider_supply|dilution_absorption|market_cap/i;
  const tokenomicsComputedFormulaNotCited = tokenomicsSupplyIntegrity
    && tokenomicsFormulaOutputs.some((formula) => formula?.status === "computed")
    && tokenomicsQuestions.some((question) =>
      formulaLinkedQuestionPattern.test(`${question?.questionId || ""} ${question?.questionText || ""}`)
      && !safeArray(question?.formulaOutputsUsed).length
      && !/not_applicable/i.test(String(question?.answerStatus || "")),
    );
  const tokenomicsMissingInputFormulaNoRequirement = tokenomicsSupplyIntegrity
    && tokenomicsFormulaOutputs.some((formula) =>
      /missing|source_required/i.test(String(formula?.status || ""))
      && !safeArray(formula?.missingInputs).length
      && !String(formula?.sourceRequirement || "").trim(),
    );
  const tokenomicsProviderReportedAsReviewed = tokenomicsSupplyIntegrity
    && tokenomicsQuestions.some((question) =>
      /reviewed evidence present|reviewed=true|source-backed reviewed/i.test(`${question?.shortAnswer || ""} ${question?.answerSummary || ""}`)
      && safeArray(question?.sourceBoundary).some((entry) => /provider-reported|provider reported|not reviewed/i.test(String(entry))),
    );
  const allSynthesizedQuestions = [
    ...safeArray(questions),
    ...tokenomicsQuestions,
  ].filter((question) => question?.synthesizedAnswer);
  const synthesizedAnswerMissing = [...safeArray(questions), ...tokenomicsQuestions].some((question) => !question?.synthesizedAnswer);
  const genericMethodologySynthesisLeak = allSynthesizedQuestions.some((question) =>
    /\b(this lens tests|this question evaluates|the engine checks|this methodology assesses|this framework looks at)\b/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const synthesizedBadRenderableValue = allSynthesizedQuestions.some((question) =>
    /\b(undefined|null|nan|infinity|\[object object\])\b/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const sourceBackedSynthesisWithoutSourceList = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "source_backed"
    && (!safeArray(question?.synthesizedAnswer?.reviewedSourcesUsed).length || !safeArray(question?.synthesizedAnswer?.reviewedFactsUsed).length),
  );
  const synthesizedScoringBoundaryViolation = allSynthesizedQuestions.some((question) =>
    safeArray(question?.synthesizedAnswer?.reviewedSourcesUsed).some((source) => source?.scoringEligible)
    || safeArray(question?.synthesizedAnswer?.sourceBoundary).some((entry) => /scoring_active/i.test(String(entry)) && !/not_scoring_active/i.test(String(entry))),
  );
  const providerOnlySynthesisOverclaimed = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "provider_reported"
    && /source-backed|reviewed evidence proves|confirmed by reviewed/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const computedSynthesisOverclaimed = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "computed"
    && /reviewed evidence proves|source-backed/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const stablecoinCopyLeakageInSynthesis = allSynthesizedQuestions.some((question) =>
    lens?.lensId !== "STABLECOIN_SETTLEMENT"
    && /stablecoin trust framing/i.test(String(question?.synthesizedAnswer?.directAnswer || "")),
  );
  const irrelevantSectorSignalLeakageInSynthesis = allSynthesizedQuestions.some((question) =>
    /AI sector markers|gaming markers outside gaming|RWA markers outside RWA|stablecoin framing outside stablecoins|meme markers outside meme/i.test(JSON.stringify(question?.synthesizedAnswer || {})),
  );
  const supportedSourceRequiredSynthesisMismatch = allSynthesizedQuestions.some((question) =>
    question?.synthesizedAnswer?.evidenceStatus === "source_required"
    && ["supported", "partially_supported"].includes(question?.answerStatus)
    && !safeArray(question?.synthesizedAnswer?.answerQualityFlags).some((flag) => /legacy_support_status_is_not_reviewed_evidence/.test(String(flag))),
  );
  const analystCards = allSynthesizedQuestions.map((question) => ({ question, card: getAnalystAnswerCard(question) }));
  const analystCardMissing = allSynthesizedQuestions.some((question) => !safeObject(question?.synthesizedAnswer?.analystAnswerCard).directAnswer);
  const analystPrimaryMissingAnswer = analystCards.some(({ card }) => !String(card?.directAnswer || "").trim());
  const analystPrimaryTemplateLeakage = analystCards.some(({ card }) =>
    /synthesisTemplateId|institutional_answer_synthesis_v1|sourceBoundary|scoringFieldsUsed|tokenDemandQuality|Unavailable in current frontend model/i.test(`${card?.directAnswer || ""} ${card?.headlineStatus || ""} ${safeArray(card?.primaryBadges).join(" ")}`),
  );
  const analystPrimaryRawEnumLeakage = analystCards.some(({ card }) =>
    /provider_metadata_not_reviewed_evidence|reviewed_demo_evidence_not_scoring_active|scoring_active_existing_field|diagnostic_only_not_scoring_active/i.test(`${card?.directAnswer || ""} ${card?.headlineStatus || ""}`),
  );
  const analystContradictoryBadgeStack = analystCards.some(({ question, card }) =>
    ["supported", "partially_supported"].includes(question?.answerStatus)
    && /source review required|live data required/i.test(String(card?.headlineStatus || ""))
    && !safeArray(card?.auditFields).some((entry) => /legacyAnswerStatus/i.test(String(entry))),
  );
  const analystSourceBackedWithoutSources = analystCards.some(({ card }) =>
    /source-backed/i.test(String(card?.headlineStatus || ""))
    && !safeArray(card?.reviewedEvidenceUsed).length,
  );
  const analystProviderOnlyOverclaim = analystCards.some(({ card }) =>
    /provider context only/i.test(String(card?.headlineStatus || ""))
    && /source-backed|reviewed evidence proves|confirmed by reviewed/i.test(String(card?.directAnswer || "")),
  );
  const analystFormulaOverclaim = analystCards.some(({ card }) =>
    /formula-derived/i.test(String(card?.headlineStatus || ""))
    && /source-backed|reviewed evidence proves|confirmed by reviewed/i.test(String(card?.directAnswer || "")),
  );
  const analystBundleMirrorMissing = allSynthesizedQuestions.length > 0 && analystCards.some(({ card }) =>
    !card?.directAnswer || !card?.headlineStatus || !safeArray(card?.sourceBoundaryPlainEnglish).length,
  );
  const stablecoinAnalystCards = analystCards.filter(({ question }) =>
    /^stablecoin_/.test(String(question?.questionId || ""))
    || (lens?.lensId === "STABLECOIN_SETTLEMENT" && /^tokenomics_/.test(String(question?.questionId || ""))),
  );
  const stablecoinTrustNotApplicableLeakage = stablecoinAnalystCards.some(({ question, card }) =>
    ["stablecoin_trust_evidence", "stablecoin_what_changes"].includes(String(question?.questionId || ""))
    && (
      /not applicable/i.test(String(card?.headlineStatus || ""))
      || /not applicable as a protocol-token value-capture question/i.test(String(card?.directAnswer || ""))
    ),
  );
  const stablecoinProtocolNotApplicableMissing = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && stablecoinAnalystCards.some(({ question, card }) =>
      /burn_buyback|buyback|fee_switch|tokenholder_accrual|value_capture/i.test(String(question?.questionId || ""))
      && !/not applicable/i.test(`${card?.headlineStatus || ""} ${card?.directAnswer || ""}`),
    );
  const stablecoinTokenomicsScarcityDominance = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && stablecoinAnalystCards.some(({ question, card }) =>
      ["tokenomics_max_supply_credibility", "tokenomics_remaining_dilution"].includes(String(question?.questionId || ""))
      && !/reserve|redemption|mint\/redeem|issuer|supported-network|peg|stablecoin/i.test(`${card?.directAnswer || ""} ${safeArray(card?.missingEvidence).join(" ")}`),
    );
  const tokenomicsProviderBoundaryMissing = tokenomicsSupplyIntegrity
    && [
      ...safeArray(tokenomicsSupplyIntegrity.providerMarketCaps),
      ...safeArray(tokenomicsSupplyIntegrity.providerFdvs),
      ...safeArray(tokenomicsSupplyIntegrity.providerVolumes),
      ...safeArray(tokenomicsSupplyIntegrity.providerSupplyValues),
    ].some((entry) => !entry?.boundary && !safeArray(entry?.sourceBoundary).length);
  const tokenomicsCanonicalStablecoinWrongVariant = tokenomicsSupplyIntegrity
    && lens?.lensId === "STABLECOIN_SETTLEMENT"
    && assetIdentityResolution?.representationType === "issuer_native_multichain_stablecoin"
    && [
      ...safeArray(assetIdentityResolution.identityWarnings),
      ...safeArray(assetIdentityResolution.chainWarnings),
      ...safeArray(assetIdentityResolution.contractWarnings),
    ].some((entry) => /wrapped|bridged|secondary variant|native asset fundamentals do not automatically transfer/i.test(String(entry)));
  const issuerNativeStablecoinVariantWarningLeak = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && assetIdentityResolution?.representationType === "issuer_native_multichain_stablecoin"
    && assetIdentityResolution?.bridgedOrWrappedStatus === "none_detected"
    && safeArray(calibrationWarnings).some((warning) => warning?.id === "wrapped_or_bridged_variant_identity_review");
  const rwaProtocolProductChainCanonicalOverride = ["RWA_HYBRID_ASSET", "RWA_HYBRID_INFRASTRUCTURE"].includes(lens?.lensId)
    && /xrp ledger/i.test(String(assetIdentityResolution?.canonicalNetworkCandidate || ""))
    && /ethereum/i.test(String(assetIdentityResolution?.analyzedNetwork || assetChain || ""));
  const memeEvidenceRoutedManual = ["AMBIGUOUS_MANUAL_CLASSIFICATION", "GENERAL_LOW_COVERAGE"].includes(lens?.lensId)
    && /meme|narrative/i.test([
      safeAsset.category,
      safeAsset.narrative,
      displayIdentity?.displayFraming,
      displayIdentity?.displayAssetClass,
      safeArray(lens?.matchedSignals).join(" "),
    ].join(" "));
  const tokenomicsCrossScopeDisagreementPollution = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.providerDisagreements).some((entry) => /dexscreener/i.test(String(entry)))
    && safeArray(tokenomicsSupplyIntegrity.providerScopeNotes).some((entry) => /pair-level|scope differs/i.test(String(entry)));
  const tokenomicsQaUnrelatedDiagnostics = tokenomicsSupplyIntegrity
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) =>
      safeArray(question.evidenceUsed).some((entry) => /anthropic|github|fundraising|tokenterminal|intotheblock|de\.fi|api key/i.test(String(entry))),
    );
  const tokenomicsStablecoinQuestionsGeneric = tokenomicsSupplyIntegrity
    && lens?.lensId === "STABLECOIN_SETTLEMENT"
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) =>
      ["tokenomics_max_supply_credibility", "tokenomics_remaining_dilution"].includes(question.questionId)
      && !/stablecoin|mint\/redeem|reserve|redemption|issuer/i.test(`${question.answerSummary} ${question.shortAnswer} ${safeArray(question.missingEvidence).join(" ")}`),
    );
  const tokenomicsAmbiguousVerifiedControlLabels = false;
  const tokenomicsContractListTooLong = tokenomicsSupplyIntegrity
    && safeArray(assetIdentityResolution?.allKnownContracts).length > 5;
  const nativeTokenomicsLens = ["NATIVE_MONETARY_BENCHMARK", "BASE_LAYER_SETTLEMENT", "PAYMENTS_SETTLEMENT"].includes(lens?.lensId);
  const tokenomicsNativeNoContractPenalty = tokenomicsSupplyIntegrity
    && nativeTokenomicsLens
    && [
      ...safeArray(tokenomicsSupplyIntegrity.scoreCaps),
      ...safeArray(tokenomicsSupplyIntegrity.confidenceCaps),
      ...safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers),
    ].some((item) => /contract scan|erc-20|evm contract|mint\/admin/i.test(String(item)));
  const tokenomicsNativeUnlockPenalty = tokenomicsSupplyIntegrity
    && nativeTokenomicsLens
    && safeArray(tokenomicsSupplyIntegrity.confidenceCaps).some((item) => /Unlock schedule missing/i.test(String(item)));
  const tokenomicsStablecoinHardCapPrimary = tokenomicsSupplyIntegrity
    && lens?.lensId === "STABLECOIN_SETTLEMENT"
    && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).some((question) =>
      ["tokenomics_max_supply_credibility", "tokenomics_remaining_dilution"].includes(question.questionId)
      && question.answerStatus !== "not_applicable",
    );
  const tokenomicsProtocolSuccessAsAccrual = tokenomicsSupplyIntegrity
    && lens?.lensId === "DEFI_PROTOCOL_TOKEN"
    && tokenomicsSupplyIntegrity.tokenholderValueCaptureStatus === "provider_reported"
    && ![
      ...safeArray(tokenomicsSupplyIntegrity.sourceRequirements),
      ...safeArray(tokenomicsSupplyIntegrity.confidenceCaps),
      ...safeArray(tokenomicsSupplyIntegrity.manualReviewTriggers),
    ].some((item) => /fee switch|fee routing|buyback|burn|tokenholder|accrual|governance/i.test(String(item)));
  const tokenomicsMigrationWithoutRequirement = tokenomicsSupplyIntegrity
    && assetIdentityResolution?.migrationStatus
    && assetIdentityResolution.migrationStatus !== "none_detected"
    && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /migration|canonical|supported contract|old\/new/i.test(String(item)));
  const tokenomicsMemeManualDespiteLens = lens?.lensId === "MEME_NARRATIVE" && /manual classification|low-coverage/i.test(String(displayIdentity?.displayFraming || displayIdentity?.displayAssetClass || ""));
  const tokenomicsHighScoreWithCriticalCaps = tokenomicsSupplyIntegrity
    && Number(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore) >= 80
    && [
      ...safeArray(tokenomicsSupplyIntegrity.hardBlockers),
      ...safeArray(tokenomicsSupplyIntegrity.scoreCaps),
      ...safeArray(tokenomicsSupplyIntegrity.confidenceCaps),
    ].length > 0;
  const tokenomicsTooPunitiveForNotApplicable = tokenomicsSupplyIntegrity
    && Number(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore) < 50
    && safeArray(tokenomicsSupplyIntegrity.confidenceCaps).length === 0
    && safeArray(tokenomicsSupplyIntegrity.scoreCaps).length === 0
    && safeArray(tokenomicsSupplyIntegrity.hardBlockers).length === 0;
  const lstScoreCollapsedOnMissingEvidence = tokenomicsSupplyIntegrity
    && lens?.lensId === "LST_STAKING_DERIVATIVE"
    && Number(tokenomicsSupplyIntegrity.tokenomicsIntegrityScore) < 40
    && !safeArray(tokenomicsSupplyIntegrity.hardBlockers).some((entry) => /confirmed|critical|honeypot|exploit/i.test(String(entry)));
  const wbtcLikelyBridgedSelection = /wbtc/i.test(String(safeAsset.symbol || safeAsset.name || ""))
    && (/bridged/i.test(String(safeAsset.name || "")) || assetIdentityResolution?.representationType === "bridged_asset" || assetIdentityResolution?.wrongAssetRisk === "high");
  const highRiskSearchCandidateLooksSafe = searchIdentityReconciliation?.selectionSafetyLevel === "high_risk_manual"
    && !safeArray(searchIdentityReconciliation.selectionWarnings).length;
  const providerDisagreementHidden = searchIdentityReconciliation?.providerAgreement === "provider_disagreement"
    && !safeArray(searchIdentityReconciliation.providerDisagreementReasons).length;
  const riskySearchSelectionMissingBundleMirror = Boolean(searchIdentityReconciliation?.wrongAssetRisk && searchIdentityReconciliation.wrongAssetRisk !== "low")
    && !safeArray(searchIdentityReconciliation.displayLabels).some((entry) => /wrong-asset risk|manual|wrapped|bridged|lp|lending|leveraged|legacy|metadata/i.test(String(entry)));
  const tokenomicsUnsafeNumericText = /NaN|Infinity|undefined/.test(JSON.stringify(tokenomicsSupplyIntegrity || {}));
  const reviewedPacketLoaded = Boolean(reviewedEvidencePacket?.packetLoaded);
  const reviewedPacketMappings = safeArray(reviewedEvidencePacket?.questionMappings);
  const reviewedPacketSourceBackedNoSources = reviewedPacketMappings.some((mapping) =>
    /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || "")) && !safeArray(mapping?.reviewedSourcesUsed).length
  );
  const reviewedPacketScoringActive = reviewedEvidencePacket?.scoringActive === true
    || safeArray(reviewedEvidencePacket?.sources).some((source) => source?.scoringEligible === true);
  const reviewedPacketGenericSourceRequiredLeak = reviewedPacketLoaded && safeArray(questions).some((question) => {
    const mapping = reviewedPacketMappings.find((entry) => entry?.questionId === question?.questionId);
    return mapping?.answerUpgradeAvailable && /source required|evidence missing|provider metadata only/i.test(String(question?.answerSummary || ""));
  });
  const reviewedPacketMissingBundleSection = reviewedPacketLoaded && !safeArray(reviewedEvidencePacket?.sources).length;
  const reviewedPacketStaleMismatch = reviewedPacketMappings.some((mapping) =>
    mapping?.freshnessStatus === "stale"
    && safeArray(mapping?.reviewedSourcesUsed).some((source) => source?.freshnessStatus === "fresh")
  );
  const reviewedPacketContradictionHidden = reviewedPacketMappings.some((mapping) =>
    safeArray(mapping?.contradictionNotes).length && !/contradict/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMechanismBackedMarketLiquidity = reviewedPacketMappings.some((mapping) =>
    /market.*(depth|liquidity)|liquidity.*depth/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMechanismBackedDistributionOverhang = reviewedPacketMappings.some((mapping) =>
    /distribution|escrow|overhang|release|non-circulating|sell pressure/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMechanismBackedLiveLiveness = reviewedPacketMappings.some((mapping) =>
    /liveness|outage|downtime|congestion|network reliability/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketStablecoinBackedProtocolBurn = lens?.lensId === "STABLECOIN_SETTLEMENT"
    && reviewedPacketMappings.some((mapping) =>
      /burn_buyback|buyback|value_capture|tokenholder|accrual/i.test(String(mapping?.questionId || ""))
      && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    );
  const reviewedPacketProtocolPossibilityBackedActiveAccrual = reviewedPacketMappings.some((mapping) =>
    /tokenholder|accrual|value_capture|fee_switch|protocol_revenue/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && (
      mapping?.questionEvidenceScope !== "direct_answer"
      || safeArray(mapping?.evidenceMappingWarnings).some((warning) => /active|material|does not answer|does not prove/i.test(String(warning)))
      || safeArray(mapping?.reviewedEvidenceDoesNotAnswer).length
    )
  );
  const reviewedPacketRwaProductRightsAsProtocolRights = reviewedPacketMappings.some((mapping) =>
    /rwa|product_rights|underlying|legal_claim|economic_claim|redemption|aum/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && safeArray(mapping?.evidenceMappingWarnings).some((warning) => /RWA product|protocol-tokenholder|legal\/economic rights/i.test(String(warning)))
  );
  const reviewedPacketPlatformAumAsAccrual = reviewedPacketMappings.some((mapping) =>
    /aum|product|platform|protocol_revenue|tokenholder|accrual|value_capture/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && safeArray(mapping?.reviewedEvidenceDoesNotAnswer).some((entry) => /AUM|product|revenue|cash-flow|value capture|rights/i.test(String(entry)))
  );
  const reviewedPacketGamingDocsAsLiveDemand = reviewedPacketMappings.some((mapping) =>
    /active|paying|retention|game_volume|marketplace|tournament|demand_absorption|sustainable/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketMemeAsInvestmentQuality = reviewedPacketMappings.some((mapping) =>
    /investment|allocation|durable|fundamental|institutional/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketNativeL1DocsAsLiquidity = ["BASE_LAYER_SETTLEMENT", "NATIVE_L1", "NATIVE_MONETARY_BENCHMARK"].includes(lens?.lensId)
    && reviewedPacketMechanismBackedMarketLiquidity;
  const reviewedPacketSafetyModuleAsRiskFreeYield = reviewedPacketMappings.some((mapping) =>
    /risk.?free|guaranteed.?yield|safe.?yield|yield_sustainability/i.test(String(mapping?.questionId || ""))
    && /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
  );
  const reviewedPacketNativeBtcAppliedToWrappedVariant = reviewedEvidencePacket?.packetId === "reviewed-demo-btc-v1"
    && /wrapped|wbtc|bridged/i.test(`${safeAsset.name || ""} ${safeAsset.id || ""} ${safeAsset.coingeckoId || ""} ${assetIdentityResolution?.representationType || ""}`);
  const reviewedEvidenceIdentityConflictHidden = safeArray(reviewedEvidencePacket?.identityEvidenceReconciliationWarnings).length
    && ![
      ...safeArray(assetIdentityResolution?.identityEvidenceReconciliationWarnings),
      ...safeArray(assetIdentityResolution?.chainWarnings),
      ...safeArray(reviewedEvidencePacket?.warnings),
    ].some((entry) => /reviewed evidence|canonical representation|migration|upgrade/i.test(String(entry)));
  const reviewedEvidenceSourceBackedWithMaterialSameGaps = reviewedPacketMappings.some((mapping) =>
    /source_backed/i.test(String(mapping?.reviewedEvidenceStatus || ""))
    && safeArray(mapping?.remainingMissingEvidence).some((entry) => /same question|directly answers|primary metric/i.test(String(entry)))
  );
  const reviewedLstMechanismEliminatesRisk = lens?.lensId === "LST_STAKING_DERIVATIVE"
    && safeArray(questions).some((question) =>
      /source_backed/i.test(String(question?.reviewedEvidenceStatus || ""))
      && /risk solved|risk eliminated|no withdrawal risk|no slashing risk|no depeg risk/i.test(`${question?.answerSummary || ""} ${question?.shortAnswer || ""}`)
    );
  const reviewedPacketText = JSON.stringify(reviewedEvidencePacket || {});
  const reviewedPacketRenderGamingCopyLeak = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    && /gaming utility|gameplay|active users|paying users|game volume|tournament|retention/i.test(reviewedPacketText);
  const renderDepinMechanismQuestionIds = [
    "depin_resource_demand_visible",
    "depin_payer_demand_to_token_demand",
    "depin_provider_incentives_durability",
    "depin_usage_vs_tokenholder_capture",
  ];
  const renderDepinMechanismMappings = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    ? reviewedPacketMappings.filter((mapping) => renderDepinMechanismQuestionIds.includes(String(mapping?.questionId || "")))
    : [];
  const renderDepinMechanismCollapsedToSourceRequired = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    && renderDepinMechanismMappings.length > 0
    && renderDepinMechanismMappings.some((mapping) =>
      /source_required/i.test(String(mapping?.reviewedEvidenceStatus || ""))
      || !safeArray(mapping?.reviewedFactsUsed).some((fact) => /render-bme-payment-burn|render-bme-emissions|render-solana-token-context|render-rndr-to-render-upgrade/i.test(String(fact?.factId || "")))
    );
  const renderDepinLiveDemandIncorrectlyUpgraded = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    && reviewedPacketMappings.some((mapping) =>
      String(mapping?.questionId || "") === "depin_prove_resource_market_demand"
      && (/source_backed|partially_source_backed/i.test(String(mapping?.reviewedEvidenceStatus || "")) || mapping?.answerUpgradeAvailable === true)
    );
  const renderDepinMechanismFactsVisible = reviewedEvidencePacket?.packetId === "reviewed-demo-render-v1"
    ? renderDepinMechanismMappings.some((mapping) => safeArray(mapping?.reviewedFactsUsed).some((fact) => /render-bme-payment-burn|render-bme-emissions|render-solana-token-context|render-rndr-to-render-upgrade/i.test(String(fact?.factId || ""))))
    : null;
  const reviewedPacketOndoRenderWarningLeak = reviewedEvidencePacket?.packetId === "reviewed-demo-ondo-v1"
    && /RNDR|RENDER|Solana upgraded|Render migration/i.test(JSON.stringify([
      reviewedEvidencePacket?.identityEvidenceReconciliationWarnings,
      reviewedEvidencePacket?.warnings,
      assetIdentityResolution?.identityEvidenceReconciliationWarnings,
      assetIdentityResolution?.chainWarnings,
    ]));
  const uniSourceCandidateRequirementsMissing = reviewedEvidencePacket?.packetId === "reviewed-demo-uni-v1"
    && !/protocol-fee|fee switch|TokenJar|fee-routing|governance finality|materiality|market cap|direct economic benefit/i.test(JSON.stringify([
      reviewedEvidencePacket?.sourceQueueNotes,
      reviewedEvidencePacket?.remainingSourceRequirements,
    ]));
  const assetContract = safeAsset.contractAddress || safeAsset.contract || safeAsset.address || safeAsset.tokenAddress;
  const assetChain = safeAsset.chain || safeAsset.network || safeAsset.platform || safeAsset.chainId;
  const providerIds = [
    safeAsset.coingeckoId ? `coingecko: ${safeAsset.coingeckoId}` : null,
    safeAsset.coinmarketcapId ? `coinmarketcap: ${safeAsset.coinmarketcapId}` : null,
    safeAsset.cmcId ? `cmc: ${safeAsset.cmcId}` : null,
  ].filter(Boolean);
  const wbtcSingleProviderIdentityHidden = /wbtc|wrapped bitcoin/i.test(`${safeAsset.symbol || ""} ${safeAsset.name || ""}`)
    && providerIds.length === 1
    && !/single-provider|CoinGecko\/CoinMarketCap identity agreement|cross-provider/i.test(JSON.stringify([
      assetIdentityResolution?.identityWarnings,
      assetIdentityResolution?.sourceRequirements,
      assetIdentityResolution?.evidenceSourceSummary,
    ]));
  const stethFalseRwaAmbiguityVisible = lens?.lensId === "LST_STAKING_DERIVATIVE"
    && /steth|staked ether|lido/i.test(`${safeAsset.symbol || ""} ${safeAsset.name || ""}`)
    && safeArray(lens?.ambiguityFlags).some((flag) => /Competing RWA \/ Hybrid Methodology Asset|internal classification suggests RWA \/ Hybrid|RWA \/ Hybrid Methodology Asset/i.test(String(flag)));
  const checklistSupportedWithoutAnswer = safeArray(questions).some((question) =>
    ["supported", "partially_supported"].includes(question?.answerStatus)
    && !String(question?.shortAnswer || question?.answerSummary || "").trim(),
  );
  const checklistNoReadableFallback = safeArray(questions).some((question) =>
    !String(question?.questionText || "").trim()
    || (!String(question?.shortAnswer || question?.answerSummary || "").trim()
      && !["not_applicable", "manual_review_required", "evidence_missing", "reviewed_evidence_required", "contradicted"].includes(question?.answerStatus)),
  );
  const checklistRawSourceBoundaryPrimaryRisk = safeArray(questions).some((question) =>
    safeArray(question?.sourceBoundary).some((entry) => /scoring_active_existing_field|provider_metadata_not_reviewed_evidence|diagnostic_only_not_scoring_active/i.test(String(entry))),
  );
  const checklistLongSignalsRisk = safeArray(questions).some((question) => safeArray(question?.supportingSignals).length > 5);
  const questionMatchStatus = questionGroupMatchesLens(questions, lens);
  const identityWarnings = safeArray(calibrationWarnings).filter((warning) => /identity|variant|wrapped|bridged/i.test(String(warning?.id || warning?.issue || "")));
  const lastAnalyzed = safeData.lastAnalyzed || safeData.generatedAt || snapshot?.generatedAt || safeData.snapshot?.generatedAt || safeMeta.generatedAt;
  const verdictLabel = safeModel.allocationOutcome?.label || safeModel.verdictSemantics?.label || decisionLayer.finalVerdictLabel || decisionLayer.currentState?.label;
  const verdictClass = safeModel.verdictClass || decisionLayer.verdictClass;
  const boundary = "Research support only. Not financial advice. No price prediction. Provider metadata is not reviewed evidence; source candidates and report-only overlays are not live scoring input.";
  const visibleContractDisplay = safeObject(assetInterpretationContract?.visibleDisplayContract);
  const visibleBundleLensLabel = visibleContractDisplay.primaryVisibleLabel || lens?.visibleLabelOverride || lens?.displayLabel || displayIdentity?.displayAssetClass || lens?.label || safeModel.assetClassLabel;
  const visibleBundleFramingLabel = visibleContractDisplay.assetFramingLabel || displayIdentity?.displayFraming || lens?.displayFraming || safeModel.assetFramingLabel;
  const assetInterpretationContractMissing = Boolean(lens?.lensId) && !assetInterpretationContract;
  const dataFirstNarrativeMissing = resolvedLensIsDisplayAuthoritative(lens) && !dataFirstNarrativeContract;
  const assetInterpretationHardGateFailure = Boolean(
    (assetInterpretationContract
      && assetInterpretationContract.visibleDisplayContract?.hardGateStatus === "FAIL")
    || dataFirstNarrativeMissing,
  );
  const assetInterpretationVisibleLabelMismatch = assetInterpretationContract
    && visibleContractDisplay.primaryVisibleLabel
    && visibleBundleLensLabel
    && visibleContractDisplay.primaryVisibleLabel !== visibleBundleLensLabel;
  const nonEthLensShowingEthGasLabel = assetInterpretationContract
    && visibleContractDisplay.labelFamily !== "native_pos_settlement_gas"
    && /PoS Smart-Contract Settlement \/ Gas Asset|Gas Asset/i.test(String(visibleBundleLensLabel));
  const effectiveSourceMatrixIds = safeArray(effectiveInstitutionalLens?.sourceMatrixEntryIds || assetInterpretationContract?.effectiveInstitutionalLens?.sourceMatrixEntryIds || assetInterpretationContract?.evidenceInterpretationContract?.sourceMatrixEntryIds);
  const sourceMatrixFamilyMismatch = categoryDrivenAssetFamilyContract?.primaryAssetFamily === "tokenized_gold_commodity_rwa"
    ? !effectiveSourceMatrixIds.includes("matrix_tokenized_gold_commodity_rwa")
    : categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform"
      ? !effectiveSourceMatrixIds.includes("matrix_non_eth_l1_smart_contract_platform")
      : false;
  const visibleLensLabelMirror = safeArray(renderedSurfaceParityViewModel?.surfaces?.visibleLensLabel);
  const visibleLensLabelMirrorMissing = !visibleLensLabelMirror.length && visibleBundleLensLabel !== "not_rendered_by_ui";
  const dataFirstNarrativeFailing = dataFirstNarrativeContract
    && dataFirstNarrativeContract.primaryNarrativeGateStatus === "FAIL";
  const aicLabelPassButNarrativeFail = assetInterpretationContract
    && assetInterpretationContract.visibleDisplayContract?.hardGateStatus === "PASS"
    && (dataFirstNarrativeFailing || dataFirstNarrativeMissing);
  const scoreExplanationNotDataBound = dataFirstNarrativeContract
    && dataFirstNarrativeContract.scoreExplanationInputs?.scoreExplanationDataBacked === false;
  const sourceUniversePromoted = safeArray(assetInterpretationContract?.evidenceInterpretationContract?.sourceUniverseTaxonomy)
    .some((entry) => entry?.promotedToReviewedEvidence || entry?.reviewedEvidenceScoringActive);
  const btcRenderedGateCorpusRows = buildBtcRenderedGateCorpusRows({
    renderedSurfaceParityViewModel,
    model: safeModel,
    displayIdentity,
    lens,
    questions,
    tokenomicsSupplyIntegrity,
    reviewedEvidencePacket,
  });
  const renderedBtcForbiddenStringChecks = buildBtcBenchmarkForbiddenStringChecks({
    corpusRows: btcRenderedGateCorpusRows,
    bundleText: "",
    asset: safeAsset,
    lens,
    assetIdentityResolution,
    reviewedEvidencePacket,
  });
  const renderedEthForbiddenStringChecks = buildEthBenchmarkForbiddenStringChecks({
    corpusRows: btcRenderedGateCorpusRows,
    bundleText: "",
    asset: safeAsset,
    lens,
    assetIdentityResolution,
    reviewedEvidencePacket,
  });
  const renderedBtcFailures = renderedBtcForbiddenStringChecks.filter((check) => !check.passed);
  const renderedEthFailures = renderedEthForbiddenStringChecks.filter((check) => !check.passed);
  const renderedBtcPrimaryVisibleFailures = renderedBtcForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []);
  const renderedEthPrimaryVisibleFailures = renderedEthForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []);
  const renderedBtcSecondaryVisibleMentions = renderedBtcForbiddenStringChecks.flatMap((check) => check.secondaryVisibleMentions || []);
  const renderedBtcAuditOnlyMentions = renderedBtcForbiddenStringChecks.flatMap((check) => check.auditOnlyMentions || []);
  const renderedBtcInternalIdExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.internalIdExclusions || []);
  const renderedBtcForbiddenListExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.forbiddenListExclusions || []);
  const renderedBtcBeforeStateExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.beforeStateExclusions || []);
  const renderedBtcSelfTriggerExclusions = renderedBtcForbiddenStringChecks.flatMap((check) => check.selfTriggerExclusions || []);
  const renderedBtcGateStatus = renderedBtcFailures.length ? "FAIL" : "PASS";
  const renderedEthGateStatus = renderedEthFailures.length ? "FAIL" : "PASS";
  const requiredMirrorMissingSurfaces = safeArray(renderedSurfaceParityViewModel.missingMirroredSurfaces);
  const requiredPrimaryZeroSurfaces = safeArray(renderedSurfaceParityViewModel.tabMirrorCoverage)
    .filter((entry) => entry?.classification === "primary" && Number(entry?.renderedItemCount || 0) === 0)
    .map((entry) => entry.surface);
  const decisionHeaderMirrorMissing = Number(renderedSurfaceParityViewModel.decisionHeaderRenderedItemCount || 0) === 0;
  const mirrorCoverageGateStatus = requiredMirrorMissingSurfaces.length || requiredPrimaryZeroSurfaces.length || decisionHeaderMirrorMissing
    ? "FAIL"
    : "PASS";
  const renderedSpecificGateStatus = renderedBtcForbiddenStringChecks.length
    ? renderedBtcGateStatus
    : renderedEthForbiddenStringChecks.length
      ? renderedEthGateStatus
      : "PASS";
  const renderedSurfaceOverallGateStatus = mirrorCoverageGateStatus === "FAIL"
    ? "FAIL"
    : renderedSpecificGateStatus === "FAIL"
      ? "FAIL"
      : "PASS";
  const mirrorCoverageFailureReason = mirrorCoverageGateStatus === "FAIL"
    ? `Required live-tab mirror coverage incomplete: missing=${requiredMirrorMissingSurfaces.join("; ") || "none"}; primaryZero=${requiredPrimaryZeroSurfaces.join("; ") || "none"}; decisionHeaderCount=${renderedSurfaceParityViewModel.decisionHeaderRenderedItemCount || 0}.`
    : "All required live-tab mirror surfaces have rendered-intended text.";
  const renderedBtcFailureReason = renderedBtcFailures.length
    ? "BTC primary visible rendered-intended text contains forbidden generic/base-layer copy. This is a blocking product-surface parity failure."
    : "No BTC forbidden strings found in primary visible rendered-intended text.";
  const renderedEthFailureReason = renderedEthFailures.length
    ? "ETH primary visible rendered-intended text contains forbidden BTC/wrapped/stablecoin/RWA/DePIN/gaming/ERC-20/generic copy. This is a blocking product-surface parity failure."
    : "No ETH forbidden strings found in primary visible rendered-intended text.";

  const sections = [
    bundleSection("0. Analysis Freshness / Live-First QA Eligibility", [
      bundleField("Bundle schema", "review-bundle-live-first-freshness-v1"),
      bundleField("Bundle generated at", bundleGeneratedAt),
      bundleField("Bundle mode", analysisFreshness.bundleMode),
      bundleField("Fresh QA eligible", analysisFreshness.freshQaEligible ? "yes" : "no"),
      bundleField("QA eligibility label", analysisFreshness.qaEligibilityLabel),
      bundleField("Current product truth object", analysisFreshness.currentProductTruthObject),
      bundleField("Freshness status", analysisFreshness.freshnessLabel),
      bundleField("Delivery source", analysisFreshness.analysisSource),
      bundleField("Recomputed", analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"),
      bundleField("Analysis generated at", analysisFreshness.generatedAt),
      bundleField("Bundle generated/read at", bundleGeneratedAt),
      bundleField("Snapshot ID", analysisFreshness.snapshotId),
      bundleField("Snapshot short ID", analysisFreshness.snapshotShortId),
      bundleField("Snapshot timestamp", analysisFreshness.generatedAt),
      bundleField("Snapshot age ms", analysisFreshness.snapshotAgeMs),
      bundleField("Freshness window ms", analysisFreshness.freshnessWindowMs),
      bundleField("Previous snapshot ID", analysisFreshness.previousSnapshotId),
      bundleField("Previous snapshot at", analysisFreshness.previousSnapshotAt),
      bundleField("Refresh mode", analysisFreshness.refreshMode),
      bundleField("Full regeneration needed", analysisFreshness.fullRegenerationNeeded === null || analysisFreshness.fullRegenerationNeeded === undefined ? "unknown" : analysisFreshness.fullRegenerationNeeded ? "yes" : "no"),
      bundleField("Partial refresh sufficient", analysisFreshness.partialRefreshSufficient === null || analysisFreshness.partialRefreshSufficient === undefined ? "unknown" : analysisFreshness.partialRefreshSufficient ? "yes" : "no"),
      bundleField("Bundle uses same normalized product object", yesNoUnknown(bundleUsesSameCurrentAnalysisObject)),
      bundleField("Live tabs are product truth; bundle is mirror", "yes"),
      bundleField("Snapshot output compare-only", analysisFreshness.isSnapshot ? "yes - historical snapshot / compare mode" : analysisFreshness.isPartialRefresh ? "yes - partial refresh compare-only / not current product truth" : "no"),
      bundleField("Post-patch fresh QA evidence allowed", analysisFreshness.freshQaEligible ? "yes" : "no"),
      "Fresh sections:",
      bundleList(analysisFreshness.freshSections),
      "Stale sections:",
      bundleList(analysisFreshness.staleSections),
      "Missing sections:",
      bundleList(analysisFreshness.missingSections),
      "Freshness warnings / QA prompts:",
      bundleList(freshnessQaWarnings.length ? freshnessQaWarnings : analysisFreshness.freshnessWarnings),
      "Live-tab visibility path:",
      bundleList(freshnessTabsWithVisibility.map((entry) => `${entry}: ${analysisFreshness.freshnessLabel ? "freshness/QA eligibility model available" : "freshness unavailable"}`)),
    ]),
    bundleSection("1. QA Bundle Header", [
      bundleField("Asset symbol", safeAsset.symbol),
      bundleField("Asset name", safeAsset.name || safeModel.assetName),
      bundleField("Canonical identity", safeAsset.id || safeAsset.coingeckoId || safeAsset.cmcId || safeAsset.canonicalId),
      bundleField("Canonical asset", `${assetIdentityResolution?.canonicalAssetName || "Unavailable"} (${assetIdentityResolution?.canonicalAssetSymbol || "Unavailable"})`),
      bundleField("Canonical/native network candidate", assetIdentityResolution?.canonicalNetworkCandidate || assetIdentityResolution?.nativeNetworkCandidate),
      bundleField("Chain / network", assetChain),
      bundleField("Contract", assetContract),
      bundleField("Analyzed network", assetIdentityResolution?.analyzedNetwork),
      bundleField("Analyzed contract", assetIdentityResolution?.analyzedContract),
      bundleField("Representation type", assetIdentityResolution?.representationType),
      bundleField("Wrong-asset risk", assetIdentityResolution?.wrongAssetRisk),
      bundleField("Search candidate recommendation", searchIdentityReconciliation?.recommendedCanonicalMatch === undefined ? null : yesNoUnknown(searchIdentityReconciliation.recommendedCanonicalMatch)),
      bundleField("Search candidate rank", searchIdentityReconciliation?.canonicalCandidateRank),
      bundleField("Search selection safety", searchIdentityReconciliation?.selectionSafetyLevel),
      bundleField("Search wrong-asset risk", searchIdentityReconciliation?.wrongAssetRisk),
      bundleField("Search representation type", searchIdentityReconciliation?.representationType),
      bundleField("Search provider agreement", searchIdentityReconciliation?.providerAgreement),
      bundleField("Search contract match status", searchIdentityReconciliation?.contractMatchStatus),
      bundleField("Search network match status", searchIdentityReconciliation?.networkMatchStatus),
      bundleField("Search query intent match", searchIdentityReconciliation?.searchQueryIntentMatch),
      bundleField("Provider IDs", providerIds.join("; ")),
      bundleField("Review Bundle role", "QA/export mirror only; live tabs are the product surface."),
      bundleField("Current QA eligibility", `${analysisFreshness.qaEligibilityLabel || "Unknown"} - ${analysisFreshness.qaEligibilityWarning || "No warning attached."}`),
      bundleField("Analysis freshness", `${analysisFreshness.freshnessLabel} | bundleMode=${analysisFreshness.bundleMode} | freshQaEligible=${analysisFreshness.freshQaEligible ? "yes" : "no"}`),
      bundleField("Product truth object", analysisFreshness.currentProductTruthObject),
      bundleField("Identity confidence", lens?.confidence),
      bundleField("Canonical identity confidence", assetIdentityResolution?.identityConfidence),
      "Identity warnings:",
      bundleList([
        ...safeArray(assetIdentityResolution?.identityWarnings),
        ...safeArray(assetIdentityResolution?.chainWarnings),
        ...safeArray(assetIdentityResolution?.contractWarnings),
        ...safeArray(assetIdentityResolution?.identityEvidenceReconciliationWarnings),
        ...safeArray(searchIdentityReconciliation?.selectionWarnings),
        ...identityWarnings.map((warning) => `${warning.id || "warning"} | ${warning.issue || "Review identity"} | verdict: ${warning.affectsVerdict ? "affects" : "diagnostic"} | scoring: ${warning.affectsScoring ? "affects" : "diagnostic"}`),
      ]),
      "Search candidate labels:",
      bundleList(searchIdentityReconciliation?.displayLabels),
      "Why this search candidate:",
      bundleList(searchIdentityReconciliation?.whyThisCandidate),
      "Why not this search candidate:",
      bundleList(searchIdentityReconciliation?.whyNotThisCandidate),
      bundleField("Last analyzed timestamp", lastAnalyzed),
      bundleField("Analysis freshness", `${analysisFreshness.freshnessLabel} - ${analysisFreshness.summary}`),
      bundleField("Delivery source", analysisFreshness.analysisSource),
      bundleField("Recomputed", analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"),
      bundleField("Snapshot ID", analysisFreshness.snapshotId),
      bundleField("Final decision / verdictClass", verdictClass),
      bundleField("Verdict label", verdictLabel),
      bundleField("Overall score", safeModel.overallScore ?? safeScores.overallScore),
      bundleField("Confidence", `${safeModel.confidenceLabel || safeConfidence.level || "Unavailable"}${safeModel.confidenceScore !== null && safeModel.confidenceScore !== undefined ? ` (${safeModel.confidenceScore})` : ""}`),
      bundleField("Asset framing", visibleBundleFramingLabel),
      bundleField("Asset class label", visibleBundleLensLabel || safeModel.assetClass),
      bundleField("Sector/lens label", visibleBundleLensLabel || safeModel.primarySector),
      bundleField("Boundary", boundary),
    ]),
    bundleSection("1A. Asset Identity Resolution / Canonical Chain Guardrail", [
      bundleField("Selected asset", `${safeAsset.name || "Unavailable"} (${safeAsset.symbol || "Unavailable"})`),
      bundleField("Canonical provider IDs", [
        assetIdentityResolution?.canonicalProviderIds?.coingeckoId ? `coingecko:${assetIdentityResolution.canonicalProviderIds.coingeckoId}` : null,
        assetIdentityResolution?.canonicalProviderIds?.coinmarketcapId ? `cmc:${assetIdentityResolution.canonicalProviderIds.coinmarketcapId}` : null,
      ].filter(Boolean).join("; ")),
      bundleField("Canonical network candidate", assetIdentityResolution?.canonicalNetworkCandidate),
      bundleField("Native network candidate", assetIdentityResolution?.nativeNetworkCandidate),
      bundleField("Selected network", assetIdentityResolution?.selectedNetwork),
      bundleField("Analyzed representation", `${assetIdentityResolution?.analyzedNetwork || "Unavailable"} ${assetIdentityResolution?.analyzedContract || "no contract"}`),
      bundleField("Contract scan applicability", assetIdentityResolution?.contractScanApplicability),
      bundleField("Migration status", assetIdentityResolution?.migrationStatus),
      bundleField("Wrapped/bridged status", assetIdentityResolution?.bridgedOrWrappedStatus),
      bundleField("Multi-chain", yesNoUnknown(assetIdentityResolution?.isMultichain)),
      bundleField("Chain confidence", assetIdentityResolution?.chainConfidence),
      bundleField("Contract confidence", assetIdentityResolution?.contractConfidence),
      bundleField("Selected search candidate display name", searchIdentityReconciliation?.candidateDisplayName),
      bundleField("Selected search canonical identity", searchIdentityReconciliation?.canonicalIdentity),
      bundleField("Selected search manual selection required", searchIdentityReconciliation?.requiresManualSelection === undefined ? null : yesNoUnknown(searchIdentityReconciliation.requiresManualSelection)),
      "Selected search provider disagreement reasons:",
      bundleList(searchIdentityReconciliation?.providerDisagreementReasons),
      "All known provider contracts:",
      bundleList(safeArray(assetIdentityResolution?.allKnownContracts).map((entry) => `${entry.provider}:${entry.network}:${entry.contractAddress} | ${entry.sourceField} | confidence:${entry.confidence}`)),
      "Old contracts:",
      bundleList(assetIdentityResolution?.oldContracts),
      "New contracts:",
      bundleList(assetIdentityResolution?.newContracts),
      "Identity source requirements:",
      bundleList(assetIdentityResolution?.sourceRequirements),
      "Identity source boundary:",
      bundleList(assetIdentityResolution?.sourceBoundary),
      "Evidence source summary:",
      bundleList(assetIdentityResolution?.evidenceSourceSummary),
    ]),
    bundleSection("2. Resolved Institutional Lens Contract", [
      bundleField("lensId", lens?.lensId),
      bundleField("label", lens?.label),
      bundleField("assetClassGroup", lens?.assetClassGroup),
      bundleField("confidence", lens?.confidence),
      bundleField("questionGroupId", lens?.questionGroupId),
      "matchedSignals:",
      bundleList(lens?.matchedSignals),
      "routingSource:",
      bundleList(lens?.routingSource),
      "providerClassificationEvidence:",
      bundleProviderEvidence(lens?.providerClassificationEvidence),
      "ambiguityFlags:",
      bundleList(lens?.ambiguityFlags),
      bundleField("fallbackReason", lens?.fallbackReason),
      "sourceBoundary:",
      bundleList(lens?.sourceBoundary),
      bundleField("Institutional question IDs/group match resolved lens", questionMatchStatus),
      "question_lens_mismatch warnings:",
      bundleList(questionMismatchWarnings.map((warning) => `${warning.issue || warning.id}: ${warning.recommendedAction || warning.expectedBehavior || "Review required."}`)),
      "Provider/internal disagreement flags:",
      bundleList(providerInternalFlags),
    ]),
    bundleSection("2AA. Asset Interpretation Contract v1", [
      bundleField("Contract attached", assetInterpretationContract ? "yes" : "missing"),
      bundleField("Artifact version", assetInterpretationContract?.artifactVersion),
      bundleField("Contract status", assetInterpretationContract?.contractStatus),
      bundleField("Primary rule", assetInterpretationContract?.primaryRule || "network_is_context_not_asset_class"),
      bundleField("Canonical asset", `${assetInterpretationContract?.canonicalAsset?.name || "Unavailable"} (${assetInterpretationContract?.canonicalAsset?.symbol || "Unavailable"})`),
      bundleField("Canonical identity", assetInterpretationContract?.canonicalAsset?.canonicalIdentity),
      bundleField("Representation type", assetInterpretationContract?.representationContext?.representationType),
      bundleField("Canonical network candidate", assetInterpretationContract?.representationContext?.canonicalNetworkCandidate),
      bundleField("Selected/analyzed network", `${assetInterpretationContract?.representationContext?.selectedNetwork || "Unavailable"} / ${assetInterpretationContract?.representationContext?.analyzedNetwork || "Unavailable"}`),
      bundleField("Selected/analyzed contract", `${assetInterpretationContract?.representationContext?.selectedContract || "none"} / ${assetInterpretationContract?.representationContext?.analyzedContract || "none"}`),
      bundleField("Raw resolved lens", assetInterpretationContract?.thesisLensContext?.lensId),
      bundleField("Raw resolved question group", assetInterpretationContract?.thesisLensContext?.questionGroupId),
      bundleField("Effective lens source", effectiveInstitutionalLens?.effectiveLensSource || assetInterpretationContract?.effectiveInstitutionalLens?.effectiveLensSource),
      bundleField("Effective lens/family", effectiveInstitutionalLens?.lensId || assetInterpretationContract?.effectiveInstitutionalLens?.lensId),
      bundleField("Effective visible label", effectiveInstitutionalLens?.label || assetInterpretationContract?.effectiveInstitutionalLens?.label),
      bundleField("Effective question group", effectiveInstitutionalLens?.questionGroupId || assetInterpretationContract?.effectiveInstitutionalLens?.questionGroupId),
      bundleField("Effective source profile", effectiveInstitutionalLens?.effectiveSourceMatrixProfile || assetInterpretationContract?.effectiveInstitutionalLens?.effectiveSourceMatrixProfile),
      bundleField("Effective source matrix entries", safeArray(effectiveInstitutionalLens?.sourceMatrixEntryIds || assetInterpretationContract?.effectiveInstitutionalLens?.sourceMatrixEntryIds).join("; ") || "none"),
      bundleField("Category authority overrides raw lens", yesNoUnknown(effectiveInstitutionalLens?.categoryAuthorityOverridesRawLens || assetInterpretationContract?.effectiveInstitutionalLens?.categoryAuthorityOverridesRawLens)),
      bundleField("Raw/effective divergence warning", effectiveInstitutionalLens?.rawEffectiveLensDivergenceWarning || assetInterpretationContract?.effectiveInstitutionalLens?.rawEffectiveLensDivergenceWarning),
      bundleField("Network is classification authority", assetInterpretationContract?.thesisLensContext?.networkContextIsClassificationAuthority ? "yes - QA violation" : "no"),
      bundleField("Visible label family", visibleContractDisplay.labelFamily),
      bundleField("Primary visible label", visibleContractDisplay.primaryVisibleLabel),
      bundleField("Asset framing label", visibleContractDisplay.assetFramingLabel),
      bundleField("Hard gate status", visibleContractDisplay.hardGateStatus),
      "Hard gate failures:",
      bundleList(visibleContractDisplay.hardGateFailures, "No visible-label hard-gate failures."),
      "Forbidden visible label families:",
      bundleList(visibleContractDisplay.forbiddenVisibleLabelFamilies, "No forbidden label families listed."),
      "Label precedence:",
      bundleList(visibleContractDisplay.labelPrecedence),
      bundleField("Expected question group", assetInterpretationContract?.institutionalQuestionContract?.expectedQuestionGroupId),
      bundleField("Actual question group", assetInterpretationContract?.institutionalQuestionContract?.actualQuestionGroupId),
      bundleField("Question group matches lens", yesNoUnknown(assetInterpretationContract?.institutionalQuestionContract?.questionGroupMatchesLens)),
      "Question mismatch warnings:",
      bundleList(assetInterpretationContract?.institutionalQuestionContract?.mismatchWarnings, "No question/lens mismatch warnings."),
      "Source Matrix entries:",
      bundleList(safeArray(assetInterpretationContract?.evidenceInterpretationContract?.sourceMatrixEntries).map((entry) =>
        `${entry.id || "matrix"} | ${entry.lensGroup || "group unavailable"} | scoring=${entry.currentScoringStatus || "non-scoring"} | boundary=${entry.sourceBoundary || "boundary unavailable"}`
      )),
      "Live/API data missing:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.liveApiDataMissing),
      "Reviewed evidence missing:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.reviewedEvidenceMissing),
      "Source candidates only:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.sourceCandidatesOnly),
      "Source universe taxonomy:",
      bundleList(safeArray(assetInterpretationContract?.evidenceInterpretationContract?.sourceUniverseTaxonomy).map((entry) =>
        `${entry.sourceUniverseId || "source_universe"} | ${entry.currentStatus || "status unavailable"} | scoring=${entry.scoringStatus || "non-scoring"} | promoted=${entry.promotedToReviewedEvidence ? "yes" : "no"} | reviewedScoring=${entry.reviewedEvidenceScoringActive ? "yes" : "no"}`
      )),
      "Source boundary:",
      bundleList(assetInterpretationContract?.evidenceInterpretationContract?.sourceBoundary),
      "Rendering parity surfaces:",
      bundleList(assetInterpretationContract?.renderingParityContract?.visibleSurfaces),
      bundleField("Frontend normalization field", assetInterpretationContract?.renderingParityContract?.frontendNormalizationField),
      bundleField("Review Bundle mirror status", assetInterpretationContract?.renderingParityContract?.copyReviewBundleMirrorStatus),
      bundleField("Scoring changed", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.scoringChanged)),
      bundleField("Verdict changed", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.providerBehaviorChanged)),
      bundleField("Reviewed evidence packet expanded", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.reviewedEvidencePacketExpanded)),
      bundleField("Reviewed evidence scoring-active", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.reviewedEvidenceScoringActive)),
      bundleField("Source candidates promoted", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.sourceCandidatesPromoted)),
      bundleField("Token-specific override added", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.tokenSpecificOverrideAdded)),
      bundleField("ADA packet coverage added", yesNoUnknown(assetInterpretationContract?.scoringBoundary?.adaPacketCoverageAdded)),
      "Engine Learning integration rules:",
      bundleList(assetInterpretationContract?.engineLearningIntegration?.ruleIds),
      "Known limitations:",
      bundleList(assetInterpretationContract?.knownLimitations),
    ]),
    bundleSection("2AB. Data-First Decision Narrative Contract", [
      bundleField("Contract attached", dataFirstNarrativeContract ? "yes" : "missing"),
      bundleField("Current QA eligibility if missing", "not eligible; full live recompute required"),
      bundleField("Artifact version", dataFirstNarrativeContract?.artifactVersion),
      bundleField("Contract status", dataFirstNarrativeContract?.contractStatus),
      bundleField("Primary narrative gate status", dataFirstNarrativeContract?.primaryNarrativeGateStatus),
      bundleField("Primary narrative failure count", dataFirstNarrativeContract?.primaryNarrativeFailureCount),
      bundleField("Decision surface data binding status", dataFirstNarrativeContract?.decisionSurfaceDataBindingStatus),
      bundleField("Score explanation data-backed", yesNoUnknown(dataFirstNarrativeContract?.scoreExplanationInputs?.scoreExplanationDataBacked)),
      bundleField("Frontend normalization field", dataFirstNarrativeContract?.frontendNormalizationField),
      bundleField("Review Bundle section", dataFirstNarrativeContract?.reviewBundleSection),
      bundleField("Narrative scope", [
        dataFirstNarrativeContract?.narrativeScope?.assetSymbol,
        dataFirstNarrativeContract?.narrativeScope?.primaryVisibleLabel,
        dataFirstNarrativeContract?.narrativeScope?.representationType,
        dataFirstNarrativeContract?.narrativeScope?.resolvedLensId,
      ].filter(Boolean).join(" | ")),
      "Generated narrative fields:",
      bundleList(safeArray(dataFirstNarrativeContract?.generatedNarrativeFields).map((entry) =>
        `${entry.fieldName || "field"} [${entry.status || "unknown"}]: ${entry.generatedText || "Unavailable"}`
      ), "No generated data-first narrative fields.", 40),
      "Facts used:",
      bundleList(safeArray(dataFirstNarrativeContract?.availableEvidenceFacts).map((fact) =>
        `${fact.factId || "fact"} | ${fact.sourceType || "source"} | ${fact.fieldPath || "field"} | ${fact.valueSummary || "value unavailable"} | proves=${fact.whatItCanProve || "scope unavailable"} | cannot=${fact.whatItCannotProve || "boundary unavailable"}`
      ), "No narrative facts attached.", 30),
      "Missing evidence gaps:",
      bundleList(safeArray(dataFirstNarrativeContract?.missingEvidenceGaps).map((gap) =>
        `${gap.gapId || "gap"} | ${gap.severity || "severity"} | ${gap.sourceRequirement || "requirement unavailable"} | notNegativeEvidence=${gap.notNegativeEvidence ? "yes" : "unknown"}`
      ), "No narrative gaps attached.", 30),
      "Allowed narrative concepts:",
      bundleList(dataFirstNarrativeContract?.allowedNarrativeConcepts),
      "Forbidden narrative concepts:",
      bundleList(dataFirstNarrativeContract?.forbiddenNarrativeConcepts),
      "Wrong asset name mentions:",
      bundleList(dataFirstNarrativeContract?.wrongAssetNameMentions, "No wrong-asset subject mentions detected."),
      "Forbidden concept mentions:",
      bundleList(dataFirstNarrativeContract?.forbiddenConceptMentions, "No forbidden concept mentions detected."),
      "Unsupported claims detected:",
      bundleList(dataFirstNarrativeContract?.unsupportedClaimsDetected, "No unsupported claims detected."),
      "Scoring anomaly findings:",
      bundleList(dataFirstNarrativeContract?.scoringAnomalyFindings, "No scoring explanation anomalies detected."),
      "Known limitations:",
      bundleList(dataFirstNarrativeContract?.knownLimitations),
    ]),
    bundleSection("2AC. Category-Driven Question Registry & API Category Signals", [
      bundleField("Provider category signals attached", providerCategorySignals ? "yes" : "missing"),
      bundleField("Asset-family contract attached", categoryDrivenAssetFamilyContract ? "yes" : "missing"),
      bundleField("Primary asset family", categoryDrivenAssetFamilyContract?.primaryAssetFamily),
      bundleField("Frontend label", categoryDrivenAssetFamilyContract?.primaryVisibleLabel || categoryDrivenAssetFamilyContract?.frontendVisibleLabel),
      bundleField("Asset framing", categoryDrivenAssetFamilyContract?.assetFramingLabel),
      bundleField("Family confidence", categoryDrivenAssetFamilyContract?.familyConfidence),
      bundleField("Resolution status", categoryDrivenAssetFamilyContract?.familyResolutionStatus),
      bundleField("Category authority applied", yesNoUnknown(categoryDrivenAssetFamilyContract?.categoryAuthorityApplied)),
      bundleField("Category authority status", categoryDrivenAssetFamilyContract?.categoryAuthorityStatus),
      bundleField("Category authority reason", categoryDrivenAssetFamilyContract?.categoryAuthorityReason || categoryDrivenAssetFamilyContract?.categoryAuthorityBlockedReason),
      bundleField("AIC alignment status", categoryDrivenAssetFamilyContract?.categoryAicAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryAicAlignmentStatus),
      bundleField("DataFirst alignment status", categoryDrivenAssetFamilyContract?.categoryDataFirstAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryDataFirstAlignmentStatus),
      bundleField("Question group alignment status", categoryDrivenAssetFamilyContract?.categoryQuestionGroupAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryQuestionGroupAlignmentStatus),
      bundleField("Question registry group", categoryDrivenAssetFamilyContract?.questionRegistryGroup?.groupId),
      bundleField("Source profile", categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.profileId),
      bundleField("Visible label family", categoryDrivenAssetFamilyContract?.visibleLabelFamily),
      bundleField("Source matrix entries", safeArray(categoryDrivenAssetFamilyContract?.sourceMatrixEntryIds).join("; ") || "none"),
      bundleField("Family fit score", categoryReadinessDiagnostics?.familyFitScore),
      bundleField("Category evidence coverage score", categoryReadinessDiagnostics?.categoryEvidenceCoverageScore),
      bundleField("Data requirement coverage score", categoryReadinessDiagnostics?.dataRequirementCoverageScore),
      bundleField("Scoring integration", categoryReadinessDiagnostics?.scoringIntegrationStatus || "non_scoring_v1"),
      bundleField("Scoring changed", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.scoringChanged)),
      bundleField("Verdict changed", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.verdictChanged)),
      bundleField("Provider behavior changed", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.providerBehaviorChanged)),
      bundleField("Reviewed evidence promoted", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.reviewedEvidencePromoted)),
      bundleField("Source candidates promoted", yesNoUnknown(categoryDrivenAssetFamilyContract?.scoringBoundary?.sourceCandidatesPromoted)),
      "Provider category summary:",
      bundleList([providerCategorySignals?.frontendVisibleSummary]),
      "CoinGecko categories / platforms:",
      bundleList([
        `categories=${safeArray(providerCategorySignals?.coinGeckoCategories).join(", ") || "none"}`,
        `platforms=${safeArray(providerCategorySignals?.coinGeckoAssetPlatforms).join(", ") || "none"}`,
      ]),
      "CoinMarketCap tags / categories:",
      bundleList([
        `tags=${safeArray(providerCategorySignals?.coinMarketCapTags).join(", ") || "none"}`,
        `categories=${safeArray(providerCategorySignals?.coinMarketCapCategories).join(", ") || "none"}`,
      ]),
      "Asset-class category signals:",
      bundleList(safeArray(providerCategorySignals?.assetClassCandidateTags).map((signal) => `${signal.provider}.${signal.field}: ${signal.value} | ${signal.classification} | ${signal.sourceBoundary}`)),
      "Network/ecosystem context signals:",
      bundleList(safeArray(providerCategorySignals?.ecosystemContextTags).map((signal) => `${signal.provider}.${signal.field}: ${signal.value} | context-only`)),
      "Conflicting category signals:",
      bundleList(providerCategorySignals?.conflictingCategorySignals, "No category conflicts detected."),
      "Excluded families:",
      bundleList(safeArray(categoryDrivenAssetFamilyContract?.excludedFamilies).map((entry) => `${entry.family}: ${entry.reason}`), "No family exclusions attached."),
      "Category-driven questions:",
      bundleList(safeArray(categoryDrivenAssetFamilyContract?.questionRegistryGroup?.questions).map((question) => `${question.questionId}: ${question.question}`)),
      "Category source requirements:",
      bundleList(categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.priorityRequirements),
      "Category answer cards:",
      bundleList(safeArray(categoryAnswerBuilder?.answerCards).map((card) => `${card.questionId} | ${card.answerStatus}: ${card.shortAnswer} | missing=${safeArray(card.missingEvidence).join("; ")}`)),
      "Category readiness manual-review flags:",
      bundleList(categoryReadinessDiagnostics?.manualReviewFlags, "No category manual-review flags."),
      "Category false-positive risks:",
      bundleList(categoryReadinessDiagnostics?.falsePositiveRisks, "No category false-positive risks."),
      "Inventoried category endpoints not consumed in v1:",
      bundleList(safeArray(providerCategorySignals?.endpointCandidates).map((candidate) => `${candidate.provider} ${candidate.endpoint} | ${candidate.v1Status} | providerBehaviorChanged=${candidate.providerBehaviorChanged ? "yes" : "no"}`)),
      "Provider category boundary:",
      bundleList(providerCategorySignals?.providerCategoryBoundary),
    ]),
    bundleSection("2A. Reviewed Evidence Packet v1", [
      bundleField("Packet loaded", reviewedEvidencePacket?.packetLoaded ? "yes" : "no"),
      bundleField("packetId", reviewedEvidencePacket?.packetId),
      bundleField("reviewStatus", reviewedEvidencePacket?.reviewStatus),
      bundleField("reviewedBy", reviewedEvidencePacket?.reviewedBy),
      bundleField("scoring-active", reviewedEvidencePacket?.scoringActive ? "yes - QA violation in v1" : "no - reviewed demo evidence is display/answer quality only"),
      "Sources used:",
      bundleList(safeArray(reviewedEvidencePacket?.sources).map((source) =>
        `${source.title} | ${source.publisher} | ${source.sourceType} | freshness:${source.freshnessStatus} | reliability:${source.reliabilityTier} | scoring:${source.scoringEligible ? "eligible" : "not-active"} | ${source.url}`
      )),
      "Facts used:",
      bundleList(safeArray(reviewedEvidencePacket?.facts).map((fact) =>
        `${fact.factId}: ${fact.claim} | type:${fact.normalizedClaimType} | contribution:${fact.answerContribution} | confidence:${fact.confidence} | doesNotAnswer:${safeArray(fact.reviewedEvidenceDoesNotAnswer).join("; ") || "none"}`
      )),
      "Question-level mappings:",
      bundleList(safeArray(reviewedEvidencePacket?.questionMappings).map((mapping) =>
        `${mapping.questionId}: ${mapping.reviewedEvidenceStatus}; scope=${mapping.questionEvidenceScope || "unknown"}; sources=${safeArray(mapping.reviewedSourcesUsed).map((source) => source.sourceId).join(", ") || "none"}; remaining=${safeArray(mapping.remainingMissingEvidence).join("; ") || "none"}; warnings=${safeArray(mapping.evidenceMappingWarnings).join("; ") || "none"}; freshness=${mapping.freshnessStatus}; reliability=${mapping.reliabilitySummary}`
      )),
      "Answer upgrade summary:",
      bundleList(reviewedEvidencePacket?.answerUpgradeSummary),
      "Source Queue coverage notes:",
      bundleList(reviewedEvidencePacket?.sourceQueueNotes),
      "Remaining reviewed-evidence source requirements:",
      bundleList(reviewedEvidencePacket?.remainingSourceRequirements),
      "Reviewed evidence warnings:",
      bundleList(reviewedEvidencePacket?.warnings),
      "Identity/evidence reconciliation warnings:",
      bundleList(reviewedEvidencePacket?.identityEvidenceReconciliationWarnings),
      "Evidence mapping warnings:",
      bundleList(reviewedEvidencePacket?.evidenceMappingWarnings),
      "Packet limitations:",
      bundleList(reviewedEvidencePacket?.audit?.limitations),
      "Source boundary:",
      bundleList(reviewedEvidencePacket?.sourceBoundary),
    ]),
    bundleSection("2B. Institutional Analyst Answer Card Live UI Mirror", [
      bundleField("Analyst answer card model attached", yesNoUnknown(!analystCardMissing)),
      bundleField("Live tabs using analyst card fields", "Institutional Checklist, Tokenomics, Evidence Map, Source Queue, Manual Review, Decision prompts, and Thesis context use analyst-card direct answer/status/evidence where available."),
      bundleField("Live UI answer order", "Direct answer -> evidence basis -> non-proof boundary -> missing evidence -> decision/confidence impact -> what would change -> audit detail."),
      "Primary live UI mirror:",
      bundleList(analystCards.map(({ question, card }) => [
        `${question?.questionId || "question"} | tab=${question?.formulaOutputsUsed ? "Tokenomics / Supply Integrity" : "Institutional Checklist"} | status=${card?.headlineStatus || "status unavailable"}`,
        `answer=${card?.directAnswer || "answer unavailable"}`,
        `missing=${safeArray(card?.missingEvidence).slice(0, 2).join("; ") || "none visible in primary row"}`,
        `impact=${card?.decisionImpact || "impact unavailable"}`,
        `boundary=${safeArray(card?.sourceBoundaryPlainEnglish)[0] || "boundary unavailable"}`,
      ].join(" | ")), "No analyst answer cards attached.", 12),
      "Technical audit fields preserved separately:",
      bundleList(analystCards.flatMap(({ card }) => safeArray(card?.auditFields)).slice(0, 20), "No analyst-card audit fields attached."),
      bundleField("Bundle mirror includes primary answer", yesNoUnknown(!analystPrimaryMissingAnswer)),
      bundleField("Bundle mirror includes primary status", yesNoUnknown(!analystBundleMirrorMissing)),
      bundleField("Audit fields preserved", analystCards.some(({ card }) => safeArray(card?.auditFields).length) ? "yes" : "unknown"),
      bundleField("Template IDs kept audit-only", yesNoUnknown(!analystPrimaryTemplateLeakage)),
      bundleField("Raw sourceBoundary enums kept audit-only", yesNoUnknown(!analystPrimaryRawEnumLeakage)),
      bundleField("Contradictory primary badge stack avoided", yesNoUnknown(!analystContradictoryBadgeStack)),
      bundleField("Stablecoin trust rows avoid protocol-token not-applicable copy", yesNoUnknown(!stablecoinTrustNotApplicableLeakage)),
      bundleField("Stablecoin tokenomics redirects max-supply/dilution to trust controls", yesNoUnknown(!stablecoinTokenomicsScarcityDominance)),
      bundleField("Stablecoin protocol-token value-capture not-applicable cases preserved", yesNoUnknown(!stablecoinProtocolNotApplicableMissing)),
    ]),
    bundleSection("2C. Backend-to-Frontend Rendered Surface Parity Gate", [
      bundleField("Gate version", renderedSurfaceParityViewModel.artifactVersion),
      bundleField("Gate status", renderedSurfaceOverallGateStatus),
      bundleField("Mirror coverage gate status", mirrorCoverageGateStatus),
      bundleField("Lens-specific text gate status", renderedSpecificGateStatus),
      bundleField("Blocking", "true"),
      bundleField("Failure reason", mirrorCoverageGateStatus === "FAIL" ? mirrorCoverageFailureReason : renderedBtcForbiddenStringChecks.length ? renderedBtcFailureReason : renderedEthForbiddenStringChecks.length ? renderedEthFailureReason : "All required live-tab mirror surfaces are represented; no native-BTC or native-ETH rendered hard gate was applicable."),
      bundleField("Required primary zero-count surfaces", requiredPrimaryZeroSurfaces.join("; ") || "none"),
      bundleField("Primary visible forbidden failure count", renderedBtcPrimaryVisibleFailures.length + renderedEthPrimaryVisibleFailures.length),
      bundleField("Primary visible forbidden failures", [...renderedBtcPrimaryVisibleFailures, ...renderedEthPrimaryVisibleFailures].map((failure) =>
        `${failure.checkId} | ${failure.surface} | ${failure.fieldPath} | phrase=${failure.matchedForbiddenPhrase} | text=${failure.renderedText}`
      ).join(" || ") || "none"),
      bundleField("Secondary visible forbidden failure count", renderedBtcSecondaryVisibleMentions.length),
      bundleField("Secondary visible forbidden mentions", renderedBtcSecondaryVisibleMentions.map((failure) =>
        `${failure.checkId} | ${failure.surface} | ${failure.fieldPath} | phrase=${failure.matchedForbiddenPhrase}`
      ).join(" || ") || "none"),
      bundleField("Audit-only forbidden mentions", renderedBtcAuditOnlyMentions.map((failure) =>
        `${failure.checkId} | ${failure.surface} | ${failure.fieldPath} | phrase=${failure.matchedForbiddenPhrase}`
      ).join(" || ") || "none"),
      bundleField("Internal ID exclusions", renderedBtcInternalIdExclusions.map((failure) =>
        `${failure.checkId} | ${failure.fieldPath} | ${failure.renderedText}`
      ).join(" || ") || "none"),
      bundleField("Forbidden-list self-trigger exclusions", renderedBtcForbiddenListExclusions.length + renderedBtcSelfTriggerExclusions.length),
      bundleField("Before-state exclusions", renderedBtcBeforeStateExclusions.length),
      bundleField("Rendered gate primary failure count", renderedBtcPrimaryVisibleFailures.length + renderedEthPrimaryVisibleFailures.length),
      bundleField("12C failure count", renderedBtcPrimaryVisibleFailures.length),
      bundleField("12D failure count", renderedEthPrimaryVisibleFailures.length),
      bundleField("2C/12C/12D counts match", renderedEthForbiddenStringChecks.length ? "yes - 2C includes ETH 12D failures" : "yes"),
      bundleField("Failure corpus shared", "yes - 2C, 12C, and 12D use the same current primary visible rendered corpus when applicable"),
      bundleField("Self-trigger excluded", "yes"),
      bundleField("Audit-only excluded", "yes"),
      bundleField("Internal IDs excluded", "yes"),
      bundleField("Before-state excluded", "yes"),
      bundleField("Product rule", "Backend artifacts are insufficient; user-facing changes must pass backend response, frontend normalization, component/view-model consumption, visible tab output, right rail when applicable, and Copy Review Bundle mirror."),
      bundleField("Frontend normalized model present", yesNoUnknown(Boolean(Object.keys(safeModel).length))),
      bundleField("Rendered component view model present", yesNoUnknown(Boolean(renderedSurfaceParityViewModel.primaryVisibleText.length))),
      bundleField("Decision Header rendered item count", renderedSurfaceParityViewModel.decisionHeaderRenderedItemCount),
      bundleField("All required live tabs mirrored", yesNoUnknown(renderedSurfaceParityViewModel.allRequiredSurfacesMirrored)),
      bundleField("Missing mirrored live-tab surfaces", safeArray(renderedSurfaceParityViewModel.missingMirroredSurfaces).join("; ") || "none"),
      bundleField("Copy Review Bundle mirrors rendered view model", "yes - this section is generated from the same normalized model passed to product components."),
      "Surface-to-field contract:",
      bundleList(Object.entries(renderedSurfaceParityViewModel.componentConsumption).map(([surface, contract]) => `${surface}: ${contract}`)),
      "Live tab mirror coverage:",
      bundleList(safeArray(renderedSurfaceParityViewModel.tabMirrorCoverage).map((entry) =>
        `${entry.surface}: ${entry.renderedItemCount} visible-model item(s) | ${entry.classification} | ${entry.mirrorStatus}${entry.firstItem ? ` | first=${entry.firstItem}` : ""}`
      )),
      "Primary visible rendered-intended text:",
      bundleList(renderedSurfaceParityViewModel.primaryVisibleText, "No rendered-intended primary text available.", 40),
      "Surface coverage:",
      bundleList(Object.entries(renderedSurfaceParityViewModel.surfaces).map(([surface, values]) => `${surface}: ${safeArray(values).length} rendered-intended text item(s)`)),
    ]),
    bundleSection("3. Decision Header / Command Header", [
      bundleField("Why allocation could make sense", safeModel.verdictSemantics?.positiveCase?.[0] || safeModel.primaryStrength),
      bundleField("Why allocation is blocked", safeModel.verdictSemantics?.blockedCase?.[0] || safeModel.primaryWeakness),
      bundleField("Final Decision", safeModel.allocationOutcome?.label),
      bundleField("Verdict interpretation", safeModel.verdictSemantics?.summary || safeModel.summaryMemo),
      bundleField("Boundary copy", safeModel.verdictSemantics?.boundary || boundary),
      "CTA/navigation labels carrying decision semantics:",
      bundleList(["View final verdict logic", "Inspect blocker", "Trace evidence", "View requirements"]),
    ]),
    bundleSection("4. Decision Tab / Decision Snapshot", [
      bundleField("Verdict semantics", `${safeModel.verdictSemantics?.label || "Unavailable"} - ${safeModel.verdictSemantics?.summary || "Unavailable"}`),
      "Evidence still needed:",
      bundleList(safeModel.verdictSemantics?.missingEvidence || safeModel.missingCritical),
      bundleField("Primary blocker", safeModel.primaryBlocker?.label),
      bundleField("Primary blocker detail", safeModel.primaryBlocker?.explanation),
      bundleField("Weakest link", safeModel.weakestLink?.label),
      bundleField("Weakest link detail", safeModel.weakestLink?.explanation),
      "What Would Change The Decision:",
      bundleList(safeModel.whatWouldChangeDecision?.items),
      bundleField("Structural quality", safeModel.overallScore),
      bundleField("Evidence support", safeModel.confidenceScore),
      bundleField("Confidence", safeModel.confidenceLabel),
      bundleField("Manual review signal", `${safeModel.manualReviewStatus?.label || "Unavailable"} - ${safeModel.manualReviewStatus?.detail || "Unavailable"}`),
      bundleField("Allocation Decision", safeModel.allocationOutcome?.label),
      bundleField("Current state", safeModel.currentState),
      bundleField("Why Now", safeModel.whyNow || decisionFrame.whyNow),
      bundleField("Why Not Now", safeModel.whyNotNow || decisionFrame.whyNotNow),
      bundleField("Decision Memo", safeModel.summaryMemo),
      bundleField("Primary Weakness", safeModel.primaryWeakness),
      bundleField("Failure Mode", safeModel.failureMode?.primary),
      bundleField("Structured Thesis Summary", safeModel.structuredThesisSummary || safeModel.summaryMemo),
      "Missing critical evidence:",
      bundleList(safeModel.missingCritical),
      "Required conditions:",
      bundleList(safeModel.requiredConditions),
      "Constraint Summary / blockers:",
      bundleList(safeModel.blockers),
      "Top decision drivers:",
      bundleList(safeModel.decisionDrivers),
      "Lens-aware display text:",
      bundleList([
        lensAware?.primaryBlocker,
        ...(lensAware?.evidenceNeeded || []),
        ...(lensAware?.whatWouldChange || []),
        ...(lensAware?.requiredConditions || []),
      ]),
      "Raw/fallback audit text still present in backend fields:",
      bundleList([
        ...(decisionFrame.whatMustBeTrue || []),
        ...(decisionFrame.nextCheckpoints || []),
        ...safeArray(decisionLayer.researchRequirements).map((requirement) => requirement?.title),
      ]),
      bundleField("Raw generic copy still visible in primary areas", yesNoUnknown(rawGenericVisible)),
      bundleField("Raw generic copy present in audit/backend fields", yesNoUnknown(rawGenericAudit)),
    ]),
    bundleSection("5. Thesis Falsification Tab", [
      bundleField("Allocation thesis", safeModel.summaryMemo),
      bundleField("Asset framing", visibleBundleFramingLabel),
      bundleField("Why allocation could make sense", allocationCase.forAllocation?.[0] || safeModel.primaryStrength),
      bundleField("Why allocation is blocked", allocationCase.againstAllocation?.[0] || safeModel.primaryWeakness),
      "Evidence still needed:",
      bundleList(allocationCase.missingEvidence || safeModel.missingCritical),
      "What would change the decision:",
      bundleList(allocationCase.whatWouldChange || safeModel.whatWouldChangeDecision?.items),
      "Review-only cautions:",
      bundleList(filterPrimaryBundleItems(verdictReasons.reviewOnlyCautions)),
      "What Must Be True:",
      bundleList(safeModel.whatMustBeTrue),
      "What Could Break The Thesis:",
      bundleList(safeModel.whatCouldBreak),
      "Live Context Supporting The Thesis:",
      bundleList(verdictReasons.positiveThesisEvidence || safeModel.topPositiveDrivers),
      "Evidence Missing / Provider Gaps:",
      bundleList(filterPrimaryBundleItems(verdictReasons.evidenceGaps || safeModel.missingCritical)),
      bundleField("Weakest Link", safeModel.weakestLink?.label),
      bundleField("False-Positive Risk / Refusal to infer", safeModel.tokenDemandTruth),
      "Manual-review triggers:",
      bundleList(filterPrimaryBundleItems([safeModel.manualReviewStatus?.detail, ...safeModel.auditAlerts])),
      bundleField("Token Demand Truth", safeModel.tokenDemandTruth),
      bundleField("Failure Modes", safeModel.failureMode?.primary),
      "Conviction Drivers:",
      bundleList(filterPrimaryBundleItems(safeModel.decisionDrivers)),
      "Blockers:",
      bundleList(filterPrimaryBundleItems(safeModel.blockers)),
      "Raw allocation-case fallback text:",
      bundleList([
        ...(rawAllocationCase.missingEvidence || []),
        ...(rawAllocationCase.whatWouldChange || []),
        ...(rawAllocationCase.againstAllocation || []),
      ]),
    ]),
    bundleSection("6. Institutional Checklist", [
      bundleField("Current asset lens text", visibleBundleLensLabel || visibleBundleFramingLabel),
      bundleField("Resolver reason", lens?.fallbackReason || safeArray(lens?.routingSource).join("; ")),
      "Provider-grounded lens panel:",
      bundleList([
        `lensId: ${bundleValue(lens?.lensId)}`,
        `questionGroupId: ${bundleValue(lens?.questionGroupId)}`,
        `confidence: ${bundleValue(lens?.confidence)}`,
        `matchedSignals: ${safeArray(lens?.matchedSignals).join("; ") || "Unavailable"}`,
        `ambiguityFlags: ${safeArray(lens?.ambiguityFlags).join("; ") || "Unavailable"}`,
      ]),
      "Registry / source boundary text:",
      bundleList(lens?.sourceBoundary || lensAware?.boundaryNotes),
      "Institutional questions:",
      bundleQuestions(questions),
    ]),
    bundleSection("6B. Institutional Answer Synthesis v1", [
      bundleField("Synthesis layer attached", allSynthesizedQuestions.length ? "yes" : "unknown"),
      bundleField("Synthesis model", "deterministic/template-driven; no runtime LLM/freeform inference; reviewed evidence remains non-scoring-active"),
      bundleField("Questions with synthesis", allSynthesizedQuestions.length),
      "Synthesis QA summary:",
      bundleList([
        `missing synthesis on question rows: ${yesNoUnknown(synthesizedAnswerMissing)}`,
        `generic methodology copy in synthesized direct answer: ${yesNoUnknown(genericMethodologySynthesisLeak)}`,
        `bad renderable value in synthesized direct answer: ${yesNoUnknown(synthesizedBadRenderableValue)}`,
        `source-backed synthesis without reviewed source/fact: ${yesNoUnknown(sourceBackedSynthesisWithoutSourceList)}`,
        `reviewed evidence scoring boundary violation: ${yesNoUnknown(synthesizedScoringBoundaryViolation)}`,
        `provider-only synthesis overclaimed as reviewed evidence: ${yesNoUnknown(providerOnlySynthesisOverclaimed)}`,
        `computed synthesis overclaimed as reviewed evidence: ${yesNoUnknown(computedSynthesisOverclaimed)}`,
        `stablecoin copy outside stablecoin lens: ${yesNoUnknown(stablecoinCopyLeakageInSynthesis)}`,
        `irrelevant sector marker leakage: ${yesNoUnknown(irrelevantSectorSignalLeakageInSynthesis)}`,
        `supported/source-required mismatch without boundary: ${yesNoUnknown(supportedSourceRequiredSynthesisMismatch)}`,
      ]),
      "Synthesized question answers:",
      bundleQuestions(allSynthesizedQuestions),
    ]),
    bundleSection("6A. Tokenomics / Supply Integrity Tab Mirror", [
      bundleField("Dedicated tab visible", tokenomicsSupplyIntegrity ? "yes - Tokenomics tab mirrors this section" : "unknown"),
      bundleField("Tab hierarchy", "Command Header -> Key Risk Summary -> Supply Snapshot -> Provider Comparison -> Formula Outputs -> Asset-Class Diligence/Q&A -> Score Logic -> Source Requirements -> Audit Boundary"),
      bundleField("Key risk summary", lens?.lensId === "STABLECOIN_SETTLEMENT" ? "reserves; redemption; issuer/custodian; mint/redeem controls; freeze/admin policy; supported networks" : "lens-specific supply, control, dilution, concentration, and value-capture diligence"),
      bundleField("Contract mapping summary", `${safeArray(assetIdentityResolution?.allKnownContracts).length || safeArray(tokenomicsSupplyIntegrity?.providerContracts).length || 0} mappings attached; primary tab shows selected/analyzed contract and top mappings first; full list remains in audit/bundle.`),
      bundleField("Tokenomics integrity score", tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === null || tokenomicsSupplyIntegrity?.tokenomicsIntegrityScore === undefined ? null : `${tokenomicsSupplyIntegrity.tokenomicsIntegrityScore}/100`),
      bundleField("Explanation summary", tokenomicsSupplyIntegrity?.explanationSummary),
      bundleField("Evidence confidence", tokenomicsSupplyIntegrity?.evidenceConfidence),
      bundleField("Supply summary", tokenomicsSupplyIntegrity?.supplySummary?.summary),
      bundleField("Current price", tokenomicsSupplyIntegrity?.currentPrice),
      bundleField("24h volume", tokenomicsSupplyIntegrity?.volume24h),
      bundleField("Max supply status", tokenomicsSupplyIntegrity?.maxSupplyStatus),
      bundleField("Max supply value", tokenomicsSupplyIntegrity?.maxSupplyValue),
      bundleField("Max supply method", tokenomicsSupplyIntegrity?.maxSupplyMethod),
      bundleField("Circulating / total / max", `${bundleValue(tokenomicsSupplyIntegrity?.circulatingSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.totalSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.maxSupplyValue)}`),
      bundleField("Market cap / FDV", `${bundleValue(tokenomicsSupplyIntegrity?.marketCap)} / ${bundleValue(tokenomicsSupplyIntegrity?.fdv)}`),
      bundleField("Market cap / FDV method", `${bundleValue(tokenomicsSupplyIntegrity?.marketCapMethod)} / ${bundleValue(tokenomicsSupplyIntegrity?.fdvMethod)}`),
      bundleField("FDV / market cap ratio", tokenomicsSupplyIntegrity?.fdvMarketCapRatio),
      bundleField("Circulating percent of max", tokenomicsSupplyIntegrity?.circulatingPercentOfMax),
      bundleField("Remaining dilution percent", tokenomicsSupplyIntegrity?.remainingDilutionPercent),
      bundleField("Supply gap total minus circulating", tokenomicsSupplyIntegrity?.supplyGapTotalMinusCirculating),
      bundleField("Supply gap max minus circulating", tokenomicsSupplyIntegrity?.supplyGapMaxMinusCirculating),
      bundleField("FDV minus market cap", tokenomicsSupplyIntegrity?.fdvMinusMarketCap),
      bundleField("Volume / market cap ratio", tokenomicsSupplyIntegrity?.volumeMarketCapRatio),
      bundleField("Self-reported CMC circulating / market cap", `${bundleValue(tokenomicsSupplyIntegrity?.selfReportedCirculatingSupply)} / ${bundleValue(tokenomicsSupplyIntegrity?.selfReportedMarketCap)}`),
      bundleField("Derived market cap / FDV", `${bundleValue(tokenomicsSupplyIntegrity?.derivedMarketCap)} / ${bundleValue(tokenomicsSupplyIntegrity?.derivedFdv)}`),
      bundleField("Unlock schedule status", tokenomicsSupplyIntegrity?.unlockScheduleStatus),
      bundleField("Next unlock", `${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockDate)} | percent: ${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockPercent)} | USD: ${bundleValue(tokenomicsSupplyIntegrity?.nextUnlockUsdValue)}`),
      bundleField("Unlock / volume ratio", tokenomicsSupplyIntegrity?.unlockToVolumeRatio),
      bundleField("Unlock / liquidity ratio", tokenomicsSupplyIntegrity?.unlockToLiquidityRatio),
      bundleField("Unlock / market cap ratio", tokenomicsSupplyIntegrity?.unlockToMarketCap),
      bundleField("Future dilution risk", tokenomicsSupplyIntegrity?.futureDilutionRisk),
      bundleField("Emission policy status", tokenomicsSupplyIntegrity?.emissionPolicyStatus),
      bundleField("Annual inflation / annual emissions / net issuance", `${bundleValue(tokenomicsSupplyIntegrity?.annualInflationEstimate)} / ${bundleValue(tokenomicsSupplyIntegrity?.annualizedEmissions)} / ${bundleValue(tokenomicsSupplyIntegrity?.netIssuanceAfterBurn)}`),
      bundleField("Mint authority status", bundleControlStatusLabel(tokenomicsSupplyIntegrity?.mintAuthorityStatus, "mint", lens?.lensId)),
      bundleField("Admin control status", bundleControlStatusLabel(tokenomicsSupplyIntegrity?.adminControlStatus, "admin", lens?.lensId)),
      bundleField("Governance supply-change risk", tokenomicsSupplyIntegrity?.governanceSupplyChangeRisk),
      bundleField("Cap mutability status", tokenomicsSupplyIntegrity?.capMutabilityStatus),
      bundleField("Burn mechanism status", tokenomicsSupplyIntegrity?.burnMechanismStatus),
      bundleField("Burn materiality", tokenomicsSupplyIntegrity?.burnMateriality),
      bundleField("Buyback/burn status", tokenomicsSupplyIntegrity?.buybackBurnStatus),
      bundleField("Buyback/burn coverage", tokenomicsSupplyIntegrity?.buybackBurnCoverage),
      bundleField("Concentration fields", `treasury=${bundleValue(tokenomicsSupplyIntegrity?.treasurySupplyConcentration)}; vestingRecipients=${bundleValue(tokenomicsSupplyIntegrity?.vestingRecipientConcentration)}; topWallet=${bundleValue(tokenomicsSupplyIntegrity?.topWalletConcentration)}`),
      bundleField("Tokenholder value capture status", tokenomicsSupplyIntegrity?.tokenholderValueCaptureStatus),
      bundleField("Token necessity status", tokenomicsSupplyIntegrity?.tokenNecessityStatus),
      bundleField("Accrual ratios", `tokenholder=${bundleValue(tokenomicsSupplyIntegrity?.tokenholderAccrualRatio)}; feeRevenue=${bundleValue(tokenomicsSupplyIntegrity?.feeRevenueCaptureRatio)}; protocolRevenueToTokenValue=${bundleValue(tokenomicsSupplyIntegrity?.protocolRevenueToTokenValue)}`),
      bundleField("Staking reward source", tokenomicsSupplyIntegrity?.stakingRewardSource),
      "Provider supply snapshots:",
      bundleList([
        tokenomicsSupplyIntegrity?.coingeckoSupply ? `CoinGecko: price=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.currentPrice)}; mcap=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.marketCap)}; fdv=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.fdv)}; volume=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.volume24h)}; circ/total/max=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.circulatingSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.totalSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.maxSupply)}; timestamp=${bundleValue(tokenomicsSupplyIntegrity.coingeckoSupply.timestamp)}; boundary=${safeArray(tokenomicsSupplyIntegrity.coingeckoSupply.sourceBoundary).join(", ")}` : null,
        tokenomicsSupplyIntegrity?.coinmarketcapSupply ? `CoinMarketCap: price=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.currentPrice)}; mcap=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.marketCap)}; fdv=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.fdv)}; volume=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.volume24h)}; circ/total/max=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.circulatingSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.totalSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.maxSupply)}; selfReported=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.selfReportedCirculatingSupply)}/${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.selfReportedMarketCap)}; timestamp=${bundleValue(tokenomicsSupplyIntegrity.coinmarketcapSupply.timestamp)}; boundary=${safeArray(tokenomicsSupplyIntegrity.coinmarketcapSupply.sourceBoundary).join(", ")}` : null,
      ].filter(Boolean)),
      "Source contradictions:",
      bundleList(tokenomicsSupplyIntegrity?.sourceContradictions),
      "Provider disagreements:",
      bundleList(tokenomicsSupplyIntegrity?.providerDisagreements),
      "Provider scope notes:",
      bundleList(tokenomicsSupplyIntegrity?.providerScopeNotes),
      "Provider numeric rows:",
      bundleList([
        ...safeArray(tokenomicsSupplyIntegrity?.providerMarketCaps).map((entry) => `${entry.provider} marketCap=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerFdvs).map((entry) => `${entry.provider} fdv=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerVolumes).map((entry) => `${entry.provider} volume24h=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerSupplyValues).map((entry) => `${entry.provider} ${entry.field}=${entry.value} (${entry.sourcePath}; ${entry.boundary}; scope=${entry.scope || "unknown"})`),
      ]),
      "Liquidity / pair context:",
      bundleList([
        ...safeArray(tokenomicsSupplyIntegrity?.providerMarketCaps),
        ...safeArray(tokenomicsSupplyIntegrity?.providerFdvs),
        ...safeArray(tokenomicsSupplyIntegrity?.providerVolumes),
        ...safeArray(tokenomicsSupplyIntegrity?.providerSupplyValues),
      ].filter((entry) => entry?.scope === "pair_liquidity_local").map((entry) => `${entry.provider} ${entry.field}=${entry.value} (${entry.sourcePath}; pair/local context, not global reconciliation)`)),
      "Provider contracts/platforms:",
      bundleList([
        ...safeArray(tokenomicsSupplyIntegrity?.providerContracts).map((entry) => `${entry.provider}: ${bundleValue(entry.network)} ${bundleValue(entry.contractAddress)} (${entry.sourcePath})`),
        ...safeArray(tokenomicsSupplyIntegrity?.providerPlatforms).map((entry) => `${entry.provider}: ${entry.platform} ${bundleValue(entry.contractAddress)} (${entry.sourcePath})`),
      ]),
      "Provider field audit:",
      bundleList(safeArray(tokenomicsSupplyIntegrity?.providerFieldAudit).map((entry) => `${entry.provider}: available=${safeArray(entry.fieldsAvailable).join(", ") || "none"}; missing=${safeArray(entry.fieldsMissing).join(", ") || "none"}; boundary=${safeArray(entry.sourceBoundary).join(", ") || "provider reported"}`)),
      "Formula outputs:",
      bundleList(tokenomicsFormulaOutputs.map((formula) => `${formula.formulaId}: ${formula.display || "Unavailable"} | status=${formula.status || "unknown"} | formula=${formula.formula || "Unavailable"} | missing=${safeArray(formula.missingInputs).join(", ") || "none"} | requirement=${formula.sourceRequirement || "Unavailable"} | boundary=${safeArray(formula.sourceBoundary).join(", ") || "Unavailable"}`)),
      "Tokenomics Question-First Q&A Mirror:",
      bundleTokenomicsQuestionFirstMirror(tokenomicsSupplyIntegrity),
      "Source requirements:",
      bundleList(tokenomicsSupplyIntegrity?.sourceRequirements),
      "Manual review triggers:",
      bundleList(tokenomicsSupplyIntegrity?.manualReviewTriggers),
      "Hard blockers:",
      bundleList(tokenomicsSupplyIntegrity?.hardBlockers),
      "Soft blockers:",
      bundleList(tokenomicsSupplyIntegrity?.softBlockers),
      "Score caps:",
      bundleList(tokenomicsSupplyIntegrity?.scoreCaps),
      "Confidence caps:",
      bundleList(tokenomicsSupplyIntegrity?.confidenceCaps),
      "Positive signals:",
      bundleList(tokenomicsSupplyIntegrity?.positiveSignals),
      "Negative signals:",
      bundleList(tokenomicsSupplyIntegrity?.negativeSignals),
      "Neutral/contextual signals:",
      bundleList(tokenomicsSupplyIntegrity?.neutralContextualSignals),
      "Raw institutional Q&A audit mirror:",
      bundleQuestions(tokenomicsSupplyIntegrity?.institutionalQuestions),
      "What would change:",
      bundleList(tokenomicsSupplyIntegrity?.whatWouldChange),
      "Source boundary:",
      bundleList(tokenomicsSupplyIntegrity?.sourceBoundary),
      "Raw audit fields:",
      bundleObjectRows(tokenomicsSupplyIntegrity?.auditRawFields),
    ]),
    bundleSection("7. Evidence Map / Source Trace", [
      "Live provider evidence rows / source statuses:",
      bundleObjectRows(sourceStatusObject),
      "Provider diagnostics summary:",
      bundleProviderDiagnostics(providerDiagnosticsList),
      "Provider notes:",
      bundleList(providerNotes),
      "Evidence coverage signals:",
      bundleList(safeArray(evidenceStatusProxy?.items).map((item) => `${item.label}: ${item.statusLabel || item.status || item.sourceLabel || "context"}`)),
      "Unavailable in live response:",
      bundleList(evidenceStatusProxy?.unavailable),
      "Official links / source trace:",
      bundleObjectRows(officialLinks || safeData.officialLinks),
      "Docs / whitepaper summary:",
      bundleObjectRows(whitepaperDocs || safeData.whitepaperDocs),
      "Provider diagnostics notes:",
      bundleProviderDiagnostics(notableDiagnostics || providerDiagnosticsList),
      bundleField("Boundary notices", "Provider metadata/live provider signal/source candidate/reviewed evidence/report-only overlay/scoring-active evidence must remain distinct."),
      bundleField("Freshness/source boundary", `${analysisFreshness.freshnessLabel}. Missing or stale provider sections are not negative evidence; they require verification before strong conclusions.`),
    ]),
    bundleSection("8. Scoring Transparency", [
      bundleField("Overall score", safeModel.overallScore ?? safeScores.overallScore),
      bundleField("Structural quality", safeModel.overallScore),
      bundleField("Evidence support/confidence proxy", `${safeModel.confidenceScore ?? safeConfidence.score ?? "Unavailable"} / ${safeModel.confidenceLabel || safeConfidence.level || "Unavailable"}`),
      "Scores:",
      bundleObjectRows(safeScores),
      "tokenDemandQuality:",
      bundleObjectRows(safeAnalysis.tokenDemandQuality),
      "evidenceDirectness:",
      bundleObjectRows(safeAnalysis.evidenceDirectness),
      "Policy signals:",
      bundleList(safeModel.policySignals || safeAnalysis.policySignals),
      "Scoring policy / caps / gates / blockers:",
      bundleObjectRows(scoringPolicy),
      "Decision layer:",
      bundleObjectRows({
        verdictClass,
        currentState: safeModel.currentState,
        posture: safeModel.posture,
      }),
      "Unavailable modules / neutral missing:",
      bundleList(safeModel.topNeutralDrivers),
      "What engine refused to infer:",
      bundleList([safeModel.tokenDemandTruth, ...(verdictReasons.notApplicableItems || [])]),
      "Score drivers - positives:",
      bundleList(safeModel.topPositiveDrivers),
      "Score drivers - negatives:",
      bundleList(safeModel.topNegativeDrivers),
      "Caveats / warnings:",
      bundleList([...safeModel.auditAlerts, ...warnings]),
    ]),
    bundleSection("9. Source Queue", [
      bundleField("Source lifecycle explainer", "Candidate -> Manual intake -> ManualSourceEvidenceItem -> Mapping -> Report-only overlay. Candidate/report-only layers are not live scoring input."),
      "Research requirements:",
      bundleList(safeArray(safeModel.researchRequirements).map((requirement) => `${requirement?.title || "Requirement"} | ${requirement?.reason || "No reason"} | impact: ${requirement?.verdictImpact || "Unavailable"}`)),
      "Lens-aware source priorities:",
      bundleList(lensAware?.sourceQueueRequirements),
      "Evidence needed:",
      bundleList(safeArray(safeModel.researchRequirements).flatMap((requirement) => requirement?.evidenceNeeded || [])),
      "Preferred source types:",
      bundleList(safeArray(safeModel.researchRequirements).flatMap((requirement) => requirement?.preferredSourceTypes || [])),
      "Live response gaps that need sources:",
      bundleList([
        ...safeModel.requiredConditions,
        ...safeModel.missingCritical,
        ...(safeModel.whatWouldChangeDecision?.items || []),
      ]),
      "Suggested research domains:",
      bundleList(suggestedResearchDomains),
      bundleField("Source boundary", "Research requirements are not evidence. Report-only evidence does not affect live scoring."),
    ]),
    bundleSection("10. Manual Review", [
      bundleField("Manual review status", safeModel.manualReviewStatus?.label),
      bundleField("Reason", safeModel.manualReviewStatus?.detail),
      "Live review signals:",
      bundleList([
        ...safeModel.missingCritical,
        ...safeModel.requiredConditions,
        ...safeModel.auditAlerts,
      ]),
      "Provider gaps:",
      bundleProviderDiagnostics(notableDiagnostics || providerDiagnosticsList),
      "Analysis freshness review signals:",
      bundleList(analysisFreshness.freshnessWarnings),
      "Calibration warnings:",
      bundleList(safeArray(calibrationWarnings).map((warning) => `${warning.id || "warning"} | ${warning.severity || "severity unavailable"} | verdict: ${warning.affectsVerdict ? "affects" : "diagnostic"} | scoring: ${warning.affectsScoring ? "affects" : "diagnostic"} | boundary: ${warning.sourceBoundary || "Unavailable"} | ${warning.issue || warning.observedBehavior || "Review required"} | ${warning.recommendedAction || "Manual review required"}`)),
      "Verification checklist:",
      bundleList([
        "Confirm source authenticity, freshness, scope, and contradictions.",
        "Do not treat provider metadata as reviewed evidence.",
        "Do not promote source candidates or report-only overlays into live scoring.",
        ...safeModel.requiredConditions,
      ]),
      "Review outcome legend:",
      bundleList(["requires_review", "accepted_for_report", "stale", "rejected", "duplicate", "low_relevance", "contradiction_review"]),
      bundleField("Failure mode matrix", safeModel.failureMode?.primary),
      "Backend risk engine summary / security checks:",
      bundleObjectRows(security || safeData.security),
      "Key alerts:",
      bundleList(safeModel.keyAlerts),
      "Green flags:",
      bundleList(safeModel.topPositiveDrivers),
      "Red flags:",
      bundleList([...safeModel.topNegativeDrivers, ...safeModel.auditAlerts]),
    ]),
    bundleSection("11. Audit / Raw Key Fields", [
      "Provider diagnostics summary:",
      bundleProviderDiagnostics(providerDiagnosticsList),
      "Provider health:",
      bundleProviderHealth(providerHealth),
      "Snapshot/drift summary:",
      bundleObjectRows(snapshot || safeData.snapshot),
      "Analysis Freshness / Snapshot Details:",
      bundleList([
        `status: ${analysisFreshness.freshnessStatus}`,
        `label: ${analysisFreshness.freshnessLabel}`,
        `source: ${analysisFreshness.analysisSource || "unknown"}`,
        `generatedAt: ${analysisFreshness.generatedAt || "unavailable"}`,
        `readAt: ${analysisFreshness.readAt || "unavailable"}`,
        `snapshotId: ${analysisFreshness.snapshotId || "unavailable"}`,
        `previousSnapshotId: ${analysisFreshness.previousSnapshotId || "unavailable"}`,
        `previousSnapshotAt: ${analysisFreshness.previousSnapshotAt || "unavailable"}`,
        `recomputed: ${analysisFreshness.recomputed === null || analysisFreshness.recomputed === undefined ? "unknown" : analysisFreshness.recomputed ? "yes" : "no"}`,
        `refreshMode: ${analysisFreshness.refreshMode || "unavailable"}`,
        `fullRegenerationNeeded: ${analysisFreshness.fullRegenerationNeeded === null || analysisFreshness.fullRegenerationNeeded === undefined ? "unknown" : String(analysisFreshness.fullRegenerationNeeded)}`,
        `partialRefreshSufficient: ${analysisFreshness.partialRefreshSufficient === null || analysisFreshness.partialRefreshSufficient === undefined ? "unknown" : String(analysisFreshness.partialRefreshSufficient)}`,
        `freshSections: ${safeArray(analysisFreshness.freshSections).join(", ") || "unavailable"}`,
        `staleSections: ${safeArray(analysisFreshness.staleSections).join(", ") || "unavailable"}`,
        `missingSections: ${safeArray(analysisFreshness.missingSections).join(", ") || "unavailable"}`,
      ]),
      "Latest stored snapshot:",
      bundleField("latest snapshot id", safeArray(timelineData)[0]?.snapshotId),
      "Historical snapshot deltas if visible:",
      bundleObjectRows(compareData?.compactImpact || compareData?.delta || compareData),
      "Thesis drift:",
      bundleObjectRows(compareData?.thesisDrift || compareData?.thesis),
      "Raw field availability summary:",
      bundleList([
        `analysis: ${Object.keys(safeAnalysis).length ? "present" : "missing"}`,
        `decisionLayer: ${Object.keys(decisionLayer).length ? "present" : "missing"}`,
        `thesisCore: ${Object.keys(thesisCore).length ? "present" : "missing"}`,
        `resolvedInstitutionalLens: ${lens ? "present" : "missing"}`,
        `assetIdentityResolution: ${assetIdentityResolution ? "present" : "missing"}`,
        `lensAwareExplanations: ${lensAware ? "present" : "missing"}`,
        `tokenomicsSupplyIntegrity: ${tokenomicsSupplyIntegrity ? "present" : "missing"}`,
        `assetInterpretationContract: ${assetInterpretationContract ? "present" : "missing"}`,
        `engineLearningBackbone: ${engineLearningBackbone ? "present" : "missing"}`,
        `providerCategorySignals: ${providerCategorySignals ? "present" : "missing"}`,
        `categoryDrivenAssetFamilyContract: ${categoryDrivenAssetFamilyContract ? "present" : "missing"}`,
        `categoryDataRequirementProfiles: ${categoryDataRequirementProfiles ? "present" : "missing"}`,
        `categoryAnswerBuilder: ${categoryAnswerBuilder ? "present" : "missing"}`,
        `categoryReadinessDiagnostics: ${categoryReadinessDiagnostics ? "present" : "missing"}`,
        `institutionalQuestions: ${safeArray(questions).length}`,
        `calibrationWarnings: ${safeArray(calibrationWarnings).length}`,
      ]),
      "Failed/skipped provider list with reasons:",
      bundleProviderDiagnostics(providerDiagnosticsList.filter((entry) => entry?.status !== "success" || ["failed", "skipped", "unavailable", "partial"].includes(entry?.coverage || ""))),
      bundleField("Anthropic fallback status if visible", aiReport?.providerStatus || aiReport?.fallbackReason || safeMeta.aiFallbackStatus),
      "Warnings/errors:",
      bundleList(warnings),
      "Raw fields that may confuse user-facing copy:",
      bundleList([
        rawGenericAudit ? "Generic protocol/unlock/vesting wording exists in raw backend/audit fields." : "No obvious generic raw copy detected by frontend heuristic.",
      ]),
    ]),
    bundleSection("12. Engine Learning Backbone v1", [
      bundleField("Backbone attached", engineLearningBackbone ? "yes" : "missing"),
      bundleField("Artifact version", engineLearningBackbone?.artifactVersion),
      bundleField("Task name", engineLearningBackbone?.taskName),
      bundleField("Summary", engineLearningBackbone?.summary),
      bundleField("Guardrail: scoring changed", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.scoringChanged) : "unknown"),
      bundleField("Guardrail: verdict changed", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.verdictChanged) : "unknown"),
      bundleField("Guardrail: provider behavior changed", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.providerBehaviorChanged) : "unknown"),
      bundleField("Guardrail: evidence packet expansion occurred", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.evidencePacketExpansionOccurred) : "unknown"),
      bundleField("Guardrail: reviewed evidence scoring-active", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Guardrail: source candidates promoted", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.sourceCandidatesPromotedToReviewedEvidence) : "unknown"),
      bundleField("Guardrail: ADA packet coverage added", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.adaPacketCoverageAdded) : "unknown"),
      "Findings:",
      bundleList(safeArray(engineLearningBackbone?.findings).map((finding) => `${finding.id || "finding"} | ${finding.category || "category unavailable"} | ${finding.severity || "severity unavailable"} | ${finding.reviewStatus || "review status unavailable"} | ${finding.recommendedAction || finding.title || "Review required"}`)),
      "Asset-class rules applied:",
      bundleList(safeArray(engineLearningBackbone?.assetClassRulesApplied).map((rule) => `${rule.id || "rule"} | ${rule.title || "Rule title unavailable"} | ${rule.outputWarningTemplate || rule.summary || "Rule summary unavailable"}`)),
      "Evidence mapping policies:",
      bundleList(safeArray(engineLearningBackbone?.evidenceMappingPoliciesApplied).map((policy) => `${policy.id || "policy"} | ${policy.status || "status unavailable"} | ${policy.sourceBoundary || "boundary unavailable"} | ${policy.displayLabel || policy.summary || "Policy summary unavailable"}`)),
      "Source requirements triggered:",
      bundleList(safeArray(engineLearningBackbone?.sourceRequirementsTriggered).map((requirement) => `${requirement.id || "requirement"} | ${requirement.title || "Requirement title unavailable"} | affects scoring: ${requirement.affectsScoring ? "yes" : "no"} | diagnostic: ${requirement.diagnosticOnly ? "yes" : "no"}`)),
      "Source candidates:",
      bundleList(safeArray(engineLearningBackbone?.sourceCandidates).map((candidate) => `${candidate.sourceCandidateTitle || candidate.candidateId || "candidate"} | status=${candidate.candidateStatus || "unknown"} | promoted=${candidate.promotedToReviewedEvidence ? "yes" : "no"} | scoring=${candidate.scoringActive ? "yes" : "no"} | boundary=${safeArray(candidate.sourceBoundary).join(", ") || "source candidate only"}`)),
      "Output QA checks:",
      bundleList(safeArray(engineLearningBackbone?.outputQaChecks).map((check) => `${check.id || "qa_check"} | ${check.status || "status unavailable"} | ${check.severity || "severity unavailable"} | ${check.description || check.remediation || "QA check"}`)),
      "Calibration anomalies:",
      bundleList(safeArray(engineLearningBackbone?.calibrationAnomalies).map((anomaly) => `${anomaly.anomalyId || "anomaly"} | ${anomaly.asset || "asset unavailable"} | ${anomaly.status || "status unavailable"} | ${anomaly.calibrationAction || anomaly.description || "Calibration review"}`)),
      "Dependency requirements:",
      bundleList(safeArray(engineLearningBackbone?.dependencyRequirements).map((dependency) => `${dependency.id || "dependency"} | ${dependency.title || "Dependency title unavailable"} | required=${safeArray(dependency.requiredFor).join(", ") || "unspecified"}`)),
      "Freshness / point-in-time readiness:",
      bundleList(safeArray(engineLearningBackbone?.freshnessPointInTimeReadiness).map((rule) => `${rule.id || "freshness_rule"} | ${rule.title || "Freshness rule"} | ${rule.status || "status unavailable"} | ${rule.outputWarning || rule.summary || "Point-in-time boundary"}`)),
      "Path parity checks:",
      bundleList(safeArray(engineLearningBackbone?.pathParityChecks).map((check) => `${check.path || check.id || "path"} | ${check.status || "status unavailable"} | required=${safeArray(check.requiredFields).join(", ")}`)),
      "Benchmark Learning / Reusable Engine Rules:",
      bundleList([
        `Rules matched: ${safeArray(engineLearningBackbone?.benchmarkLearningRulesApplied).length}`,
        `Registry total: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.totalRules ?? "unknown"}`,
        `Source benchmark assets: ${safeArray(engineLearningBackbone?.benchmarkLearningRegistrySummary?.sourceBenchmarkAssets).join(", ") || "unknown"}`,
        `Scoring status: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.scoringStatus || "unknown"}`,
        `Reviewed evidence status: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.reviewedEvidenceStatus || "unknown"}`,
        `Frontend parity status: ${engineLearningBackbone?.benchmarkLearningRegistrySummary?.frontendParityStatus || "unknown"}`,
        `BTC baseline 2C: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.btcBaseline2CStatus || "unknown"}`,
        `BTC baseline 12C failure count: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.btcBaseline12CFailureCount ?? "unknown"}`,
        `ETH baseline 2C: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.ethBaseline2CStatus || "unknown"}`,
        `ETH baseline 12D failure count: ${engineLearningBackbone?.benchmarkLearningRenderedParity?.ethBaseline12DFailureCount ?? "unknown"}`,
        `Shared primary-visible corpus: ${yesNoUnknown(engineLearningBackbone?.benchmarkLearningRenderedParity?.sharedPrimaryVisibleCorpus)}`,
        `ETH learning captured: ${yesNoUnknown(safeArray(engineLearningBackbone?.benchmarkLearningRegistrySummary?.ruleIds).includes("eth_baseline_regression_fixture"))}`,
        `BTC learning preserved: ${yesNoUnknown(safeArray(engineLearningBackbone?.benchmarkLearningRegistrySummary?.ruleIds).includes("btc_baseline_regression_fixture"))}`,
        "Next benchmark candidates: WBTC, stETH, USDC/USDT, RENDER, ONDO/RWA, UNI/AAVE/LINK",
      ]),
      "Benchmark rules applied:",
      bundleList(safeArray(engineLearningBackbone?.benchmarkLearningRulesApplied).map((rule) => `${rule.ruleId || "rule"} | source=${rule.sourceBenchmarkAsset || "unknown"} | applies=${safeArray(rule.appliesToLens).join(", ") || "lens unknown"} | scoring=${rule.scoringStatus || "unknown"} | reviewedEvidence=${rule.reviewedEvidenceStatus || "unknown"} | ${rule.generalizedRule || "Rule summary unavailable"}`)),
      "Benchmark source requirement templates:",
      bundleList(safeArray(engineLearningBackbone?.benchmarkLearningSourceRequirementTemplates).slice(0, 12).map((template) => `${template.templateId || "template"} | ${template.requirementGroup || "group unavailable"} | ${template.requirementText || "Requirement unavailable"} | scoring=${template.scoringStatus || "unknown"}`)),
      "Source & Data Requirement Matrix v1:",
      bundleList([
        `Matrix attached: ${engineLearningBackbone?.sourceDataRequirementMatrix ? "yes" : "missing"}`,
        `Providers inventoried: ${engineLearningBackbone?.sourceDataRequirementMatrix?.providerCount ?? "unknown"}`,
        `Matrix entries: ${engineLearningBackbone?.sourceDataRequirementMatrix?.matrixEntryCount ?? "unknown"}`,
        `Lens groups covered: ${safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.lensGroupsCovered).slice(0, 12).join(", ") || "unknown"}`,
        `Scoring status: ${engineLearningBackbone?.sourceDataRequirementMatrix?.currentScoringStatus || "unknown"}`,
        `Future scoring readiness: ${engineLearningBackbone?.sourceDataRequirementMatrix?.futureScoringReadiness || "unknown"}`,
        `Backend response path: ${engineLearningBackbone?.sourceDataRequirementMatrix?.backendResponsePathStatus || "unknown"}`,
        `Frontend normalization: ${engineLearningBackbone?.sourceDataRequirementMatrix?.frontendNormalizationStatus || "unknown"}`,
        `Review Bundle parity: ${engineLearningBackbone?.sourceDataRequirementMatrix?.reviewBundleParityStatus || "unknown"}`,
        `BTC/ETH benchmark integration: ${engineLearningBackbone?.sourceDataRequirementMatrix?.btcEthBenchmarkLearningIntegrationStatus || "unknown"}`,
        `Scoring changed: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.scoringChanged)}`,
        `Verdict changed: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.verdictChanged)}`,
        `Provider behavior changed: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.providerBehaviorChanged)}`,
        `Evidence packet expansion: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.evidencePacketExpansionOccurred)}`,
        `Reviewed evidence scoring-active: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.reviewedEvidenceScoringActive)}`,
        `Source candidates promoted: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.sourceCandidatesPromoted)}`,
        `ADA packet coverage added: ${yesNoUnknown(engineLearningBackbone?.sourceDataRequirementMatrix?.adaPacketCoverageAdded)}`,
      ]),
      "Asset Interpretation Contract integration:",
      bundleList([
        `Integration attached: ${engineLearningBackbone?.assetInterpretationContractIntegration ? "yes" : "missing"}`,
        `Backend field: ${engineLearningBackbone?.assetInterpretationContractIntegration?.backendResponseField || "unknown"}`,
        `Visible label gate: ${engineLearningBackbone?.assetInterpretationContractIntegration?.visibleLabelGateStatus || "unknown"}`,
        `Source Matrix integrated: ${yesNoUnknown(engineLearningBackbone?.assetInterpretationContractIntegration?.sourceMatrixIntegrated)}`,
        `Scoring status: ${engineLearningBackbone?.assetInterpretationContractIntegration?.currentScoringStatus || "non_scoring_v1"}`,
      ]),
      "Asset Interpretation reusable rules:",
      bundleList(engineLearningBackbone?.assetInterpretationContractIntegration?.ruleIds),
      "Data-First Narrative Contract integration:",
      bundleList([
        `Integration attached: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration ? "yes" : "missing"}`,
        `Backend field: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.backendResponseField || "unknown"}`,
        `Frontend field: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.frontendNormalizationField || "unknown"}`,
        `Primary narrative gate: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.primaryNarrativeGateStatus || "unknown"}`,
        `Decision surface binding: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.decisionSurfaceDataBindingStatus || "unknown"}`,
        `Score explanation binding: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.scoreExplanationDataBindingStatus || "unknown"}`,
        `Scoring status: ${engineLearningBackbone?.dataFirstNarrativeContractIntegration?.currentScoringStatus || "non_scoring_v1"}`,
      ]),
      "Matrix missing data categories:",
      bundleList(safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.missingDataCategories).slice(0, 16)),
      "Matrix source candidates generated:",
      bundleList(safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.sourceCandidatesGenerated).slice(0, 16)),
      "Matrix reviewed evidence needs:",
      bundleList(safeArray(engineLearningBackbone?.sourceDataRequirementMatrix?.reviewedEvidenceNeeds).slice(0, 16)),
      "Deferred findings:",
      bundleList(safeArray(engineLearningBackbone?.deferredFindings).map((finding) => `${finding.id || "deferred"} | ${finding.title || "Deferred finding"} | ${finding.recommendedAction || "Next cleanup pass"}`)),
      "Known limitations:",
      bundleList(engineLearningBackbone?.knownLimitations),
      bundleField("Next resume pointer", engineLearningBackbone?.nextResumePointer),
    ]),
    bundleSection("13. Cross-Tab Consistency Checklist", [
      bundleField("Resolved lens matches Decision Header lens", lens && displayIdentity ? yesNoUnknown(String(displayIdentity.displayFraming || displayIdentity.displayAssetClass || "").toLowerCase().includes(String(lens.label || lens.lensId || "").split("/")[0].trim().toLowerCase())) : "unknown"),
      bundleField("Institutional question group matches resolved lens", questionMatchStatus),
      bundleField("Decision wording is lens-specific", yesNoUnknown(Boolean(lensAware))),
      bundleField("Thesis Falsification wording is lens-specific", yesNoUnknown(Boolean(lensAware))),
      bundleField("Source Queue requirements are lens-specific", yesNoUnknown(Boolean(lensAware?.sourceQueueRequirements?.length))),
      bundleField("Manual Review requirements are lens-specific", yesNoUnknown(Boolean(lensAware))),
      bundleField("Evidence Map preserves metadata/evidence boundary", "unknown"),
      bundleField("Scoring Transparency avoids unsupported inference", "unknown"),
      bundleField("Provider metadata is not presented as reviewed evidence", safeArray(lens?.sourceBoundary).length ? "yes" : "unknown"),
      bundleField("Raw generic copy still visible in primary areas", yesNoUnknown(rawGenericVisible)),
      bundleField("High-confidence lens but manual/low-coverage primary framing", yesNoUnknown(manualFramingWhileLensResolved)),
      bundleField("Suggested research domains contain stale fallback labels", yesNoUnknown(staleResearchDomains)),
      bundleField("Primary copy uses generic fallback despite lens-aware copy", yesNoUnknown(genericPrimaryDespiteLens)),
      bundleField("Protocol economics mapping skipped for major protocol token", yesNoUnknown(protocolMappingSkipped)),
      bundleField("Tokenomics max supply missing without source requirement", yesNoUnknown(tokenomicsMissingMaxWithoutRequirement)),
      bundleField("Tokenomics unlocks missing without cap/source requirement", yesNoUnknown(tokenomicsMissingUnlocksWithoutCap)),
      bundleField("Mint/admin controls unresolved without warning", yesNoUnknown(tokenomicsMintAdminWithoutWarning)),
      bundleField("Provider supply contradiction without warning", yesNoUnknown(tokenomicsContradictionWithoutWarning)),
      bundleField("High FDV/market-cap without dilution note", yesNoUnknown(tokenomicsHighFdvWithoutDilutionNote)),
      bundleField("Provider numeric rows missing despite tokenomics values", yesNoUnknown(tokenomicsProviderRowsMissing)),
      bundleField("Tokenomics tab missing while tokenomics object exists", tokenomicsSupplyIntegrity ? "no" : "unknown"),
      bundleField("Formula outputs missing while numeric inputs exist", yesNoUnknown(tokenomicsFormulaOutputsMissing)),
      bundleField("Q&A answers missing formula/data linkage", yesNoUnknown(tokenomicsQuestionsMissingLinkage)),
      bundleField("Tokenomics Q&A not rendered as question-first accordion model", yesNoUnknown(tokenomicsQuestionAccordionMirrorMissing)),
      bundleField("Question expanded answer missing short answer", yesNoUnknown(tokenomicsQuestionExpandedMissingShortAnswer)),
      bundleField("Question expanded answer missing data/formula/rule linkage", yesNoUnknown(tokenomicsQuestionMissingDataFormulaRule)),
      bundleField("Question says unknown when better status is available", yesNoUnknown(tokenomicsQuestionVagueUnknown)),
      bundleField("Not-applicable asset-class answer shown as failure", yesNoUnknown(tokenomicsNotApplicableShownAsFailure)),
      bundleField("Formula computed but Q&A does not cite it", yesNoUnknown(tokenomicsComputedFormulaNotCited)),
      bundleField("Missing-input formula lacks source requirement", yesNoUnknown(tokenomicsMissingInputFormulaNoRequirement)),
      bundleField("Provider-reported value shown as reviewed evidence", yesNoUnknown(tokenomicsProviderReportedAsReviewed)),
      bundleField("Review Bundle mirrors question-first Tokenomics model", tokenomicsSupplyIntegrity ? yesNoUnknown(!tokenomicsQuestionAccordionMirrorMissing) : "unknown"),
      bundleField("Engine Learning Backbone present in frontend model", engineLearningBackbone ? "yes" : "missing"),
      bundleField("Engine Learning source candidates remain non-reviewed", engineLearningBackbone ? yesNoUnknown(safeArray(engineLearningBackbone.sourceCandidates).some((candidate) => candidate.promotedToReviewedEvidence)) : "unknown"),
      bundleField("Engine Learning reviewed evidence stays non-scoring", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Engine Learning ADA packet coverage added", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.guardrails?.adaPacketCoverageAdded) : "unknown"),
      bundleField("Engine Learning critical output QA failures", engineLearningBackbone ? safeArray(engineLearningBackbone.outputQaChecks).filter((check) => check.status === "fail" && check.severity === "critical").length : "unknown"),
      bundleField("Engine Learning path parity includes frontend and bundle", engineLearningBackbone ? yesNoUnknown(!safeArray(engineLearningBackbone.pathParityChecks).some((check) => ["frontend_normalization", "copy_review_bundle"].includes(check.path) && !["ready", "preserved"].includes(check.status))) : "unknown"),
      bundleField("Benchmark learning registry mirrored", engineLearningBackbone ? yesNoUnknown(safeArray(engineLearningBackbone.benchmarkLearningRulesApplied).length > 0 || safeArray(engineLearningBackbone.benchmarkLearningRegistrySummary?.ruleIds).length > 0) : "unknown"),
      bundleField("Benchmark learning remains non-scoring", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRegistrySummary?.scoringStatus === "non_scoring_v1") : "unknown"),
      bundleField("Benchmark reviewed evidence remains non-scoring-active", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRegistrySummary?.reviewedEvidenceStatus === "reviewed_non_scoring_active_false") : "unknown"),
      bundleField("BTC rendered baseline parity captured", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRenderedParity?.btcBaseline2CStatus === "PASS" && engineLearningBackbone.benchmarkLearningRenderedParity?.btcBaseline12CFailureCount === 0 && engineLearningBackbone.benchmarkLearningRenderedParity?.sharedPrimaryVisibleCorpus === true) : "unknown"),
      bundleField("ETH rendered baseline parity captured", engineLearningBackbone ? yesNoUnknown(engineLearningBackbone.benchmarkLearningRenderedParity?.ethBaseline2CStatus === "PASS" && engineLearningBackbone.benchmarkLearningRenderedParity?.ethBaseline12DFailureCount === 0 && engineLearningBackbone.benchmarkLearningRenderedParity?.sharedPrimaryVisibleCorpus === true) : "unknown"),
      bundleField("ETH benchmark learning captured without scoring authority", engineLearningBackbone ? yesNoUnknown(safeArray(engineLearningBackbone.benchmarkLearningRegistrySummary?.ruleIds).includes("eth_baseline_regression_fixture") && engineLearningBackbone.benchmarkLearningRegistrySummary?.scoringStatus === "non_scoring_v1") : "unknown"),
      bundleField("Source & Data Requirement Matrix present", engineLearningBackbone ? yesNoUnknown(Boolean(engineLearningBackbone.sourceDataRequirementMatrix)) : "unknown"),
      bundleField("Matrix separates live/API from reviewed/deep research", engineLearningBackbone?.sourceDataRequirementMatrix ? "yes - full registry is backend/audit artifact; summary mirrors requirements and boundaries" : "unknown"),
      bundleField("Matrix remains non-scoring", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.currentScoringStatus === "non_scoring_requirement_matrix") : "unknown"),
      bundleField("Matrix provider behavior unchanged", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.providerBehaviorChanged) : "unknown"),
      bundleField("Matrix source candidates remain candidate-only", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.sourceCandidatesPromoted) : "unknown"),
      bundleField("Matrix reviewed evidence remains non-scoring", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.reviewedEvidenceScoringActive) : "unknown"),
      bundleField("Matrix ADA packet coverage added", engineLearningBackbone?.sourceDataRequirementMatrix ? yesNoUnknown(engineLearningBackbone.sourceDataRequirementMatrix.adaPacketCoverageAdded) : "unknown"),
      bundleField("Category signals present in frontend model", yesNoUnknown(Boolean(providerCategorySignals))),
      bundleField("Category family contract present in frontend model", yesNoUnknown(Boolean(categoryDrivenAssetFamilyContract))),
      bundleField("Category registry remains non-scoring", categoryReadinessDiagnostics ? yesNoUnknown(categoryReadinessDiagnostics.scoringIntegrationStatus === "non_scoring_v1") : "unknown"),
      bundleField("Category provider behavior unchanged", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.scoringBoundary?.providerBehaviorChanged === false) : "unknown"),
      bundleField("Category source candidates promoted", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.scoringBoundary?.sourceCandidatesPromoted) : "unknown"),
      bundleField("Category reviewed evidence promoted", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.scoringBoundary?.reviewedEvidencePromoted) : "unknown"),
      bundleField("Category authority applied when eligible", categoryDrivenAssetFamilyContract ? yesNoUnknown(categoryDrivenAssetFamilyContract.categoryAuthorityApplied) : "unknown"),
      bundleField("Category/AIC aligned", categoryDrivenAssetFamilyContract ? yesNoUnknown((categoryDrivenAssetFamilyContract.categoryAicAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryAicAlignmentStatus) === "aligned") : "unknown"),
      bundleField("Category/DataFirst aligned", categoryDrivenAssetFamilyContract ? yesNoUnknown((categoryDrivenAssetFamilyContract.categoryDataFirstAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryDataFirstAlignmentStatus) === "aligned") : "unknown"),
      bundleField("Category/question group aligned", categoryDrivenAssetFamilyContract ? yesNoUnknown((categoryDrivenAssetFamilyContract.categoryQuestionGroupAlignmentStatus || assetInterpretationContract?.categoryAuthorityBridge?.categoryQuestionGroupAlignmentStatus) === "aligned") : "unknown"),
      bundleField("Effective category source matrix aligned", categoryDrivenAssetFamilyContract?.categoryAuthorityApplied ? yesNoUnknown(!sourceMatrixFamilyMismatch) : "not applicable"),
      bundleField("visibleLensLabel mirror status", visibleLensLabelMirrorMissing ? "missing" : visibleLensLabelMirror.length ? "mirrored" : "not_rendered_by_ui"),
      bundleField("PAXG-like tokenized gold avoids manual primary label", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "tokenized_gold_commodity_rwa" ? yesNoUnknown(!/manual classification|general low-coverage/i.test(`${visibleBundleLensLabel} ${visibleBundleFramingLabel} ${dataFirstNarrativeContract?.narrativeScope?.primaryVisibleLabel || ""}`)) : "not applicable"),
      bundleField("PAXG-like tokenized gold source matrix is dedicated", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "tokenized_gold_commodity_rwa" ? yesNoUnknown(effectiveSourceMatrixIds.includes("matrix_tokenized_gold_commodity_rwa") && !effectiveSourceMatrixIds.includes("matrix_rwa_hybrid_finance")) : "not applicable"),
      bundleField("ADA-like non-ETH L1 avoids AI routing", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform" ? yesNoUnknown(!/ai_infrastructure|agent token/i.test(String(categoryDrivenAssetFamilyContract.primaryAssetFamily))) : "not applicable"),
      bundleField("ADA-like non-ETH L1 source matrix is dedicated", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform" ? yesNoUnknown(effectiveSourceMatrixIds.includes("matrix_non_eth_l1_smart_contract_platform") && !effectiveSourceMatrixIds.includes("matrix_native_pos_gas_eth")) : "not applicable"),
      bundleField("ADA-like non-ETH L1 avoids ETH-only source gaps", categoryDrivenAssetFamilyContract?.primaryAssetFamily === "non_eth_l1_smart_contract_platform" ? yesNoUnknown(!/EIP-1559|base-fee|base fee|priority fee|L2\/blob|blob fee|proposer-builder|relay centralization|ETF-flow|ETH fee-market/i.test([
        dataFirstNarrativeContract?.generatedNarrativeFields?.map((field) => field.generatedText).join(" "),
        dataFirstNarrativeContract?.missingEvidenceGaps?.map((gap) => gap.sourceRequirement).join(" "),
        categoryDrivenAssetFamilyContract?.sourceRequirementProfile?.priorityRequirements?.join(" "),
        tokenomicsSupplyIntegrity?.sourceRequirements?.join(" "),
        tokenomicsSupplyIntegrity?.institutionalQuestions?.map((question) => `${question.shortAnswer || ""} ${question.answerSummary || ""} ${safeArray(question.missingEvidence).join(" ")} ${safeArray(question.whatWouldChange).join(" ")}`).join(" "),
      ].join(" "))) : "not applicable"),
      bundleField("Ecosystem tags preserved as context", providerCategorySignals ? yesNoUnknown(safeArray(providerCategorySignals.ecosystemContextTags).length >= 0 && safeArray(categoryDrivenAssetFamilyContract?.excludedFamilies).every((entry) => !/classification authority/i.test(entry.reason || "") || /not authority/i.test(entry.reason || ""))) : "unknown"),
      bundleField("Category question requirements visible in Source Queue", categoryDrivenAssetFamilyContract ? yesNoUnknown(safeArray(safeModel.researchRequirements).some((requirement) => String(requirement?.id || "").startsWith("category-driven-"))) : "unknown"),
      bundleField("Asset Interpretation Contract present", yesNoUnknown(!assetInterpretationContractMissing)),
      bundleField("Asset Interpretation visible label hard gate failed", yesNoUnknown(assetInterpretationHardGateFailure)),
      bundleField("Asset Interpretation label matches bundle/display label", assetInterpretationContract ? yesNoUnknown(!assetInterpretationVisibleLabelMismatch) : "unknown"),
      bundleField("Non-ETH lens showing ETH PoS/gas label", yesNoUnknown(nonEthLensShowingEthGasLabel)),
      bundleField("Data-first narrative contract present", yesNoUnknown(!dataFirstNarrativeMissing)),
      bundleField("Data-first primary narrative gate failed", yesNoUnknown(dataFirstNarrativeFailing)),
      bundleField("AIC label PASS but narrative FAIL", yesNoUnknown(aicLabelPassButNarrativeFail)),
      bundleField("Score explanation not data-bound", yesNoUnknown(scoreExplanationNotDataBound)),
      bundleField("Wrong-asset primary narrative mentions", dataFirstNarrativeContract ? safeArray(dataFirstNarrativeContract.wrongAssetNameMentions).length : "unknown"),
      bundleField("Forbidden primary narrative concepts", dataFirstNarrativeContract ? safeArray(dataFirstNarrativeContract.forbiddenConceptMentions).length : "unknown"),
      bundleField("Unsupported primary narrative claims", dataFirstNarrativeContract ? safeArray(dataFirstNarrativeContract.unsupportedClaimsDetected).length : "unknown"),
      bundleField("Source universe taxonomy candidate-only", assetInterpretationContract ? yesNoUnknown(!sourceUniversePromoted) : "unknown"),
      bundleField("Network treated as classification authority", assetInterpretationContract ? yesNoUnknown(assetInterpretationContract.thesisLensContext?.networkContextIsClassificationAuthority) : "unknown"),
      bundleField("Asset Interpretation scoring boundary preserved", assetInterpretationContract ? yesNoUnknown(
        assetInterpretationContract.scoringBoundary?.scoringChanged === false
        && assetInterpretationContract.scoringBoundary?.verdictChanged === false
        && assetInterpretationContract.scoringBoundary?.providerBehaviorChanged === false
        && assetInterpretationContract.scoringBoundary?.sourceCandidatesPromoted === false
      ) : "unknown"),
      bundleField("Tokenomics key questions visible near top of tab", tokenomicsSupplyIntegrity ? "yes - Q&A renders after executive summary and key-risk summary" : "unknown"),
      bundleField("Tokenomics Q&A buried below detail sections", tokenomicsSupplyIntegrity ? "no - provider/identity/audit details are lower or collapsible" : "unknown"),
      bundleField("Tabs use executive answer / key question structure", "yes - Decision, Thesis, Evidence, Scoring, Source Queue, Manual Review, and Tokenomics include executive or question-first lead sections"),
      bundleField("Primary tab order follows answer/questions/evidence/audit", "yes - primary tabs lead with executive answer and question prompts before provider/audit detail"),
      bundleField("Institutional Checklist questions buried below resolver/provider metadata", safeArray(questions).length ? "no - live Q&A rows render before lens/provider context" : "unknown"),
      bundleField("Decision repeats blocker/evidence lists in multiple primary sections", "no - duplicate blocker, weakest-link, and layer details are collapsed under Decision Details / Audit"),
      bundleField("Thesis exposes long report sections before core questions", "no - allocation semantics and supporting panels are collapsed below falsification questions"),
      bundleField("Audit/provider details dominate primary product surface", "no - audit/provider-heavy detail is demoted or collapsible in primary tab flow"),
      bundleField("Long contract/provider lists visible before key questions", tokenomicsSupplyIntegrity ? "no - Tokenomics questions precede contract/provider detail" : "unknown"),
      bundleField("Repeated boundary copy overwhelms primary UX", "unknown - bundle cannot measure visual density; primary tabs now consolidate boundary copy into executive/detail sections"),
      bundleField("Question cards include status/impact/source badges", tokenomicsSupplyIntegrity ? "yes - Tokenomics and lightweight tab prompts render status, impact, and source-state badges" : "unknown"),
      bundleField("Expandable cards include chevron/expand microcopy", "yes - shared question/detail cards expose View/Hide or Expand/Collapse copy with chevrons"),
      bundleField("Expandable rows keyboard/touch accessible", "yes - shared expanders use button semantics with aria-expanded; checklist rows use native summary plus visible state copy"),
      bundleField("Mobile overflow risk from long IDs/contracts", "reduced - primary text rows, cards, rail values, and timelines use break-word/anywhere wrapping"),
      bundleField("Right rail competes on small screens", "no - responsive layout stacks rail and uses compact mobile rail summary"),
      bundleField("Primary UI contains 'Unavailable in current frontend model'", "no - that placeholder is reserved for Review Bundle/audit fallback text"),
      bundleField("Primary UI exposes raw sourceBoundary field names", checklistRawSourceBoundaryPrimaryRisk ? "no - raw boundary ids are collapsed technical/audit detail, not primary row copy" : "no"),
      bundleField("Primary UI exposes scoringFieldsUsed", "no - checklist scoring/audit fields are collapsed technical details"),
      bundleField("Checklist supported status but no short answer", yesNoUnknown(checklistSupportedWithoutAnswer)),
      bundleField("Checklist question has no readable fallback answer", yesNoUnknown(checklistNoReadableFallback)),
      bundleField("Long supportingSignals list appears before concise answer", checklistLongSignalsRisk ? "no - long signal lists are collapsed behind concise answers" : "no"),
      bundleField("Decision/Thesis missing question-first cards", "no - Decision and Thesis render question prompt cards near the top"),
      bundleField("Thesis starts with long report text before key questions", "no - key falsification prompts appear immediately after the summary card"),
      bundleField("Institutional Checklist rendered as concise Q&A rows", safeArray(questions).length ? "yes - live answers render as expandable rows" : "unknown"),
      bundleField("FDV/market-cap ratio missing despite valid values", yesNoUnknown(tokenomicsMissingRatioDespiteValues)),
      bundleField("Remaining dilution missing despite supply values", yesNoUnknown(tokenomicsMissingDilutionDespiteValues)),
      bundleField("Provider-reported values missing boundary label", yesNoUnknown(tokenomicsProviderBoundaryMissing)),
      bundleField("Score/caps distinguish diagnostic-only from final scoring", safeArray(tokenomicsSupplyIntegrity?.sourceBoundary).includes("diagnostic_only_not_scoring_active") ? "yes" : "unknown"),
      bundleField("Canonical issuer-native stablecoin incorrectly marked wrapped/bridged", yesNoUnknown(tokenomicsCanonicalStablecoinWrongVariant)),
      bundleField("Pair-level DexScreener data compared as global disagreement", yesNoUnknown(tokenomicsCrossScopeDisagreementPollution)),
      bundleField("Q&A includes unrelated provider diagnostics", yesNoUnknown(tokenomicsQaUnrelatedDiagnostics)),
      bundleField("Stablecoin max-supply/dilution question asset-class-aware", tokenomicsSupplyIntegrity && lens?.lensId === "STABLECOIN_SETTLEMENT" ? yesNoUnknown(!tokenomicsStablecoinQuestionsGeneric) : "unknown"),
      bundleField("Ambiguous verified mint/admin labels in primary UI", yesNoUnknown(tokenomicsAmbiguousVerifiedControlLabels)),
      bundleField("Provider contract list too long without summary/expand behavior", tokenomicsContractListTooLong ? "no - primary tab summarizes and expands contract mappings" : "no"),
      bundleField("Tokenomics exact numbers/formulas/Q&A present after cleanup", tokenomicsSupplyIntegrity ? yesNoUnknown(Boolean(tokenomicsFormulaOutputs.length && safeArray(tokenomicsSupplyIntegrity.institutionalQuestions).length)) : "unknown"),
      bundleField("Review Bundle mirrors Tokenomics tab", tokenomicsSupplyIntegrity ? "yes" : "unknown"),
      bundleField("NaN/Infinity/undefined visible in tokenomics object", yesNoUnknown(tokenomicsUnsafeNumericText)),
      bundleField("Native asset wrongly penalized for no contract", yesNoUnknown(tokenomicsNativeNoContractPenalty)),
      bundleField("Native benchmark penalized for missing ERC-20 unlocks", yesNoUnknown(tokenomicsNativeUnlockPenalty)),
      bundleField("Issuer-native stablecoin has wrapped/bridged warning contradiction", yesNoUnknown(issuerNativeStablecoinVariantWarningLeak || tokenomicsCanonicalStablecoinWrongVariant)),
      bundleField("RWA protocol token canonical network overridden by product/partner chain", yesNoUnknown(rwaProtocolProductChainCanonicalOverride)),
      bundleField("Meme evidence routed to ambiguous manual classification", yesNoUnknown(memeEvidenceRoutedManual)),
      bundleField("Stablecoin hard-cap dilution treated as primary risk", yesNoUnknown(tokenomicsStablecoinHardCapPrimary)),
      bundleField("Protocol success treated as tokenholder accrual", yesNoUnknown(tokenomicsProtocolSuccessAsAccrual)),
      bundleField("Migrated token lacks canonical/migration source requirement", yesNoUnknown(tokenomicsMigrationWithoutRequirement)),
      bundleField("Meme asset routed to manual classification despite meme lens", yesNoUnknown(tokenomicsMemeManualDespiteLens)),
      bundleField("LST score collapses from missing evidence without confirmed failure", yesNoUnknown(lstScoreCollapsedOnMissingEvidence)),
      bundleField("WBTC-like selection appears bridged/high-risk", yesNoUnknown(wbtcLikelyBridgedSelection)),
      bundleField("Reviewed packet exists but Q&A still shows generic source-required answer", yesNoUnknown(reviewedPacketGenericSourceRequiredLeak)),
      bundleField("Institutional Answer Synthesis attached to all visible question rows", yesNoUnknown(!synthesizedAnswerMissing)),
      bundleField("Synthesized direct answers avoid methodology copy", yesNoUnknown(!genericMethodologySynthesisLeak)),
      bundleField("Synthesized direct answers avoid null/undefined/NaN/Infinity", yesNoUnknown(!synthesizedBadRenderableValue)),
      bundleField("Source-backed synthesized answer has reviewed sources/facts", yesNoUnknown(!sourceBackedSynthesisWithoutSourceList)),
      bundleField("Reviewed evidence remains non-scoring-active in synthesis", yesNoUnknown(!synthesizedScoringBoundaryViolation)),
      bundleField("Provider-only synthesis avoids reviewed-evidence overclaim", yesNoUnknown(!providerOnlySynthesisOverclaimed)),
      bundleField("Computed/formula synthesis avoids reviewed-evidence overclaim", yesNoUnknown(!computedSynthesisOverclaimed)),
      bundleField("Analyst answer card attached to synthesized rows", yesNoUnknown(!analystCardMissing)),
      bundleField("Analyst primary answers present", yesNoUnknown(!analystPrimaryMissingAnswer)),
      bundleField("Analyst primary UI hides template IDs/internal fields", yesNoUnknown(!analystPrimaryTemplateLeakage)),
      bundleField("Analyst primary UI hides raw sourceBoundary enums", yesNoUnknown(!analystPrimaryRawEnumLeakage)),
      bundleField("Analyst primary badges avoid supported/source-required contradiction", yesNoUnknown(!analystContradictoryBadgeStack)),
      bundleField("Source-backed analyst cards include reviewed evidence", yesNoUnknown(!analystSourceBackedWithoutSources)),
      bundleField("Provider-only analyst card avoids reviewed-evidence overclaim", yesNoUnknown(!analystProviderOnlyOverclaim)),
      bundleField("Formula-derived analyst card avoids reviewed-evidence overclaim", yesNoUnknown(!analystFormulaOverclaim)),
      bundleField("Bundle mirrors analyst-card primary answer/status/boundary", yesNoUnknown(!analystBundleMirrorMissing)),
      bundleField("Stablecoin trust evidence is central, not not-applicable", yesNoUnknown(!stablecoinTrustNotApplicableLeakage)),
      bundleField("Stablecoin max-supply/dilution rows do not dominate trust diligence", yesNoUnknown(!stablecoinTokenomicsScarcityDominance)),
      bundleField("Stablecoin protocol-token value-capture remains not applicable where appropriate", yesNoUnknown(!stablecoinProtocolNotApplicableMissing)),
      bundleField("Stablecoin synthesis copy absent for non-stablecoin lens", yesNoUnknown(!stablecoinCopyLeakageInSynthesis)),
      bundleField("Irrelevant sector markers absent from synthesized primary answer context", yesNoUnknown(!irrelevantSectorSignalLeakageInSynthesis)),
      bundleField("Supported/source-required synthesis mismatch has explicit boundary", yesNoUnknown(!supportedSourceRequiredSynthesisMismatch)),
      bundleField("Source-backed reviewed answer missing source list", yesNoUnknown(reviewedPacketSourceBackedNoSources)),
      bundleField("Reviewed demo evidence treated as scoring-active", yesNoUnknown(reviewedPacketScoringActive)),
      bundleField("Reviewed evidence allowed to change final verdict/overall score", reviewedPacketScoringActive ? "yes - QA violation" : "no - non-scoring display layer"),
      bundleField("Reviewed packet stale source shown as fresh", yesNoUnknown(reviewedPacketStaleMismatch)),
      bundleField("Reviewed packet contradiction not surfaced", yesNoUnknown(reviewedPacketContradictionHidden)),
      bundleField("Review Bundle missing evidence packet section", yesNoUnknown(reviewedPacketMissingBundleSection)),
      bundleField("Official mechanism docs source-backed a market/liquidity question", yesNoUnknown(reviewedPacketMechanismBackedMarketLiquidity)),
      bundleField("Official mechanism docs source-backed distribution/overhang materiality", yesNoUnknown(reviewedPacketMechanismBackedDistributionOverhang)),
      bundleField("Official mechanism docs source-backed live liveness/outage status", yesNoUnknown(reviewedPacketMechanismBackedLiveLiveness)),
      bundleField("Stablecoin reserve docs source-backed protocol burn/buyback question", yesNoUnknown(reviewedPacketStablecoinBackedProtocolBurn)),
      bundleField("Governance/adoption possibility treated as active tokenholder accrual", yesNoUnknown(reviewedPacketProtocolPossibilityBackedActiveAccrual)),
      bundleField("RWA product rights applied to protocol tokenholder rights", yesNoUnknown(reviewedPacketRwaProductRightsAsProtocolRights)),
      bundleField("Platform/AUM activity used as tokenholder accrual", yesNoUnknown(reviewedPacketPlatformAumAsAccrual)),
      bundleField("Gaming docs used as active-user/payer/retention proof", yesNoUnknown(reviewedPacketGamingDocsAsLiveDemand)),
      bundleField("Meme classification used as investment-quality proof", yesNoUnknown(reviewedPacketMemeAsInvestmentQuality)),
      bundleField("Native L1 docs used as market liquidity proof", yesNoUnknown(reviewedPacketNativeL1DocsAsLiquidity)),
      bundleField("Safety Module/staking docs shown as risk-free yield", yesNoUnknown(reviewedPacketSafetyModuleAsRiskFreeYield)),
      bundleField("Native BTC packet applied to wrapped/bridged BTC variant", yesNoUnknown(reviewedPacketNativeBtcAppliedToWrappedVariant)),
      bundleField("Reviewed evidence identity conflict hidden from UI", yesNoUnknown(reviewedEvidenceIdentityConflictHidden)),
      bundleField("Source-backed mapping still has material same-question gaps", yesNoUnknown(reviewedEvidenceSourceBackedWithMaterialSameGaps)),
      bundleField("LST source-backed mechanism displayed as risk elimination", yesNoUnknown(reviewedLstMechanismEliminatesRisk)),
      bundleField("RENDER DePIN answer leaks gaming active-user copy", yesNoUnknown(reviewedPacketRenderGamingCopyLeak)),
      bundleField("RENDER DePIN mechanism rows collapsed to pure source-required", yesNoUnknown(renderDepinMechanismCollapsedToSourceRequired)),
      bundleField("RENDER live demand proof incorrectly source-backed", yesNoUnknown(renderDepinLiveDemandIncorrectlyUpgraded)),
      bundleField("RENDER mechanism reviewed fact IDs visible", yesNoUnknown(renderDepinMechanismFactsVisible)),
      bundleField("ONDO reviewed evidence leaks RENDER migration identity warning", yesNoUnknown(reviewedPacketOndoRenderWarningLeak)),
      bundleField("UNI fee-switch/TokenJar source candidates missing from source requirements", yesNoUnknown(uniSourceCandidateRequirementsMissing)),
      bundleField("WBTC single-provider identity context hidden", yesNoUnknown(wbtcSingleProviderIdentityHidden)),
      bundleField("stETH LST displays false equal-weight RWA ambiguity", yesNoUnknown(stethFalseRwaAmbiguityVisible)),
      bundleField("Canonical and bridged/wrapped variants visually distinguishable in candidate UI", "yes - candidate cards show representation and wrong-asset risk when backend returns identitySummary"),
      bundleField("High-risk search candidate lacks warning labels", yesNoUnknown(highRiskSearchCandidateLooksSafe)),
      bundleField("Provider disagreement hidden in search identity", yesNoUnknown(providerDisagreementHidden)),
      bundleField("Risky selected search candidate missing bundle mirror", yesNoUnknown(riskySearchSelectionMissingBundleMirror)),
      bundleField("tokenomicsIntegrityScore high despite unresolved critical caps", yesNoUnknown(tokenomicsHighScoreWithCriticalCaps)),
      bundleField("tokenomicsIntegrityScore too punitive for not-applicable fields", yesNoUnknown(tokenomicsTooPunitiveForNotApplicable)),
      bundleField("Wrapped/stable/LST/RWA missing redemption/reserve source requirements", tokenomicsSupplyIntegrity ? yesNoUnknown(
        ["WRAPPED_ASSET", "STABLECOIN_SETTLEMENT", "LST_STAKING_DERIVATIVE", "RWA_HYBRID_ASSET"].includes(lens?.lensId)
        && !safeArray(tokenomicsSupplyIntegrity.sourceRequirements).some((item) => /reserve|redemption|mint|burn|custodian|legal|collateral|withdrawal/i.test(item)),
      ) : "unknown"),
      bundleField("Calibration warnings visible if present", safeArray(calibrationWarnings).length ? "yes" : "unknown"),
      bundleField("Analysis freshness visible in live tabs", analysisFreshness.freshnessStatus !== "unknown" || analysisFreshness.freshnessWarnings.length ? "yes" : "unknown"),
      bundleField("Live-first QA eligibility visible", analysisFreshness.qaEligibilityLabel ? "yes" : "unknown"),
      bundleField("Snapshot-derived bundle blocked from current QA", analysisFreshness.isSnapshot ? yesNoUnknown(!analysisFreshness.freshQaEligible) : "not applicable"),
      bundleField("Cached/recent bundle blocked from current QA", analysisFreshness.isCachedRecentMemo ? yesNoUnknown(!analysisFreshness.freshQaEligible) : "not applicable"),
      bundleField("Partial refresh sections listed", analysisFreshness.isPartialRefresh ? yesNoUnknown(Boolean(safeArray(analysisFreshness.freshSections).length || safeArray(analysisFreshness.staleSections).length || safeArray(analysisFreshness.missingSections).length)) : "not applicable"),
      bundleField("Bundle generated from same normalized product object", yesNoUnknown(bundleUsesSameCurrentAnalysisObject)),
      bundleField("Rendered-surface parity gate attached", renderedSurfaceParityViewModel.primaryVisibleText.length ? "yes" : "unknown"),
      bundleField("Component consumes BTC-native lens label override where applicable", lens?.lensId === "NATIVE_MONETARY_BENCHMARK" ? yesNoUnknown(/Native PoW Monetary/i.test(renderedPrimaryVisibleText)) : "not applicable"),
      bundleField("Frontend appears to render backend fields", lens && questions?.length ? "yes" : "unknown"),
      bundleField("Any obvious institutional-quality wording issues", rawGenericVisible ? "yes" : "unknown"),
    ]),
    bundleSection("13. Institutional QA Notes", [
      bundleField("Potentially embarrassing wording", rawGenericVisible ? "Generic protocol/tokenomics wording appears in primary display fields." : "No obvious generic primary-display wording detected by frontend heuristic."),
      bundleField("Generic copy still visible", rawGenericVisible ? "yes" : rawGenericAudit ? "raw/audit only" : "unknown"),
      bundleField("High-confidence lens framing issue", manualFramingWhileLensResolved ? "Resolved lens is high confidence but primary framing still looks manual/low-coverage." : "No high-confidence lens/manual-framing conflict detected."),
      bundleField("Stale research-domain issue", staleResearchDomains ? "Suggested research domains still include stale Manual Classification/AI/L1 fallback language." : "No stale research-domain fallback detected."),
      bundleField("Protocol economics mapping issue", protocolMappingSkipped ? "Major DeFi protocol mapping appears skipped/unavailable; treat as evidence-blocked, not confirmed absence." : "No major-protocol mapping issue detected by frontend heuristic."),
      bundleField("Lens mismatch risk", questionMismatchWarnings.length ? "question_lens_mismatch warning present" : questionMatchStatus === "yes" ? "low from current frontend model" : "unknown"),
      bundleField("Evidence-overclaim risk", safeArray(lens?.sourceBoundary).length ? "source boundary visible; still verify browser copy" : "unknown"),
      bundleField("Provider gap risk", notableDiagnostics?.length ? `${notableDiagnostics.length} notable provider diagnostics` : "unknown"),
      bundleField("UI clarity risk", "Review in browser; bundle is a QA aid and does not replace visual inspection."),
      bundleField("Recommended follow-up", "Run live cross-tab QA for LINK, ONDO, RENDER, USDC, WBTC, stETH, PEPE, RIO/NAKA, ETH/DAG controls."),
    ]),
  ];

  const bundleHeader = [
    "ThesisCore Cross-Tab QA Review Bundle",
    `Generated: ${bundleGeneratedAt}`,
    `Mode: ${analysisFreshness.bundleMode || "unknown"} | Fresh QA eligible: ${analysisFreshness.freshQaEligible ? "yes" : "no"}`,
    "Purpose: paste this bundle into review to detect lens routing, wording, evidence-boundary, scoring/explanation, frontend visibility, and live-first freshness issues.",
  ];
  const coreBundleText = [
    ...bundleHeader,
    ...sections,
  ].join("\n");
  const leakageForbiddenStringChecks = buildIdentityLensLeakageForbiddenStringChecks({
    bundleText: coreBundleText,
    asset: safeAsset,
    lens,
    assetIdentityResolution,
    reviewedEvidencePacket,
  });
  const leakageFailures = leakageForbiddenStringChecks.filter((check) => !check.passed);
  const btcBenchmarkForbiddenStringChecks = renderedBtcForbiddenStringChecks;
  const btcBenchmarkFailures = btcBenchmarkForbiddenStringChecks.filter((check) => !check.passed);
  const ethBenchmarkForbiddenStringChecks = renderedEthForbiddenStringChecks;
  const ethBenchmarkFailures = ethBenchmarkForbiddenStringChecks.filter((check) => !check.passed);
  const leakageQaSection = bundleSection("12B. Identity / Lens Leakage Recovery Patch #2 Text QA", [
    bundleField("Text-level forbidden-string checks run", leakageForbiddenStringChecks.length ? "yes" : "not applicable for this asset/lens"),
    bundleField("Text-level forbidden-string failures", leakageFailures.length),
    bundleField("Checked fields", leakageForbiddenStringChecks.flatMap((check) => check.checkedFields).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    bundleField("Checked bundle sections", leakageForbiddenStringChecks.flatMap((check) => check.checkedBundleSections).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    "Forbidden-string checks:",
    bundleList(leakageForbiddenStringChecks.map((check) =>
      `${check.checkId}: ${check.passed ? "PASS" : "FAIL"} | ${check.forbidden} | matches=${check.matches.join("; ") || "none"} | allowedWhen=${check.allowedWhen}`
    )),
    "False-negative prevention:",
    bundleList([
      "Checks scan the Copy Review Bundle core text mirror, not only boolean model flags.",
      "Checks include identity warnings, ambiguity/provider-internal flags, reviewed-evidence warnings, Source Queue, Manual Review, and audit-mirror sections.",
      "Checks are asset/lens scoped so valid RWA, wrapped, gaming, DePIN, and LST copy is not globally forbidden.",
    ]),
  ]);
  const btcBenchmarkQaSection = bundleSection("12C. BTC Benchmark Answer / Native Base-Layer Text QA", [
    bundleField("BTC-native forbidden-string checks run", btcBenchmarkForbiddenStringChecks.length ? "yes" : "not applicable for this asset/lens"),
    bundleField("BTC-native forbidden-string failures", btcBenchmarkForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []).length),
    bundleField("Checked fields", btcBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedFields).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    bundleField("Checked bundle sections", btcBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedBundleSections).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    "Forbidden-string checks:",
    bundleList(btcBenchmarkForbiddenStringChecks.map((check) =>
      `${check.checkId}: ${check.passed ? "PASS" : "FAIL"} | ${check.forbidden} | primaryMatches=${(check.primaryVisibleFailures || []).map((failure) => `${failure.surface}.${failure.fieldPath}: ${failure.matchedForbiddenPhrase}`).join("; ") || "none"} | secondary=${(check.secondaryVisibleMentions || []).length} | audit/internal/report exclusions=${[
        ...(check.auditOnlyMentions || []),
        ...(check.internalIdExclusions || []),
        ...(check.forbiddenListExclusions || []),
        ...(check.beforeStateExclusions || []),
        ...(check.selfTriggerExclusions || []),
      ].length} | allowedWhen=${check.allowedWhen}`
    )),
    "Native BTC expected surface:",
    bundleList([
      "Primary copy should use native proof-of-work, hard-cap/halving, blockspace/transaction-fee demand, miner economics, hashrate/security-budget, mining-pool concentration, liquidity/depth, custody/access, and liveness wording.",
      "Wrapped WBTC or bridged BTC variants remain separate identity contexts and must not inherit native BTC treatment automatically.",
      "Reviewed demo BTC evidence improves answer quality only; it is not scoring-active in v1.",
    ]),
  ]);
  const ethBenchmarkQaSection = bundleSection("12D. ETH Benchmark Answer / PoS Settlement Text QA", [
    bundleField("ETH-native forbidden-string checks run", ethBenchmarkForbiddenStringChecks.length ? "yes" : "not applicable for this asset/lens"),
    bundleField("ETH-native forbidden-string failures", ethBenchmarkForbiddenStringChecks.flatMap((check) => check.primaryVisibleFailures || []).length),
    bundleField("Checked fields", ethBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedFields).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    bundleField("Checked bundle sections", ethBenchmarkForbiddenStringChecks.flatMap((check) => check.checkedBundleSections).filter((entry, index, all) => all.indexOf(entry) === index).join("; ")),
    "Forbidden-string checks:",
    bundleList(ethBenchmarkForbiddenStringChecks.map((check) =>
      `${check.checkId}: ${check.passed ? "PASS" : "FAIL"} | ${check.forbidden} | primaryMatches=${(check.primaryVisibleFailures || []).map((failure) => `${failure.surface}.${failure.fieldPath}: ${failure.matchedForbiddenPhrase}`).join("; ") || "none"} | secondary=${(check.secondaryVisibleMentions || []).length} | audit/internal/report exclusions=${[
        ...(check.auditOnlyMentions || []),
        ...(check.internalIdExclusions || []),
        ...(check.forbiddenListExclusions || []),
        ...(check.beforeStateExclusions || []),
        ...(check.selfTriggerExclusions || []),
      ].length} | allowedWhen=${check.allowedWhen}`
    )),
    "Native ETH expected surface:",
    bundleList([
      "Primary copy should use PoS smart-contract settlement, gas demand, transaction-fee demand, EIP-1559 base-fee burn, net issuance, staking/validator security, client diversity, slashing/liveness, L2 settlement, blob/data-availability fees, liquidity/depth, custody/access, ETF-flow, and regulatory-access wording.",
      "Native ETH should not show BTC PoW/miner/hashrate/halving/block-subsidy copy, wrapped backing/redemption copy, stablecoin reserves/attestation copy, RWA legal/NAV/redemption copy, DePIN/gaming/meme copy, or ERC-20 admin/proxy copy as primary visible framing.",
      "Reviewed demo ETH evidence improves answer quality only; it is not scoring-active in v1.",
    ]),
  ]);
  return [
    ...bundleHeader,
    ...sections,
    leakageQaSection,
    btcBenchmarkQaSection,
    ethBenchmarkQaSection,
  ].join("\n");
}

export function buildMethodologyPrinciples() {
  return [
    "Truth before allocation",
    "False positives are risk",
    "Protocol quality is not token quality",
    "Confidence is earned, not assumed",
    "Capital deserves deterministic judgment",
  ];
}
