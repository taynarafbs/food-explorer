exports.up = knex => knex.schema.createTable("dishes", table => {
    table.increments("id");
    table.text("title");
    table.text("description");
    table.integer("price");
    table.string("type");

    table.integer("user_id").references("id").inTable("users");

    table.timestamp("create_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
    table.string('img');
});


exports.down = knex => knex.schema.dropTable("dishes");

