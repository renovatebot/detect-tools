import { JsonValue } from 'type-fest';
import { z } from 'zod';
import { getStaticTOMLValue, parseTOML } from 'toml-eslint-parser';

export const Json = z.string().transform((str, ctx): JsonValue => {
  try {
    return JSON.parse(str);
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
    return z.NEVER;
  }
});

export const Toml = z.string().transform((str, ctx): unknown => {
  try {
    const ast = parseTOML(str);
    const res = getStaticTOMLValue(ast);
    return res;
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Invalid TOML' });
    return z.NEVER;
  }
});
