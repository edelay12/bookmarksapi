const BookmarkService = {
    getList(knex){
return knex.select('*').from('bookmark_table')
    },
    getById(knex, id){
        return knex.from('bookmark_table').select('*').where('item_key' , id).first()
    },
    deleteItem(id, knex) {

    }
};

module.exports = BookmarkService