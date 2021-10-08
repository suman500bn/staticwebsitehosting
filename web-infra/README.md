# CDK Template for Static Website!

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Stack Names:
 
 WebInfraStack : name of the cloudformation stack.<br>
 
 domainName: 'hbomaxtest.com'<br>
 
 subDomain: 'joinapp.hbomaxtest.com'<br>
 
 bucketName: 'joinapp.hbomaxtest.com'<br>
 
 WAF: WafCloudfront<br>
 
 CloudFront Distribution: "SiteDistribution"<br>
 
 s3deployment: "deployStaticWebsite"<br>


I quick started project with boiler plate code

## Prerequisites:

AWS CLI installed pip3 install --upgrade awscli
AWS CDK installed npm install -g aws-cdk
Node.js installed [Node.js](https://nodejs.org/en/download/)
Typescript installed npm -g install typescript
IAM user with required permissions for using appropriate resources on cloud

To start with boilerplate code
cdk init app --language typescript

## Project Directory:

bin
lib
package.json

Inside bin folder, we initialize stack and specify environment to which stack is deployed.

Inside lib folder, we define our cloud stack.For static website, i require S3,Cloudfront,Route 53, Certificate Manager, WAF. So i imported those libraries in my code.

Inside package.json, you can find imported libraries in dependencies section. Inside scripts section, we can automate some commands and some commands are given by default.

## Domain

For this project, i started with lookingup for domainname "hbomaxtest.com" record in route 53.

## Cloudfront OAI and bucket
Now i need to create origin access identity (OAI) so that s3 will allow only cloudfront to access the bucket.Created OAI.Created bucket with bucketname "joinapp.hbomaxtest.com" with following configuration. Publicreadaccess as false, websiteindexdcument as index.html and cors enabled for external requests.Add OAI to bucket resource policy allowing cloudfront to access s3 bucket.

## Firewall (AWS WAF)
Created firewall using wafv2 and scrope to "CLOUDFRONT".For this setup i haven't used any rules to allow or block cerain IP. But there is commented option rules to filter out IP.

## TLS Certificate
Checked AWS cerificate manager for the domain and domain hosted zone to retrive certificate.

## HTTPS and SSL
Attached TLS certificate to cloudfront and enabled SSL with aliases as sub domain name to create viewer certificate.

## Cloudfront web distribution
Attached origin source as S3 bucket and enabled default behaviour. Attached viewer certificate leveraging custom domain and firewall(WAF) to the distribution.

## Alias record
Created alias record in route 53 based on IP from cloud distribution

## S3 deployment
Website folder is given as Source. Attached cloudfront distribution and distribution paths to ['/*'] so that newer updates to website are updated in s3.


![image](https://user-images.githubusercontent.com/61553789/136573633-8aef25a9-0412-45d8-94ce-91c0ef8e30e8.png)

