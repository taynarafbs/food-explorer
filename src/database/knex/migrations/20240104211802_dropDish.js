
exports.up = function (knex) {
    return knex.schema.dropTable("dish");
};


exports.down = function (knex) {

};
