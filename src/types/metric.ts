// src/types/metric.ts
import { ObjectId } from "mongodb";

export interface IMetric {
  _id?: ObjectId;
  projectId: ObjectId; // Foreign key mapping this metric to a specific application
  routePath: string; // The URL endpoint that was triggered (e.g., "/api/checkout")
  executionTimeMs: number; // Total duration of the serverless function execution
  memoryUsedMb: number; // Amount of cloud RAM consumed
  computeCostUSD: number; // Calculated cost based on serverless run parameters
  isError: boolean; // Flag checking if the code execution crashed
  errorMessage?: string; // Stored log message if an execution anomaly occurred
  timestamp: Date; // Temporal coordinate of the event
}
