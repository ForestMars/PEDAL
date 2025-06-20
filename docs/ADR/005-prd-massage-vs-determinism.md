# ADR 005: PRD 'Massage' vs. Determinism in PEDAL

## Status
Proposed

## Context

A core premise of PEDAL is that given the same Product Requirements Document (PRD), the system will always produce identical, formally verifiable artifacts—ensuring determinism, auditability, and trust. This is only possible if the PRD strictly conforms to the required schema and format.

However, in practice, product owners and users may submit PRDs that are "near misses"—documents that are almost, but not quite, valid. To improve usability and lower the barrier to entry, there is a temptation to use AI (e.g., LLMs) to "massage" or auto-correct these PRDs into a valid form before ingestion.

This introduces a tradeoff:
- **Strict Determinism:** Only accept PRDs that are 100% valid. Any deviation is rejected, preserving the guarantee that the same input always yields the same output.
- **AI Massage:** Allow the system to auto-correct or reformat near-miss PRDs using AI, making the system more user-friendly but introducing non-determinism (the same PRD could yield different outputs depending on the AI's behavior, version, or context).

## Decision

PEDAL will prioritize **strict determinism** as the default and recommended mode of operation:
- By default, only PRDs that fully conform to the required schema and hybrid user story format will be accepted for pipeline processing.
- The validation script will provide clear, actionable error messages to help users correct their PRDs.
- This preserves the core guarantee: **the same PRD always yields the same output**.

However, PEDAL will offer an **optional, opt-in "AI massage" mode** for users who prefer convenience over strict determinism:
- If enabled, the system will attempt to auto-correct or reformat near-miss PRDs using an LLM or similar tool.
- The output of the AI massage step will be saved alongside the original PRD, and a warning will be displayed that determinism is no longer guaranteed for this run.
- Users and auditors will be able to review both the original and massaged PRD, and can choose to re-run the pipeline in strict mode if required.

## Rationale

- **Transparency:** Users must be aware when determinism is lost. All AI-massaged PRDs will be clearly flagged and auditable.
- **User Experience:** This approach balances rigor with usability, allowing teams to choose the mode that best fits their needs.
- **Auditability:** By saving both the original and massaged PRD, PEDAL maintains a clear audit trail.
- **Future-Proofing:** As AI tools improve, the system can revisit the balance between strictness and convenience, but the default will always be strict determinism.

## Consequences

- Teams that require formal guarantees (e.g., for compliance or regulated environments) can rely on strict mode.
- Teams that value speed and convenience can opt into AI massage, with full awareness of the tradeoff.
- Documentation and UI must make this distinction clear at every step.

---

**Related:** See [PRD Requirements](../prd-requirements/index.md) and [Hybrid User Story Format](../prd-requirements/user-story-format.md) for details on the required PRD structure. 