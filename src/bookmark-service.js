const BookmarkService = {
    getList(knex){
return knex.select('*').from('bookmark_table')
    },
    getById(knex, id){
        return knex.from('bookmark_table').select('*').where('item_key' , id).first()
    },
    postItem(knex , newItem) {
        return knex
        .insert(newItem)
        .into('bookmark_table')
        .returning('*')
          .then(rows => {
          return rows[0]
        })
    },
    deleteItem(knex, id) {
        return knex('bookmark_table')
        .where('item_key' , id)
        .delete()
    }
};

module.exports = BookmarkService