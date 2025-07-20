import { HowManyResult, QualityGate, QualityGateResult } from '../types/howmany';
export declare class QualityGateEvaluator {
    private qualityGate;
    constructor(qualityGate: QualityGate);
    /**
     * Evaluate quality gate against HowMany results
     */
    evaluate(results: HowManyResult): QualityGateResult;
    /**
     * Add contextual recommendations based on the analysis results
     */
    private addContextualRecommendations;
    /**
     * Format quality gate result for logging
     */
    formatResult(result: QualityGateResult): string;
    /**
     * Log quality gate result
     */
    logResult(result: QualityGateResult): void;
    /**
     * Create quality gate from action inputs
     */
    static fromInputs(): QualityGate;
}
//# sourceMappingURL=quality-gate.d.ts.map