import { z } from 'zod';
import { Json, Toml } from '../schema';
import { readFile } from '../fs';

const PythonConstraintObject = z
  .object({
    requires: z
      .object({
        python_version: z.string().nullable().catch(null),
        python_full_version: z.string().nullable().catch(null),
      })
      .catch({
        python_version: null,
        python_full_version: null,
      }),
    packages: z
      .object({
        pipenv: z.string().nullable(),
      })
      .catch({ pipenv: null }),
    'dev-packages': z
      .object({
        pipenv: z.string().nullable(),
      })
      .catch({ pipenv: null }),
  })
  .transform(
    ({
      requires: {
        python_version: pythonVersion,
        python_full_version: pythonFullVersion,
      },
      packages: { pipenv: pipenvDefault },
      'dev-packages': { pipenv: pipenvDevelop },
    }) => ({
      pythonVersion,
      pythonFullVersion,
      pipenvDefault,
      pipenvDevelop,
    }),
  )
  .catch({
    pythonVersion: null,
    pythonFullVersion: null,
    pipenvDefault: null,
    pipenvDevelop: null,
  });

const PythonConstraint = z
  .object({
    pythonVersion: z.string().nullable(),
    pythonFullVersion: z.string().nullable(),
  })
  .transform(({ pythonVersion, pythonFullVersion }) => {
    // Exact python version has been included since 2022.10.9. It is more specific than the major.minor version
    // https://github.com/pypa/pipenv/blob/main/CHANGELOG.md#2022109-2022-10-09
    if (pythonFullVersion) {
      return `== ${pythonFullVersion}`;
    }

    // Before 2022.10.9, only the major.minor version was included
    if (pythonVersion) {
      return `== ${pythonVersion}.*`;
    }

    return null;
  });

const PipfilePythonVersion = Toml.pipe(PythonConstraintObject)
  .pipe(PythonConstraint)
  .catch(null);

const PipenvConstraintObject = z
  .object({
    pipenv: z.object({
      version: z.string(),
    }),
  })
  .transform(({ pipenv: { version } }) => version)
  .nullable()
  .catch(null);

const PipfileLock = Json.pipe(
  z.object({
    _meta: PythonConstraintObject,
    default: PipenvConstraintObject,
    develop: PipenvConstraintObject,
  }),
)
  .transform(
    ({
      _meta: { pythonVersion, pythonFullVersion },
      default: pipenvDefault,
      develop: pipenvDevelop,
    }) => {
      return { pythonVersion, pythonFullVersion, pipenvDefault, pipenvDevelop };
    },
  )
  .catch({
    pythonVersion: null,
    pythonFullVersion: null,
    pipenvDefault: null,
    pipenvDevelop: null,
  });

const PipenvConstraint = z
  .object({
    pythonVersion: z.string().nullable(),
    pythonFullVersion: z.string().nullable(),
    pipenvDefault: z.string().nullable(),
    pipenvDevelop: z.string().nullable(),
  })
  .transform(
    ({ pythonVersion, pythonFullVersion, pipenvDefault, pipenvDevelop }) => {
      if (pipenvDefault) {
        return pipenvDefault;
      }

      if (pipenvDevelop) {
        return pipenvDevelop;
      }

      // Exact python version has been included since 2022.10.9
      if (pythonFullVersion) {
        // python_full_version was added after 3.6 was already deprecated, so it should be impossible to have a 3.6 version
        // https://github.com/pypa/pipenv/blob/main/CHANGELOG.md#2022109-2022-10-09
        /* istanbul ignore else */
        if (pythonFullVersion.startsWith('3.7.')) {
          // Python 3.7 support was dropped in pipenv 2023.10.20
          // https://github.com/pypa/pipenv/blob/main/CHANGELOG.md#20231020-2023-10-20
          return '< 2023.10.20';
        }
      }

      // Before 2022.10.9, only the major.minor version was included
      /* istanbul ignore else */
      if (pythonVersion) {
        if (pythonVersion === '3.6') {
          // Python 3.6 was deprecated in 2022.4.20
          // https://github.com/pypa/pipenv/blob/main/CHANGELOG.md#2022420-2022-04-20
          return '< 2022.4.20';
        }
        if (pythonVersion === '3.7') {
          // Python 3.7 was deprecated in 2023.10.20 but we shouldn't reach here unless we are < 2022.10.9
          // https://github.com/pypa/pipenv/blob/main/CHANGELOG.md#20231020-2023-10-20
          return '< 2022.10.9';
        }
      }

      return null;
    },
  )
  .nullable()
  .catch(null);

const PipfilePipenvConstraint = Toml.pipe(PythonConstraintObject)
  .pipe(PipenvConstraint)
  .catch(null);

export async function getPythonConstraint(
  path: string,
): Promise<string | undefined> {
  const pipfileContent = await readFile(path, 'Pipfile');
  const pipfileVersion = PipfilePythonVersion.parse(pipfileContent);
  if (pipfileVersion) {
    return pipfileVersion;
  }

  const lockfileContent = await readFile(path, 'Pipfile.lock');
  const lockfileVersion =
    PipfileLock.pipe(PythonConstraint).parse(lockfileContent);
  if (lockfileVersion) {
    return lockfileVersion;
  }

  const pythonVersion = await readFile(path, '.python-version');
  if (pythonVersion) {
    if (pythonVersion.split('.').length >= 3) {
      return `== ${pythonVersion}`;
    } else {
      return `== ${pythonVersion}.*`;
    }
  }

  return undefined;
}

export async function getPipenvConstraint(path: string): Promise<string> {
  const pipfileContent = await readFile(path, 'Pipfile');
  const pipenvConstraint = PipfilePipenvConstraint.parse(pipfileContent);
  if (pipenvConstraint) {
    return pipenvConstraint;
  }

  const lockfileContent = await readFile(path, 'Pipfile.lock');
  const pipenvLockfileConstraint =
    PipfileLock.pipe(PipenvConstraint).parse(lockfileContent);
  if (pipenvLockfileConstraint) {
    return pipenvLockfileConstraint;
  }

  return '';
}
