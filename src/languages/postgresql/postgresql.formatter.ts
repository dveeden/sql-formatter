import { expandPhrases } from 'src/expandPhrases';
import Formatter from 'src/formatter/Formatter';
import Tokenizer from 'src/lexer/Tokenizer';
import { functions } from './postgresql.functions';
import { keywords } from './postgresql.keywords';

const reservedCommands = expandPhrases([
  // queries
  'WITH [RECURSIVE]',
  'SELECT [ALL | DISTINCT]',
  'FROM',
  'WHERE',
  'GROUP BY [ALL | DISTINCT]',
  'HAVING',
  'WINDOW',
  'PARTITION BY',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
  'FETCH {FIRST | NEXT}',
  // Data manipulation
  // - insert:
  'INSERT INTO',
  'VALUES',
  // - update:
  'UPDATE [ONLY]',
  'SET',
  'WHERE CURRENT OF',
  // - delete:
  'DELETE FROM [ONLY]',
  // - truncate:
  'TRUNCATE [TABLE] [ONLY]',
  // Data definition
  'CREATE [OR REPLACE] [TEMP | TEMPORARY] [RECURSIVE] VIEW',
  'CREATE MATERIALIZED VIEW [IF NOT EXISTS]',
  'CREATE [GLOBAL | LOCAL] [TEMPORARY | TEMP | UNLOGGED] TABLE [IF NOT EXISTS]',
  'DROP TABLE [IF EXISTS]',
  // - alter table:
  'ALTER TABLE [IF EXISTS] [ONLY]',
  'ALTER TABLE ALL IN TABLESPACE',
  'RENAME [COLUMN]',
  'RENAME TO',
  'ADD [COLUMN] [IF NOT EXISTS]',
  'DROP [COLUMN] [IF EXISTS]',
  'ALTER [COLUMN]',
  '[SET DATA] TYPE', // for alter column
  '{SET | DROP} DEFAULT', // for alter column
  '{SET | DROP} NOT NULL', // for alter column

  // https://www.postgresql.org/docs/14/sql-commands.html
  'ABORT',
  'ALTER AGGREGATE',
  'ALTER COLLATION',
  'ALTER CONVERSION',
  'ALTER DATABASE',
  'ALTER DEFAULT PRIVILEGES',
  'ALTER DOMAIN',
  'ALTER EVENT TRIGGER',
  'ALTER EXTENSION',
  'ALTER FOREIGN DATA WRAPPER',
  'ALTER FOREIGN TABLE',
  'ALTER FUNCTION',
  'ALTER GROUP',
  'ALTER INDEX',
  'ALTER LANGUAGE',
  'ALTER LARGE OBJECT',
  'ALTER MATERIALIZED VIEW',
  'ALTER OPERATOR',
  'ALTER OPERATOR CLASS',
  'ALTER OPERATOR FAMILY',
  'ALTER POLICY',
  'ALTER PROCEDURE',
  'ALTER PUBLICATION',
  'ALTER ROLE',
  'ALTER ROUTINE',
  'ALTER RULE',
  'ALTER SCHEMA',
  'ALTER SEQUENCE',
  'ALTER SERVER',
  'ALTER STATISTICS',
  'ALTER SUBSCRIPTION',
  'ALTER SYSTEM',
  'ALTER TABLESPACE',
  'ALTER TEXT SEARCH CONFIGURATION',
  'ALTER TEXT SEARCH DICTIONARY',
  'ALTER TEXT SEARCH PARSER',
  'ALTER TEXT SEARCH TEMPLATE',
  'ALTER TRIGGER',
  'ALTER TYPE',
  'ALTER USER',
  'ALTER USER MAPPING',
  'ALTER VIEW',
  'ANALYZE',
  'BEGIN',
  'CALL',
  'CHECKPOINT',
  'CLOSE',
  'CLUSTER',
  'COMMENT',
  'COMMIT',
  'COMMIT PREPARED',
  'COPY',
  'CREATE ACCESS METHOD',
  'CREATE AGGREGATE',
  'CREATE CAST',
  'CREATE COLLATION',
  'CREATE CONVERSION',
  'CREATE DATABASE',
  'CREATE DOMAIN',
  'CREATE EVENT TRIGGER',
  'CREATE EXTENSION',
  'CREATE FOREIGN DATA WRAPPER',
  'CREATE FOREIGN TABLE',
  'CREATE FUNCTION',
  'CREATE GROUP',
  'CREATE INDEX',
  'CREATE LANGUAGE',
  'CREATE OPERATOR',
  'CREATE OPERATOR CLASS',
  'CREATE OPERATOR FAMILY',
  'CREATE POLICY',
  'CREATE PROCEDURE',
  'CREATE PUBLICATION',
  'CREATE ROLE',
  'CREATE RULE',
  'CREATE SCHEMA',
  'CREATE SEQUENCE',
  'CREATE SERVER',
  'CREATE STATISTICS',
  'CREATE SUBSCRIPTION',
  'CREATE TABLESPACE',
  'CREATE TEXT SEARCH CONFIGURATION',
  'CREATE TEXT SEARCH DICTIONARY',
  'CREATE TEXT SEARCH PARSER',
  'CREATE TEXT SEARCH TEMPLATE',
  'CREATE TRANSFORM',
  'CREATE TRIGGER',
  'CREATE TYPE',
  'CREATE USER',
  'CREATE USER MAPPING',
  'DEALLOCATE',
  'DECLARE',
  'DISCARD',
  'DO',
  'DROP ACCESS METHOD',
  'DROP AGGREGATE',
  'DROP CAST',
  'DROP COLLATION',
  'DROP CONVERSION',
  'DROP DATABASE',
  'DROP DOMAIN',
  'DROP EVENT TRIGGER',
  'DROP EXTENSION',
  'DROP FOREIGN DATA WRAPPER',
  'DROP FOREIGN TABLE',
  'DROP FUNCTION',
  'DROP GROUP',
  'DROP INDEX',
  'DROP LANGUAGE',
  'DROP MATERIALIZED VIEW',
  'DROP OPERATOR',
  'DROP OPERATOR CLASS',
  'DROP OPERATOR FAMILY',
  'DROP OWNED',
  'DROP POLICY',
  'DROP PROCEDURE',
  'DROP PUBLICATION',
  'DROP ROLE',
  'DROP ROUTINE',
  'DROP RULE',
  'DROP SCHEMA',
  'DROP SEQUENCE',
  'DROP SERVER',
  'DROP STATISTICS',
  'DROP SUBSCRIPTION',
  'DROP TABLESPACE',
  'DROP TEXT SEARCH CONFIGURATION',
  'DROP TEXT SEARCH DICTIONARY',
  'DROP TEXT SEARCH PARSER',
  'DROP TEXT SEARCH TEMPLATE',
  'DROP TRANSFORM',
  'DROP TRIGGER',
  'DROP TYPE',
  'DROP USER',
  'DROP USER MAPPING',
  'DROP VIEW',
  'EXECUTE',
  'EXPLAIN',
  'FETCH',
  'GRANT',
  'IMPORT FOREIGN SCHEMA',
  'LISTEN',
  'LOAD',
  'LOCK',
  'MOVE',
  'NOTIFY',
  'PREPARE',
  'PREPARE TRANSACTION',
  'REASSIGN OWNED',
  'REFRESH MATERIALIZED VIEW',
  'REINDEX',
  'RELEASE SAVEPOINT',
  'RESET',
  'RETURNING',
  'REVOKE',
  'ROLLBACK',
  'ROLLBACK PREPARED',
  'ROLLBACK TO SAVEPOINT',
  'SAVEPOINT',
  'SECURITY LABEL',
  'SELECT INTO',
  'SET CONSTRAINTS',
  'SET ROLE',
  'SET SESSION AUTHORIZATION',
  'SET TRANSACTION',
  'SHOW',
  'START TRANSACTION',
  'UNLISTEN',
  'VACUUM',
  // other
  'AFTER',
  'SET SCHEMA',
]);

const reservedSetOperations = expandPhrases([
  'UNION [ALL | DISTINCT]',
  'EXCEPT [ALL | DISTINCT]',
  'INTERSECT [ALL | DISTINCT]',
]);

const reservedJoins = expandPhrases([
  'JOIN',
  '{LEFT | RIGHT | FULL} [OUTER] JOIN',
  '{INNER | CROSS} JOIN',
  'NATURAL [INNER] JOIN',
  'NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN',
]);

const reservedPhrases = ['ON DELETE', 'ON UPDATE'];

const binaryOperators = [
  // Math Operators
  '<<',
  '>>',
  '|/',
  '||/',
  '!!',
  // String Operators
  '||',
  // Pattern Matching Operators
  '~~',
  '~~*',
  '!~~',
  '!~~*',
  // POSIX RegExp operators
  '~',
  '~*',
  '!~',
  '!~*',
  // Similarity Operators
  '<%',
  '<<%',
  '%>',
  '%>>',
  // Byte Comparison Operators
  '~>~',
  '~<~',
  '~>=~',
  '~<=~',
  // Geometric operators
  '@-@',
  '@@',
  '#',
  '##',
  '<->',
  '&&',
  '&<',
  '&>',
  '<<|',
  '&<|',
  '|>>',
  '|&>',
  '<^',
  '^>',
  '?#',
  '?-',
  '?|',
  '?-|',
  '?||',
  '@>',
  '<@',
  '~=',
  // Network Address operators
  '>>=',
  '<<=',
  // Text Search Operators
  '@@@',
  // JSON Operators
  '?',
  '@?',
  '?&',
  '->',
  '->>',
  '#>',
  '#>>',
  '#-',
  // Other Operators
  ':=',
  '::',
  '=>',
  '-|-',
];

// https://www.postgresql.org/docs/14/index.html
export default class PostgreSqlFormatter extends Formatter {
  static operators = binaryOperators;

  tokenizer() {
    return new Tokenizer({
      reservedCommands,
      reservedSetOperations,
      reservedJoins,
      reservedDependentClauses: ['WHEN', 'ELSE'],
      reservedPhrases,
      reservedKeywords: keywords,
      reservedFunctionNames: functions,
      openParens: ['(', '['],
      closeParens: [')', ']'],
      stringTypes: ['$$', { quote: "''", prefixes: ['B', 'E', 'X', 'U&'] }],
      identTypes: [{ quote: '""', prefixes: ['U&'] }],
      identChars: { rest: '$' },
      numberedParamTypes: ['$'],
      operators: PostgreSqlFormatter.operators,
    });
  }
}