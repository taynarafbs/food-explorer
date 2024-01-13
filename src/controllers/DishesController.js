const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishesController {
    async create(request, response) {
        const { title, description, price, type, ingredients } = request.body;
        const user_id = request.user.id;

        const diskStorage = new DiskStorage;

        if (!title || !price || !description || !type || !ingredients) {
            throw new AppError('Não foi possivel realizar o cadastro do prato.')
        }
        const user = await knex("users").where({ id: user_id }).first();
        if (!user) {
            throw new AppError("Usuário não autorizado", 401);
        }

        // const filename = img && await diskStorage.saveFile(img.filename);


        const [dish_id] = await knex("dishes").insert({
            title,
            description,
            price,
            type,
            user_id,
            // img: filename
        });

        const ingredientsInsert = ingredients.map(name => {
            return {
                dish_id,
                name,
            };
        });

        await knex("ingredients").insert(ingredientsInsert);

        return response.json();
    };

    async update(request, response) {
        const { title, description, price, type, ingredients } = request.body;
        const user_id = request.user.id;

        const { id } = request.params;
        let img = null;
        let filename = null;

        const diskStorage = new DiskStorage();

        const user = await knex("users").where({ id: user_id }).first();
        if (!user) {
            throw new AppError("Somente usuários administradores", 401);
        }

        const dish = await knex("dishes").where({ id }).first();

        filename = dish.img || null;

        if (request.file) {
            if (filename) {
                await diskStorage.deleteFile(filename)
            }

            img = request.file.filename
            console.log(img)
            if (img) {
                filename = await diskStorage.saveFile(img);
            }
        }

        const newDish = {
            ...dish,
            title,
            description,
            price,
            type,
            img: filename
        }

        const responseDishes = await knex("dishes").where({ id }).update(newDish);

        if (ingredients) {
            const newIngredientsInsert = ingredients.map(name => {
                return {
                    dish_id: id,
                    name,
                };
            });
            await knex("ingredients").where({ dish_id: id }).delete();
            await knex("ingredients").insert(newIngredientsInsert);
        }


        return response.json(responseDishes);

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
        const { title, ingredients } = request.query;

        const user_id = request.user.id;

        let dishes;

        if (ingredients) {
            const filterIngredients = ingredients.split(',').map(ingredients => ingredients.trim());

            dishes = await knex("ingredients")
                .select([
                    "dishes.id",
                    "dishes.title",
                    "dishes.user_id",
                ])
                .where("dishes.user_id", user_id)
                .whereLike("dishes.title", `%${title}%`)
                .whereIn("name", filterIngredients)
                .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
                .orderBy("dishes.title")

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