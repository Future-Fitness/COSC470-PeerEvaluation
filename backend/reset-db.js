const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function resetDatabase() {
  try {
    console.log('Connecting to Aiven MySQL...');

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to Aiven MySQL');
    console.log('Dropping existing tables...');

    // Drop tables in reverse order of dependencies
    const dropTables = [
      'Criteria_Description',
      'Criterion',
      'Review',
      'Rubric',
      'User_Courses',
      'Group_Members',
      'Submission',
      'CourseGroup',
      'Assignment',
      'Course',
      'User'
    ];

    for (const table of dropTables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`  ✓ Dropped ${table}`);
      } catch (err) {
        // Ignore errors
      }
    }

    console.log('\n✅ All tables dropped');
    console.log('Running schema...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'schema-fixed.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove all comments first (lines starting with --)
    schema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let count = 0;
    for (const statement of statements) {
      if (statement) {
        try {
          await connection.query(statement);
          count++;
        } catch (err) {
          console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
          throw err;
        }
      }
    }

    console.log(`✅ Executed ${count} SQL statements successfully!`);

    // Verify tables created
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n✅ Created ${tables.length} tables:`);
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });

    // Show test users
    const [users] = await connection.query('SELECT id, name, email, is_teacher FROM `User` LIMIT 5');
    console.log('\n✅ Test accounts:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.is_teacher ? 'Teacher' : 'Student'}`);
    });

    await connection.end();
    console.log('\n✅ Database reset complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    process.exit(1);
  }
}

resetDatabase();
