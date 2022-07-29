import { expandPhrases } from 'src/expandPhrases';
import Formatter from 'src/formatter/Formatter';
import Tokenizer from 'src/lexer/Tokenizer';
import { EOF_TOKEN, isToken, type Token, TokenType } from 'src/lexer/token';
import { keywords } from './mariadb.keywords';
import { functions } from './mariadb.functions';

const reservedCommands = expandPhrases([
  // queries
  'WITH [RECURSIVE]',
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'LIMIT',
  'OFFSET',

  // https://mariadb.com/docs/reference/mdb/sql-statements/
  'ALTER DATABASE',
  'ALTER DATABASE COMMENT',
  'ALTER EVENT',
  'ALTER FUNCTION',
  'ALTER PROCEDURE',
  'ALTER SCHEMA',
  'ALTER SCHEMA COMMENT',
  'ALTER SEQUENCE',
  'ALTER SERVER',
  'ALTER TABLE',
  'ALTER USER',
  'ALTER VIEW',
  'ANALYZE',
  'ANALYZE TABLE',
  'BACKUP LOCK',
  'BACKUP STAGE',
  'BACKUP UNLOCK',
  'BEGIN',
  'BINLOG',
  'CACHE INDEX',
  'CALL',
  'CHANGE MASTER TO',
  'CHECK TABLE',
  'CHECK VIEW',
  'CHECKSUM TABLE',
  'COMMIT',
  'CREATE AGGREGATE FUNCTION',
  'CREATE DATABASE',
  'CREATE EVENT',
  'CREATE FUNCTION',
  'CREATE INDEX',
  'CREATE PROCEDURE',
  'CREATE ROLE',
  'CREATE SEQUENCE',
  'CREATE SERVER',
  'CREATE SPATIAL INDEX',
  'CREATE TABLE',
  'CREATE TRIGGER',
  'CREATE UNIQUE INDEX',
  'CREATE USER',
  'CREATE VIEW',
  'DEALLOCATE PREPARE',
  'DELETE',
  'DELETE FROM',
  'DESCRIBE',
  'DO',
  'DROP DATABASE',
  'DROP EVENT',
  'DROP FUNCTION',
  'DROP INDEX',
  'DROP PREPARE',
  'DROP PROCEDURE',
  'DROP ROLE',
  'DROP SEQUENCE',
  'DROP SERVER',
  'DROP TABLE',
  'DROP TRIGGER',
  'DROP USER',
  'DROP VIEW',
  'EXECUTE',
  'EXPLAIN',
  'FLUSH',
  'GET DIAGNOSTICS',
  'GET DIAGNOSTICS CONDITION',
  'GRANT',
  'HANDLER',
  'HELP',
  'INSERT',
  'INSTALL PLUGIN',
  'INSTALL SONAME',
  'KILL',
  'LOAD DATA INFILE',
  'LOAD INDEX INTO CACHE',
  'LOAD XML INFILE',
  'LOCK TABLE',
  'OPTIMIZE TABLE',
  'PREPARE',
  'PURGE BINARY LOGS',
  'PURGE MASTER LOGS',
  'RELEASE SAVEPOINT',
  'RENAME TABLE',
  'RENAME USER',
  'REPAIR TABLE',
  'REPAIR VIEW',
  'REPLACE',
  'RESET MASTER',
  'RESET QUERY CACHE',
  'RESET REPLICA',
  'RESET SLAVE',
  'RESIGNAL',
  'RETURNING',
  'REVOKE',
  'ROLLBACK',
  'SAVEPOINT',
  'SELECT',
  'SET',
  'SET CHARACTER SET',
  'SET DEFAULT ROLE',
  'SET GLOBAL TRANSACTION',
  'SET NAMES',
  'SET PASSWORD',
  'SET ROLE',
  'SET STATEMENT',
  'SET TRANSACTION',
  'SHOW',
  'SHOW ALL REPLICAS STATUS',
  'SHOW ALL SLAVES STATUS',
  'SHOW AUTHORS',
  'SHOW BINARY LOGS',
  'SHOW BINLOG EVENTS',
  'SHOW BINLOG STATUS',
  'SHOW CHARACTER SET',
  'SHOW CLIENT_STATISTICS',
  'SHOW COLLATION',
  'SHOW COLUMNS',
  'SHOW CONTRIBUTORS',
  'SHOW CREATE DATABASE',
  'SHOW CREATE EVENT',
  'SHOW CREATE FUNCTION',
  'SHOW CREATE PACKAGE',
  'SHOW CREATE PACKAGE BODY',
  'SHOW CREATE PROCEDURE',
  'SHOW CREATE SEQUENCE',
  'SHOW CREATE TABLE',
  'SHOW CREATE TRIGGER',
  'SHOW CREATE USER',
  'SHOW CREATE VIEW',
  'SHOW DATABASES',
  'SHOW ENGINE',
  'SHOW ENGINE INNODB STATUS',
  'SHOW ENGINES',
  'SHOW ERRORS',
  'SHOW EVENTS',
  'SHOW EXPLAIN',
  'SHOW FUNCTION CODE',
  'SHOW FUNCTION STATUS',
  'SHOW GRANTS',
  'SHOW INDEX',
  'SHOW INDEXES',
  'SHOW INDEX_STATISTICS',
  'SHOW KEYS',
  'SHOW LOCALES',
  'SHOW MASTER LOGS',
  'SHOW MASTER STATUS',
  'SHOW OPEN TABLES',
  'SHOW PACKAGE BODY CODE',
  'SHOW PACKAGE BODY STATUS',
  'SHOW PACKAGE STATUS',
  'SHOW PLUGINS',
  'SHOW PLUGINS SONAME',
  'SHOW PRIVILEGES',
  'SHOW PROCEDURE CODE',
  'SHOW PROCEDURE STATUS',
  'SHOW PROCESSLIST',
  'SHOW PROFILE',
  'SHOW PROFILES',
  'SHOW QUERY_RESPONSE_TIME',
  'SHOW RELAYLOG EVENTS',
  'SHOW REPLICA',
  'SHOW REPLICA HOSTS',
  'SHOW REPLICA STATUS',
  'SHOW SCHEMAS',
  'SHOW SLAVE',
  'SHOW SLAVE HOSTS',
  'SHOW SLAVE STATUS',
  'SHOW STATUS',
  'SHOW STORAGE ENGINES',
  'SHOW TABLE STATUS',
  'SHOW TABLES',
  'SHOW TRIGGERS',
  'SHOW USER_STATISTICS',
  'SHOW VARIABLES',
  'SHOW WARNINGS',
  'SHOW WSREP_MEMBERSHIP',
  'SHOW WSREP_STATUS',
  'SHUTDOWN',
  'SIGNAL',
  'START ALL REPLICAS',
  'START ALL SLAVES',
  'START REPLICA',
  'START SLAVE',
  'START TRANSACTION',
  'STOP ALL REPLICAS',
  'STOP ALL SLAVES',
  'STOP REPLICA',
  'STOP SLAVE',
  'TRUNCATE',
  'TRUNCATE TABLE',
  'UNINSTALL PLUGIN',
  'UNINSTALL SONAME',
  'UNLOCK TABLE',
  'UPDATE',
  'USE',
  'XA BEGIN',
  'XA COMMIT',
  'XA END',
  'XA PREPARE',
  'XA RECOVER',
  'XA ROLLBACK',
  'XA START',
  // other
  'ADD',
  'ALTER COLUMN',
  'INSERT INTO',
  'INSERT',
  'VALUES',
]);

const reservedSetOperations = expandPhrases([
  'UNION [ALL | DISTINCT]',
  'EXCEPT [ALL | DISTINCT]',
  'INTERSECT [ALL | DISTINCT]',
  'MINUS [ALL | DISTINCT]',
]);

const reservedJoins = expandPhrases([
  'JOIN',
  '{LEFT | RIGHT} [OUTER] JOIN',
  '{INNER | CROSS} JOIN',
  'NATURAL JOIN',
  'NATURAL {LEFT | RIGHT} [OUTER] JOIN',
  // non-standard joins
  'STRAIGHT_JOIN',
]);

// For reference: https://mariadb.com/kb/en/sql-statements-structure/
export default class MariaDbFormatter extends Formatter {
  static operators = [':=', '<<', '>>', '<=>', '&&', '||'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands,
      reservedSetOperations,
      reservedJoins,
      reservedDependentClauses: ['WHEN', 'ELSE', 'ELSEIF', 'ELSIF'],
      reservedLogicalOperators: ['AND', 'OR', 'XOR'],
      reservedKeywords: keywords,
      reservedFunctionNames: functions,
      // TODO: support _ char set prefixes such as _utf8, _latin1, _binary, _utf8mb4, etc.
      stringTypes: [
        { quote: "''", prefixes: ['B', 'X'] },
        { quote: '""', prefixes: ['B', 'X'] },
      ],
      identTypes: ['``'],
      identChars: { first: '$', rest: '$', allowFirstCharNumber: true },
      variableTypes: [
        { regex: '@[A-Za-z0-9_.$]+' },
        { quote: '""', prefixes: ['@'], requirePrefix: true },
        { quote: "''", prefixes: ['@'], requirePrefix: true },
        { quote: '``', prefixes: ['@'], requirePrefix: true },
      ],
      positionalParams: true,
      lineCommentTypes: ['--', '#'],
      operators: MariaDbFormatter.operators,
      postProcess,
    });
  }
}

function postProcess(tokens: Token[]) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.SET(token) && nextToken.value === '(') {
      // This is SET datatype, not SET statement
      return { ...token, type: TokenType.RESERVED_FUNCTION_NAME };
    }
    return token;
  });
}
