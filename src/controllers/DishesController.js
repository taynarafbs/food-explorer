const knex = require("../database/knex");

class DishesController {
    async create(request, response) {
        const { title, description, price, type, ingredients } = request.body;
        const { user_id } = request.params;

        const [dish_id] = await knex("dishes").insert({
            title,
            description,
            price,
            type,
            user_id
        });

        const ingredientsInsert = ingredients.map(name => {
            return {
                dish_id,
                name,
            };
        });

        await knex("ingredients").insert(ingredientsInsert);

        response.json();
    };

    async show(request, response) {
        const { id } = request.params;
        const dish = await knex("dishes").where({ id }).first();
        const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name");

        return response.json({
            ...dish,
            ingredients
        });

    };


    async delete(request, response) {
        const { id } = request.params;

        await knex("dishes").where({ id }).delete();

        return response.json();
    };

    async index(request, response) {
        const { title, user_id, ingredients } = request.query;

        let dishes;

        if (ingredients) {
            const filterIngredients = ingredients.split(',').map(ingredients => ingredients.trim());

            dishes = await knex("ingredients")
                .whereIn("name", filterIngredients);

        } else {
            dishes = await knex("dishes")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("title");

        };

        return response.json(dishes);
    };

};

module.exports = DishesController;