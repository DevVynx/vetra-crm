/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, RequestHandler } from "express";
import z from "zod";

import { BadRequestError, type ValidationIssue } from "@/shared/http/errors";

export type ValidationProperty = "body" | "query" | "params" | "headers";

export type ValidationSchemas = Partial<Record<ValidationProperty, z.ZodTypeAny>>;

type InferProperty<
  S extends ValidationSchemas,
  P extends ValidationProperty,
  Fallback,
> = P extends keyof S ? (S[P] extends z.ZodTypeAny ? z.output<S[P]> : Fallback) : Fallback;

// Untyped on purpose: Express makes every handler of a route share one Request type, so a
// ParsedQs-typed validator would reject a controller whose query is the parsed schema output.
export type ValidationMiddleware<S extends ValidationSchemas> = RequestHandler<
  any,
  any,
  any,
  any
> & {
  readonly __schemas?: S;
};

type SchemasOf<M extends ValidationMiddleware<any>> =
  M extends ValidationMiddleware<infer S> ? S : never;

export type ValidatedRequest<M extends ValidationMiddleware<any>, ResBody = unknown> = Request<
  InferProperty<SchemasOf<M>, "params", Request["params"]>,
  ResBody,
  InferProperty<SchemasOf<M>, "body", unknown>,
  InferProperty<SchemasOf<M>, "query", Request["query"]>
> & {
  headers: InferProperty<SchemasOf<M>, "headers", Request["headers"]>;
};

const PARAM_KEYS = ["minimum", "maximum", "expected", "received", "inclusive", "type"] as const;

const extractParams = (issue: z.core.$ZodIssue): Record<string, unknown> | undefined => {
  const source = issue as unknown as Record<string, unknown>;
  const params: Record<string, unknown> = {};

  for (const key of PARAM_KEYS) {
    if (source[key] !== undefined) params[key] = source[key];
  }

  return Object.keys(params).length > 0 ? params : undefined;
};

// Zod's own issue.code (too_small, too_big, invalid_type, ...) is already a
// stable, language-neutral identifier — nothing to translate here, that's
// entirely the frontend's job. A custom .refine()/.superRefine() has no
// native code (Zod reports "custom"), so by convention its `message` is
// used as the stable token instead (e.g. "invalidDateRange") rather than
// human-readable prose.
const formatZodIssues = (property: ValidationProperty, error: z.ZodError): ValidationIssue[] =>
  error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : property,
    code: issue.code === "custom" ? issue.message : issue.code,
    params: extractParams(issue),
  }));

const getRequestValue = (req: Request, property: ValidationProperty) => {
  switch (property) {
    case "body":
      return req.body;

    case "query":
      return req.query;

    case "params":
      return req.params;

    case "headers":
      return Object.fromEntries(
        Object.entries(req.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(", ") : (value ?? ""),
        ])
      );
  }
};

const setRequestValue = (req: Request, property: ValidationProperty, value: unknown) => {
  switch (property) {
    case "body":
      req.body = value;
      return;

    case "params":
      req.params = value as Request["params"];
      return;

    case "headers":
      Object.assign(req.headers, value);
      return;

    case "query":
      Object.defineProperty(req, "query", {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      });

      return;
  }
};

export const validation = <S extends ValidationSchemas>(schemas: S): ValidationMiddleware<S> => {
  const middleware: ValidationMiddleware<S> = (req, res, next) => {
    const issues: ValidationIssue[] = [];
    const parsedValues: Partial<Record<ValidationProperty, unknown>> = {};

    for (const [property, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const key = property as ValidationProperty;
      const value = getRequestValue(req, key);

      const result = schema.safeParse(value);

      if (!result.success) {
        issues.push(...formatZodIssues(key, result.error));
        continue;
      }

      parsedValues[key] = result.data;
    }

    if (issues.length > 0) {
      throw new BadRequestError("Validation failed", issues);
    }

    for (const [property, value] of Object.entries(parsedValues)) {
      setRequestValue(req, property as ValidationProperty, value);
    }

    next();
  };

  return middleware;
};
