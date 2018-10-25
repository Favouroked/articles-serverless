sam package --template-file Articles/template.yaml --output-template-file serverless-output.yaml --s3-bucket articlesbucket12345
# To package lambda function

aws cloudformation deploy --template-file /home/favour/Workspace/articles-graphql/serverless-output.yaml --stack-name articles-stack --capabilities CAPABILITY_IAM
# To deploy lambda function