aws lambda invoke --function-name articles-stack-ArticlesFunction-JOAJEYVIBTT1 --log-type Tail --payload '{"field": "putArticle", "arguments": {"articleId": "1", "topic": "Favour", "content": "Favour is awesome"}}' outputfile.txt
# the above command is to invoke a remote lambda function

# aws lambda list-functions --max-items 10
# The function above is to list all remote lambda function

# aws configure
# The function above is to configure aws


