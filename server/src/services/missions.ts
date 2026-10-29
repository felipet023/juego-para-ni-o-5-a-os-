import { z } from 'zod';
import type { Lesson, Mission, QueryResult, QuerySpec } from '../content/types.js';
import { TOY_COLORS, TOY_TYPES } from '../content/datasets.js';
import { evaluateQuery, matchingLeftIds, queriesEquivalent } from '../engine/queryEngine.js';
import { badRequest } from '../lib/errors.js';
import {
  deleteToy,
  ensureLabSeeded,
  findToyByName,
  insertToy,
  updateToy,
  type LabToy,
} from './lab.js';

export const querySpecSchema = z
  .object({
    select: z.array(z.string().min(1).max(80)).min(1).max(8),
    from: z.string().min(1).max(40),
    where: z
      .object({
        column: z.string().min(1).max(80),
        op: z.enum(['=', '!=', '>', '<', '>=', '<=', 'LIKE']),
        value: z.string().min(1).max(80),
      })
      .strict()
      .optional(),
    orderBy: z
      .object({
        column: z.string().min(1).max(80),
        dir: z.enum(['ASC', 'DESC']),
      })
      .strict()
      .optional(),
    limit: z.number().int().min(1).max(50).optional(),
    join: z
      .object({
        table: z.string().min(1).max(40),
        leftColumn: z.string().min(1).max(80),
        rightColumn: z.string().min(1).max(80),
      })
      .strict()
      .optional(),
  })
  .strict();

const choiceAnswer = z.object({ optionId: z.string().min(1).max(40) }).strict();
const cellAnswer = z.object({ row: z.number().int().min(0).max(100), column: z.string().min(1).max(40) }).strict();
const queryAnswer = z.object({ query: querySpecSchema }).strict();
const joinAnswer = z.object({ ids: z.array(z.number().int().positive()).max(50) }).strict();

const toyType = z.string().refine((value) => TOY_TYPES.includes(value), 'Ese tipo no existe.');
const toyColor = z.string().refine((value) => TOY_COLORS.includes(value), 'Ese color no existe.');

const labInsertAnswer = z
  .object({
    nombre: z.string().trim().min(1).max(40),
    tipo: toyType,
    color: toyColor,
    precio: z.number().min(0).max(999),
  })
  .strict();

const labUpdateAnswer = z
  .object({
    targetName: z.string().trim().min(1).max(40),
    field: z.enum(['color', 'precio']),
    value: z.union([z.string().trim().max(20), z.number().min(0).max(999)]),
  })
  .strict();

const labDeleteAnswer = z.object({ targetName: z.string().trim().min(1).max(40) }).strict();

export interface MissionOutcome {
  correct: boolean;
  feedback: string;
  sql?: string;
  result?: QueryResult;
  lab?: LabToy[];
  matchedIds?: number[];
  unmatchedIds?: number[];
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

/**
 * Evalúa una respuesta contra la misión. Es la única autoridad: el cliente
 * nunca decide si acertó, ni cuántas estrellas gana.
 */
export async function evaluateMission(params: {
  lesson: Lesson;
  mission: Mission;
  answer: unknown;
  userId: number;
}): Promise<MissionOutcome> {
  const { lesson, mission, answer, userId } = params;

  switch (mission.kind) {
    case 'choice': {
      const parsed = choiceAnswer.parse(answer);
      const correct = parsed.optionId === mission.correctId;
      return {
        correct,
        feedback: correct ? mission.explanation : lesson.errorFeedback,
      };
    }

    case 'pick-cell': {
      const parsed = cellAnswer.parse(answer);
      const correct =
        parsed.row === mission.target.row && parsed.column === mission.target.column;
      return {
        correct,
        feedback: correct ? mission.explanation : lesson.errorFeedback,
      };
    }

    case 'build-query': {
      const parsed = queryAnswer.parse(answer);
      const query = parsed.query as QuerySpec;

      let result: QueryResult | undefined;
      try {
        result = evaluateQuery(query);
      } catch (error) {
        return {
          correct: false,
          feedback:
            error instanceof Error
              ? `Esa consulta no funciona todavía: ${error.message}`
              : lesson.errorFeedback,
        };
      }

      const correct = queriesEquivalent(query, mission.expected);
      return {
        correct,
        feedback: correct ? mission.explanation : lesson.errorFeedback,
        result,
        sql: result.sql,
      };
    }

    case 'join-match': {
      const parsed = joinAnswer.parse(answer);
      const { matched, unmatched } = matchingLeftIds(
        mission.leftTable,
        mission.rightTable,
        mission.leftKey,
        mission.rightKey,
      );
      const expected = new Set(matched);
      const given = new Set(parsed.ids);
      const correct = expected.size === given.size && [...expected].every((id) => given.has(id));
      return {
        correct,
        feedback: correct ? mission.explanation : lesson.errorFeedback,
        matchedIds: matched,
        unmatchedIds: unmatched,
      };
    }

    case 'lab-action': {
      if (mission.action === 'insert') {
        const parsed = labInsertAnswer.parse(answer);
        const expected = mission.expected;
        const correct =
          normalizeText(parsed.nombre) === normalizeText(expected.nombre) &&
          parsed.tipo === expected.tipo &&
          parsed.color === expected.color &&
          Number(parsed.precio) === expected.precio;

        if (!correct) return { correct: false, feedback: lesson.errorFeedback };

        await ensureLabSeeded(userId);
        const existing = await findToyByName(userId, parsed.nombre);
        if (!existing) {
          await insertToy(userId, {
            nombre: parsed.nombre,
            tipo: parsed.tipo,
            color: parsed.color,
            precio: parsed.precio,
          });
        }
        return {
          correct: true,
          feedback: mission.explanation,
          lab: await ensureLabSeeded(userId),
        };
      }

      if (mission.action === 'update') {
        const parsed = labUpdateAnswer.parse(answer);
        const correct =
          normalizeText(parsed.targetName) === normalizeText(mission.targetName) &&
          parsed.field === mission.field &&
          normalizeText(String(parsed.value)) === normalizeText(String(mission.expectedValue));

        if (!correct) return { correct: false, feedback: lesson.errorFeedback };

        await ensureLabSeeded(userId);
        const toy = await findToyByName(userId, mission.targetName);
        if (!toy) {
          return {
            correct: false,
            feedback: 'Ese juguete ya no está en el laboratorio. Reinicia el laboratorio e inténtalo de nuevo.',
            lab: await ensureLabSeeded(userId),
          };
        }
        await updateToy(userId, toy.id, mission.field, mission.expectedValue);
        return { correct: true, feedback: mission.explanation, lab: await ensureLabSeeded(userId) };
      }

      const parsed = labDeleteAnswer.parse(answer);
      const correct = normalizeText(parsed.targetName) === normalizeText(mission.targetName);
      if (!correct) return { correct: false, feedback: lesson.errorFeedback };

      await ensureLabSeeded(userId);
      const toy = await findToyByName(userId, mission.targetName);
      if (!toy) {
        return {
          correct: false,
          feedback: 'Ese juguete ya no está. Reinicia el laboratorio para volver a practicar.',
          lab: await ensureLabSeeded(userId),
        };
      }
      await deleteToy(userId, toy.id);
      return { correct: true, feedback: mission.explanation, lab: await ensureLabSeeded(userId) };
    }

    default: {
      throw badRequest('Esta misión no existe.');
    }
  }
}
