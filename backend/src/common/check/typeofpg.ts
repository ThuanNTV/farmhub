// PostgreSQL Data Types trong TypeORM

// ✅ ĐÚNG - PostgreSQL supported types
export const PostgreSQLTypes = {
  // Text types
  varchar: 'varchar', // Variable character with limit
  char: 'char', // Fixed character
  text: 'text', // Variable unlimited text

  // Numeric types
  integer: 'integer', // 4-byte integer
  bigint: 'bigint', // 8-byte integer
  smallint: 'smallint', // 2-byte integer
  decimal: 'decimal', // Exact numeric
  numeric: 'numeric', // Exact numeric (same as decimal)
  real: 'real', // 4-byte floating point
  double: 'double precision', // 8-byte floating point

  // Boolean
  boolean: 'boolean', // true/false

  // Date/Time
  date: 'date', // Date only
  time: 'time', // Time only
  timestamp: 'timestamp', // Date and time
  timestamptz: 'timestamptz', // Timestamp with timezone

  // JSON
  json: 'json', // JSON data
  jsonb: 'jsonb', // Binary JSON (better performance)

  // UUID
  uuid: 'uuid', // UUID type

  // Arrays
  'varchar[]': 'varchar[]', // Array of varchar
  'integer[]': 'integer[]', // Array of integers
};

// ❌ SAI - Không hỗ trợ trong PostgreSQL
export const UnsupportedTypes = {
  nvarchar: 'nvarchar', // SQL Server only
  nchar: 'nchar', // SQL Server only
  ntext: 'ntext', // SQL Server only
  datetime: 'datetime', // SQL Server/MySQL, dùng timestamp trong PostgreSQL
  datetime2: 'datetime2', // SQL Server only
  money: 'money', // Dùng decimal thay thế
};
