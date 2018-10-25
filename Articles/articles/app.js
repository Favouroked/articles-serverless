let AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
let table = process.env.TABLE_NAME;

exports.lambdaHandler =  (event, context, callback) => {
    let getParams = {
        TableName: table,
        Key: {
            "articleId": event.arguments.articleId
        }
    };

    let putParams = {
        TableName: table,
        Item: {
            'articleId': event.arguments.articleId,
            'topic': event.arguments.topic,
            'content': event.arguments.content
        }
    };

    let allParams = {
        TableName: table,
        ProjectionExpression: "articleId, topic, content"
    }

    let deleteParams = {
        TableName: table,
        Key: {
            "articleId": event.arguments.articleId
        }
    };

    switch(event.field) {
        case "allArticles":
            dynamo.scan(allParams, function(err, data) {
                if (err) {
                    console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    let results = data.Items;
                    callback(null, results);
                }
            });
            break;
        case "getArticle":
            dynamo.get(getParams, function(err, data) {
                if (err) {
                    console.error("Error JSON: ", JSON.stringify(err, null, 2));
                    callback(err)
                } else if (data.Item == undefined) {
                    let result = {
                        "articleId": "",
                        "topic": "",
                        "content": ""
                    };
                    callback(null, result);
                } else {
                    console.log('Article Exists: ', JSON.stringify(data, null, 2));
                    let result = {
                        "articleId": data.Item.articleId,
                        "topic": data.Item.topic,
                        "content": data.Item.content
                    };
                    callback(null, result);
                }
            });
            break;
        case "updateArticle":
            dynamo.get(getParams, function(err, data) {
                if (err) {
                    console.error("Error JSON: ", JSON.stringify(err, null, 2));
                    callback(err)
                } else if (data.Item == undefined) {
                    let result = {
                        "message": "Id doesn't exist"
                    };
                    callback(null, result);
                } else {
                    let params = {
                        TableName: table,
                        Key: {
                            "articleId": event.arguments.articleId
                        },
                        UpdateExpression: "set topic = :t, content = :c",
                        ExpressionAttributeValues: {
                            ":t": event.arguments.topic || data.Item.topic,
                            ":c": event.arguments.content || data.Item.content
                        },
                        ReturnValues: "UPDATED_NEW"
                    };
                    dynamo.update(params, function(error, updated_data) {
                        if (error) {
                            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            let result = {
                                "articleId": event.arguments.articleId,
                                "topic": event.arguments.topic || data.Item.topic,
                                "content": event.arguments.content || data.Item.content
                            };
                            callback(null, result);
                        }
                    });
                } 
            });
            break;
        case "putArticle":
            dynamo.put(putParams, function(err, data) {
                if (err) {
                    console.error("Error JSON: ", JSON.stringify(err, null, 2));
                    callback(err)
                } else {
                    console.log("Article Added: ", JSON.stringify(data, null, 2));
                    let result = putParams.Item;
                    callback(null, result);
                }
            });
            break;
        case "deleteArticle":
            dynamo.delete(deleteParams, function(err, data) {
                if (err) {
                    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                    let result = true;
                    callback(null, result)
                }
            });
            break;
        default:
            callback("Unknown field, unable to resolve" + event.field, null);
    }
};
