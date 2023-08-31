const { BadRequestError } = require("../expressError");

//TODO Worked on this
// This dynamically updates values in the table based on the number of keys sent in the request.  If there are no keys present then it returns "No Data" error message
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //collect keys from dataToUpdate Object
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  //Convert dict items to sql parseable strings
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  //return columns formatted into valid sql
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
