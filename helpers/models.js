// =============================================================================
// FUNCTIONS
// =============================================================================
/**
 * DESCRIPTION: Finds in a model all the documents that match the query and returns the ordered data
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_fields ( Optional Param ) Fields you want to have in the query. Example: _id,name,phone
 * @param {String} sort ( Optional Param ) Object with the field by which the query is ordered, the value of the field 1 (ascending) -1 or (triggering). *Default:* { date_created: 1 }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const find = function( model, query, query_fields = null, sort = { date_created: 1 } ){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        if( query_fields != null ){

            MODEL.find(query, query_fields).sort(sort).exec(function(error, data) { 

                resolve( { error: error, data: data } );
            });
        }
        else{

            MODEL.find(query, null).sort(sort).exec(function(error, data) { 

                resolve( { error: error, data: data } );
            });
        }
    });
};
/**
 * DESCRIPTION: Finds in a model all the documents that match the query, returns the ordered data and lightens its weight using lean
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_fields ( Optional Param ) Fields you want to have in the query. Example: _id,name,phone
 * @param {String} sort ( Optional Param ) Object with the field by which the query is ordered, the value of the field 1 (ascending) -1 or (triggering). *Default:* { date_created: 1 }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const findLean = function( model, query, query_fields = null, sort = { _id: 1 }, limit ){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.find(query, query_fields).sort(sort).limit(limit).lean({ autopopulate: true }).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Finds in a model one the documents that match the query and returns the ordered data
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_fields ( Optional Param ) Fields you want to have in the query. Example: _id,name,phone
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const findOne = function( model, query, query_fields = null ){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.findOne(query, query_fields).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Finds in a model one the documents that match the query, returns the ordered data and lightens its weight using lean
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_fields ( Optional Param ) Fields you want to have in the query. Example: _id,name,phone
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
const findOneLean = function( model, query, query_fields = null ){

    return new Promise(function(resolve) {
        
        const MODEL = require(`../models/${ model }`);
        MODEL.findOne(query, query_fields).lean({ autopopulate: true }).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Finds in a model by document id
 * @param {String} model Model file name
 * @param {String} doc_id Id of the document you want to find
 * @param {String} query_fields ( Optional Param ) Fields you want to have in the query. Example: _id,name,phone
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
const findById = function( model, doc_id, query_fields = null ){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.findById(doc_id, query_fields).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Finds in a model by document id and lightens its weight using lean
 * @param {String} model Model file name
 * @param {String} doc_id Id of the document you want to find
 * @param {String} query_fields ( Optional Param ) Fields you want to have in the query. Example: _id,name,phone
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const findByIdLean = function( model, doc_id, query_fields = null ){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.findById(doc_id, query_fields).lean({ autopopulate: true }).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Finds in a model by document id and Update document
 * @param {String} model Model file name
 * @param {String} doc_id Id of the document you want to find
 * @param {String} query_update Fields you want to update. Example: { $set:{ nombre: "Pedro" } }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const findByIdAndUpdate = function(model, doc_id, query_update){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.findByIdAndUpdate(doc_id, query_update).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Finds in a model one the documents that match the query and Update document
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_update Fields you want to update. Example: { $set:{ nombre: "Pedro" } }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
const findOneAndUpdate = function(model, query, query_update, options){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.findOneAndUpdate(query, query_update, options).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Create a new document based on a model
 * @param {String} model Model file name
 * @param {Object} params Object with the document fields to create. Example: { name: "Pedro" }
 * @param {Boolean} contains_password ( Optional Param ) This model contains a password. *Deafult:* false
 * @param {String} password_field_name ( Optional Param ) Name of the field containing a password
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
 const newDocument = function(model, params, contains_password = false, password_field_name = "password"){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        if( contains_password == true ){

            params[password_field_name] = MODEL.generateHash( params[password_field_name] );
        }
        MODEL.create(params, function(error, data) {

            resolve({ error: error, data: data })  
        });
    });
};
/**
 * DESCRIPTION: Update a document based on a model
 * @param {Object} MODEL Object Model
 * @param {Object} params Object with the document fields to update. Example: { name: "Pedro" }
 * @param {Boolean} contains_password ( Optional Param ) This model contains a password. *Deafult:* false
 * @param {String} password_field_name ( Optional Param ) Name of the field containing a password
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
 const updateDocument = function(MODEL, params, contains_password = false, password_field_name = "password"){

    return new Promise(function(resolve) {

        if( contains_password == true ){

            params[password_field_name] = MODEL.generateHash( params[password_field_name] );
        }
        MODEL.update(params, function(error, data) {

            resolve({ error: error, data: data })  
        });
    });
};
/**
 * DESCRIPTION: Update a document
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {Object} params Object with the document fields to update. Example: { name: "Pedro" }
 * @param {Boolean} contains_password ( Optional Param ) This model contains a password. *Deafult:* false
 * @param {String} password_field_name ( Optional Param ) Name of the field containing a password
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
 const update = function(model, query, params, contains_password = false, password_field_name = "password"){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        if( contains_password == true ){

            params[password_field_name] = MODEL.generateHash( params[password_field_name] );
        }
        MODEL.update(query, params, function(error, data) {

            resolve({ error: error, data: data })  
        });
    });
};
/**
 * DESCRIPTION: Counts the documents that match the query in the model
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: 0 }
 */
const countDocuments = function(model, query){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.countDocuments(query).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Counts the documents that match the query in the model
 * @param {Object} MODEL Object containing the instance of a model
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: 0 }
 */
const countDocumentsPaginate = function(MODEL, query){

    return new Promise(function(resolve) {

        MODEL.countDocuments(query).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Find all the documents in a model that match the query. The result is sorted and paginated
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_fields Fields you want to have in the query. Example: _id,name,phone
 * @param {Number} page ( Optional Param ) Page number you want to search. *Default:* 1
 * @param {Object} sort ( Optional Param ) Object with the field by which the query is ordered, the value of the field 1 (ascending) -1 or (triggering). *Default:* { date_created: 1 }
 * @param {Number} limit ( Optional Param ) Limit of items per page. *Default:* 250
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
const findPaginate = function(model, query, query_fields, page = 1, sort = { date_created: 1 }, limit = global.default_limit_per_page){

    return new Promise(function(resolve) {

        const MODEL     = require(`../models/${ model }`);
        let skip_page   = ( page - 1 ) * limit;
        let result = { 
            error: null, 
            data: { docs: [], total_docs: 0, limit: limit, page: page, pages: 0, next_page: null, prev_page: null } 
        };
        const resultPage = async( result, data, query ) =>{

            return new Promise( async(resolve) =>{

                let count_docs          = await countDocumentsPaginate( MODEL, query );
                let total_pages         = Math.ceil(count_docs.data / limit);
    
                result.data.docs        = data;
                result.data.total_docs  = count_docs.data;
                result.data.pages       = total_pages * limit < count_docs.data ? total_pages + 1 : total_pages;
                result.data.next_page   = result.data.pages != null && page == result.data.pages ? null : page + 1;
                result.data.prev_page   = limit ? page - 1 : null;
                result.error            = count_docs.error;

                resolve( result );
            });
        };
        MODEL.find(query, query_fields).skip(skip_page).sort(sort).limit(limit).exec( async(error, data) => { 

            if( !error ){

                result = await resultPage( result, data, query );
                resolve( result );
            }
            else{

                result.error = error;
                resolve( result );
            }
        });
    });
};
/**
 * DESCRIPTION: Find all the documents in a model that match the query. The result is sorted, paginated and lightens its weight using lean
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {String} query_fields Fields you want to have in the query. Example: _id,name,phone
 * @param {Number} page ( Optional Param ) Page number you want to search. *Default:* 1
 * @param {Number} limit ( Optional Param ) Limit of items per page. *Default:* 250
 * @param {Object} sort ( Optional Param ) Object with the field by which the query is ordered, the value of the field 1 (ascending) -1 or (triggering). *Default:* { date_created: 1 }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: {} }
 */
const findLeanPaginate = function(model, query, query_fields, page = 1, limit = global.default_limit_per_page, sort = { date_created: 1 }){

    return new Promise(function(resolve) {

        const MODEL     = require(`../models/${ model }`);
        let skip_page   = ( page - 1 ) * limit;
        let result = { 
            error: null, 
            data: { docs: [], total_docs: 0, limit: limit, page: page, pages: 0, next_page: null, prev_page: null } 
        };
        const resultPage = async( result, data, query ) =>{

            return new Promise( async(resolve) =>{

                let count_docs          = await countDocumentsPaginate( MODEL, query );
                let total_pages         = Math.ceil(count_docs.data / limit);
    
                result.data.docs        = data;
                result.data.total_docs  = count_docs.data;
                result.data.pages       = total_pages * limit < count_docs.data ? total_pages + 1 : total_pages;
                result.data.next_page   = result.data.pages != null && page == result.data.pages ? null : page + 1;
                result.data.prev_page   = limit ? page - 1 : null;
                result.error            = count_docs.error;
                
                resolve( result );
            });
        };
        MODEL.find(query, query_fields).skip(skip_page).sort(sort).limit(limit).lean({ autopopulate: true }).exec( async(error, data) => { 

            if( !error ){

                result = resultPage( result, data, query );
                resolve( result );
            }
            else{

                result.error = error;
                resolve( result );
            }
        });
    });
};
/**
 * DESCRIPTION: Insert multiple documents into a collection
 * @param {String} model Model file name
 * @param {Object} array_docs Array of documents to be inserted into the collection. Example: [ { name: "Pedro" }, { name: "Juan" } ]
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const insertMany = function(model, array_docs){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.insertMany(array_docs, function(error, docs) {

            resolve( { error: error, data: docs } );
        });
    });
};
/**
 * DESCRIPTION: Update multiple documents in a collection
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @param {Object} query_update Fields you want to update. Example: { $set:{ nombre: "Pedro" } }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const updateMany = function(model, query, query_update){

    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.updateMany(query, query_update).exec(function(error, data) { 

            resolve( { error: error, data: data } );
        });
    });
};
/**
 * DESCRIPTION: Delete multiple documents in a collection
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const deleteMany = function(model, query){
    
    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.deleteMany(query, function(error, docs) {

            resolve( { error: error, data: docs } );
        });
    });
};
/**
 * DESCRIPTION: Delete multiple documents in a collection
 * @param {String} model Model file name
 * @param {Object} query Object for query. Example: { name: "Pedro" }
 * @returns Returns an object for an error variable and a data with the result of the query. Example: { error: null, data: [] }
 */
const remove = function(model, query){
    
    return new Promise(function(resolve) {

        const MODEL = require(`../models/${ model }`);
        MODEL.remove(query).exec( function(error, docs) {

            resolve( { error: error, data: docs } );
        });
    });
};
module.exports = {
    find,
    findLean,
    findOne,
    findOneLean,
    findById,
    findByIdLean,
    findByIdAndUpdate,
    findOneAndUpdate,
    newDocument,
    updateDocument,
    update,
    countDocuments,
    countDocumentsPaginate,
    findPaginate,
    findLeanPaginate,
    insertMany,
    updateMany,
    deleteMany,
    remove
};