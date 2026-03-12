import { randomUUID } from "node:crypto"
import type { OptimizationReport } from "@shared/models/optimization-report.ts"
import { getOptimizationReports } from "../database.ts"

export const resolvers = {

  Query: {

    optimizationReports: () => {
      return getOptimizationReports().find()
    },

    optimizationReport: (_: unknown, { id }: { id: string }) => {
      return getOptimizationReports().findOne({ id })
    }

  },

  Mutation: {

    createOptimizationReport: (
      _: unknown,
      { input }: { input: Omit<OptimizationReport, "id"> }
    ) => {

      const report: OptimizationReport = {
        id: randomUUID(),
        ...input
      }

      return getOptimizationReports().insert(report)
    },

    deleteOptimizationReport: (_: unknown, { id }: { id: string }) => {

      const col = getOptimizationReports()
      const report = col.findOne({ id })

      if (!report) return false

      col.remove(report)

      return true
    }

  }

}