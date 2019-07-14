
function DatabaseError(statement, message) {
    this.statement = statement;
    this.message = message;
}


const database = {
    tables: {},
    createTable(comando) {
        const regex = /create table ([a-z]+) \((.+)\)/
        const parseStatement = comando.match(regex)
        const tableName = parseStatement[1]

        this.tables[tableName] = {
            columns: {},
            data: []
        }

        let columns = parseStatement[2]
        columns = columns.split(", ")

        for (let column of columns) {
            column = column.split(" ")
            const type = column[1]
            const name = column[0]
            this.tables[tableName].columns[name] = type
        }
    },
    insert(comando) {
        const regex = /insert into ([a-z]+) \((.+)\) values \((.+)\)/;
        const parseStatement = comando.match(regex);
        let [, tableName, columns, values] = parseStatement
        let row = {};
        columns = columns.split(", ");
        values = values.split(", ");

        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            let value = values[i];
            row[column] = value
        }
        this.tables[tableName].data.push(row)

    },
    select(comando) {
        const regex = /select (.+) from ([a-z]+)(?: where (.+))?/;
        const parseStatement = comando.match(regex);
        let [, columns, tableName, whereClause] = parseStatement;
        columns = columns.split(", ")
        let rows = this.tables[tableName].data;

        if (whereClause) {
            const [columnWhere, valueWhere] = whereClause.split(" = ")
            rows = rows.filter(function (row) {
                return row[columnWhere] === valueWhere
            })
        }

        rows = rows.map(function (row) {
            let selectedRow = {};
            columns.forEach(column => {
                selectedRow[column] = row[column]
            });
            return selectedRow;
        })
        return rows;
    },
    delete(statement) {
        const regex = /delete from ([a-z]+)(?: where (.+))?/
        const parseStatement = statement.match(regex)

        let [, tableName, whereClause] = parseStatement;
        
        if (whereClause) {
            
            whereClause = whereClause.split(" = ")

            let rows = this.tables[tableName].data;

            const [columnWhere, valueWhere] = whereClause

            rows = rows.filter(function (row) {
                return row[columnWhere] !== valueWhere
            })

            this.tables[tableName].data = rows;
        }else{
            this.tables[tableName].data = [];
        }

    },
    execute(statement) {
        if (statement.startsWith("create table")) {
            return this.createTable(statement)
        }
        if (statement.startsWith("insert into")) {
            return this.insert(statement)
        }
        if (statement.startsWith("select")) {
            return this.select(statement)
        }
        if (statement.startsWith("delete")) {
            return this.delete(statement)
        }
        const message = `Syntax error: "${statement}"`

        throw new DatabaseError(statement, message);
    }
}

try {
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    // console.log(JSON.stringify(database.execute("select id, name, age from author where id = 1"), undefined, " "));
    console.log(JSON.stringify(database.execute("delete from author where id = 2"), undefined, " "));
    console.log(JSON.stringify(database.execute("select name, age from author"), undefined, " "));


} catch (e) {
    console.log(e.message)
}
// console.log(JSON.stringify(database, undefined, " "))
