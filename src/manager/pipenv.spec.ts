import { codeBlock } from 'common-tags';
import * as fs from '../fs';
import * as pipenv from './pipenv';
import { mockFs } from '../test-utils';

jest.mock('../fs');

describe('pipenv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPythonConstraint', () => {
    describe('Pipfile', () => {
      it('python_full_version', async () => {
        mockFs(fs, {
          '/path/to/folder/Pipfile': codeBlock`
            [requires]
            python_full_version = "3.8.1"
          `,
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBe('== 3.8.1');
      });

      it('python_version', async () => {
        mockFs(fs, {
          '/path/to/folder/Pipfile': codeBlock`
            [requires]
            python_version = "3.8"
          `,
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBe('== 3.8.*');
      });
    });

    describe('Pipfile.lock', () => {
      it('python_full_version', async () => {
        mockFs(fs, {
          '/path/to/folder/Pipfile.lock': JSON.stringify({
            _meta: {
              requires: {
                python_full_version: '3.8.1',
              },
            },
          }),
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBe('== 3.8.1');
      });

      it('python_version', async () => {
        mockFs(fs, {
          '/path/to/folder/Pipfile.lock': JSON.stringify({
            _meta: {
              requires: {
                python_version: '3.8',
              },
            },
          }),
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBe('== 3.8.*');
      });
    });

    describe('.python-version', () => {
      it('major.minor.patch', async () => {
        mockFs(fs, {
          '/path/to/folder/.python-version': '3.8.1',
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBe('== 3.8.1');
      });

      it('major.minor', async () => {
        mockFs(fs, {
          '/path/to/folder/.python-version': '3.8',
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBe('== 3.8.*');
      });
    });

    describe('no python version', () => {
      it('returns undefined for empty files', async () => {
        mockFs(fs, {
          '/path/to/folder/Pipfile': '[requires]\n',
          '/path/to/folder/Pipfile.lock': '{}',
          '/path/to/folder/.python-version': '',
        });
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBeUndefined();
      });

      it('returns undefined for empty folder', async () => {
        mockFs(fs, {});
        const res = await pipenv.getPythonConstraint('/path/to/folder');
        expect(res).toBeUndefined();
      });
    });
  });

  describe('getPipenvConstraint', () => {
    it('returns the pipenv default constraint', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile.lock': JSON.stringify({
          default: {
            pipenv: {
              version: '2022.10.9',
            },
          },
        }),
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('2022.10.9');
    });

    it('returns the pipenv develop constraint', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile.lock': JSON.stringify({
          develop: {
            pipenv: {
              version: '2022.10.9',
            },
          },
        }),
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('2022.10.9');
    });

    it('returns constraint for python_full_version 3.7', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile.lock': JSON.stringify({
          _meta: {
            requires: {
              python_full_version: '3.7.9',
            },
          },
        }),
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('< 2023.10.20');
    });

    it('returns constraint for python_version 3.6', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile.lock': JSON.stringify({
          _meta: {
            requires: {
              python_version: '3.6',
            },
          },
        }),
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('< 2022.4.20');
    });

    it('returns constraint for python_version 3.7', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile.lock': JSON.stringify({
          _meta: {
            requires: {
              python_version: '3.7',
            },
          },
        }),
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('< 2022.10.9');
    });

    it('returns empty string for unknown python version', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile.lock': JSON.stringify({
          _meta: {
            requires: {
              python_version: '3.8',
            },
          },
        }),
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('');
    });

    it('gets pipenv constraint from Pipenv `packages` section', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile': codeBlock`
          [packages]
          pipenv = "==2020.8.13"
        `,
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('==2020.8.13');
    });

    it('gets pipenv constraint from Pipenv `dev-packages` section', async () => {
      mockFs(fs, {
        '/path/to/folder/Pipfile': codeBlock`
          [dev-packages]
          pipenv = "==2020.8.13"
        `,
      });
      const res = await pipenv.getPipenvConstraint('/path/to/folder');
      expect(res).toBe('==2020.8.13');
    });
  });
});
