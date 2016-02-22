/*
	CSW operations
*/
//allows serving files with extension jsonld
var fs = require("fs");
require.extensions[".jsonld"] = function (m) {
 m.exports = JSON.parse(fs.readFileSync(m.filename, 'utf8'));
};

//create ID for records
var uuid = require('node-uuid');


var settings = require('../config.json');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var resultSchema = new Schema({ any: Schema.Types.Mixed });
var model = {};
var context = {};

//connects to local mongodb
var db = mongoose.createConnection(settings.localMongo, function(error){
if(error){
console.log(error);
}
});

//define the collections
//FIXME context
for(var key in settings.layers){
	var layer = settings.layers[key];
	var layerModel = db.model(key, resultSchema);
	model[key] = layerModel;
	//context[key] = require(layer.context);
}

//GetRecords
function getOutput(req,res,layerID){
	
	//req.query.srsname
	//FIXME SRSNAME

	//this variable is used for querying mongoDB
     var aggregate = [];
	//just to be able to run aggregate in case of no query parameters
	aggregate.push({$match : {}});

	//positive integer
	if(req.query.startindex !== undefined){
		aggregate.push({ $skip: parseInt(req.query.startindex) });
	}

	// sortby = att1,-att2,-att3
	// can only sort by properties inside the properties field
	if(req.query.sortby !== undefined){
		var sort = {};
		var att = req.query.sortby.split(',');
		att.forEach( function(val){
			if(val.charAt(0) === '-') {
				sort['properties.'+val.slice( 1 )] = -1;
			} else { 
				sort['properties.'+val] = 1;	
			}
		});
		aggregate.push({ $sort: sort });
	}	

	//positive integer
	if(req.query.count !== undefined){
		aggregate.push({ $limit: parseInt(req.query.count) });
	}

	model[layerID].aggregate(aggregate,function(err,result){
		//error
		if (err){
			console.log(err);
			return res.status(500).end();
		} else {
			//results
			if(result.length === 0){
				//Did not find any entry, returns empty records
				return res.json({"@type": layerID, "type":layerID, records: []});
			} else {
				//Found result
				result = result.map(function(item){
					delete item._id;
					delete item.__v;
					return item;			
				});
				//create record collection
				//FIXME Context
				//return res.json({"@context": context[layerID], "@type": layerID, "type":layerID, records: result});
				return res.json({"@type": layerID, "type":layerID, records: result});
			}
		}
	});
};

//getFeatureById and GetPropertyValue 
function getOutputById(res,layerID, featureID){

	var query = model[layerID].findOne({'id': featureID});
	query.select('-_id -__v');
	
	query.exec(function(err,result){
		//error
		if (err){
			console.log(err);
			return res.status(500).end();
		} else {
			//results
			if(result === null){
				//Did not find any entry
				res.status(404).end();
			} else {
				//make sure context is the first property
				//FIXME Context
				//var resultContext = {"@context": context[layerID]};
				var resultContext = {};
				for (var key in result.toObject()) {
					resultContext[key] = result.toObject()[key];
				}
				return res.json(resultContext);
			}
		}
	});	
}

//to insert multiple records they need to be wrapped in a 'records' array
function insertData(results,res, layerID){
	//delete context
	delete results["@context"];

	var resultsArray = [];
	if("records" in results){
		resultsArray = results.records.map(function(item){
			item.id = layerID+":"+uuid.v1();
			return item;
		});
	} else {
		results.id = layerID+":"+uuid.v1();
		resultsArray = [results];
	}

	model[layerID].collection.insert(resultsArray, function(err, docs) {
		if (err) {
			console.log(err);
			return res.status(500).end();
		} else {
			return res.status(201).end();
		}
	});	
}

function deleteData(res,featureID, layerID){
	
	model[layerID].findOneAndRemove({'id': featureID}, function(err,result){
		//error
		if (err){
			console.log(err);
			return res.status(500).end();
		}
		if(result === null){
			//Did not find any entry
			res.status(404).end();
		} else {
			//Found result		
			return res.status(204).end();
		}
	});
}

function updateData(res,featureID, values, layerID){
	
	model[layerID].findOneAndRemove({'id': featureID }, function (err, doc) {
		//error
		if (err) {
			console.log(err);
			return res.status(500).end();
		}
		if (doc === null) {
			//Did not find any entry
			res.status(404).end();
		} else {
			//Found result		
			//Create new object
			
			var original = doc.toObject();
			
			// Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
			delete original._id;
			
			Object.keys(values.properties).forEach(function(key){
				original.properties[key] = values.properties[key];
			});
			
			original.geometry = values.geometry;
			
			//Insert new object
			model[layerID].collection.insert([original], function(err, docs) {
				if (err) {
					console.log('error');
					return res.status(500).end();
				} else {
					return res.status(200).end();
				}
			});				
		}
	});	

}

module.exports.getOutput = getOutput;
module.exports.getOutputById = getOutputById;
module.exports.insertData = insertData;
module.exports.deleteData = deleteData;
module.exports.updateData = updateData;
