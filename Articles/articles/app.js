let AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
let table = process.env.TABLE_NAME;

exports.lambdaHandler = async (event, context) => {
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
            const data = await dyanmo.scan(allParams).toPromise()
            let results = data.Items;
            return results;
        case "getArticle":
            const data = await dyanmo.get(getParams).toPromise()
            if (data.Item == undefined) {
                let result = {
                    "articleId": "",
                    "topic": "",
                    "content": ""
                };
                return result
            } else {
                let result = {
                    "articleId": data.Item.articleId,
                    "topic": data.Item.topic,
                    "content": data.Item.content
                };
                return result
            }
        case "updateArticle":
            const data = await dynamo.get(getParams).toPromise();
            if (data.Item == undefined) {
                let result = {
                    "message": "Id doesn't exist"
                };
                return result;
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
                const _ = await dynamo.update(params).toPromise();
                let result = {
                    "articleId": event.arguments.articleId,
                    "topic": event.arguments.topic || data.Item.topic,
                    "content": event.arguments.content || data.Item.content
                };
                return result;
            }
        case "putArticle":
            const data = await dynamo.put(putParams).toPromise();
            let result = putParams.Item;
            return result;
        case "deleteArticle":
            const _ = await dynamo.delete(deleteParams).toPromise();
            let result = true;
            return result;
        default:
            let result = "Unknown field, unable to resolve" + event.field;
    }
};
